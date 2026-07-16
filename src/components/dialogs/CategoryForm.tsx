'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDialog } from './FormDialog';
import { useCreateCategory, useUpdateCategory, type Category } from '@/hooks/useCategories';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  category?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({ open, onOpenChange, mode, category, onSuccess }: CategoryFormProps) {
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      description: category.description,
    } : {
      name: '',
      description: '',
    },
  });

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const onSubmit = async (data: CategoryFormData) => {
    if (isCreate) {
      await createCategory.mutateAsync(data);
    } else if (isEdit && category?._id) {
      await updateCategory.mutateAsync({ id: category._id, data });
    }
    onSuccess?.();
    onOpenChange(false);
    form.reset();
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${isCreate ? 'Create' : 'Edit'} Category`}
      isLoading={createCategory.isPending || updateCategory.isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={isCreate ? 'Create Category' : 'Update Category'}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="e.g., Beverages, Snacks, Dairy"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...form.register('description')}
            placeholder="Brief description of this category"
            rows={3}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
