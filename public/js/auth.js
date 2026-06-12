const API = '/api';

// Auth state
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

function guardarSesion(tok, user) {
  token = tok;
  usuario = user;
  localStorage.setItem('token', tok);
  localStorage.setItem('usuario', JSON.stringify(user));
}

function cerrarSesion() {
  token = null;
  usuario = null;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/';
}

async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + url, { ...options, headers });
  if (res.status === 401) {
    cerrarSesion();
    throw new Error('Sesión expirada');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

// Login page logic
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('admin.html') || window.location.pathname.endsWith('cliente.html')) {
    if (!token) return window.location.href = '/';
    document.getElementById('sidebar-user').textContent = `${usuario.nombre} (${usuario.rol})`;
    document.getElementById('btn-logout')?.addEventListener('click', cerrarSesion);
    return;
  }
  if (!document.getElementById('auth-form')) return; // not on login page

  let isRegister = false;
  const form = document.getElementById('auth-form');
  const title = document.getElementById('form-title');
  const btn = document.getElementById('auth-btn');
  const toggle = document.getElementById('toggle-auth');
  const nameField = document.getElementById('name-field');
  const rolField = document.getElementById('rol-field');
  const errorMsg = document.getElementById('error-msg');

  toggle.addEventListener('click', () => {
    isRegister = !isRegister;
    title.textContent = isRegister ? 'Crear Cuenta' : 'Iniciar Sesión';
    btn.textContent = isRegister ? 'Registrarse' : 'Ingresar';
    toggle.textContent = isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
    nameField.classList.toggle('hidden', !isRegister);
    rolField.classList.toggle('hidden', !isRegister);
    errorMsg.classList.add('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
      if (isRegister) {
        const nombre = document.getElementById('reg-nombre').value;
        const rol = document.getElementById('reg-rol').value;
        const data = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ nombre, email, password, rol })
        });
        guardarSesion(data.token, data.usuario);
      } else {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        guardarSesion(data.token, data.usuario);
      }
      redirigirSegunRol();
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  });

  if (token) redirigirSegunRol();
});

function redirigirSegunRol() {
  if (usuario.rol === 'Admin') {
    window.location.href = '/admin.html';
  } else {
    window.location.href = '/cliente.html';
  }
}
