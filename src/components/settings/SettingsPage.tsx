"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  CalendarClock,
  Clock,
  ImagePlus,
  KeyRound,
  Mail,
  Save,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth/session";
import { AvatarCropperModal } from "@/components/settings/AvatarCropperModal";

type SettingsCategoryId = "profile" | "notifications" | "calendar";

type SettingsCategory = {
  id: SettingsCategoryId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const settingsCategories: SettingsCategory[] = [
  { id: "profile", label: "Profil", icon: User },
  { id: "notifications", label: "Benachrichtigungen", icon: Bell },
  { id: "calendar", label: "Kalender", icon: CalendarDays },
];

const reminderOptions: { label: string; minutes: number }[] = [
  { label: "10 Minuten vorher", minutes: 10 },
  { label: "1 Stunde vorher", minutes: 60 },
  { label: "1 Tag vorher", minutes: 1440 },
  { label: "3 Tage vorher", minutes: 4320 },
];
const digestTimes = ["07:00", "12:00", "18:00", "20:00"];

// S-15 Fix: Wiederverwendbarer Tailwind-String für native <select>-Elemente.
const SELECT_CLASSES =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface NotificationSettingsState {
  missedSessionRescheduleEnabled: boolean;
  missedSessionReplanWarningEnabled: boolean;
  deadlineRemindersEnabled: boolean;
  deadlineLeadMinutes: number;
  dailyDigestEnabled: boolean;
  digestTime: string;
  sessionRemindersEnabled: boolean;
  overdueTaskRemindersEnabled: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsState = {
  missedSessionRescheduleEnabled: true,
  missedSessionReplanWarningEnabled: true,
  deadlineRemindersEnabled: true,
  deadlineLeadMinutes: 1440,
  dailyDigestEnabled: true,
  digestTime: "18:00",
  sessionRemindersEnabled: true,
  overdueTaskRemindersEnabled: false,
};

export function SettingsPage({ currentUser }: { currentUser?: CurrentUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentUser?.avatarUrl ?? null,
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // displayName → Vorname / Nachname aufsplitten
  const nameParts = currentUser?.displayName?.trim().split(/\s+/).filter(Boolean) ?? [];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  // Username-Fallback: Teil vor dem @
  const username =
    currentUser?.username ??
    currentUser?.email?.split("@")[0]?.replace(/[^A-Za-z0-9._-]/g, "_") ??
    "";

  const tabParam = searchParams.get("tab");
  // S-2 Fix: Default-Tab ist 'profile'.
  const activeCategory: SettingsCategoryId =
    settingsCategories.find((category) => category.id === tabParam)?.id ?? "profile";

  // S-12 Fix: Direkt berechnen statt useMemo.
  const activeTitle =
    settingsCategories.find((category) => category.id === activeCategory)?.label ?? "Einstellungen";

  // S-3 Fix: ObjectURL beim Wechsel/Unmount revoken (Memory-Leak verhindern).
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setAvatarError(null);

    if (!file) {
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Bitte ein PNG-, JPEG- oder WebP-Bild auswählen.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Datei ist zu groß (max. 5 MB).");
      event.target.value = "";
      return;
    }

    setCropFile(file);
  }

  function handleCropConfirm(blob: Blob) {
    setCropFile(null);

    setAvatarPreview((previous) => {
      if (previous && previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(blob);
    });

    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("avatar", blob, "avatar.jpg");
    fetch("/api/profile/avatar", { method: "POST", body: formData })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          setAvatarError(body.error ?? "Upload fehlgeschlagen.");
        } else {
          if (fileInputRef.current) fileInputRef.current.value = "";
          router.refresh();
        }
      })
      .catch(() => setAvatarError("Upload fehlgeschlagen. Bitte erneut versuchen."))
      .finally(() => setAvatarUploading(false));
  }

  function handleCropCancel() {
    setCropFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleCategoryChange(categoryId: SettingsCategoryId) {
    router.replace(`/settings?tab=${categoryId}`, { scroll: false });
  }

  return (
    <main className="h-full px-6 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div>
          <p className="text-sm font-medium text-gray-500">Einstellungen</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950">{activeTitle}</h1>
        </div>

        <div
          role="tablist"
          aria-label="Einstellungs-Kategorien"
          className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
        >
          {settingsCategories.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeCategory;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategoryChange(id)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-950",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {activeCategory === "profile" && (
          <ProfileSettings
            avatarPreview={avatarPreview}
            avatarError={avatarError}
            avatarUploading={avatarUploading}
            fileInputRef={fileInputRef}
            onAvatarChange={handleAvatarChange}
            firstName={firstName}
            lastName={lastName}
            username={username}
            email={currentUser?.email ?? ""}
          />
        )}
        {activeCategory === "notifications" && <NotificationSettings />}
        {activeCategory === "calendar" && <CalendarSettings />}
      </div>

      {cropFile && (
        <AvatarCropperModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </main>
  );
}

interface ProfileSettingsProps {
  avatarPreview: string | null;
  avatarError: string | null;
  avatarUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

function ProfileSettings({
  avatarPreview,
  avatarError,
  avatarUploading,
  fileInputRef,
  onAvatarChange,
  firstName: initialFirstName,
  lastName: initialLastName,
  username: initialUsername,
  email: initialEmail,
}: ProfileSettingsProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [username, setUsername] = useState(initialUsername);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // S-5 Fix: Submit-Handler verhindert Page-Reload (echte Persistenz folgt mit API).
  useEffect(() => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setUsername(initialUsername);
  }, [initialFirstName, initialLastName, initialUsername]);

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, username }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        user?: {
          displayName: string;
          username: string | null;
        };
        error?: string;
      };

      if (!response.ok || !data.user) {
        throw new Error(data.error ?? "Profil konnte nicht gespeichert werden.");
      }

      const savedNameParts = data.user.displayName.trim().split(/\s+/).filter(Boolean);
      setFirstName(savedNameParts[0] ?? "");
      setLastName(savedNameParts.slice(1).join(" "));
      setUsername(data.user.username ?? "");
      setFeedback({ type: "success", message: "Profil gespeichert." });
      router.refresh();
    } catch (saveError) {
      setFeedback({
        type: "error",
        message:
          saveError instanceof Error
            ? saveError.message
            : "Profil konnte nicht gespeichert werden.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-950">Profilbild</h2>
        <div className="mt-5 flex flex-col items-center gap-4">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Profilvorschau" className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_AVATAR_TYPES.join(",")}
            className="hidden"
            onChange={onAvatarChange}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            {avatarUploading ? "Wird hochgeladen…" : "Bild hochladen"}
          </Button>
          {avatarError && (
            <p role="alert" className="text-center text-xs text-red-600">
              {avatarError}
            </p>
          )}
          <p className="text-center text-xs text-gray-500">PNG, JPEG oder WebP, max. 5 MB.</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
          <h2 className="text-base font-semibold text-gray-950">Kontodaten</h2>
          <p className="text-sm text-gray-500">Name, Username, E-Mail und Passwort verwalten.</p>
        </div>

        <form className="mt-5 grid gap-5" onSubmit={handleProfileSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" htmlFor="first-name">
              {/* S-14 Fix: name-Attribut. Controlled input — kein uncontrolled-Warning. */}
              <Input
                id="first-name"
                name="firstName"
                value={firstName}
                disabled={isSaving}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>
            <Field label="Nachname" htmlFor="last-name">
              <Input
                id="last-name"
                name="lastName"
                value={lastName}
                disabled={isSaving}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Username" htmlFor="username">
            <Input
              id="username"
              name="username"
              value={username}
              disabled={isSaving}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="E-Mail" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                value={initialEmail}
                readOnly
                className="cursor-default text-gray-500"
              />
            </Field>
            <Button type="button" variant="outline" className="md:mb-0" disabled>
              <Mail className="h-4 w-4" />
              E-Mail ändern
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-950">Passwort</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sende einen Link zum Zurücksetzen deines Passworts.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/forgot-password")}
            >
              <KeyRound className="h-4 w-4" />
              Passwort zurücksetzen
            </Button>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-4">
            {feedback && (
              <p
                role={feedback.type === "error" ? "alert" : "status"}
                aria-live={feedback.type === "error" ? "assertive" : "polite"}
                className={cn(
                  "mr-auto text-sm font-medium",
                  feedback.type === "success" ? "text-green-600" : "text-red-600",
                )}
              >
                {feedback.message}
              </p>
            )}
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4" />
              Änderungen speichern
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsState>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings/notifications", {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => ({}))) as {
          settings?: NotificationSettingsState;
          error?: string;
        };

        if (!response.ok || !data.settings) {
          throw new Error(data.error ?? "Einstellungen konnten nicht geladen werden.");
        }

        if (!cancelled) {
          setSettings(data.settings);
          setFeedback(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setFeedback({
            type: "error",
            message:
              loadError instanceof Error
                ? loadError.message
                : "Einstellungen konnten nicht geladen werden.",
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleNotificationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await response.json().catch(() => ({}))) as {
        settings?: NotificationSettingsState;
        error?: string;
      };

      if (!response.ok || !data.settings) {
        throw new Error(data.error ?? "Einstellungen konnten nicht gespeichert werden.");
      }

      setSettings(data.settings);
      setFeedback({
        type: "success",
        message: "Benachrichtigungseinstellungen gespeichert.",
      });
    } catch (saveError) {
      setFeedback({
        type: "error",
        message:
          saveError instanceof Error
            ? saveError.message
            : "Einstellungen konnten nicht gespeichert werden.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-base font-semibold text-gray-950">Benachrichtigungen</h2>
        <p className="text-sm text-gray-500">
          Erinnerungen und Lernübersichten für deinen Alltag steuern.
        </p>
      </div>

      <form className="mt-5 grid gap-5" onSubmit={handleNotificationSubmit}>
        <SettingsBlock
          icon={Bell}
          title="Verpasste Lernsessions"
          description="Steuert Hinweise, wenn geplante Lerneinheiten abgelaufen und die verknüpften Aufgaben noch offen sind."
        >
          <CheckboxField
            id="missed-session-reschedule"
            name="missedSessionRescheduleEnabled"
            label="Bei 1 bis 2 verpassten Sessions einen Hinweis zum Verschieben anzeigen"
            checked={settings.missedSessionRescheduleEnabled}
            disabled={isLoading || isSaving}
            onCheckedChange={(checked) =>
              setSettings((previous) => ({
                ...previous,
                missedSessionRescheduleEnabled: checked,
              }))
            }
          />
          <CheckboxField
            id="missed-session-replan"
            name="missedSessionReplanWarningEnabled"
            label="Ab 3 verpassten Sessions eine Warnung zum Neuplanen anzeigen"
            checked={settings.missedSessionReplanWarningEnabled}
            disabled={isLoading || isSaving}
            onCheckedChange={(checked) =>
              setSettings((previous) => ({
                ...previous,
                missedSessionReplanWarningEnabled: checked,
              }))
            }
          />
        </SettingsBlock>

        <SettingsBlock
          icon={CalendarClock}
          title="Deadline-Erinnerungen"
          description="Erinnert dich rechtzeitig an Aufgaben, Prüfungen und Abgaben."
        >
          <CheckboxField
            id="deadline-reminders"
            name="deadlineReminders"
            label="Deadline-Erinnerungen aktivieren"
            checked={settings.deadlineRemindersEnabled}
            disabled={isLoading || isSaving}
            onCheckedChange={(checked) =>
              setSettings((previous) => ({
                ...previous,
                deadlineRemindersEnabled: checked === true,
              }))
            }
          />
          <Field label="Erinnerungsvorlauf" htmlFor="deadline-lead-time">
            <select
              id="deadline-lead-time"
              name="deadlineLeadTime"
              value={settings.deadlineLeadMinutes}
              disabled={isLoading || isSaving || !settings.deadlineRemindersEnabled}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  deadlineLeadMinutes: Number(event.target.value),
                }))
              }
              className={SELECT_CLASSES}
            >
              {reminderOptions.map((option) => (
                <option key={option.minutes} value={option.minutes}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </SettingsBlock>

        <SettingsBlock
          icon={Clock}
          title="Tägliche Lernübersicht"
          description="Fasst deine heutigen Lernsessions, offenen Aufgaben und Fristen zusammen."
        >
          <CheckboxField
            id="daily-digest"
            name="dailyDigest"
            label="Tägliche Lernübersicht aktivieren"
            checked={settings.dailyDigestEnabled}
            disabled={isLoading || isSaving}
            onCheckedChange={(checked) =>
              setSettings((previous) => ({
                ...previous,
                dailyDigestEnabled: checked,
              }))
            }
          />
          <Field label="Uhrzeit" htmlFor="digest-time">
            <select
              id="digest-time"
              name="digestTime"
              value={settings.digestTime}
              disabled={isLoading || isSaving || !settings.dailyDigestEnabled}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  digestTime: event.target.value,
                }))
              }
              className={SELECT_CLASSES}
            >
              {digestTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </Field>
        </SettingsBlock>

        <SettingsBlock
          icon={Bell}
          title="Lernsessions"
          description="Benachrichtigungen für geplante Lernzeiten und wiederkehrende Sessions."
        >
          <CheckboxField
            id="session-reminders"
            name="sessionReminders"
            label="Erinnerungen für geplante Lernsessions"
            checked={settings.sessionRemindersEnabled}
            disabled={isLoading || isSaving}
            onCheckedChange={(checked) =>
              setSettings((previous) => ({
                ...previous,
                sessionRemindersEnabled: checked === true,
              }))
            }
          />
          <CheckboxField
            id="overdue-tasks"
            name="overdueTasks"
            label="Überfällige Aufgaben zusätzlich hervorheben"
            checked={settings.overdueTaskRemindersEnabled}
            disabled={isLoading || isSaving}
            onCheckedChange={(checked) =>
              setSettings((previous) => ({
                ...previous,
                overdueTaskRemindersEnabled: checked === true,
              }))
            }
          />
        </SettingsBlock>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          {feedback && (
            <p
              className={cn(
                "mr-auto text-sm font-medium",
                feedback.type === "success" ? "text-green-600" : "text-red-600",
              )}
            >
              {feedback.message}
            </p>
          )}
          <Button type="submit" disabled={isLoading || isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Wird gespeichert" : "Einstellungen speichern"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function CalendarSettings() {
  const [courseCode, setCourseCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Gespeicherte Kurskennung beim Laden abrufen
  useEffect(() => {
    fetch("/api/calendar/sources")
      .then((r) => r.json())
      .then((data) => {
        if (data.source?.name) {
          const match = data.source.name.match(/\((.+)\)$/);
          if (match) setCourseCode(match[1].trim());
        }
      })
      .catch(() => {/* nicht eingeloggt oder Fehler – ignorieren */})
      .finally(() => setIsLoading(false));
  }, []);

  async function handleScheduleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || !courseCode.trim()) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/calendar/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode }),
      });

      if (res.ok) {
        setFeedback({ type: "success", message: `Stundenplan für ${courseCode.toUpperCase()} gespeichert.` });
      } else {
        const data = await res.json();
        setFeedback({ type: "error", message: data.error ?? "Fehler beim Speichern." });
      }
    } catch {
      setFeedback({ type: "error", message: "Netzwerkfehler. Bitte erneut versuchen." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-base font-semibold text-gray-950">Kalender</h2>
        <p className="text-sm text-gray-500">
          Gib dein Kurskürzel ein. Der DHBW-Stundenplan wird automatisch geladen.
        </p>
      </div>

      <form className="mt-5 grid max-w-xl gap-5" onSubmit={handleScheduleImport}>
        <Field label="Kurskennung" htmlFor="schedule-group">
          <Input
            id="schedule-group"
            name="scheduleGroup"
            placeholder="Kurskürzel eingeben, z.B. TIF25A"
            value={isLoading ? "" : courseCode}
            disabled={isLoading}
            onChange={(e) => setCourseCode(e.target.value)}
          />
          <p className="text-xs text-gray-400">
            Der Link wird automatisch zusammengestellt: stash.dhbw-loerrach.de/calendar/<strong>{courseCode ? courseCode.trim().toLowerCase() : "kurskuerzel"}</strong>@dhbw-loerrach.de.ics
          </p>
        </Field>

        {feedback && (
          <p className={`text-sm font-medium ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {feedback.message}
          </p>
        )}

        <div className="flex justify-end border-t border-gray-100 pt-4">
          {isSaving ? (
            <div
              role="status"
              aria-live="polite"
              className="flex h-9 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3"
            >
              <CalendarDays className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Stundenplan wird gespeichert</span>
              <div className="flex items-center gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
              </div>
            </div>
          ) : (
            <Button type="submit" disabled={!courseCode.trim()}>
              <CalendarDays className="h-4 w-4" />
              Stundenplan speichern
            </Button>
          )}
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

interface CheckboxFieldProps {
  id: string;
  label: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function CheckboxField({
  id,
  label,
  name,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={(nextChecked) => onCheckedChange?.(nextChecked)}
      />
      <Label
        htmlFor={id}
        className={cn("text-gray-700", disabled && "text-gray-400")}
      >
        {label}
      </Label>
    </div>
  );
}

interface SettingsBlockProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsBlock({ icon: Icon, title, description, children }: SettingsBlockProps) {
  return (
    <div className="grid gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-[220px_1fr] md:gap-6">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
        </div>
      </div>
      <div className="grid content-start gap-4">{children}</div>
    </div>
  );
}
