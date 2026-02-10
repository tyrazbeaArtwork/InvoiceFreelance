#Requires -Version 5.1
<#
.SYNOPSIS
    Enterprise-grade Excel row-to-file converter with modal UI.

.DESCRIPTION
    Converts Excel rows to individual files with:
    - Column A: Sequence (optional)
    - Column B: File content
    - Column C: Filename
    - Column D: File extension/type
    
    Features:
    - Dual-path Excel reading (ImportExcel + COM fallback)
    - Culture-safe timestamped output folders
    - Robust sanitization and collision handling
    - Zero orphaned Excel processes
    - Comprehensive error handling and logging

.NOTES
    Author: Production Engineering Team
    Version: 1.0.0
    Tested: Windows PowerShell 5.1, PowerShell 7.x
#>

[CmdletBinding()]
param(
    [switch]$WhatIf,
    [ValidateSet('Overwrite', 'Skip', 'AutoUnique')]
    [string]$CollisionPolicy = 'AutoUnique'
)

#region CONFIGURATION
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$script:Config = @{
    ValidExtensions = @('txt', 'log', 'json', 'xml', 'csv', 'md', 'ps1', 'html', 'css', 'js', 'ini')
    BinaryExtensions = @('pdf', 'png', 'jpg', 'gif', 'zip', 'docx', 'xlsx', 'bin', 'dat')
    MaxFilenameLength = 150
    MaxPathLength = 240
    EncodingWithBOM = $false  # UTF-8 without BOM for modern compatibility
    ReservedNames = @('CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 
                      'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 
                      'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9')
}

$script:Stats = @{
    Total = 0
    Created = 0
    Skipped = 0
    Failed = 0
    Errors = [System.Collections.Generic.List[object]]::new()
}
#endregion

#region PREFLIGHT FUNCTIONS
function Ensure-STAMode {
    <#
    .SYNOPSIS
        Ensures script runs in Single-Threaded Apartment for COM/UI.
    #>
    if ([Threading.Thread]::CurrentThread.GetApartmentState() -ne 'STA') {
        Write-Warning "Relaunching in STA mode..."
        $psExe = if ($PSVersionTable.PSVersion.Major -ge 7) { 'pwsh.exe' } else { 'powershell.exe' }
        $args = @('-STA', '-File', $PSCommandPath) + $PSBoundParameters.GetEnumerator() | ForEach-Object { "-$($_.Key)", $_.Value }
        Start-Process -FilePath $psExe -ArgumentList $args -Wait -NoNewWindow
        exit
    }
}

function Initialize-Environment {
    <#
    .SYNOPSIS
        Validates environment and creates output folder structure.
    #>
    param(
        [string]$ScriptRoot
    )
    
    # Validate write permissions
    try {
        $testFile = Join-Path $ScriptRoot ".writetest_$(Get-Random)"
        [IO.File]::WriteAllText($testFile, 'test')
        Remove-Item $testFile -Force
    } catch {
        throw "Cannot write to script directory: $ScriptRoot. Please move script to a writable location."
    }

    # Check available disk space (minimum 100MB)
    $drive = Split-Path $ScriptRoot -Qualifier
    $disk = Get-PSDrive ($drive.TrimEnd(':'))
    if ($disk.Free -lt 100MB) {
        throw "Insufficient disk space. Need at least 100MB free on $drive"
    }

    # Create timestamped output folder with en-US culture
    $culture = [System.Globalization.CultureInfo]::GetCultureInfo('en-US')
    $folderBase = '#' + (Get-Date).ToString('ddMMM,ddd (yyyy)', $culture)
    
    $outputDir = Join-Path $ScriptRoot $folderBase
    $suffix = 2
    while (Test-Path $outputDir) {
        $outputDir = Join-Path $ScriptRoot "$folderBase #$suffix"
        $suffix++
    }
    
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    
    # Create log file
    $logFile = Join-Path $outputDir "conversion_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    
    return @{
        OutputDir = $outputDir
        LogFile = $logFile
    }
}

function Write-Log {
    <#
    .SYNOPSIS
        Writes structured log entries.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [ValidateSet('INFO', 'WARN', 'ERROR', 'FATAL')]
        [string]$Level = 'INFO',
        
        [string]$LogFile = $script:LogPath
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'
    $entry = "[$timestamp] [$Level] $Message"
    
    try {
        Add-Content -Path $LogFile -Value $entry -Encoding UTF8 -ErrorAction SilentlyContinue
    } catch {
        Write-Warning "Failed to write log: $_"
    }
    
    switch ($Level) {
        'INFO' { Write-Verbose $Message }
        'WARN' { Write-Warning $Message }
        'ERROR' { Write-Error $Message -ErrorAction Continue }
        'FATAL' { Write-Error $Message -ErrorAction Continue }
    }
}
#endregion

