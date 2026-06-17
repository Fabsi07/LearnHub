"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FEEDBACK_CATEGORIES,
  feedbackCategoryLabels,
  type FeedbackCategory,
} from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

const SELECT_CLASSES =
  "admin-role-select h-10 w-full rounded-lg border border-input px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const OPTION_CLASSES = "admin-role-select-option";

interface FeedbackFormState {
  category: FeedbackCategory;
  title: string;
  description: string;
}

const initialForm: FeedbackFormState = {
  category: "BUG",
  title: "",
  description: "",
};

export function FeedbackForm() {
  const [form, setForm] = useState<FeedbackFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Feedback konnte nicht gesendet werden.");
      }

      setForm(initialForm);
      setMessage({
        type: "success",
        text: "Danke, dein Feedback wurde gespeichert.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Feedback konnte nicht gesendet werden.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-950">Feedback einreichen</h2>
            <p className="text-sm text-gray-500">
              Rueckmeldung, Fehlerbericht oder Idee strukturiert senden.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <Field label="Kategorie" htmlFor="feedback-category">
            <select
              id="feedback-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as FeedbackCategory,
                }))
              }
              className={SELECT_CLASSES}
            >
              {FEEDBACK_CATEGORIES.map((category) => (
                <option key={category} value={category} className={OPTION_CLASSES}>
                  {feedbackCategoryLabels[category]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Titel" htmlFor="feedback-title">
            <Input
              id="feedback-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              required
              minLength={3}
              maxLength={120}
              placeholder="Kurz beschreiben, worum es geht"
              className="h-10 bg-white"
            />
          </Field>

          <Field label="Beschreibung" htmlFor="feedback-description">
            <textarea
              id="feedback-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              required
              minLength={10}
              maxLength={4000}
              rows={8}
              placeholder="Beschreibe, was passiert ist oder was verbessert werden soll."
              className="min-h-[180px] w-full resize-y rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </Field>
        </div>

        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={cn(
              "mt-5 rounded-lg border px-4 py-3 text-sm font-medium",
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {message.text}
          </p>
        )}

        <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
          <Button type="submit" disabled={submitting} className="bg-brand-red text-white hover:bg-brand-red-dark">
            <Send className="h-4 w-4" />
            {submitting ? "Wird gesendet..." : "Feedback senden"}
          </Button>
        </div>
      </form>
    </section>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-gray-700">
        {label}
      </Label>
      {children}
    </div>
  );
}
