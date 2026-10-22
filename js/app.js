import {
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  filterTasks,
  getTaskStatistics,
} from "./task.js";

import { loadTasks, saveTasks } from "./storage.js";
import { validateTask } from "./validation.js";

// Application state
let tasks = loadTasks();
let currentFilter = "all";
let editingId = null;

// Form elements
const taskForm = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const categoryInput = document.querySelector("#task-category");
const priorityInput = document.querySelector("#task-priority");
const dateInput = document.querySelector("#task-date");

const formHeading = document.querySelector("#form-heading");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");
const formError = document.querySelector("#form-error");

// Task list elements
const searchInput = document.querySelector("#search-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");

// Statistics elements
const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const pendingCount = document.querySelector("#pending-count");
const highCount = document.querySelector("#high-count");

// Save tasks in LocalStorage
function persistTasks() {
  const saved = saveTasks(tasks);

  if (!saved) {
    showError(
      "Could not save your changes. Check your browser storage settings.",
    );
  }

  return saved;
}

function showError(message) {
  formError.textContent = message;
}

function clearError() {
  showError("");
}

// Reset the form after adding or cancelling a task
function resetForm() {
  editingId = null;
  taskForm.reset();

  formHeading.textContent = "Add a New Task";
  submitButton.textContent = "Add Task";
  cancelEditButton.classList.add("hidden");

  clearError();
}

// Display task statistics
function renderStatistics() {
  const stats = getTaskStatistics(tasks);

  totalCount.textContent = stats.total;
  completedCount.textContent = stats.completed;
  pendingCount.textContent = stats.pending;
  highCount.textContent = stats.highPriority;
}

// Create a safe text element
function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

// Display one task
function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item";

  // Completion checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;
  checkbox.dataset.action = "toggle";
  checkbox.dataset.id = task.id;
  checkbox.setAttribute("aria-label", `Complete ${task.title}`);

  // Task information
  const content = document.createElement("div");
  content.className = "task-content";

  const title = createTextElement(
    "div",
    `task-title${task.completed ? " completed" : ""}`,
    task.title,
  );

  const categoryName = {
    study: "Study",
    work: "Work",
    personal: "Personal",
    other: "Other",
  };

  const category = createTextElement(
    "span",
    "category",
    categoryName[task.category] || "Uncategorized",
  );

  const priorityName = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  const priority = createTextElement(
    "span",
    `priority ${task.priority}`,
    `${priorityName[task.priority] || "Unknown"} Priority`,
  );

  
let deadlineLabel = "No due date";
let deadlineClass = "deadline-none";

if (task.completed) {
  deadlineLabel = "Completed";
  deadlineClass = "deadline-completed";
} else if (task.dueDate) {
  const [month, day, year] = task.dueDate.split("/").map(Number);

  const deadline = new Date(year, month - 1, day);
  deadline.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (deadline < today) {
    deadlineLabel = "Overdue";
    deadlineClass = "deadline-overdue";
  } else if (deadline.getTime() === today.getTime()) {
    deadlineLabel = "Due Today";
    deadlineClass = "deadline-today";
  } else {
    deadlineLabel = "Upcoming";
    deadlineClass = "deadline-upcoming";
  }
}

const dueDate = createTextElement(
  "div",
  `task-meta deadline ${deadlineClass}`,
  task.dueDate ? `Due: ${task.dueDate} — ${deadlineLabel}` : deadlineLabel,
);


  const createdDate = new Date(task.createdAt);
  const createdText = Number.isNaN(createdDate.getTime())
    ? "Creation date unavailable"
    : `Created: ${createdDate.toLocaleDateString()}`;

  const created = createTextElement("div", "task-meta", createdText);

  const labels = document.createElement("div");
  labels.className = "task-labels";
  labels.append(category, priority);

  content.append(title, labels, dueDate, created);

  // Edit and Delete buttons
  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.dataset.action = "edit";
  editButton.dataset.id = task.id;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = task.id;

  actions.append(editButton, deleteButton);
  item.append(checkbox, content, actions);

  return item;
}

