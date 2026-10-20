const VALID_PRIORITIES = ["low", "medium", "high"];

const VALID_CATEGORIES = ["study", "work", "personal", "other"];

export function validateTask(title, priority, category, dueDate) {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    return {
      valid: false,
      message: "Task title cannot be empty.",
    };
  }

  if (cleanTitle.length > 100) {
    return {
      valid: false,
      message: "Task title cannot exceed 100 characters.",
    };
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return {
      valid: false,
      message: "Please select a valid priority.",
    };
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return {
      valid: false,
      message: "Please select a valid category.",
    };
  }

  if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return {
      valid: false,
      message: "Please select a valid due date.",
    };
  }

  const parsedDate = new Date(`${dueDate}T00:00:00`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== dueDate
  ) {
    return {
      valid: false,
      message: "The selected date is invalid.",
    };
  }

  return {
    valid: true,
    message: "",
    title: cleanTitle,
    priority,
    category,
    dueDate,
  };
}
