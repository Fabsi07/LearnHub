"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Code2,
  MessageSquareText,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { FeedbackManagement } from "@/components/admin/FeedbackManagement";
import type { AdminAnalyticsPayload } from "@/lib/admin/analytics";
import type { AdminUserListItem, AdminUsersPayload } from "@/lib/admin/users";
import type { FeedbackPayload } from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

type AdminRole = "USER" | "ADMIN" | "DEV";

type FormState = {
  displayName: string;
  email: string;
  password: string;
  role: AdminRole;
};

type EditState = Pick<FormState, "displayName" | "role">;

const emptyForm: FormState = {
  displayName: "",
  email: "",
  password: "",
  role: "USER",
};

const roleLabels: Record<FormState["role"], string> = {
  USER: "Nutzer",
  ADMIN: "Admin",
  DEV: "Dev",
};

const SELECT_CLASSES =
  "admin-role-select h-8 w-full rounded-lg border border-input px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const OPTION_CLASSES = "admin-role-select-option";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function roleBadgeClass(role: FormState["role"]) {
  if (role === "ADMIN") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (role === "DEV") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-gray-200 bg-gray-50 text-gray-700";
}

interface AdminDashboardProps {
  initialAnalyticsData: AdminAnalyticsPayload | null;
  initialUsersData: AdminUsersPayload | null;
  initialFeedbackData: FeedbackPayload;
  currentUserId: string;
  currentUserRole: AdminRole;
  fixedAdminEmail: string;
}

