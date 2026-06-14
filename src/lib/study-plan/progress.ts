interface TaskCompletion {
  completed: boolean;
}

export interface TaskProgress {
  taskCount: number;
  completedTaskCount: number;
  percentage: number;
}

export function calculateTaskProgress(tasks: readonly TaskCompletion[]): TaskProgress {
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const taskCount = tasks.length;

  return {
    taskCount,
    completedTaskCount,
    percentage: taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0,
  };
}
