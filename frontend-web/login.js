// Tabs
document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
        document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.form).classList.add('active');
    });
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showError(formId, msg) {
    const el = document.getElementById(`error-${formId}`);
    if (el) {
        el.textContent = msg;
        el.classList.add('show');
    }
}

function hideError(formId) {
    const el = document.getElementById(`error-${formId}`);
    if (el) el.classList.remove('show');
}

function saveSession(data) {
    localStorage.setItem('canchapro_session', JSON.stringify(data));
}

async function readJsonSafe(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

// Login Usuario
document.getElementById('form-user').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('user');
    try {
        const res = await fetch(`${API_URL}/auth/login-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('user-email').value,
                password: document.getElementById('user-password').value
            })
        });
        const data = await readJsonSafe(res);
        if (!res.ok) {
            showError('user', (data && data.error) ? data.error : `Error ${res.status}. Verifica que el backend esté actualizado y activo.`);
            return;
        }
        saveSession(data);
        showToast('¡Bienvenido!');
        window.location.href = 'user-dashboard.html';
    } catch (err) {
        showError('user', 'Error de conexión. Verifica que el servidor esté activo.');
    }
});

// Login Admin
document.getElementById('form-admin').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('admin');
    try {
        const res = await fetch(`${API_URL}/auth/login-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('admin-email').value,
                password: document.getElementById('admin-password').value
            })
        });
        const data = await readJsonSafe(res);
        if (!res.ok) {
            showError('admin', (data && data.error) ? data.error : `Error ${res.status}. Verifica que el backend esté actualizado y activo.`);
            return;
        }
        saveSession(data);
        showToast('¡Bienvenido, Admin!');
        window.location.href = 'index.html';
    } catch (err) {
        showError('admin', 'Error de conexión. Verifica que el servidor esté activo.');
    }
});

// Registro
document.getElementById('form-register').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('register');
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('reg-name').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value,
                phone: document.getElementById('reg-phone').value || null
            })
        });
        const data = await readJsonSafe(res);
        if (!res.ok) {
            showError('register', (data && data.error) ? data.error : `Error ${res.status}. Verifica que el backend esté actualizado y activo.`);
            return;
        }
        saveSession(data);
        showToast('¡Cuenta creada! Bienvenido.');
        window.location.href = 'user-dashboard.html';
    } catch (err) {
        showError('register', 'Error de conexión. Verifica que el servidor esté activo.');
    }
});
