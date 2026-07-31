"use client";

import { useCallback, useEffect, useState } from "react";
import type { EntityConfig, FieldConfig } from "./entity-configs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

type Row = Record<string, unknown> & { id: string };

function emptyFormValues(fields: FieldConfig[]): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {};
  for (const field of fields) {
    values[field.name] = field.type === "boolean" ? false : "";
  }
  return values;
}

function rowToFormValues(row: Row, fields: FieldConfig[]): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {};
  for (const field of fields) {
    const raw = row[field.name];
    if (field.type === "boolean") {
      values[field.name] = Boolean(raw);
    } else if (field.type === "stringList") {
      values[field.name] = Array.isArray(raw) ? raw.join(", ") : "";
    } else {
      values[field.name] = raw == null ? "" : String(raw);
    }
  }
  return values;
}

function formValuesToPayload(
  values: Record<string, string | boolean>,
  fields: FieldConfig[]
): Record<string, unknown> {
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
    } else {
      payload[field.name] = raw;
    }
  }
  return payload;
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

function EntityForm({
  config,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  config: EntityConfig;
  initialValues: Record<string, string | boolean>;
  onSubmit: (values: Record<string, string | boolean>) => Promise<void>;
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
      {config.fields.map((field) => (
        <div key={field.name}>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {field.label}
          </label>
          <FieldInput
            field={field}
            value={values[field.name]}
            onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
            disabled={field.readOnlyOnEdit && submitLabel === "Save"}
          />
        </div>
      ))}
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

  const handleCreate = async (values: Record<string, string | boolean>) => {
    const response = await fetch(`${API_BASE_URL}${config.apiPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValuesToPayload(values, config.fields)),
    });
    if (!response.ok) throw new Error("create failed");
    setCreating(false);
    await load();
  };

  const handleUpdate = async (id: string, values: Record<string, string | boolean>) => {
    const response = await fetch(`${API_BASE_URL}${config.apiPath}/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}${config.apiPath}/${id}`, { method: "DELETE" });
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

      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {editingId === row.id ? (
              <EntityForm
                config={config}
                initialValues={rowToFormValues(row, config.fields)}
                onSubmit={(values) => handleUpdate(row.id, values)}
                onCancel={() => setEditingId(null)}
                submitLabel="Save"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-800 dark:text-zinc-200">
                  {String(row[config.titleField] ?? row.id)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(row.id)}
                    className="text-xs text-sky-600 hover:underline dark:text-sky-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {rows.length === 0 && !creating && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No {config.label.toLowerCase()} yet.</p>
        )}
      </ul>
    </div>
  );
}
