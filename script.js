// script.js - To-Do list logic (uses localStorage)
// Key constants
const STORAGE_KEY = "regan_todo_tasks_v1";

const elements = {
  input: document.getElementById("task-input"),
  addBtn: document.getElementById("add-btn"),
  list: document.getElementById("task-list"),
  remainingCount: document.getElementById("remaining-count"),
  clearCompleted: document.getElementById("clear-completed"),
  filterButtons: document.querySelectorAll(".filter-btn"),
};

let tasks = []; // array of { id:number, text:string, completed:boolean }
let filter = "all"; // 'all' | 'active' | 'completed'

// -------- storage helpers --------
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load tasks:", e);
    tasks = [];
  }
}

// -------- rendering --------
function render() {
  elements.list.innerHTML = "";
  const visible = tasks.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-item";
    empty.style.opacity = "0.6";
    empty.textContent = "No tasks to show.";
    elements.list.appendChild(empty);
  } else {
    visible.forEach(task => {
      const li = document.createElement("li");
      li.className = "task-item";
      if (task.completed) li.classList.add("completed");

      // checkbox / toggle
      const check = document.createElement("button");
      check.className = "check";
      check.type = "button";
      check.setAttribute("aria-label", task.completed ? "Mark as active" : "Mark as complete");
      check.innerHTML = task.completed ? "✓" : "";
      check.addEventListener("click", () => toggleTask(task.id));
      li.appendChild(check);

      // text
      const span = document.createElement("span");
      span.className = "task-text";
      span.textContent = task.text;
      li.appendChild(span);

      // delete
      const del = document.createElement("button");
      del.className = "delete-btn";
      del.type = "button";
      del.title = "Delete task";
      del.innerHTML = "✕";
      del.addEventListener("click", () => deleteTask(task.id));
      li.appendChild(del);

      elements.list.appendChild(li);
    });
  }

  updateRemainingCount();
}

// -------- actions --------
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const newTask = {
    id: Date.now(),
    text: trimmed,
    completed: false,
  };
  tasks.unshift(newTask); // newest first
  saveTasks();
  render();
  elements.input.value = "";
  elements.input.focus();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

function updateRemainingCount() {
  const remaining = tasks.filter(t => !t.completed).length;
  elements.remainingCount.textContent = `${remaining} item${remaining !== 1 ? "s" : ""} left`;
}

// -------- filters --------
function setFilter(newFilter) {
  filter = newFilter;
  elements.filterButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === newFilter);
  });
  render();
}

// -------- event wiring --------
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  render();

  // add button
  elements.addBtn.addEventListener("click", () => addTask(elements.input.value));

  // enter key
  elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTask(elements.input.value);
    }
  });

  // clear completed
  elements.clearCompleted.addEventListener("click", () => clearCompleted());

  // filters
  elements.filterButtons.forEach(btn => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  // accessibility: focus input on load
  elements.input.focus();
});
