"use client";

import { useMemo, useRef, useState } from "react";
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

type SettingsCategory = {
  id: "profile" | "notifications" | "calendar";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const settingsCategories: SettingsCategory[] = [
  { id: "profile", label: "Profil", icon: User },
  { id: "notifications", label: "Benachrichtigungen", icon: Bell },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
];

const reminderOptions = ["10 Minuten vorher", "1 Stunde vorher", "1 Tag vorher", "3 Tage vorher"];
const digestTimes = ["07:00", "12:00", "18:00", "20:00"];

export function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tabParam = searchParams.get("tab");
  const activeCategory =
    settingsCategories.find((category) => category.id === tabParam)?.id ?? "notifications";

  const activeTitle = useMemo(
    () => settingsCategories.find((category) => category.id === activeCategory)?.label ?? "Einstellungen",
    [activeCategory]
  );

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleCategoryChange(categoryId: SettingsCategory["id"]) {
    router.replace(`/dashboard/settings?tab=${categoryId}`, { scroll: false });
  }

  return (
    <main className="h-full px-6 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div>
          <p className="text-sm font-medium text-gray-500">Einstellungen</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950">{activeTitle}</h1>
        </div>

        <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          {settingsCategories.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeCategory;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleCategoryChange(id)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
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
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProfileSettings({ avatarPreview, fileInputRef, onAvatarChange }: ProfileSettingsProps) {
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
            accept="image/*"
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
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
          <h2 className="text-base font-semibold text-gray-950">Kontodaten</h2>
          <p className="text-sm text-gray-500">Name, Username, E-Mail und Passwort verwalten.</p>
        </div>

        <form className="mt-5 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" htmlFor="first-name">
              <Input id="first-name" defaultValue="Finn" />
            </Field>
            <Field label="Nachname" htmlFor="last-name">
              <Input id="last-name" defaultValue="Pfleghaar" />
            </Field>
          </div>

          <Field label="Username" htmlFor="username">
            <Input id="username" defaultValue="finn.pfleghaar" />
          </Field>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="E-Mail" htmlFor="email">
              <Input id="email" type="email" defaultValue="finn.pfleghaar@dhbw.de" />
            </Field>
            <Button type="button" variant="outline" className="md:mb-0">
              <Mail className="h-4 w-4" />
              E-Mail ändern
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-950">Passwort</h3>
              <p className="mt-1 text-sm text-gray-500">Sende einen Link zum Zurücksetzen deines Passworts.</p>
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
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-base font-semibold text-gray-950">Benachrichtigungen</h2>
        <p className="text-sm text-gray-500">Erinnerungen und Lernübersichten für deinen Alltag steuern.</p>
      </div>

      <div className="mt-5 grid gap-5">
        <SettingsBlock
          icon={CalendarClock}
          title="Deadline-Erinnerungen"
          description="Erinnert dich rechtzeitig an Aufgaben, Prüfungen und Abgaben."
        >
          <CheckboxField id="deadline-reminders" label="Deadline-Erinnerungen aktivieren" defaultChecked />
          <Field label="Erinnerungsvorlauf" htmlFor="deadline-lead-time">
            <select
              id="deadline-lead-time"
              defaultValue="1 Tag vorher"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {reminderOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
        </SettingsBlock>

        <SettingsBlock
          icon={Clock}
          title="Tägliche Lernübersicht"
          description="Fasst deine heutigen Lernsessions, offenen Aufgaben und Fristen zusammen."
        >
          <CheckboxField id="daily-digest" label="Tägliche Lernübersicht aktivieren" defaultChecked />
          <Field label="Uhrzeit" htmlFor="digest-time">
            <select
              id="digest-time"
              defaultValue="18:00"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {digestTimes.map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </Field>
        </SettingsBlock>

        <SettingsBlock
          icon={Bell}
          title="Lernsessions"
          description="Benachrichtigungen für geplante Lernzeiten und wiederkehrende Sessions."
        >
          <CheckboxField id="session-reminders" label="Erinnerungen für geplante Lernsessions" defaultChecked />
          <CheckboxField id="overdue-tasks" label="Überfällige Aufgaben zusätzlich hervorheben" />
        </SettingsBlock>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <Button type="button">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </section>
  );
}

function CalendarSettings() {
  const [isImporting, setIsImporting] = useState(false);

  function handleScheduleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isImporting) {
      return;
    }

    setIsImporting(true);
    window.setTimeout(() => setIsImporting(false), 1600);
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-base font-semibold text-gray-950">Calendar</h2>
        <p className="text-sm text-gray-500">Wähle aus, welchen Stundenplan du in den Kalender importieren willst.</p>
      </div>

      <form className="mt-5 grid max-w-xl gap-5" onSubmit={handleScheduleImport}>
        <Field label="Stundenplan" htmlFor="schedule-group">
          <Input id="schedule-group" placeholder="TIF25A" />
        </Field>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          {isImporting ? (
            <div className="flex h-9 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3">
              <CalendarDays className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Stundenplan wird importiert</span>
              <div className="flex items-center gap-1">
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
  defaultChecked?: boolean;
}

function CheckboxField({ id, label, defaultChecked }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} defaultChecked={defaultChecked} />
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
