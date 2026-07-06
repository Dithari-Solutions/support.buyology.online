"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Category, Platform } from "@/lib/types";
import Spinner from "@/components/support/Spinner";
import PageHeader from "@/components/support/PageHeader";
import Badge from "@/components/support/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import FormAlert from "@/components/support/FormAlert";

export default function PlatformsView() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New platform form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPlatforms(await api.get<Platform[]>("/api/platforms?all=true"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newName.trim()) return;
    try {
      await api.post("/api/platforms", { name: newName.trim(), description: newDesc.trim(), active: true });
      setNewName("");
      setNewDesc("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create platform.");
    }
  };

  return (
    <div>
      <PageHeader title="Platforms & categories" subtitle="Manage the systems users can open tickets against." />
      {error && <div className="mb-4"><FormAlert type="error" message={error} /></div>}

      {/* New platform */}
      <form
        onSubmit={createPlatform}
        className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
      >
        <h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">Add a platform</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input placeholder="e.g. Library System" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Input placeholder="Short description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </div>
        </div>
        <Button size="sm" className="mt-4">
          Add platform
        </Button>
      </form>

      {loading ? (
        <Spinner label="Loading platforms…" />
      ) : (
        <div className="space-y-4">
          {platforms.map((p) => (
            <PlatformCard key={p.id} platform={p} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformCard({ platform, onChanged }: { platform: Platform; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(platform.name);
  const [desc, setDesc] = useState(platform.description ?? "");
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [newCat, setNewCat] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCategories = useCallback(async () => {
    setCategories(await api.get<Category[]>(`/api/platforms/${platform.id}/categories?all=true`));
  }, [platform.id]);

  const toggleExpand = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && categories === null) await loadCategories();
  };

  const savePlatform = async () => {
    setBusy(true);
    try {
      await api.put(`/api/platforms/${platform.id}`, {
        name: name.trim(),
        description: desc.trim(),
        active: platform.active,
      });
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async () => {
    setBusy(true);
    try {
      await api.patch(`/api/platforms/${platform.id}/active?active=${!platform.active}`);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    await api.post(`/api/platforms/${platform.id}/categories`, { name: newCat.trim(), active: true });
    setNewCat("");
    loadCategories();
  };

  const toggleCategory = async (c: Category) => {
    await api.patch(`/api/platforms/categories/${c.id}/active?active=${!c.active}`);
    loadCategories();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {editing ? (
            <div className="space-y-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
            </div>
          ) : (
            <>
              <p className="flex items-center gap-2 font-medium text-gray-800 dark:text-white/90">
                {platform.name}
                {platform.additional && <Badge tone="info">Additional</Badge>}
                <Badge tone={platform.active ? "success" : "gray"}>
                  {platform.active ? "Active" : "Inactive"}
                </Badge>
              </p>
              {platform.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{platform.description}</p>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button type="button" size="sm" onClick={savePlatform} disabled={busy}>
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={toggleActive} disabled={busy}>
                {platform.active ? "Deactivate" : "Activate"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={toggleExpand}>
                Categories {expanded ? "▲" : "▼"}
              </Button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          {categories === null ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-2 text-sm dark:border-gray-800"
                >
                  <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    {c.name}
                    <Badge tone={c.active ? "success" : "gray"}>{c.active ? "Active" : "Inactive"}</Badge>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCategory(c)}
                    className="text-xs text-accent-600 hover:text-accent-500 dark:text-accent-400 dark:hover:text-accent-300"
                  >
                    {c.active ? "Deactivate" : "Activate"}
                  </button>
                </li>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-400">No categories yet.</p>
              )}
            </ul>
          )}
          <form onSubmit={addCategory} className="flex gap-2">
            <Input placeholder="New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <Button size="sm">Add</Button>
          </form>
        </div>
      )}
    </div>
  );
}
