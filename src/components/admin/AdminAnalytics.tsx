"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminAnalyticsPayload, AnalyticsBucket } from "@/lib/admin/analytics";
import { cn } from "@/lib/utils";

interface AdminAnalyticsProps {
  initialData: AdminAnalyticsPayload;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE").format(value);
}

function formatHours(value: number) {
  return `${new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 1,
  }).format(value)} h`;
}

export function AdminAnalytics({ initialData }: AdminAnalyticsProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const studyPlanAdoptionRate = useMemo(() => {
    if (data.users.total === 0) {
      return 0;
    }
    return Math.round((data.users.usersWithStudyPlans / data.users.total) * 100);
  }, [data.users.total, data.users.usersWithStudyPlans]);

  async function reloadAnalytics() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/analytics");
      const nextData = (await response.json().catch(() => null)) as
        | (AdminAnalyticsPayload & { error?: string })
        | null;

      if (!response.ok || !nextData) {
        throw new Error(nextData?.error ?? "Analysen konnten nicht geladen werden.");
      }

      setData(nextData);
      setMessage({ type: "success", text: "Analysen wurden aktualisiert." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Analysen konnten nicht geladen werden.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-950">Aggregierte Analysen</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                Diese Ansicht zeigt nur zusammengefasste Nutzungs- und Fortschrittsdaten. Sie
                dient der Produktbewertung, nicht der Kontrolle einzelner Studierender.
              </p>
              <p className="mt-2 text-xs font-medium text-gray-400">
                Aktualisiert: {formatDateTime(data.generatedAt)}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={reloadAnalytics} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Aktualisieren
          </Button>
        </div>
      </section>

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Registrierte Nutzer"
          value={formatNumber(data.users.total)}
          detail={`+${formatNumber(data.users.newLast30Days)} in 30 Tagen`}
          tone="gray"
        />
        <MetricCard
          icon={UserCheck}
          label="Aktive Sessions"
          value={formatNumber(data.users.activeSessionUsers)}
          detail={`${formatNumber(data.users.signedInLast30Days)} Nutzer mit Login in 30 Tagen`}
          tone="blue"
        />
        <MetricCard
          icon={Target}
          label="Lernplan-Nutzung"
          value={`${studyPlanAdoptionRate} %`}
          detail={`${formatNumber(data.users.usersWithStudyPlans)} Nutzer mit Lernplänen`}
          tone="green"
        />
        <MetricCard
          icon={CalendarClock}
          label="Kalenderquellen"
          value={`${data.calendar.sourceAdoptionRate} %`}
          detail={`${formatNumber(data.calendar.calendarSources)} gespeicherte Quellen`}
          tone="amber"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AnalyticsSection
          title="Lernplanung"
          description="Aufgabenfortschritt und Planungsstand über alle Nutzer hinweg."
          icon={ListChecks}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Lernpläne gesamt" value={formatNumber(data.learning.studyPlans)} />
            <MiniMetric label="Aktive Lernpläne" value={formatNumber(data.learning.activeStudyPlans)} />
            <MiniMetric label="Aufgaben gesamt" value={formatNumber(data.learning.tasks)} />
            <MiniMetric label="Offene Aufgaben" value={formatNumber(data.learning.openTasks)} />
            <MiniMetric label="Überfällige Aufgaben" value={formatNumber(data.learning.overdueTasks)} />
            <MiniMetric label="Geschätzte Lernzeit" value={formatHours(data.learning.plannedHours)} />
          </div>
          <ProgressRow label="Aufgaben abgeschlossen" value={data.learning.completionRate} />
          <ProgressRow
            label="Durchschnittlicher Lernplanfortschritt"
            value={data.learning.averagePlanProgress}
          />
        </AnalyticsSection>

        <AnalyticsSection
          title="Kalender und Erinnerungen"
          description="Wie stark Planung, Termine und Benachrichtigungen genutzt werden."
          icon={CalendarClock}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Kalendereinträge" value={formatNumber(data.calendar.events)} />
            <MiniMetric label="Lerneinheiten" value={formatNumber(data.calendar.learningEvents)} />
            <MiniMetric label="Externe Termine" value={formatNumber(data.calendar.externalEvents)} />
            <MiniMetric
              label="Nutzer mit Kalenderquelle"
              value={formatNumber(data.users.usersWithCalendarSources)}
            />
            <MiniMetric label="Offene Hinweise" value={formatNumber(data.notifications.open)} />
            <MiniMetric
              label="Verpasste Lerneinheiten"
              value={formatNumber(data.notifications.missedSessionOpen)}
            />
          </div>
          <ProgressRow label="DHBW-/ICS-Adoption" value={data.calendar.sourceAdoptionRate} />
          <ProgressRow label="Nutzer mit Lernplan" value={studyPlanAdoptionRate} />
        </AnalyticsSection>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AnalyticsSection
          title="Feedback-Auswertung"
          description="Status und Themen der eingereichten Rückmeldungen."
          icon={CheckCircle2}
        >
          <div className="grid gap-3 sm:grid-cols-4">
            <MiniMetric label="Gesamt" value={formatNumber(data.feedback.total)} />
            <MiniMetric label="Offen" value={formatNumber(data.feedback.open)} />
            <MiniMetric label="Kritisch" value={formatNumber(data.feedback.critical)} />
            <MiniMetric label="Umgesetzt" value={formatNumber(data.feedback.done)} />
          </div>
          <BucketList buckets={data.feedback.byStatus} />
          <BucketList buckets={data.feedback.byCategory} compact />
        </AnalyticsSection>

        <AnalyticsSection
          title="Admin-Übersicht"
          description="Rollenverteilung und Hinweise für den Betrieb."
          icon={ShieldCheck}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Admin-Accounts" value={formatNumber(data.users.adminAccounts)} />
            <MiniMetric label="Dev-Accounts" value={formatNumber(data.users.devAccounts)} />
            <MiniMetric label="Überfällige Lernpläne" value={formatNumber(data.learning.overdueStudyPlans)} />
            <MiniMetric label="Dringende Hinweise" value={formatNumber(data.notifications.urgent)} />
            <MiniMetric
              label="Erledigte Lernzeit"
              value={formatHours(data.learning.completedEstimatedHours)}
            />
            <MiniMetric label="Benachrichtigungen" value={formatNumber(data.notifications.total)} />
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Diese Zahlen sind Momentaufnahmen aus dem MVP-Datenbestand. Für einen echten
                Produktivbetrieb wären zusätzlich Datenschutzkonzept, Zeitraumfilter und
                Audit-Logging sinnvoll.
              </p>
            </div>
          </div>
        </AnalyticsSection>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  tone: "gray" | "blue" | "green" | "amber";
}

function MetricCard({ icon: Icon, label, value, detail, tone }: MetricCardProps) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-950">{value}</p>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="mt-1 text-xs text-gray-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

interface AnalyticsSectionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function AnalyticsSection({ title, description, icon: Icon, children }: AnalyticsSectionProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-950">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

interface MiniMetricProps {
  label: string;
  value: string;
}

function MiniMetric({ label, value }: MiniMetricProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-950">{value}</p>
    </div>
  );
}

interface ProgressRowProps {
  label: string;
  value: number;
}

function ProgressRow({ label, value }: ProgressRowProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-950">{value} %</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-gray-950" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

interface BucketListProps {
  buckets: AnalyticsBucket[];
  compact?: boolean;
}

function BucketList({ buckets, compact = false }: BucketListProps) {
  return (
    <div className={cn("grid gap-3", compact && "sm:grid-cols-3")}>
      {buckets.map((bucket) => (
        <div key={bucket.key} className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-gray-700">{bucket.label}</span>
            <span className="font-bold text-gray-950">{formatNumber(bucket.count)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-950"
              style={{ width: `${bucket.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
