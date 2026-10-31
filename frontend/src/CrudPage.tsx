import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { create, list, remove, update } from "./api";
import type { Row } from "./api";
import Table from "./Table";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: string[];
  required?: boolean;
};

type Props = { title: string; path: string; fields: Field[] };

export default function CrudPage({ title, path, fields }: Props) {
  const emptyForm = () =>
    Object.fromEntries(fields.map((f) => [f.name, f.type === "select" ? f.options![0] : ""]));

  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Row>(emptyForm());
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setRows(await list(path));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setForm(emptyForm());
    setEditId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Send numbers as numbers, ignore empty optional fields
    const data: Row = {};
    for (const f of fields) {
      const v = form[f.name];
      if (v === "" || v === undefined) continue;
      data[f.name] = f.type === "number" ? Number(v) : v;
    }
    try {
      if (editId === null) await create(path, data);
      else await update(path, editId, data);
      reset();
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function startEdit(row: Row) {
    setEditId(row.id);
    setForm(Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? ""])));
  }

  async function handleDelete(row: Row) {
    if (!confirm(`Delete #${row.id}?`)) return;
    try {
      await remove(path, row.id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section>
      <h2>{title}</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        {fields.map((f) => (
          <label key={f.name}>
            {f.label}
            {f.type === "textarea" ? (
              <textarea
                value={form[f.name]}
                required={f.required}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
            ) : f.type === "select" ? (
              <select value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                {f.options!.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type ?? "text"}
                value={form[f.name]}
                required={f.required}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
            )}
          </label>
        ))}
        <div className="buttons">
          <button type="submit">{editId === null ? "Create" : `Update #${editId}`}</button>
          {editId !== null && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <Table
        rows={rows}
        columns={["id", ...fields.map((f) => f.name)]}
        actions={(row) => (
          <>
            <button className="secondary" onClick={() => startEdit(row)}>Edit</button>
            <button className="danger" onClick={() => handleDelete(row)}>Delete</button>
          </>
        )}
      />
    </section>
  );
}
