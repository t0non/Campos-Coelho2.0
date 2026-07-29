"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PromotionalCombo, PromotionalComboFormData } from "@/types/promotion";
import { createComboAction, updateComboAction } from "@/app/admin/actions";
import { ImageUploader } from "./ImageUploader";
import { PromotionCard } from "@/components/promotions/PromotionCard";
import { parseISOToSaoPauloLocal, generateSlug } from "@/lib/promotions";
import { Button } from "@/components/ui/Button";
import { Save, Plus, Trash2, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface PromotionFormProps {
  initialData?: PromotionalCombo;
}

export function PromotionForm({ initialData }: PromotionFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState<PromotionalComboFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    short_description: initialData?.short_description || "",
    full_description: initialData?.full_description || "",
    original_price: initialData?.original_price ? String(initialData.original_price) : "",
    promotional_price: initialData?.promotional_price ? String(initialData.promotional_price) : "",
    image_url: initialData?.image_url || "",
    image_path: initialData?.image_path || "",
    badge: initialData?.badge || "",
    cta_label: initialData?.cta_label || "Solicitar agendamento",
    cta_url: initialData?.cta_url || "/contato",
    benefits: Array.isArray(initialData?.benefits) ? initialData.benefits : [],
    starts_at: parseISOToSaoPauloLocal(initialData?.starts_at),
    ends_at: parseISOToSaoPauloLocal(initialData?.ends_at),
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
    sort_order: initialData?.sort_order ?? 0,
  });

  const [newBenefit, setNewBenefit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        // Auto generate slug if user hasn't custom edited it
        if (name === "title" && !isEditing) {
          next.slug = generateSlug(value);
        }
        return next;
      });
    }
  };

  const handleAddBenefit = () => {
    const trimmed = newBenefit.trim();
    if (!trimmed) return;

    if (formData.benefits.length >= 6) {
      setError("Limite de no máximo 6 benefícios por combo.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, trimmed],
    }));
    setNewBenefit("");
    setError(null);
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Client side checks
    if (!formData.title.trim()) {
      setError("O título da promoção é obrigatório.");
      return;
    }

    if (!formData.promotional_price || isNaN(parseFloat(formData.promotional_price))) {
      setError("Informe um preço promocional válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      let res;
      if (isEditing && initialData?.id) {
        res = await updateComboAction(initialData.id, formData);
      } else {
        res = await createComboAction(formData);
      }

      if (res.success) {
        setSuccessMessage("Combo salvo com sucesso!");
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        setError(res.error || "Não foi possível salvar o combo. Revise as informações.");
      }
    } catch (err: any) {
      setError("Ocorreu uma falha na comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construct preview object for PromotionCard
  const previewCombo = {
    title: formData.title || "Nome do Combo",
    slug: formData.slug || "combo-promocional",
    short_description: formData.short_description || "Descrição curta do combo...",
    original_price: formData.original_price ? parseFloat(formData.original_price) : null,
    promotional_price: formData.promotional_price ? parseFloat(formData.promotional_price) : 0,
    badge: formData.badge,
    benefits: formData.benefits,
    cta_label: formData.cta_label,
    cta_url: formData.cta_url,
    image_url: formData.image_url,
    ends_at: formData.ends_at ? `${formData.ends_at}:00-03:00` : null,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form Fields */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-brand-bodyText/80 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao painel</span>
          </Link>
          <span className="text-xs text-brand-bodyText/60">
            {isEditing ? "Modo de Edição" : "Novo Cadastro"}
          </span>
        </div>

        {error && (
          <div role="alert" className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div role="status" className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-brand-surface p-6 rounded-xl border border-brand-border/70 shadow-sm space-y-6">
          {/* Section 1: Principal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary border-b border-brand-border/40 pb-2">
              1. Informações Principais
            </h3>

            <div>
              <label htmlFor="title" className="block text-xs font-medium text-brand-heading mb-1">
                Nome do Combo *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                maxLength={100}
                placeholder="Ex: Combo Especial Corte + Hidratação"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="slug" className="block text-xs font-medium text-brand-heading mb-1">
                  Endereço do Combo (Slug) *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  placeholder="combo-corte-hidratacao"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-xs font-mono focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label htmlFor="badge" className="block text-xs font-medium text-brand-heading mb-1">
                  Selo de Destaque (opcional)
                </label>
                <input
                  type="text"
                  id="badge"
                  name="badge"
                  maxLength={30}
                  placeholder="Ex: MAIS VENDIDO, 20% OFF"
                  value={formData.badge}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="short_description" className="block text-xs font-medium text-brand-heading mb-1">
                Descrição Curta *
              </label>
              <textarea
                id="short_description"
                name="short_description"
                required
                rows={2}
                maxLength={200}
                placeholder="Resumo objetivo do combo promocional..."
                value={formData.short_description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {/* Image Uploader */}
            <ImageUploader
              currentUrl={formData.image_url}
              currentPath={formData.image_path}
              onImageChange={(url, path) =>
                setFormData((prev) => ({ ...prev, image_url: url, image_path: path }))
              }
            />
          </div>

          {/* Section 2: Valores e Oferta */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary border-b border-brand-border/40 pb-2">
              2. Valores e Benefícios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="promotional_price" className="block text-xs font-medium text-brand-heading mb-1">
                  Preço Promocional (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="promotional_price"
                  name="promotional_price"
                  required
                  placeholder="150.00"
                  value={formData.promotional_price}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm font-mono focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label htmlFor="original_price" className="block text-xs font-medium text-brand-heading mb-1">
                  Preço Original Riscado (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="original_price"
                  name="original_price"
                  placeholder="200.00"
                  value={formData.original_price}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm font-mono focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* Benefits Manager */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-brand-heading">
                Benefícios Incluídos (máximo 6 itens)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Corte de Cabelo Feminino"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-xs focus:border-brand-primary"
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-3 py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-primaryHover transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {formData.benefits.length > 0 && (
                <ul className="space-y-1.5 pt-2">
                  {formData.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-3 py-1.5 bg-brand-muted/60 border border-brand-border/40 rounded-md text-xs text-brand-heading"
                    >
                      <span>• {benefit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(i)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Section 3: Datas e Exibição */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary border-b border-brand-border/40 pb-2">
              3. Vigência e Visibilidade
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="starts_at" className="block text-xs font-medium text-brand-heading mb-1">
                  Data/Hora Inicial (Horário de Brasília)
                </label>
                <input
                  type="datetime-local"
                  id="starts_at"
                  name="starts_at"
                  value={formData.starts_at}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-xs focus:border-brand-primary"
                />
              </div>

              <div>
                <label htmlFor="ends_at" className="block text-xs font-medium text-brand-heading mb-1">
                  Data/Hora de Encerramento (opcional)
                </label>
                <input
                  type="datetime-local"
                  id="ends_at"
                  name="ends_at"
                  value={formData.ends_at}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-xs focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label htmlFor="sort_order" className="block text-xs font-medium text-brand-heading mb-1">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-6 pt-5">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-brand-heading cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-brand-primary border-brand-border rounded focus:ring-brand-primary"
                  />
                  <span>Ativar promoção no site</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-brand-heading cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-brand-primary border-brand-border rounded focus:ring-brand-primary"
                  />
                  <span>Destaque principal</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-lg text-xs font-medium text-brand-bodyText bg-brand-muted hover:bg-brand-border/50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-brand-primary text-white text-xs font-semibold shadow hover:bg-brand-primaryHover transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvação em andamento...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? "Salvar alterações" : "Publicar combo"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Card Preview */}
      <div className="lg:col-span-5 sticky top-20 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-brand-heading uppercase tracking-wider">
          <span>Pré-visualização do Card</span>
          <span className="text-[11px] text-brand-bodyText/60 lowercase italic">
            Como ficará no site público
          </span>
        </div>

        <div className="p-4 bg-brand-cream/20 rounded-2xl border border-brand-border/60">
          <PromotionCard combo={previewCombo} isPreview />
        </div>
      </div>
    </div>
  );
}
