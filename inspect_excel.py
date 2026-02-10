
import pandas as pd
import os

files = [
    r"C:\Users\Tyra\Downloads\Invoicepage-main\Guide Here\Format import export\invoice_data_1770106287045_Jan2026.xlsx",
    r"C:\Users\Tyra\Downloads\Invoicepage-main\Guide Here\Format import export\invoice_data_1stdev.xlsx"
]

for file_path in files:
    print(f"\n--- Inspecting: {os.path.basename(file_path)} ---")
    try:
        xl = pd.ExcelFile(file_path)
        for sheet_name in xl.sheet_names:
            print(f"\nSheet: {sheet_name}")
            df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
            print(df.head(10).to_string())
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
