let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filter = 'all';
let sort = null;

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const title = document.getElementById('task-input').value.trim();
  if (!title) { alert('Enter a task name'); return; }
  tasks.push({
    id: Date.now(),
    title,
    priority: document.getElementById('priority').value,
    deadline: document.getElementById('deadline').value,
    completed: false
  });
  saveTasks();
  document.getElementById('task-input').value = '';
  document.getElementById('deadline').value = '';
  render();
}

function toggleDone(id) {
  tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  saveTasks(); render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(); render();
}

function setFilter(f) {
  filter = f;
  document.getElementById('processing').style.display = 'block';
  debounceRender();
}

function setSort(s) { sort = s; render(); }

function debounce(fn, delay) {
  let t;
  return function() { clearTimeout(t); t = setTimeout(fn, delay); };
}
const debounceRender = debounce(render, 300);

function isOverdue(d) {
  if (!d) return false;
  return d < new Date().toISOString().split('T')[0];
}

function render() {
  document.getElementById('processing').style.display = 'none';

  let list = [...tasks];
  if (filter === 'completed') list = list.filter(t => t.completed);
  if (filter === 'pending') list = list.filter(t => !t.completed);

  if (sort === 'priority') {
    const order = {High:1, Medium:2, Low:3};
    list.sort((a,b) => order[a.priority] - order[b.priority]);
  }
  if (sort === 'deadline') {
    list.sort((a,b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
  }

  const total = tasks.length;
  const comp = tasks.filter(t => t.completed).length;
  document.getElementById('total').textContent = total;
  document.getElementById('comp').textContent = comp;
  document.getElementById('pend').textContent = total - comp;

  const container = document.getElementById('task-list');
  if (!list.length) { container.innerHTML = '<p style="font-size:0.9rem;color:#999;">No tasks here.</p>'; return; }

  container.innerHTML = list.map(t => {
    const badge = t.priority === 'High' ? 'bg-danger' : t.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-success';
    const overdue = !t.completed && isOverdue(t.deadline) ? 'overdue' : '';
    return `
      <div class="card mb-2 px-3 py-2 ${overdue}">
        <div class="d-flex justify-content-between align-items-center">
          <span class="${t.completed ? 'done' : ''}">${t.title} &nbsp;<span class="badge ${badge}">${t.priority}</span>&nbsp;${t.deadline ? '<small class="text-muted">'+t.deadline+'</small>' : ''}</span>
          <span class="d-flex gap-1">
            <button class="btn btn-sm btn-success" onclick="toggleDone(${t.id})">${t.completed ? 'Undo' : 'Done'}</button>
            <button class="btn btn-sm btn-danger" onclick="deleteTask(${t.id})">Delete</button>
          </span>
        </div>
      </div>`;
  }).join('');
}

render();