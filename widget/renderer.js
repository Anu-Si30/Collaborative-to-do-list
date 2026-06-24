// ─── Config ──────────────────────────────────────────────────────────────────
// The widget reads the auth token from the same localStorage key the main app uses.
// When running locally, point to localhost. After deployment, change this to your
// Render URL (e.g. https://neontasks-api.onrender.com).
const API_BASE = 'http://localhost:5000/api';
const REFRESH_INTERVAL_MS = 60_000; // re-fetch tasks every 60 seconds

// ─── Clock ───────────────────────────────────────────────────────────────────
const timeEl   = document.getElementById('time');
const dateEl   = document.getElementById('date');

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function updateClock() {
  const now = new Date();

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  timeEl.textContent = `${hh}:${mm}:${ss}`;

  const day   = DAYS[now.getDay()];
  const date  = now.getDate();
  const month = MONTHS[now.getMonth()];
  dateEl.textContent = `${day}, ${date} ${month}`;
}

setInterval(updateClock, 1000);
updateClock();

// ─── Progress ring ───────────────────────────────────────────────────────────
const ringProgress = document.getElementById('ring-progress');
const ringDoneText = document.getElementById('ring-done');
const fractionEl   = document.getElementById('fraction');
const statusEl     = document.getElementById('status-msg');

const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40 → 251.2

function setRing(done, total) {
  const progress = total === 0 ? 0 : done / total;
  const offset   = CIRCUMFERENCE * (1 - progress);

  ringProgress.style.strokeDashoffset = offset;

  // Colour: grey → cyan → green depending on progress
  if      (progress === 0)   ringProgress.style.stroke = 'rgba(255,255,255,0.15)';
  else if (progress < 0.5)   ringProgress.style.stroke = '#00d4ff';
  else if (progress < 1)     ringProgress.style.stroke = '#a855f7';
  else                        ringProgress.style.stroke = '#22c55e';

  ringDoneText.textContent = done;
  fractionEl.textContent   = `${done} / ${total} tasks`;
  statusEl.textContent     = total === 0 ? 'No tasks yet' : progress === 1 ? '🎉 All done!' : `${Math.round(progress * 100)}% complete`;
}

// ─── Fetch tasks from API ────────────────────────────────────────────────────
async function fetchTasks() {
  // Option B: read the token saved by the main web app in localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    statusEl.textContent = 'Log in at the web app first';
    setRing(0, 0);
    return;
  }

  try {
    // 1. Get all rooms the user is in
    const roomsRes = await fetch(`${API_BASE}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!roomsRes.ok) throw new Error('Auth failed');
    const rooms = await roomsRes.json();

    if (!rooms.length) {
      setRing(0, 0);
      statusEl.textContent = 'No rooms joined yet';
      return;
    }

    // 2. Fetch todos for each room and aggregate
    let totalTasks = 0;
    let doneTasks  = 0;

    // Get the logged-in user id from the token (decode JWT payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId  = payload.id || payload._id || payload.userId;

    await Promise.all(
      rooms.map(async (room) => {
        const todosRes = await fetch(`${API_BASE}/todos/room/${room._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!todosRes.ok) return;
        const todos = await todosRes.json();

        // Only count THIS user's todos
        todos.forEach((t) => {
          const ownerId = t.owner?._id || t.owner;
          if (ownerId?.toString() === userId?.toString()) {
            totalTasks++;
            if (t.completed) doneTasks++;
          }
        });
      })
    );

    setRing(doneTasks, totalTasks);
  } catch (err) {
    console.error('Widget fetch error:', err);
    statusEl.textContent = 'Could not load tasks';
  }
}

fetchTasks();
setInterval(fetchTasks, REFRESH_INTERVAL_MS);

// ─── Close button ────────────────────────────────────────────────────────────
document.getElementById('close-btn').addEventListener('click', () => {
  window.electronAPI.closeWindow();
});
