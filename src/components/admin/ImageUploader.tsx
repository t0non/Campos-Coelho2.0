"use client";

import React, { useState, useRef } from "react";
import { uploadComboImageAction } from "@/app/admin/actions";
import { Upload, Image as ImageIcon, Loader2, X, Check } from "lucide-react";

interface ImageUploaderProps {
  currentUrl?: string;
  currentPath?: string;
  onImageChange: (url: string, path: string) => void;
}

export function ImageUploader({
  currentUrl = "",
  currentPath = "",
  onImageChange,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadComboImageAction(formData);

      if (res.success && res.url && res.path) {
        onImageChange(res.url, res.path);
      } else {
        setError(res.error || "Não foi possível enviar a imagem.");
      }
    } catch (err) {
      setError("Ocorreu uma falha no upload. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onImageChange("", "");
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-brand-heading">
        Imagem Promocional (JPG, PNG ou WebP - máx 5MB)
      </label>

      {currentUrl ? (
        <div className="relative rounded-xl border border-brand-border overflow-hidden bg-brand-muted max-w-sm group">
          <img
            src={currentUrl}
            alt="Preview"
            className="w-full aspect-[16/10] object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-brand-dark text-xs font-semibold rounded-lg shadow hover:bg-brand-cream transition-colors"
            >
              Trocar foto
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition-colors"
              title="Remover imagem"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-brand-border/80 hover:border-brand-primary rounded-xl p-6 text-center bg-brand-cream/10 hover:bg-brand-cream/30 transition-all cursor-pointer group"
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              <span className="text-xs font-medium text-brand-bodyText">
                Enviando imagem...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-brand-muted flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-primary block">
                  Clique para selecionar uma imagem
                </span>
                <span className="text-[11px] text-brand-bodyText/60 block mt-0.5">
                  Recomendado proporção 16:10 (ex: 800x500 px)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p role="alert" className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
