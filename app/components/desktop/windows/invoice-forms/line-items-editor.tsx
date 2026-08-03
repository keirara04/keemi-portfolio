"use client";

import type { LineItem } from "@/lib/invoice";

function makeId() {
  return Math.random().toString(36).slice(2);
}

export function newLineItem(): LineItem {
  return { id: makeId(), description: "", quantity: 1, unitPrice: 0 };
}

export function LineItemsEditor({
  items,
  onChange,
  showSubDescription = false,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  showSubDescription?: boolean;
}) {
  const updateItem = (id: string, patch: Partial<LineItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-black/10 p-2.5 dark:border-white/10">
          <div className="flex gap-2">
            <input
              value={item.description}
              onChange={(e) => updateItem(item.id, { description: e.target.value })}
              placeholder="Description"
              className="min-w-0 flex-1 rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-xs text-zinc-900 dark:border-white/10 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="shrink-0 rounded-md border border-black/10 px-2 text-xs text-zinc-500 hover:border-rose-400 hover:text-rose-600 dark:border-white/10 dark:text-zinc-400"
            >
              Remove
            </button>
          </div>
          {showSubDescription ? (
            <input
              value={item.subDescription ?? ""}
              onChange={(e) => updateItem(item.id, { subDescription: e.target.value })}
              placeholder="Sub-description (optional)"
              className="mt-1.5 w-full rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-xs text-zinc-900 dark:border-white/10 dark:text-zinc-100"
            />
          ) : null}
          <div className="mt-1.5 flex gap-2">
            <label className="flex flex-1 items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              Qty
              <input
                type="number"
                value={item.quantity === 0 ? "" : item.quantity}
                onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) || 0 })}
                className="w-full rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs text-zinc-900 dark:border-white/10 dark:text-zinc-100"
              />
            </label>
            <label className="flex flex-1 items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              Unit price
              <input
                type="number"
                value={item.unitPrice === 0 ? "" : item.unitPrice}
                onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                className="w-full rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs text-zinc-900 dark:border-white/10 dark:text-zinc-100"
              />
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newLineItem()])}
        className="rounded-md border border-dashed border-black/20 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-sky-400 hover:text-sky-600 dark:border-white/20 dark:text-zinc-400"
      >
        + Add row
      </button>
    </div>
  );
}