export function AdminDashboard({
  initialAnalyticsData,
  initialUsersData,
  initialFeedbackData,
  currentUserId,
  currentUserRole,
  fixedAdminEmail,
}: AdminDashboardProps) {
  const canManageUsers = currentUserRole === "ADMIN";
  const [activeTab, setActiveTab] = useState<"analytics" | "feedback" | "users">(
    canManageUsers && initialAnalyticsData ? "analytics" : "feedback",
  );
  const [feedbackBadgeCount, setFeedbackBadgeCount] = useState(initialFeedbackData.newCount);
  const [users, setUsers] = useState<AdminUserListItem[]>(initialUsersData?.users ?? []);
  const [total, setTotal] = useState(initialUsersData?.total ?? 0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ displayName: "", role: "USER" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "ADMIN").length,
    [users],
  );
  const devCount = useMemo(
    () => users.filter((user) => user.role === "DEV").length,
    [users],
  );

  async function applyResponse(response: Response) {
    const data = (await response.json().catch(() => null)) as
      | (Partial<AdminUsersPayload> & { error?: string })
      | null;

    if (!response.ok) {
      throw new Error(data?.error ?? "Admin-Aktion fehlgeschlagen.");
    }

    if (Array.isArray(data?.users) && typeof data.total === "number") {
      setUsers(data.users);
      setTotal(data.total);
    }
  }

  async function reloadUsers() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/users");
      await applyResponse(response);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Nutzerliste konnte nicht geladen werden.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await applyResponse(response);
      setForm(emptyForm);
      setMessage({ type: "success", text: "Nutzer wurde angelegt." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Nutzer konnte nicht angelegt werden.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user: AdminUserListItem) {
    if (!window.confirm(`${user.displayName} wirklich dauerhaft löschen?`)) {
      return;
    }

    setDeletingId(user.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      await applyResponse(response);
      setMessage({ type: "success", text: "Nutzer wurde gelöscht." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Nutzer konnte nicht gelöscht werden.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  function startEditing(user: AdminUserListItem) {
    setEditingId(user.id);
    setEditForm({ displayName: user.displayName, role: user.role });
    setMessage(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({ displayName: "", role: "USER" });
  }

  async function handleSaveEdit(user: AdminUserListItem) {
    setSavingId(user.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      await applyResponse(response);
      cancelEditing();
      setMessage({ type: "success", text: "Nutzer wurde aktualisiert." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Nutzer konnte nicht aktualisiert werden.",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="flex h-full flex-col gap-5 overflow-auto p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Administration</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950">Verwaltung</h1>
        </div>
        {canManageUsers && activeTab === "users" && (
          <Button type="button" variant="outline" onClick={reloadUsers} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Aktualisieren
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {canManageUsers && initialAnalyticsData && (
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              activeTab === "analytics"
                ? "bg-gray-950 text-white dark:bg-white dark:text-black"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-950",
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Analysen
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("feedback")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
            activeTab === "feedback"
              ? "bg-gray-950 text-white dark:bg-white dark:text-black"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-950",
          )}
        >
          <MessageSquareText className="h-4 w-4" />
          Feedback
          {feedbackBadgeCount > 0 && (
            <span className="rounded-full bg-brand-red px-2 py-0.5 text-xs font-bold text-white">
              {feedbackBadgeCount}
            </span>
          )}
        </button>

        {canManageUsers && (
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              activeTab === "users"
                ? "bg-gray-950 text-white dark:bg-white dark:text-black"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-950",
            )}
          >
            <Users className="h-4 w-4" />
            Benutzer
          </button>
        )}
      </div>

      {activeTab === "analytics" && initialAnalyticsData && (
        <AdminAnalytics initialData={initialAnalyticsData} />
      )}

      {activeTab === "feedback" && (
        <FeedbackManagement
          initialData={initialFeedbackData}
          onNewCountChange={setFeedbackBadgeCount}
        />
      )}

      {activeTab === "users" && canManageUsers && (
        <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-950">{total}</p>
              <p className="text-sm text-gray-500">Registrierte Accounts</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-950">{adminCount}</p>
              <p className="text-sm text-gray-500">Admin-Accounts</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-950">{devCount}</p>
              <p className="text-sm text-gray-500">Dev-Accounts</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Fester Admin
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-gray-950">
            {fixedAdminEmail}
          </p>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={cn(
            "rounded-lg border px-4 py-3 text-sm font-medium",
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {message.text}
        </p>
      )}

      <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleCreate}
          className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-950">Neuen Nutzer anlegen</h2>
              <p className="text-sm text-gray-500">Name, Login und Rolle vergeben.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Name" htmlFor="admin-display-name">
              <Input
                id="admin-display-name"
                value={form.displayName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, displayName: event.target.value }))
                }
                required
                maxLength={80}
                autoComplete="name"
              />
            </Field>
            <Field label="E-Mail" htmlFor="admin-email">
              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Passwort" htmlFor="admin-password">
              <Input
                id="admin-password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
                minLength={8}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Rolle" htmlFor="admin-role">
              <select
                id="admin-role"
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as FormState["role"],
                  }))
                }
                className={SELECT_CLASSES}
              >
                <option value="USER" className={OPTION_CLASSES}>
                  Nutzer
                </option>
                <option value="ADMIN" className={OPTION_CLASSES}>
                  Admin
                </option>
                <option value="DEV" className={OPTION_CLASSES}>
                  Dev
                </option>
              </select>
            </Field>
          </div>

          <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
            <Button type="submit" disabled={submitting}>
              <UserPlus className="h-4 w-4" />
              {submitting ? "Wird angelegt..." : "Anlegen"}
            </Button>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-950">Alle Accounts</h2>
              <p className="text-sm text-gray-500">Name, E-Mail, Registrierung und Rolle.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">E-Mail</th>
                  <th className="px-5 py-3">Registriert</th>
                  <th className="px-5 py-3">Rolle</th>
                  <th className="px-5 py-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const deleteDisabled = isSelf || user.isFixedAdmin || deletingId === user.id;
                  const isEditing = editingId === user.id;
                  const roleChangeDisabled = isSelf || user.isFixedAdmin;

                  return (
                    <tr key={user.id} className="align-middle">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                            {user.displayName
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase())
                              .join("") || "LH"}
                          </div>
                          <div className="min-w-0">
                            {isEditing ? (
                              <Input
                                value={editForm.displayName}
                                onChange={(event) =>
                                  setEditForm((current) => ({
                                    ...current,
                                    displayName: event.target.value,
                                  }))
                                }
                                maxLength={80}
                                className="h-8 min-w-[180px]"
                              />
                            ) : (
                              <p className="truncate font-semibold text-gray-950">
                                {user.displayName}
                              </p>
                            )}
                            {isSelf && (
                              <p className="text-xs text-gray-500">Aktuelle Session</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{user.email}</td>
                      <td className="px-5 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select
                            value={editForm.role}
                            disabled={roleChangeDisabled}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                role: event.target.value as FormState["role"],
                              }))
                            }
                            className={cn(SELECT_CLASSES, "min-w-[120px]")}
                          >
                            <option value="USER" className={OPTION_CLASSES}>
                              Nutzer
                            </option>
                            <option value="ADMIN" className={OPTION_CLASSES}>
                              Admin
                            </option>
                            <option value="DEV" className={OPTION_CLASSES}>
                              Dev
                            </option>
                          </select>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                              roleBadgeClass(user.role),
                            )}
                          >
                            {roleLabels[user.role]}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                disabled={savingId === user.id}
                                onClick={() => handleSaveEdit(user)}
                              >
                                <Save className="h-4 w-4" />
                                {savingId === user.id ? "Speichert..." : "Speichern"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={savingId === user.id}
                                onClick={cancelEditing}
                              >
                                <X className="h-4 w-4" />
                                Abbrechen
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(user)}
                              >
                                <Pencil className="h-4 w-4" />
                                Bearbeiten
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={deleteDisabled}
                                title={
                                  isSelf || user.isFixedAdmin
                                    ? "Dieser Admin-Account kann nicht gelöscht werden"
                                    : "Nutzer löschen"
                                }
                                onClick={() => handleDelete(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingId === user.id ? "Löscht..." : "Löschen"}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
        </>
      )}
    </main>
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
