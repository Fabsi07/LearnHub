interface TaskCompletion {
  completed: boolean;
}

export interface TaskProgress {
  taskCount: number;
  completedTaskCount: number;
  percentage: number;
}

export function calculateTaskProgress(tasks: readonly TaskCompletion[]): TaskProgress {
  const taskCount = tasks.length;
  let completedTaskCount = 0;
  for (const task of tasks) if (task.completed) completedTaskCount++;

  return {
    taskCount,
    completedTaskCount,
    percentage: taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0,
  };
}
