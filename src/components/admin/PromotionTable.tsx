"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PromotionalCombo } from "@/types/promotion";
import { formatCurrencyBRL, getComboStatus, formatBRDateTime } from "@/lib/promotions";
import { PromotionStatus } from "@/components/promotions/PromotionStatus";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  toggleComboActiveAction,
  duplicateComboAction,
  deleteComboAction,
} from "@/app/admin/actions";
import {
  Edit3,
  Copy,
  Trash2,
  Eye,
  Power,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface PromotionTableProps {
  combos: PromotionalCombo[];
}

export function PromotionTable({ combos }: PromotionTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleToggleActive = async (id: string, currentState: boolean) => {
    setLoadingId(id);
    setActionError(null);
    try {
      const res = await toggleComboActiveAction(id, currentState);
      if (!res.success) {
        setActionError(res.error || "Erro ao alterar status.");
      }
    } catch {
      setActionError("Falha na comunicação com o servidor.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setLoadingId(id);
    setActionError(null);
    try {
      const res = await duplicateComboAction(id);
      if (!res.success) {
        setActionError(res.error || "Erro ao duplicar combo.");
      }
    } catch {
      setActionError("Falha na comunicação com o servidor.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setActionError(null);

    try {
      const res = await deleteComboAction(deletingId);
      if (!res.success) {
        setActionError(res.error || "Erro ao excluir combo.");
      }
    } catch {
      setActionError("Falha na comunicação com o servidor.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (!combos || combos.length === 0) {
    return (
      <div className="bg-brand-surface rounded-xl border border-brand-border/70 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-muted flex items-center justify-center mx-auto text-brand-primary">
          <Eye className="w-6 h-6" />
        </div>
        <h3 className="font-heading text-lg font-medium text-brand-heading">
          Nenhum combo promocional cadastrado
        </h3>
        <p className="text-xs text-brand-bodyText/80 max-w-sm mx-auto">
          Clique no botão &quot;Novo combo&quot; acima para criar a sua primeira promoção.
        </p>
      </div>
    );
  }

  return (
    <>
      {actionError && (
        <div role="alert" className="p-4 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {actionError}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-brand-surface rounded-xl border border-brand-border/70 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-brand-bodyText border-collapse">
          <thead>
            <tr className="bg-brand-muted/50 border-b border-brand-border/50 text-brand-heading font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Combo</th>
              <th className="py-3.5 px-4">Preço</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Vigência</th>
              <th className="py-3.5 px-4 text-center">Ordem</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {combos.map((combo) => {
              const status = getComboStatus(combo);
              const isLoadingThis = loadingId === combo.id;

              return (
                <tr key={combo.id} className="hover:bg-brand-cream/20 transition-colors">
                  {/* Thumbnail & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-brand-muted overflow-hidden shrink-0 border border-brand-border/40">
                        {combo.image_url ? (
                          <img
                            src={combo.image_url}
                            alt={combo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-bodyText/40">
                            Sem Foto
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-brand-heading text-sm block">
                          {combo.title}
                        </span>
                        <span className="text-[11px] text-brand-bodyText/60 font-mono">
                          /{combo.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-mono font-medium">
                    <span className="text-brand-primary text-sm font-semibold">
                      {formatCurrencyBRL(combo.promotional_price)}
                    </span>
                    {combo.original_price && combo.original_price > combo.promotional_price && (
                      <span className="block text-[11px] text-brand-bodyText/50 line-through">
                        {formatCurrencyBRL(combo.original_price)}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <PromotionStatus status={status} />
                  </td>

                  {/* Period */}
                  <td className="py-3 px-4 text-[11px] text-brand-bodyText/80">
                    {combo.starts_at || combo.ends_at ? (
                      <div>
                        {combo.starts_at && <div>Início: {formatBRDateTime(combo.starts_at)}</div>}
                        {combo.ends_at && <div>Fim: {formatBRDateTime(combo.ends_at)}</div>}
                      </div>
                    ) : (
                      <span className="text-brand-bodyText/50 italic">Sem data limite</span>
                    )}
                  </td>

                  {/* Order */}
                  <td className="py-3 px-4 text-center font-mono font-medium">
                    {combo.sort_order}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Toggle Active */}
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleToggleActive(combo.id, combo.is_active)}
                        className={`p-1.5 rounded-md transition-colors ${
                          combo.is_active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                        title={combo.is_active ? "Desativar promoção" : "Ativar promoção"}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <Link
                        href={`/admin/combos/${combo.id}/editar`}
                        className="p-1.5 rounded-md bg-brand-muted text-brand-primary hover:bg-brand-border/50 transition-colors"
                        title="Editar combo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      {/* Duplicate */}
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleDuplicate(combo.id)}
                        className="p-1.5 rounded-md bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                        title="Duplicar combo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => setDeletingId(combo.id)}
                        className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Excluir combo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-4">
        {combos.map((combo) => {
          const status = getComboStatus(combo);

          return (
            <div
              key={combo.id}
              className="bg-brand-surface p-4 rounded-xl border border-brand-border/70 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-brand-muted overflow-hidden shrink-0 border border-brand-border/40">
                  {combo.image_url ? (
                    <img
                      src={combo.image_url}
                      alt={combo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-bodyText/40">
                      Sem Foto
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-brand-heading text-sm truncate">
                      {combo.title}
                    </h4>
                    <PromotionStatus status={status} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-brand-primary block mt-0.5">
                    {formatCurrencyBRL(combo.promotional_price)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-xs">
                <span className="text-brand-bodyText/60">Ordem: {combo.sort_order}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(combo.id, combo.is_active)}
                    className="px-2.5 py-1 rounded bg-stone-100 text-stone-700 text-xs font-medium"
                  >
                    {combo.is_active ? "Desativar" : "Ativar"}
                  </button>
                  <Link
                    href={`/admin/combos/${combo.id}/editar`}
                    className="px-2.5 py-1 rounded bg-brand-primary text-white text-xs font-semibold"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeletingId(combo.id)}
                    className="p-1 rounded bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessible Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Excluir Combo Promocional"
        message="Tem certeza que deseja excluir este combo? Esta ação não poderá ser desfeita."
        confirmLabel="Sim, excluir combo"
        cancelLabel="Cancelar"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}
