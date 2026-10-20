import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import ConfirmDialog from '@/Components/ui/confirm-dialog';
import { 
  Tags, 
  Plus, 
  Edit, 
  Trash2, 
  Layers, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  storeCategory, 
  updateCategory, 
  destroyCategory 
} from '@/actions/App/Http/Controllers/Admin/SettingController';
import { toast } from '@/Hooks/use-toast';

export interface CategoryItem {
  id: number;
  name: string;
  description?: string | null;
  products_count?: number;
}

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  categories = [],
}: ManageCategoriesModalProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    description: '',
  });

  const handleStartCreate = () => {
    setEditingCategory(null);
    reset();
    clearErrors();
    setIsCreating(true);
  };

  const handleStartEdit = (category: CategoryItem) => {
    setIsCreating(false);
    clearErrors();
    setEditingCategory(category);
    setData({
      name: category.name,
      description: category.description || '',
    });
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingCategory(null);
    reset();
    clearErrors();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      put(updateCategory.url(editingCategory.id), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Category "${data.name}" updated successfully.`);
          handleCancelForm();
        },
      });
    } else {
      post(storeCategory.url(), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Category "${data.name}" created successfully.`);
          handleCancelForm();
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;

    router.delete(destroyCategory.url(categoryToDelete.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Category "${categoryToDelete.name}" deleted.`);
        setCategoryToDelete(null);
      },
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className="sm:max-w-[580px] max-h-[85vh] flex flex-col p-6 rounded-2xl gap-4"
          showCloseButton={false}
        >
          {/* Header */}
          <DialogHeader className="pb-3 border-b border-slate-100 pr-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5c1516]/10 text-[#5c1516] flex items-center justify-center font-bold">
                  <Tags size={18} />
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold text-slate-800">
                    Menu Categories Management
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Create, edit, or remove menu category classifications for products & POS.
                  </DialogDescription>
                </div>
              </div>

              {!isCreating && !editingCategory && (
                <Button
                  size="sm"
                  onClick={handleStartCreate}
                  className="h-8 bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus size={14} /> Add Category
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Form Area: Create or Edit Category */}
          {(isCreating || editingCategory) && (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  {editingCategory ? <Edit size={13} className="text-[#5c1516]" /> : <Plus size={13} className="text-[#5c1516]" />}
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Category Details'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rice Meals, Healthy Options, Pastries..."
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={`h-9 text-xs rounded-xl bg-white ${errors.name ? 'border-red-500' : ''}`}
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-red-600 font-semibold mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    placeholder="Brief description or purpose for cashiers and parents..."
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="h-9 text-xs rounded-xl bg-white"
                    maxLength={255}
                  />
                  {errors.description && (
                    <p className="text-[10px] text-red-600 font-semibold mt-1">{errors.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelForm}
                  className="h-8 text-xs rounded-xl border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={processing || !data.name.trim()}
                  className="h-8 bg-[#5c1516] hover:bg-[#7a1420] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  {processing ? <RefreshCw size={12} className="animate-spin" /> : <Check size={13} />}
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </Button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto max-h-[44vh] space-y-2 pr-1 divide-y divide-slate-100">
            {categories.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No menu categories found. Click "+ Add Category" to create one.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="pt-2 pb-2 first:pt-0 flex items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-slate-500 border-slate-200">
                        {cat.products_count ?? 0} {cat.products_count === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(cat)}
                      className="h-7 text-xs px-2 rounded-lg border-slate-200 text-slate-600 hover:text-[#5c1516] hover:bg-red-50/50 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit size={12} className="mr-1" /> Edit
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCategoryToDelete(cat)}
                      className="h-7 text-xs px-2 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Category changes instantly update POS and inventory filter pills.
            </span>
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 rounded-xl cursor-pointer"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title={`Delete Category "${categoryToDelete?.name}"?`}
        description={
          categoryToDelete?.products_count && categoryToDelete.products_count > 0
            ? `There are currently ${categoryToDelete.products_count} product(s) assigned to this category. Deleting this category will mark those products as uncategorized.`
            : `Are you sure you want to delete this category? It can be restored or recreated later.`
        }
        confirmText="Delete Category"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </>
  );
}
