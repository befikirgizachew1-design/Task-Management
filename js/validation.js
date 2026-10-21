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

  // Check that the due date is entered
  if (!dueDate) {
    return {
      valid: false,
      message: "Please select a due date.",
    };
  }

  // Check the MM/DD/YYYY format
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dueDate)) {
    return {
      valid: false,
      message: "Please enter the date in the form of MM/DD/YYYY.",
    };
  }

  // Split the date into month, day, and year
  const [month, day, year] = dueDate.split("/").map(Number);

  // Create a date object
  const parsedDate = new Date(year, month - 1, day);

  // Check whether the date really exists
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
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
