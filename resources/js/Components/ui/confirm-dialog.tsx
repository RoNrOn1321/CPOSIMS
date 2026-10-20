import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Trash2,
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string | React.ReactNode;
  warningNote?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description = 'Please confirm if you want to proceed with this action.',
  warningNote,
  confirmText,
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  // Variant styling configurations
  const variantConfig = {
    danger: {
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-200/80',
      defaultIcon: <Trash2 size={20} />,
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs font-black',
      defaultConfirmText: 'Delete',
    },
    warning: {
      badgeBg: 'bg-amber-50 text-amber-600 border-amber-200/80',
      defaultIcon: <AlertTriangle size={20} />,
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-black',
      defaultConfirmText: 'Proceed',
    },
    info: {
      badgeBg: 'bg-blue-50 text-blue-600 border-blue-200/80',
      defaultIcon: <Info size={20} />,
      confirmBtn: 'bg-[#5c1516] hover:bg-[#7a1420] text-white shadow-xs font-black',
      defaultConfirmText: 'Confirm',
    },
    success: {
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
      defaultIcon: <CheckCircle2 size={20} />,
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-black',
      defaultConfirmText: 'Confirm',
    },
  }[variant];

  const displayConfirmText = confirmText || variantConfig.defaultConfirmText;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val && !isLoading) {
        handleCancel();
      }
    }}>
      <DialogContent 
        className="sm:max-w-[420px] rounded-2xl p-6 bg-white border border-slate-200/80 shadow-2xl overflow-hidden"
        showCloseButton={!isLoading}
      >
        <DialogHeader className="gap-3">
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${variantConfig.badgeBg}`}>
              {icon || variantConfig.defaultIcon}
            </div>

            <div className="space-y-1 text-left flex-1 min-w-0 pt-0.5">
              <DialogTitle className="text-base font-extrabold text-slate-800 tracking-tight leading-snug">
                {title}
              </DialogTitle>
              {typeof description === 'string' ? (
                <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                  {description}
                </DialogDescription>
              ) : (
                <div className="text-xs text-slate-500 leading-relaxed">
                  {description}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {warningNote && (
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="leading-relaxed flex-1">
              {warningNote}
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleCancel}
            className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100/80"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`h-9 px-5 text-xs rounded-xl flex items-center gap-1.5 ${variantConfig.confirmBtn} disabled:opacity-50`}
          >
            {isLoading && <Loader2 size={13} className="animate-spin" />}
            <span>{isLoading ? 'Processing...' : displayConfirmText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