#region UI FUNCTIONS
function Show-FileDialog {
    <#
    .SYNOPSIS
        Displays OpenFileDialog for Excel file selection.
    #>
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.Application]::EnableVisualStyles()
    
    $dialog = New-Object System.Windows.Forms.OpenFileDialog
    $dialog.Title = 'Select Source Excel File'
    $dialog.Filter = 'Excel Files (*.xlsx;*.xls;*.xlsm)|*.xlsx;*.xls;*.xlsm|All Files (*.*)|*.*'
    $dialog.InitialDirectory = $PSScriptRoot
    $dialog.CheckFileExists = $true
    
    if ($dialog.ShowDialog() -eq 'OK') {
        return $dialog.FileName
    }
    return $null
}

function Show-SummaryDialog {
    <#
    .SYNOPSIS
        Displays processing summary with action buttons.
    #>
    param(
        [int]$Total,
        [int]$Created,
        [int]$Skipped,
        [int]$Failed,
        [string]$OutputPath,
        [string]$LogPath
    )
    
    Add-Type -AssemblyName System.Windows.Forms
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = 'Conversion Complete'
    $form.Size = New-Object System.Drawing.Size(450, 280)
    $form.StartPosition = 'CenterScreen'
    $form.FormBorderStyle = 'FixedDialog'
    $form.MaximizeBox = $false
    
    # Summary label
    $label = New-Object System.Windows.Forms.Label
    $label.Location = New-Object System.Drawing.Point(20, 20)
    $label.Size = New-Object System.Drawing.Size(400, 100)
    $summaryText = @"
Processing Summary:
================================
Total Rows: $Total
Created: $Created
Skipped: $Skipped
Failed: $Failed
"@
    $label.Text = $summaryText
    $label.Font = New-Object System.Drawing.Font('Consolas', 10)
    $form.Controls.Add($label)
    
    # Output path label
    $pathLabel = New-Object System.Windows.Forms.Label
    $pathLabel.Location = New-Object System.Drawing.Point(20, 130)
    $pathLabel.Size = New-Object System.Drawing.Size(400, 40)
    $pathLabel.Text = "Output: $OutputPath"
    $pathLabel.Font = New-Object System.Drawing.Font('Segoe UI', 8)
    $form.Controls.Add($pathLabel)
    
    # Open folder button
    $openBtn = New-Object System.Windows.Forms.Button
    $openBtn.Location = New-Object System.Drawing.Point(20, 180)
    $openBtn.Size = New-Object System.Drawing.Size(130, 35)
    $openBtn.Text = 'Open Folder'
    $openBtn.Add_Click({
        Invoke-Item $OutputPath
    })
    $form.Controls.Add($openBtn)
    
    # View log button
    $logBtn = New-Object System.Windows.Forms.Button
    $logBtn.Location = New-Object System.Drawing.Point(160, 180)
    $logBtn.Size = New-Object System.Drawing.Size(130, 35)
    $logBtn.Text = 'View Log'
    $logBtn.Add_Click({
        Start-Process notepad.exe -ArgumentList $LogPath
    })
    $form.Controls.Add($logBtn)
    
    # Close button
    $closeBtn = New-Object System.Windows.Forms.Button
    $closeBtn.Location = New-Object System.Drawing.Point(300, 180)
    $closeBtn.Size = New-Object System.Drawing.Size(110, 35)
    $closeBtn.Text = 'Close'
    $closeBtn.DialogResult = 'OK'
    $form.Controls.Add($closeBtn)
    $form.AcceptButton = $closeBtn
    
    [void]$form.ShowDialog()
}
#endregion

#region EXCEL FUNCTIONS
function Get-ExcelData {
    <#
    .SYNOPSIS
        Reads Excel data using ImportExcel or COM fallback.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Path
    )
    
    Write-Log "Reading Excel file: $Path"
    
    $extension = [IO.Path]::GetExtension($Path).ToLower()
    $useImportExcel = $false
    
    # Check for ImportExcel module
    if ($extension -in @('.xlsx', '.xlsm')) {
        $module = Get-Module -ListAvailable ImportExcel -ErrorAction SilentlyContinue
        if ($module) {
            $useImportExcel = $true
            Write-Log "Using ImportExcel module for faster processing"
        }
    }
    
    if ($useImportExcel) {
        try {
            Import-Module ImportExcel -ErrorAction Stop
            $rawData = Import-Excel -Path $Path -DataOnly -NoHeader
            
            # ImportExcel with -NoHeader creates P1, P2, P3, P4 properties
            # Normalize to A, B, C, D for consistency
            $data = $rawData | ForEach-Object {
                [PSCustomObject]@{
                    A = $_.P1
                    B = $_.P2
                    C = $_.P3
                    D = $_.P4
                }
            }
            
            Write-Log "Successfully read $($data.Count) rows via ImportExcel"
            return $data
        } catch {
            Write-Log "ImportExcel failed, falling back to COM: $_" -Level WARN
        }
    }
    
    # COM fallback
    return Read-ExcelViaCOM -Path $Path
}

