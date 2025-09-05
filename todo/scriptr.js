const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const summaryDiv = document.getElementById('summary');

// Load todos from localStorage
let todos = JSON.parse(localStorage.getItem('todos') || '[]');

// --- Rendering Logic ---
function renderTodos() {
  todoList.innerHTML = '';
  if (todos.length === 0) {
    todoList.innerHTML = '<li class="todo-item" style="justify-content:center; color:#6d7c93;">No tasks yet. Start by adding one above 👆</li>';
    updateSummary();
    return;
  }
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.setAttribute('data-idx', idx);

    // Task display or edit mode
    if (todo.editing) {
      li.innerHTML = `
        <input class="edit-input" type="text" value="${todo.text}" maxlength="60" />
        <button class="edit-btn" data-idx="${idx}" title="Save">💾</button>
        <button class="delete-btn" data-idx="${idx}" title="Delete">🗑️</button>
      `;
    } else {
      li.innerHTML = `
        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-idx="${idx}">
        <span class="todo-text" title="Click to edit">${todo.text}</span>
        <button class="edit-btn" data-idx="${idx}" title="Edit">✏️</button>
        <button class="delete-btn" data-idx="${idx}" title="Delete">🗑️</button>
      `;
    }
    todoList.appendChild(li);
  });
  updateSummary();
}

function updateSummary() {
  const left = todos.filter(t => !t.completed).length;
  const total = todos.length;
  let nextTask = todos.find(t => !t.completed);
  summaryDiv.innerHTML =
    total === 0
      ? "You're all caught up for today! 🎉"
      : left === 0
        ? 'All tasks for today completed! ✔️'
        : `Tasks left: <b>${left}</b> &mdash; Next: <b>${nextTask ? nextTask.text : ''}</b>`;
}

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// --- Event Listeners ---

// Add new todo
todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (text) {
    todos.push({ text, completed: false });
    saveTodos();
    todoInput.value = '';
    renderTodos();
  }
});

// Handle clicks and changes on the todo list
todoList.addEventListener('click', e => {
  const idx = e.target.closest('li')?.getAttribute('data-idx');
  if (idx == null) return;

  // Delete
  if (e.target.classList.contains('delete-btn')) {
    todos.splice(idx, 1);
    saveTodos();
    renderTodos();
    return;
  }

  // Edit button (switch to edit mode)
  if (e.target.classList.contains('edit-btn')) {
    if (todos[idx].editing) {
      // Save edit
      const inputEl = todoList.querySelector(`li[data-idx="${idx}"] .edit-input`);
      const newText = inputEl.value.trim();
      if (newText) {
        todos[idx].text = newText;
        todos[idx].editing = false;
        saveTodos();
        renderTodos();
      } else {
        inputEl.focus();
      }
    } else {
      // Enter edit mode
      todos[idx].editing = true;
      renderTodos();
      // Focus input
      setTimeout(() => {
        const inputEl = todoList.querySelector(`li[data-idx="${idx}"] .edit-input`);
        if (inputEl) inputEl.focus();
      }, 20);
    }
    return;
  }

  // Clicking text also enters edit mode for quick edit
  if (e.target.classList.contains('todo-text')) {
    todos[idx].editing = true;
    renderTodos();
    setTimeout(() => {
      const inputEl = todoList.querySelector(`li[data-idx="${idx}"] .edit-input`);
      if (inputEl) inputEl.focus();
    }, 20);
    return;
  }
});

// Checkbox complete toggle
todoList.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    const idx = e.target.getAttribute('data-idx');
    if (idx != null) {
      todos[idx].completed = !todos[idx].completed;
      saveTodos();
      renderTodos();
    }
  }
});

// Save edits with Enter key in edit mode
todoList.addEventListener('keydown', e => {
  if (e.target.classList.contains('edit-input') && e.key === 'Enter') {
    const idx = e.target.closest('li').getAttribute('data-idx');
    if (idx != null) {
      const newText = e.target.value.trim();
      if (newText) {
        todos[idx].text = newText;
        todos[idx].editing = false;
        saveTodos();
        renderTodos();
      }
    }
  }
});

// Initial render
renderTodos();
