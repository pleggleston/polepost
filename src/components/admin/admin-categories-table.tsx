'use client';

import { useActionState } from 'react';
import { createCategoryAction, toggleCategoryAction } from '@/app/(admin)/admin/categories/actions';
import type { AdminCategory } from '@/lib/admin/categories';

type ActionState = { error: string | null };
const defaultState: ActionState = { error: null };

type AdminCategoriesTableProps = {
  categories: AdminCategory[];
};

export function AdminCategoriesTable({ categories }: AdminCategoriesTableProps) {
  const [createState, createAction, createPending] = useActionState(createCategoryAction, defaultState);

  return (
    <div className="space-y-4">
      {/* Category list */}
      <div className="overflow-hidden rounded-xl border border-border">
        {categories.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Label</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Order</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <CategoryRow key={cat.id} category={cat} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add category form */}
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Add category</h2>
        <form action={createAction} className="flex gap-2">
          {createState.error ? (
            <p className="w-full rounded-md bg-destructive/10 p-2 text-sm text-destructive">{createState.error}</p>
          ) : null}
          <input
            name="label"
            required
            minLength={2}
            maxLength={60}
            placeholder="Category label (e.g. Comedy)"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={createPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createPending ? 'Adding…' : 'Add'}
          </button>
        </form>
      </section>
    </div>
  );
}

function CategoryRow({ category }: { category: AdminCategory }) {
  const handleToggle = async () => {
    await toggleCategoryAction(category.id, !category.is_active);
  };

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium">{category.label}</td>
      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{category.slug}</td>
      <td className="px-4 py-3 text-muted-foreground">{category.sort_order}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            category.is_active
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {category.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <form action={handleToggle}>
          <button
            type="submit"
            className="rounded-md border border-input px-3 py-1 text-xs font-medium hover:bg-muted"
          >
            {category.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </form>
      </td>
    </tr>
  );
}
