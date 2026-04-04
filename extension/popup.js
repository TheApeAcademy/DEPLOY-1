// ApeAcademy Extension — popup.js
const SUPABASE_URL = 'https://gtnnzhphexfjblujspmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bm56aHBoZXhmamJsdWpzcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzU2NzUsImV4cCI6MjA4Nzg1MTY3NX0.a7zi2U0VeTFpLNQu1Csh-VwjqwaVlKwnbj7T1C27kak';
const PAYMENT_LINK = 'https://flutterwave.com/pay/ctiqneyy3cgv';

const PRICES = {
  'Short Assignment': 8, 'Homework': 15, 'Essay': 30, 'Lab Report': 35,
  'Presentation': 30, 'Case Study': 40, 'Project': 45, 'Research Paper': 50,
  'Thesis': 90, 'Dissertation': 130, 'Reflection': 20, 'Literature Review': 35,
  'Business Plan': 40, 'Annotated Bibliography': 25, 'Technical Report': 35, 'Other': 25,
};

// ── DOM refs ──────────────────────────────────────────────
const sections = {
  login: document.getElementById('section-login'),
  submit: document.getElementById('section-submit'),
  result: document.getElementById('section-result'),
};

function showSection(name) {
  Object.values(sections).forEach(s => s.classList.remove('active'));
  sections[name].classList.add('active');
}

function setStatus(elId, msg, type = 'info') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = msg
    ? `<div class="status-box status-${type}">${msg}</div>`
    : '';
}

// ── Auth helpers ──────────────────────────────────────────
async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// ── State ─────────────────────────────────────────────────
let currentToken = null;
let currentUser = null;
let currentAssignmentId = null;

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Restore saved session
  const saved = await chrome.storage.local.get(['ape_token', 'ape_user']);
  if (saved.ape_token && saved.ape_user) {
    currentToken = saved.ape_token;
    currentUser = saved.ape_user;
    showLoggedIn();
  } else {
    showSection('login');
  }

  // Try to get selected text from active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, (response) => {
        if (chrome.runtime.lastError) return; // content script not loaded on this tab
        if (response && response.text) {
          const textarea = document.getElementById('assignment-text');
          if (textarea && !textarea.value) textarea.value = response.text;
        }
      });
    }
  } catch (_) { /* silent */ }
});

function showLoggedIn() {
  document.getElementById('user-email-display').textContent = currentUser?.email || '';
  showSection('submit');
}

// ── Sign In ───────────────────────────────────────────────
document.getElementById('btn-signin').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) { setStatus('login-status', 'Please enter email and password.', 'error'); return; }

  const btn = document.getElementById('btn-signin');
  btn.innerHTML = '<span class="spinner"></span>Signing in...';
  btn.disabled = true;

  try {
    const result = await signIn(email, password);
    if (result.access_token) {
      currentToken = result.access_token;
      currentUser = result.user || { email };
      await chrome.storage.local.set({ ape_token: currentToken, ape_user: currentUser });
      setStatus('login-status', '', 'info');
      showLoggedIn();
    } else {
      setStatus('login-status', result.error_description || result.msg || 'Sign in failed. Check your credentials.', 'error');
    }
  } catch (err) {
    setStatus('login-status', 'Network error. Please try again.', 'error');
  }

  btn.innerHTML = 'Sign In';
  btn.disabled = false;
});

// ── Sign Out ──────────────────────────────────────────────
document.getElementById('btn-signout').addEventListener('click', async () => {
  await chrome.storage.local.remove(['ape_token', 'ape_user']);
  currentToken = null;
  currentUser = null;
  showSection('login');
});

// ── Submit Assignment ─────────────────────────────────────
document.getElementById('btn-submit').addEventListener('click', async () => {
  const text = document.getElementById('assignment-text').value.trim();
  const type = document.getElementById('assignment-type').value;
  if (!text) { setStatus('submit-status', 'Please enter your assignment text.', 'error'); return; }
  if (!type) { setStatus('submit-status', 'Please select an assignment type.', 'error'); return; }

  const btn = document.getElementById('btn-submit');
  btn.innerHTML = '<span class="spinner"></span>Submitting...';
  btn.disabled = true;
  setStatus('submit-status', '', 'info');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const pageUrl = tab?.url || '';

    const payload = {
      user_id: currentUser?.id || currentUser?.sub,
      user_name: currentUser?.user_metadata?.name || currentUser?.email,
      user_email: currentUser?.email,
      assignment_type: type,
      course_name: 'Submitted via Extension',
      class_name: 'Extension',
      teacher_name: 'N/A',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      platform: 'Email',
      platform_contact: currentUser?.email,
      description: text,
      files: '[]',
      status: 'pending',
      payment_amount: PRICES[type] ?? 25,
      source_url: pageUrl,
    };

    const { ok, data } = await supabaseFetch('/rest/v1/assignments', {
      method: 'POST',
      token: currentToken,
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(payload),
    });

    if (ok && data && (Array.isArray(data) ? data[0] : data)?.id) {
      const assignment = Array.isArray(data) ? data[0] : data;
      currentAssignmentId = assignment.id;
      const price = PRICES[type] ?? 25;
      showResult(price, type);
    } else {
      const msg = data?.message || data?.error || 'Submission failed. Please try again.';
      setStatus('submit-status', msg, 'error');
    }
  } catch (err) {
    setStatus('submit-status', 'Network error. Please try again.', 'error');
  }

  btn.innerHTML = 'Submit Assignment';
  btn.disabled = false;
});

function showResult(price, type) {
  showSection('result');
  setStatus('result-status', `✅ <strong>${type}</strong> submitted successfully!`, 'success');

  const priceDisplay = document.getElementById('price-display');
  const priceValue = document.getElementById('price-value');
  const btnPay = document.getElementById('btn-pay');

  priceValue.textContent = `£${price.toFixed(2)}`;
  priceDisplay.style.display = 'block';
  btnPay.style.display = 'block';
}

document.getElementById('btn-pay').addEventListener('click', () => {
  chrome.tabs.create({ url: PAYMENT_LINK });
});

document.getElementById('btn-new').addEventListener('click', () => {
  currentAssignmentId = null;
  document.getElementById('assignment-text').value = '';
  document.getElementById('assignment-type').value = '';
  setStatus('submit-status', '', 'info');
  showSection('submit');
});
