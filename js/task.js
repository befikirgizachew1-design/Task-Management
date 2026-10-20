import { validateTask } from "./validation.js";

export function createTask(title, priority, category, dueDate) {
  const result = validateTask(title, priority, category, dueDate);

  if (!result.valid) {
    throw new Error(result.message);
  }

  return {
    id: crypto.randomUUID(),
    title: result.title,
    priority: result.priority,
    category: result.category,
    dueDate: result.dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function addTask(tasks, title, priority, category, dueDate) {
  const newTask = createTask(title, priority, category, dueDate);
  return [...tasks, newTask];
}

export function updateTask(tasks, id, title, priority, category, dueDate) {
  const existingTask = tasks.find((task) => task.id === id);

  if (!existingTask) {
    throw new Error("Task not found.");
  }

  const result = validateTask(title, priority, category, dueDate);

  if (!result.valid) {
    throw new Error(result.message);
  }

  return tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          title: result.title,
          priority: result.priority,
          category: result.category,
          dueDate: result.dueDate,
        }
      : task,
  );
}

export function deleteTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) {
    throw new Error("Task not found.");
  }

  return tasks.filter((task) => task.id !== id);
}

export function toggleTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) {
    throw new Error("Task not found.");
  }

  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
}

export function filterTasks(tasks, filter, searchTerm = "") {
  const query = searchTerm.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(query);

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed);

    return matchesSearch && matchesFilter;
  });
}

export function getTaskStatistics(tasks) {
  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
    pending: tasks.filter((task) => !task.completed).length,
    highPriority: tasks.filter(
      (task) => task.priority === "high" && !task.completed,
    ).length,
  };
}