function Read-ExcelViaCOM {
    <#
    .SYNOPSIS
        Reads Excel using COM automation with proper cleanup.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Path
    )
    
    $excel = $null
    $workbook = $null
    $worksheet = $null
    
    try {
        Write-Log "Initializing Excel COM object..."
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $excel.DisplayAlerts = $false
        $excel.ScreenUpdating = $false
        
        Write-Log "Opening workbook: $Path"
        $workbook = $excel.Workbooks.Open($Path, $false, $true) # ReadOnly
        $worksheet = $workbook.Worksheets.Item(1)
        
        Write-Log "Reading data range..."
        $usedRange = $worksheet.UsedRange
        $rowCount = $usedRange.Rows.Count
        $colCount = $usedRange.Columns.Count
        
        Write-Log "Found $rowCount rows and $colCount columns"
        
        # Read all data at once (fastest method)
        $rawData = $usedRange.Value2
        
        # Convert to PowerShell objects
        $data = [System.Collections.Generic.List[object]]::new()
        
        for ($row = 1; $row -le $rowCount; $row++) {
            $rowData = [PSCustomObject]@{
                A = if ($colCount -ge 1) { $rawData[$row, 1] } else { $null }
                B = if ($colCount -ge 2) { $rawData[$row, 2] } else { $null }
                C = if ($colCount -ge 3) { $rawData[$row, 3] } else { $null }
                D = if ($colCount -ge 4) { $rawData[$row, 4] } else { $null }
            }
            $data.Add($rowData)
        }
        
        Write-Log "Successfully read $($data.Count) rows via COM"
        return $data
        
    } catch {
        Write-Log "COM read failed: $_" -Level ERROR
        throw
    } finally {
        # Critical cleanup sequence
        if ($workbook) {
            $workbook.Close($false)
            [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
        }
        if ($excel) {
            $excel.Quit()
            [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
        }
        
        # Force garbage collection
        [GC]::Collect()
        [GC]::WaitForPendingFinalizers()
        [GC]::Collect()
        
        # Verify no Excel processes remain
        Start-Sleep -Milliseconds 500
        $excelProcs = Get-Process Excel -ErrorAction SilentlyContinue
        if ($excelProcs) {
            Write-Log "WARNING: Excel process(es) still running - attempting cleanup" -Level WARN
            $excelProcs | Stop-Process -Force -ErrorAction SilentlyContinue
        }
    }
}
#endregion

#region SANITIZATION FUNCTIONS
function Get-SanitizedExtension {
    <#
    .SYNOPSIS
        Validates and sanitizes file extension.
    #>
    param(
        [string]$Extension
    )
    
    if ([string]::IsNullOrWhiteSpace($Extension)) {
        return $null
    }
    
    $ext = $Extension.Trim().TrimStart('.').ToLowerInvariant()
    $ext = $ext -replace '[^a-z0-9]', ''
    
    if ($ext.Length -eq 0 -or $ext.Length -gt 8) {
        return $null
    }
    
    return $ext
}

function Get-SanitizedFilename {
    <#
    .SYNOPSIS
        Sanitizes filename removing invalid characters.
    #>
    param(
        [string]$Filename
    )
    
    if ([string]::IsNullOrWhiteSpace($Filename)) {
        return $null
    }
    
    # Remove invalid filesystem characters
    $name = $Filename.Trim()
    $name = $name -replace '[\x00-\x1F<>:"/\\|?*]', '_'
    $name = $name.Trim().TrimEnd('.')
    
    # Handle reserved Windows names
    $nameUpper = $name.ToUpperInvariant()
    if ($script:Config.ReservedNames -contains $nameUpper) {
        $name = "${name}_"
    }
    
    # Enforce length limit
    if ($name.Length -gt $script:Config.MaxFilenameLength) {
        $name = $name.Substring(0, $script:Config.MaxFilenameLength)
    }
    
    return $name
}

function Get-UniqueFilePath {
    <#
    .SYNOPSIS
        Generates unique file path handling collisions.
    #>
    param(
        [string]$Directory,
        [string]$BaseName,
        [string]$Extension
    )
    
    $path = Join-Path $Directory "$BaseName.$Extension"
    
    if (-not (Test-Path $path)) {
        return $path
    }
    
    # Apply collision policy
    switch ($script:CollisionPolicy) {
        'Overwrite' {
            return $path
        }
        'Skip' {
            return $null
        }
        'AutoUnique' {
            $counter = 1
            do {
                $uniqueName = "${BaseName}_$($counter.ToString('000'))"
                $path = Join-Path $Directory "$uniqueName.$Extension"
                $counter++
            } while ((Test-Path $path) -and $counter -lt 1000)
            
            if ($counter -ge 1000) {
                Write-Log "Collision limit reached for: $BaseName" -Level ERROR
                return $null
            }
            return $path
        }
    }
}
#endregion

#region FILE OPERATIONS
function Test-BinaryContent {
    <#
    .SYNOPSIS
        Determines if content should be treated as binary.
    #>
    param(
        [string]$Extension
    )
    
    return $script:Config.BinaryExtensions -contains $Extension
}

function Write-FileContent {
    <#
    .SYNOPSIS
        Writes content to file with proper encoding.
    #>
    param(
        [string]$Path,
        [string]$Content,
        [bool]$IsBinary
    )
    
    if ($WhatIf) {
        Write-Log "[WHATIF] Would create: $Path"
        return $true
    }
    
    try {
        if ($IsBinary) {
            # Attempt base64 decode
            try {
                $bytes = [Convert]::FromBase64String($Content)
                [IO.File]::WriteAllBytes($Path, $bytes)
                $fileName = [IO.Path]::GetFileName($Path)
                $byteLength = $bytes.Length
                Write-Log "Created binary file: $fileName ($byteLength bytes)"
            } catch {
                Write-Log "Base64 decode failed for $Path - writing as text" -Level WARN
                $encoding = New-Object System.Text.UTF8Encoding($script:Config.EncodingWithBOM)
                [IO.File]::WriteAllText($Path, $Content, $encoding)
            }
        } else {
            # Write as text
            $encoding = New-Object System.Text.UTF8Encoding($script:Config.EncodingWithBOM)
            [IO.File]::WriteAllText($Path, $Content, $encoding)
            $fileName = [IO.Path]::GetFileName($Path)
            $contentLength = $Content.Length
            Write-Log "Created text file: $fileName ($contentLength chars)"
        }
        return $true
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Log "Failed to write ${Path}: $errorMsg" -Level ERROR
        return $false
    }
}
#endregion

#region MAIN PROCESSING
function Process-ExcelRows {
    <#
    .SYNOPSIS
        Main processing loop for converting rows to files.
    #>
    param(
        [array]$Data,
        [string]$OutputDirectory
    )
    
    $script:Stats.Total = $Data.Count
    Write-Log "Processing $($Data.Count) rows..."
    
    # Detect and skip header row
    $startIndex = 0
    if ($Data.Count -gt 0) {
        $firstRow = $Data[0]
        $headerIndicators = @('content', 'filename', 'file name', 'type', 'extension')
        $isHeader = $false
        
        foreach ($prop in $firstRow.PSObject.Properties) {
            $value = [string]$prop.Value
            if ($headerIndicators | Where-Object { $value -match $_ }) {
                $isHeader = $true
                break
            }
        }
        
        if ($isHeader) {
            Write-Log "Header row detected - skipping first row"
            $startIndex = 1
        }
    }
    
    # Process each row
    for ($i = $startIndex; $i -lt $Data.Count; $i++) {
        $rowNum = $i + 1
        $row = $Data[$i]
        
        # Show progress
        if ($i % 10 -eq 0) {
            $percentComplete = [math]::Round(($i / $Data.Count) * 100)
            Write-Progress -Activity "Converting rows to files" -Status "$i of $($Data.Count) processed" -PercentComplete $percentComplete
        }
        
        # Extract and validate data
        $content = [string]$row.B
        $filename = [string]$row.C
        $extension = [string]$row.D
        
        # Validate content
        if ([string]::IsNullOrWhiteSpace($content)) {
            Write-Log "Row $rowNum - Skipped: Empty content" -Level WARN
            $script:Stats.Skipped++
            continue
        }
        
        # Sanitize filename
        $cleanFilename = Get-SanitizedFilename -Filename $filename
        if (-not $cleanFilename) {
            $cleanFilename = "file_$($rowNum.ToString('0000'))"
            Write-Log "Row $rowNum - Generated filename: $cleanFilename"
        }
        
        # Sanitize extension
        $cleanExtension = Get-SanitizedExtension -Extension $extension
        if (-not $cleanExtension) {
            Write-Log "Row $rowNum - Skipped: Invalid extension '$extension'" -Level WARN
            $script:Stats.Skipped++
            continue
        }
        
        # Generate file path
        $filePath = Get-UniqueFilePath -Directory $OutputDirectory -BaseName $cleanFilename -Extension $cleanExtension
        
        if (-not $filePath) {
            Write-Log "Row $rowNum - Skipped: Could not resolve unique path for '$cleanFilename.$cleanExtension'" -Level WARN
            $script:Stats.Skipped++
            continue
        }
        
        # Write file
        $isBinary = Test-BinaryContent -Extension $cleanExtension
        $success = Write-FileContent -Path $filePath -Content $content -IsBinary $isBinary
        
        if ($success) {
            $script:Stats.Created++
        } else {
            $script:Stats.Failed++
            $script:Stats.Errors.Add([PSCustomObject]@{
                Row = $rowNum
                Filename = "$cleanFilename.$cleanExtension"
                Error = "Write failed"
            })
        }
    }
    
    Write-Progress -Activity "Converting rows to files" -Completed
}
#endregion

#region MAIN EXECUTION
try {
    Write-Host "`n================================================================" -ForegroundColor Cyan
    Write-Host "        Excel Row-to-File Converter v1.0.0                   " -ForegroundColor Cyan
    Write-Host "================================================================`n" -ForegroundColor Cyan
    
    # 1. Ensure STA mode
    Ensure-STAMode
    
    # 2. Initialize environment
    Write-Host "Initializing environment..." -ForegroundColor Yellow
    $env = Initialize-Environment -ScriptRoot $PSScriptRoot
    $script:LogPath = $env.LogFile
    $script:CollisionPolicy = $CollisionPolicy
    
    Write-Log "======================================================="
    Write-Log "Conversion Session Started"
    Write-Log "PowerShell Version: $($PSVersionTable.PSVersion)"
    Write-Log "Collision Policy: $CollisionPolicy"
    Write-Log "======================================================="
    
    # 3. Select Excel file
    Write-Host "Please select your Excel file..." -ForegroundColor Yellow
    $excelPath = Show-FileDialog
    
    if (-not $excelPath) {
        Write-Log "User cancelled file selection"
        Write-Host "`nOperation cancelled by user." -ForegroundColor Yellow
        exit 2
    }
    
    Write-Host "`nSelected: $excelPath" -ForegroundColor Green
    Write-Log "Selected file: $excelPath"
    
    # 4. Read Excel data
    Write-Host "`nReading Excel data..." -ForegroundColor Yellow
    $data = Get-ExcelData -Path $excelPath
    
    if (-not $data -or $data.Count -eq 0) {
        throw "No data found in Excel file"
    }
    
    Write-Host "Found $($data.Count) rows" -ForegroundColor Green
    
    # 5. Process rows
    Write-Host "`nConverting rows to files..." -ForegroundColor Yellow
    Process-ExcelRows -Data $data -OutputDirectory $env.OutputDir
    
    # 6. Show summary
    Write-Log "======================================================="
    Write-Log "Conversion Complete - Total: $($script:Stats.Total), Created: $($script:Stats.Created), Skipped: $($script:Stats.Skipped), Failed: $($script:Stats.Failed)"
    Write-Log "======================================================="
    
    Write-Host "`n================================================================" -ForegroundColor Green
    Write-Host "                    CONVERSION COMPLETE                        " -ForegroundColor Green
    Write-Host "================================================================`n" -ForegroundColor Green
    
    Show-SummaryDialog -Total $script:Stats.Total `
                       -Created $script:Stats.Created `
                       -Skipped $script:Stats.Skipped `
                       -Failed $script:Stats.Failed `
                       -OutputPath $env.OutputDir `
                       -LogPath $env.LogFile
    
    # Determine exit code
    if ($script:Stats.Failed -gt 0) {
        exit 1
    } else {
        exit 0
    }
    
} catch {
    Write-Log "FATAL ERROR: $_" -Level FATAL
    Write-Log "Stack Trace: $($_.ScriptStackTrace)" -Level FATAL
    
    Write-Host "`n================================================================" -ForegroundColor Red
    Write-Host "                      FATAL ERROR                              " -ForegroundColor Red
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "`nPlease check the log file for details." -ForegroundColor Yellow
    
    exit 2
} finally {
    # Cleanup
    if ($script:LogPath) {
        Write-Host "`nLog file: $($script:LogPath)" -ForegroundColor Cyan
    }
}
#endregion