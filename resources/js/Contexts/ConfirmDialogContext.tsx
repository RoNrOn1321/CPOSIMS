import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import ConfirmDialog, { ConfirmVariant } from '@/Components/ui/confirm-dialog';

export interface ConfirmOptions {
  title?: string;
  description?: string | React.ReactNode;
  warningNote?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    // If a dialog was already pending, reject the previous one
    if (resolverRef.current) {
      resolverRef.current(false);
    }

    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title={options.title}
        description={options.description}
        warningNote={options.warningNote}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        icon={options.icon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
}
