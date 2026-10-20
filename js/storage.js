const STORAGE_KEY = "task-manager-tasks";

export function loadTasks() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData === null) {
      return [];
    }

    const tasks = JSON.parse(savedData);

    if (!Array.isArray(tasks)) {
      throw new Error("Saved task data is not an array.");
    }

    return tasks;
  } catch (error) {
    console.error("Could not load tasks:", error);
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);
    return false;
  }
}
