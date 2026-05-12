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

const reminderOptions = ["10 Minuten vorher", "1 Stunde vorher", "1 Tag vorher", "3 Tage vorher"];
const digestTimes = ["07:00", "12:00", "18:00", "20:00"];

// S-15 Fix: Wiederverwendbarer Tailwind-String für native <select>-Elemente.
const SELECT_CLASSES =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // S-4 Fix: MIME- und Größenvalidierung.
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

    setAvatarPreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(file);
    });
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
                    ? "bg-gray-900 text-white shadow-sm"
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
            fileInputRef={fileInputRef}
            onAvatarChange={handleAvatarChange}
          />
        )}
        {activeCategory === "notifications" && <NotificationSettings />}
        {activeCategory === "calendar" && <CalendarSettings />}
      </div>
    </main>
  );
}

interface ProfileSettingsProps {
  avatarPreview: string | null;
  avatarError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProfileSettings({
  avatarPreview,
  avatarError,
  fileInputRef,
  onAvatarChange,
}: ProfileSettingsProps) {
  // S-5 Fix: Submit-Handler verhindert Page-Reload (echte Persistenz folgt mit API).
  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: An /api/profile anbinden, sobald verfügbar.
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
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            Bild hochladen
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
              {/* S-11 Fix: Generische Demo-Daten statt echter Personendaten. S-14 Fix: name-Attribut. */}
              <Input id="first-name" name="firstName" defaultValue="Max" />
            </Field>
            <Field label="Nachname" htmlFor="last-name">
              <Input id="last-name" name="lastName" defaultValue="Mustermann" />
            </Field>
          </div>

          <Field label="Username" htmlFor="username">
            <Input id="username" name="username" defaultValue="max.mustermann" />
          </Field>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="E-Mail" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue="demo@learnhub.de"
              />
            </Field>
            <Button type="button" variant="outline" className="md:mb-0">
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
            <Button type="button" variant="outline">
              <KeyRound className="h-4 w-4" />
              Passwort zurücksetzen
            </Button>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button type="submit">
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
  // S-5 Fix: Submit-Handler.
  function handleNotificationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: An /api/settings/notifications anbinden.
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
          icon={CalendarClock}
          title="Deadline-Erinnerungen"
          description="Erinnert dich rechtzeitig an Aufgaben, Prüfungen und Abgaben."
        >
          <CheckboxField
            id="deadline-reminders"
            name="deadlineReminders"
            label="Deadline-Erinnerungen aktivieren"
            defaultChecked
          />
          <Field label="Erinnerungsvorlauf" htmlFor="deadline-lead-time">
            <select
              id="deadline-lead-time"
              name="deadlineLeadTime"
              defaultValue="1 Tag vorher"
              className={SELECT_CLASSES}
            >
              {reminderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
            defaultChecked
          />
          <Field label="Uhrzeit" htmlFor="digest-time">
            <select
              id="digest-time"
              name="digestTime"
              defaultValue="18:00"
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
            defaultChecked
          />
          <CheckboxField
            id="overdue-tasks"
            name="overdueTasks"
            label="Überfällige Aufgaben zusätzlich hervorheben"
          />
        </SettingsBlock>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <Button type="submit">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      </form>
    </section>
  );
}

function CalendarSettings() {
  const [isImporting, setIsImporting] = useState(false);

  // S-10 Hinweis: Fake-Import bis API/ICS-Endpoint existiert.
  function handleScheduleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isImporting) {
      return;
    }

    setIsImporting(true);
    // TODO: Echten Import an /api/calendar/import anbinden.
    window.setTimeout(() => setIsImporting(false), 1600);
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        {/* S-1 Fix: Englische Überschrift -> Deutsch. */}
        <h2 className="text-base font-semibold text-gray-950">Kalender</h2>
        <p className="text-sm text-gray-500">
          Wähle aus, welchen Stundenplan du in den Kalender importieren willst.
        </p>
      </div>

      <form className="mt-5 grid max-w-xl gap-5" onSubmit={handleScheduleImport}>
        <Field label="Stundenplan" htmlFor="schedule-group">
          <Input id="schedule-group" name="scheduleGroup" placeholder="TIF25A" />
        </Field>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          {isImporting ? (
            <div
              role="status"
              aria-live="polite"
              className="flex h-9 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3"
            >
              <CalendarDays className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Stundenplan wird importiert</span>
              <div className="flex items-center gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
              </div>
            </div>
          ) : (
            <Button type="submit">
              <CalendarDays className="h-4 w-4" />
              Stundenplan importieren
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
  defaultChecked?: boolean;
}

function CheckboxField({ id, label, name, defaultChecked }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} name={name} defaultChecked={defaultChecked} />
      <Label htmlFor={id} className="text-gray-700">
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