// Render the task list using the current filter and search
function renderTasks() {
  const visibleTasks = filterTasks(tasks, currentFilter, searchInput.value);

  taskList.replaceChildren();

  visibleTasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });

  taskCount.textContent = `${visibleTasks.length} task${visibleTasks.length === 1 ? "" : "s"}`;

  emptyMessage.classList.toggle("hidden", visibleTasks.length > 0);

  if (visibleTasks.length === 0) {
    emptyMessage.textContent =
      tasks.length === 0
        ? "No tasks yet. Add your first task above!"
        : "No matching tasks. Try another search or filter.";
  }
}

function renderApp() {
  renderStatistics();
  renderTasks();
}

// Submit the form: create a task or update an existing task
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const title = titleInput.value;
  const category = categoryInput.value;
  const priority = priorityInput.value;
  const dueDate = dateInput.value.trim();

  const result = validateTask(title, priority, category, dueDate);

  if (!result.valid) {
    showError(result.message);
    return;
  }

  try {
    if (editingId) {
      tasks = updateTask(tasks, editingId, title, priority, category, dueDate);
    } else {
      tasks = addTask(tasks, title, priority, category, dueDate);
    }

    console.log("Tasks after adding:", tasks);

    const saved = persistTasks();
    console.log("Tasks saved successfully:", saved);

    if (!saved) {
      return;
    }

    resetForm();
    renderApp();
  } catch (error) {
    showError(error.message || "Unable to save this task.");
  }
});

// Cancel editing
cancelEditButton.addEventListener("click", resetForm);

// Search tasks as the user types
searchInput.addEventListener("input", renderTasks);

// Filter tasks
document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter-button").forEach((filterButton) => {
      const active = filterButton === button;

      filterButton.classList.toggle("active", active);
      filterButton.setAttribute("aria-pressed", String(active));
    });

    renderTasks();
  });
});

// Handle Edit and Delete button clicks
taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button || !taskList.contains(button)) {
    return;
  }

  const { action, id } = button.dataset;
  clearError();

  if (action === "edit") {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
      showError("Task not found.");
      return;
    }

    editingId = id;
    titleInput.value = task.title;
    categoryInput.value = task.category || "other";
    priorityInput.value = task.priority;
    dateInput.value = task.dueDate || "";

    formHeading.textContent = "Edit Task";
    submitButton.textContent = "Save Changes";
    cancelEditButton.classList.remove("hidden");

    titleInput.focus();
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      tasks = deleteTask(tasks, id);

      if (editingId === id) {
        resetForm();
      }

      persistTasks();
      renderApp();
    } catch (error) {
      showError(error.message || "Unable to delete this task.");
    }
  }
});

// Handle completion checkbox changes
taskList.addEventListener("change", (event) => {
  const checkbox = event.target;

  if (!checkbox.matches('input[data-action="toggle"]')) {
    return;
  }

  clearError();

  try {
    tasks = toggleTask(tasks, checkbox.dataset.id);
    persistTasks();
    renderApp();
  } catch (error) {
    showError(error.message || "Unable to update task.");
    renderApp();
  }
});

// Show saved tasks when the page opens
renderApp();

const themeToggle = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("task-manager-theme");

// Restore the saved theme, or use light mode
let currentTheme = savedTheme === "dark" ? "dark" : "light";

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;

  if (currentTheme === "dark") {
    themeToggle.textContent = "☀️ Light Mode";
    themeToggle.setAttribute("aria-label", "Switch to light mode");
  } else {
    themeToggle.textContent = "🌙 Dark Mode";
    themeToggle.setAttribute("aria-label", "Switch to dark mode");
  }
}

// Change the theme when the button is clicked
themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";

  localStorage.setItem("task-manager-theme", currentTheme);

  applyTheme();
});

// Apply the theme when the page loads
applyTheme();
