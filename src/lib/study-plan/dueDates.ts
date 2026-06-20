export function startOfLocalDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isPastDueDate(
  dueDate: Date | string,
  referenceDate: Date = new Date(),
): boolean {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (Number.isNaN(due.getTime())) return false;
  return startOfLocalDay(due).getTime() < startOfLocalDay(referenceDate).getTime();
}

export function isOpenTaskOverdue(
  task: { completed: boolean; dueDate: Date | string },
  referenceDate: Date = new Date(),
): boolean {
  return !task.completed && isPastDueDate(task.dueDate, referenceDate);
}
