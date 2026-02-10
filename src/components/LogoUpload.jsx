import React, { useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X } from 'lucide-react';

const LogoUpload = () => {
    const { logo, setLogo } = useContext(AppContext);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogo(null);
    };

    return (
        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-blue-500" />
                Business Logo
            </h3>

            {!logo ? (
                <div className="relative group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center py-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <ImageIcon size={24} />
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Click or drag to upload logo</p>
                        <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG (e.g., 200x200px)</p>
                    </div>
                </div>
            ) : (
                <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-lg border bg-white flex items-center justify-center overflow-hidden p-2 group">
                        <img src={logo} alt="Business logo" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={removeLogo}
                                type="button"
                            >
                                <X size={14} />
                            </Button>
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-1">Logo active</p>
                </div>
            )}
        </div>
    );
};

export default LogoUpload;
