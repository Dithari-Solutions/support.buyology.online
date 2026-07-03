"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Category, Platform, TicketDetail, TicketPriority } from "@/lib/types";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import SelectField from "@/components/support/SelectField";
import FormAlert from "@/components/support/FormAlert";
import PageHeader from "@/components/support/PageHeader";
import { PRIORITY_LABEL } from "@/lib/format";

const PRIORITY_OPTIONS = (["LOW", "MEDIUM", "HIGH", "URGENT"] as TicketPriority[]).map((p) => ({
  value: p,
  label: PRIORITY_LABEL[p],
}));

export default function OpenTicketForm() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [platformId, setPlatformId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [files, setFiles] = useState<FileList | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Platform[]>("/api/platforms").then(setPlatforms).catch(() => setPlatforms([]));
  }, []);

  useEffect(() => {
    setCategoryId("");
    if (!platformId) {
      setCategories([]);
      return;
    }
    api
      .get<Category[]>(`/api/platforms/${platformId}/categories`)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [platformId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!platformId) {
      setError("Please select a platform.");
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await api.post<TicketDetail>("/api/tickets", {
        platformId: Number(platformId),
        categoryId: categoryId ? Number(categoryId) : null,
        subject: subject.trim(),
        description,
        priority,
      });

      // Upload any attachments to the newly created ticket.
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          const form = new FormData();
          form.append("file", file);
          try {
            await api.postForm(`/api/tickets/${ticket.id}/attachments`, form);
          } catch {
            /* keep going — attachment failures shouldn't block navigation */
          }
        }
      }

      router.push(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create the ticket.");
      setSubmitting(false);
    }
  };

  const selectedPlatform = platforms.find((p) => String(p.id) === platformId);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Open a ticket" subtitle="Tell us what you need help with." />

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
      >
        {error && <FormAlert type="error" message={error} />}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label>
              Platform <span className="text-error-500">*</span>
            </Label>
            <SelectField
              options={platforms.map((p) => ({ value: String(p.id), label: p.name }))}
              value={platformId}
              onChange={setPlatformId}
              placeholder="Select a platform or Additional / Other"
            />
            {selectedPlatform?.description && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {selectedPlatform.description}
              </p>
            )}
          </div>

          <div>
            <Label>Category</Label>
            <SelectField
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
              value={categoryId}
              onChange={setCategoryId}
              placeholder={platformId ? "Select a category (optional)" : "Choose a platform first"}
              disabled={!platformId || categories.length === 0}
            />
          </div>
        </div>

        <div>
          <Label>
            Subject <span className="text-error-500">*</span>
          </Label>
          <Input
            placeholder="Short summary of the issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <Label>
            Description <span className="text-error-500">*</span>
          </Label>
          <TextArea
            rows={6}
            placeholder="Describe the problem in detail — what happened, steps to reproduce, error messages, etc."
            value={description}
            onChange={setDescription}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label>Priority</Label>
            <SelectField
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(v) => setPriority(v as TicketPriority)}
            />
          </div>
          <div>
            <Label>Attachments (optional)</Label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-brand-500/10 dark:file:text-brand-300"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button size="sm" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
