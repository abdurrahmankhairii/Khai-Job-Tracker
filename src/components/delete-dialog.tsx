
"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
}

export function DeleteDialog({ isOpen, onClose, onConfirm, title, description }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 glass-panel bg-white/80 p-6 shadow-2xl focus:outline-none animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <Dialog.Title className="text-xl font-bold text-slate-800">
              {title}
            </Dialog.Title>
            
            <Dialog.Description className="text-slate-600">
              {description}
            </Dialog.Description>
          </div>

          <div className="flex justify-center gap-3 pt-8">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors w-full">
              Cancel
            </button>
            <button type="button" onClick={handleConfirm} disabled={loading} className="px-5 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition-all w-full disabled:opacity-50">
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

