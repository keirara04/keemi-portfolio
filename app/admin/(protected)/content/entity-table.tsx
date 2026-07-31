"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { EntityConfig, FieldConfig } from "./entity-configs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

type Row = Record<string, unknown> & { id: string };
type Screenshot = { src: string; alt: string };
type FieldValue = string | boolean | Screenshot[];
type FormValues = Record<string, FieldValue>;

function emptyFormValues(fields: FieldConfig[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    if (field.type === "boolean") values[field.name] = false;
    else if (field.type === "imageList") values[field.name] = [];
    else values[field.name] = "";
  }
  return values;
}

function rowToFormValues(row: Row, fields: FieldConfig[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const raw = row[field.name];
    if (field.type === "boolean") {
      values[field.name] = Boolean(raw);
    } else if (field.type === "stringList") {
      values[field.name] = Array.isArray(raw) ? raw.join(", ") : "";
    } else if (field.type === "imageList") {
      values[field.name] = Array.isArray(raw) ? (raw as Screenshot[]) : [];
    } else {
      values[field.name] = raw == null ? "" : String(raw);
    }
  }
  return values;
}

function formValuesToPayload(values: FormValues, fields: FieldConfig[]): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = values[field.name];
    if (field.type === "number") {
      payload[field.name] = raw === "" ? 0 : Number(raw);
    } else if (field.type === "stringList") {
      payload[field.name] = String(raw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (field.type === "boolean") {
      payload[field.name] = Boolean(raw);
    } else if (field.type === "imageList") {
      payload[field.name] = raw;
    } else {
      payload[field.name] = raw;
    }
  }
  return payload;
}

function formatCellValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return "—";
  return String(value);
}

function FieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FieldConfig;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  disabled?: boolean;
}) {
  const baseClass =
    "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-60";

  if (field.type === "boolean") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4"
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
        className={baseClass}
      />
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={baseClass}
    />
  );
}

function ImageListInput({
  value,
  onChange,
}: {
  value: Screenshot[];
  onChange: (value: Screenshot[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE_URL}/admin/uploads`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error();
      const { url } = await response.json();
      onChange([...value, { src: url, alt: "" }]);
    } catch {
      setError("Upload failed — is Spaces configured?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value.map((shot, index) => (
        <div
          key={shot.src}
          className="flex items-center gap-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-700"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-uploaded URLs, not a next/image remote pattern */}
          <img src={shot.src} alt={shot.alt} className="h-12 w-12 rounded object-cover" />
          <input
            type="text"
            value={shot.alt}
            onChange={(e) => {
              const next = [...value];
              next[index] = { ...next[index], alt: e.target.value };
              onChange(next);
            }}
            placeholder="Alt text"
            className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="text-xs text-red-600 hover:underline dark:text-red-400"
          >
            Remove
          </button>
        </div>
      ))}
      <label className="w-fit cursor-pointer rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        {uploading ? "Uploading…" : "+ Upload image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function EntityForm({
  config,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  config: EntityConfig;
  initialValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch {
      setError("Save failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      {config.fields.map((field) => {
        if (field.hiddenOnCreate && submitLabel === "Create") return null;
        return (
        <div key={field.name}>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {field.label}
          </label>
          {field.type === "imageList" ? (
            <ImageListInput
              value={values[field.name] as Screenshot[]}
              onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
            />
          ) : (
            <FieldInput
              field={field}
              value={values[field.name] as string | boolean}
              onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
              disabled={field.readOnlyOnEdit && submitLabel === "Save"}
            />
          )}
        </div>
        );
      })}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function EntityTable({ config }: { config: EntityConfig }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${config.apiPath}`);
      if (!response.ok) throw new Error();
      setRows(await response.json());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [config.apiPath]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleCreate = async (values: FormValues) => {
    const response = await fetch(`${API_BASE_URL}${config.apiPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValuesToPayload(values, config.fields)),
    });
    if (!response.ok) throw new Error("create failed");
    setCreating(false);
    await load();
  };

  const handleUpdate = async (id: string, values: FormValues) => {
    const response = await fetch(`${API_BASE_URL}${config.apiPath}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValuesToPayload(values, config.fields)),
    });
    if (!response.ok) throw new Error("update failed");
    setEditingId(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const response = await fetch(`${API_BASE_URL}${config.apiPath}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (response.ok) await load();
  };

  if (loadError) {
    return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load {config.label}.</p>;
  }

  if (rows === null) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{config.label}</h2>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
          >
            + New
          </button>
        )}
      </div>

      {creating && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <EntityForm
            config={config}
            initialValues={emptyFormValues(config.fields)}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
            submitLabel="Create"
          />
        </div>
      )}

      {rows.length === 0 && !creating ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No {config.label.toLowerCase()} yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                {(config.listColumns ?? [{ name: config.titleField, label: config.titleField }]).map(
                  (col) => (
                    <th key={col.name} className="px-4 py-2.5 font-medium">
                      {col.label}
                    </th>
                  )
                )}
                <th className="px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((row) => {
                const columns = config.listColumns ?? [
                  { name: config.titleField, label: config.titleField },
                ];
                if (editingId === row.id) {
                  return (
                    <tr key={row.id} className="bg-white dark:bg-zinc-900">
                      <td colSpan={columns.length + 1} className="p-4">
                        <EntityForm
                          config={config}
                          initialValues={rowToFormValues(row, config.fields)}
                          onSubmit={(values) => handleUpdate(row.id, values)}
                          onCancel={() => setEditingId(null)}
                          submitLabel="Save"
                        />
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={row.id} className="bg-white dark:bg-zinc-900">
                    {columns.map((col) => (
                      <td key={col.name} className="max-w-xs truncate px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {formatCellValue(row[col.name])}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingId(row.id)}
                          aria-label="Edit"
                          className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          aria-label="Delete"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
