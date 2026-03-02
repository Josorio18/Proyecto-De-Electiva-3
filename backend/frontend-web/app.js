// API_URL se define en config.js (se adapta a localhost o producción)

// ===== NAVEGACIÓN =====
const navLinks = document.querySelectorAll('.nav-links li');
const views = document.querySelectorAll('.view-section');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        link.classList.add('active');
        const targetView = document.getElementById(link.dataset.target);
        targetView.classList.add('active');

        // Refresh Data on tab clicked
        if (link.dataset.target === 'dashboard-view') Dashboard.load();
        if (link.dataset.target === 'users-view') Users.load();
        if (link.dataset.target === 'admins-view') Admins.load();
        if (link.dataset.target === 'courts-view') Courts.load();
        if (link.dataset.target === 'reservations-view') Reservations.load();
        if (link.dataset.target === 'payments-view') Payments.load();
    });
});

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== API HELPERS =====
async function fetchData(endpoint) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`);
        return await res.json();
    } catch (e) { console.error(e); }
}

async function postData(endpoint, data) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Error en el servidor');
        return await res.json();
    } catch (e) {
        showToast('Error en la operación', 'error');
        throw e;
    }
}

async function deleteData(endpoint) {
    await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
}

// ========================
//      MODULOS CRUD
// ========================

// DASHBOARD
const Dashboard = {
    async load() {
        const users = await fetchData('/users') || [];
        const courts = await fetchData('/courts') || [];
        const reservations = await fetchData('/reservations') || [];

        document.getElementById('total-users').textContent = users.length;
        document.getElementById('total-courts').textContent = courts.filter(c => c.isActive).length;
        document.getElementById('total-reservations').textContent = reservations.length;
    }
};

// USUARIOS
const Users = {
    async load() {
        const users = await fetchData('/users');
        const tbody = document.getElementById('table-users');
        tbody.innerHTML = '';
        users.forEach(u => {
            tbody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.phone || 'N/A'}</td>
                <td><button class="btn-delete" onclick="Users.delete(${u.id})"><i class="fa fa-trash"></i></button></td>
            </tr>`;
        });
    },
    async delete(id) {
        if (confirm('¿Eliminar usuario?')) {
            // Nota: Aquí se debería crear /api/users DELETE en el backend para borrar usuarios de ser necesario (No solicitado, solo UI).
            showToast('Función no habilitada para usuarios en pruebas.', 'error');
        }
    }
};

document.getElementById('form-users').addEventListener('submit', async (e) => {
    e.preventDefault();
    await postData('/users', {
        name: document.getElementById('u-name').value,
        email: document.getElementById('u-email').value,
        password: document.getElementById('u-password').value,
        phone: document.getElementById('u-phone').value
    });
    showToast('Usuario Creado Extiosamente!');
    e.target.reset();
    Users.load();
});

// ADMINS
const Admins = {
    async load() {
        const admins = await fetchData('/admins');
        const tbody = document.getElementById('table-admins');
        tbody.innerHTML = '';
        admins.forEach(a => {
            tbody.innerHTML += `
            <tr>
                <td>${a.id}</td>
                <td>${a.name}</td>
                <td>${a.email}</td>
                <td><button class="btn-delete" onclick="Admins.delete(${a.id})"><i class="fa fa-trash"></i></button></td>
            </tr>`;
        });
    },
    async delete(id) {
        if (confirm('¿Eliminar Admin?')) {
            await deleteData(`/admins/${id}`);
            showToast('Admin Eliminado');
            Admins.load();
        }
    }
};
document.getElementById('form-admins').addEventListener('submit', async (e) => {
    e.preventDefault();
    await postData('/admins', {
        name: document.getElementById('a-name').value,
        email: document.getElementById('a-email').value,
        password: document.getElementById('a-password').value
    });
    showToast('Admin Registrado!');
    e.target.reset();
    Admins.load();
});


// CANCHAS
const Courts = {
    async load() {
        const courts = await fetchData('/courts');
        const tbody = document.getElementById('table-courts');
        tbody.innerHTML = '';
        courts.forEach(c => {
            tbody.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.sport}</td>
                <td>$${c.pricePerHour}</td>
                <td><span class="badge ${c.isActive ? 'confirmed' : 'pending'}">${c.isActive ? 'Activa' : 'Inactiva'}</span></td>
                <td><button class="btn-delete" onclick="Courts.delete(${c.id})"><i class="fa fa-trash"></i></button></td>
            </tr>`;
        });
    },
    async delete(id) {
        if (confirm('¿Inactivar/Eliminar Cancha?')) {
            await deleteData(`/courts/${id}`);
            showToast('Cancha Eliminada');
            Courts.load();
        }
    }
};
document.getElementById('form-courts').addEventListener('submit', async (e) => {
    e.preventDefault();
    await postData('/courts', {
        name: document.getElementById('c-name').value,
        sport: document.getElementById('c-sport').value,
        pricePerHour: parseFloat(document.getElementById('c-price').value),
        isActive: document.getElementById('c-active').checked
    });
    showToast('Cancha Registrada!');
    e.target.reset();
    Courts.load();
});


// RESERVAS
const Reservations = {
    async populateSelects() {
        const users = await fetchData('/users');
        const courts = await fetchData('/courts');

        const selU = document.getElementById('r-user');
        const selC = document.getElementById('r-court');
        const selP = document.getElementById('p-res'); // Para pagos

        selU.innerHTML = '<option value="">Seleccione Usuario...</option>';
        selC.innerHTML = '<option value="">Seleccione Cancha...</option>';
        selP.innerHTML = '<option value="">Seleccione Reserva...</option>'; // Para la Pestaña Pagos

        users.forEach(u => selU.innerHTML += `<option value="${u.id}">${u.name}</option>`);
        courts.filter(c => c.isActive).forEach(c => selC.innerHTML += `<option value="${c.id}">${c.name} - $${c.pricePerHour}/h</option>`);
    },
    async load() {
        await this.populateSelects();
        const resList = await fetchData('/reservations');
        const tbody = document.getElementById('table-reservations');
        tbody.innerHTML = '';

        resList.forEach(r => {
            // Llenar select de pagos con reservas pendientes
            if (r.status === 'pending') {
                document.getElementById('p-res').innerHTML += `<option value="${r.id}">Res #${r.id} - ${r.User?.name || ''} - ${r.date}</option>`;
            }

            tbody.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td>${r.User ? r.User.name : 'N/A'}</td>
                <td>${r.Court ? r.Court.name : 'N/A'}</td>
                <td>${r.date}</td>
                <td>${r.startTime} a ${r.endTime}</td>
                <td><span class="badge ${r.status}">${r.status}</span></td>
                <td><button class="btn-delete" onclick="Reservations.delete(${r.id})"><i class="fa fa-trash"></i></button></td>
            </tr>`;
        });
    },
    async delete(id) {
        if (confirm('¿Eliminar Reserva?')) {
            await deleteData(`/reservations/${id}`);
            showToast('Reserva Cancelada');
            Reservations.load();
        }
    }
};
document.getElementById('form-reservations').addEventListener('submit', async (e) => {
    e.preventDefault();
    await postData('/reservations', {
        userId: parseInt(document.getElementById('r-user').value),
        courtId: parseInt(document.getElementById('r-court').value),
        date: document.getElementById('r-date').value,
        startTime: document.getElementById('r-start').value,
        endTime: document.getElementById('r-end').value
    });
    showToast('Reserva Exitosa!');
    e.target.reset();
    Reservations.load();
});


// PAGOS
const Payments = {
    async load() {
        const pays = await fetchData('/payments');
        const tbody = document.getElementById('table-payments');
        tbody.innerHTML = '';
        pays.forEach(p => {
            tbody.innerHTML += `
            <tr>
                <td>#${p.id}</td>
                <td>${p.reservationId}</td>
                <td>$${p.amount}</td>
                <td>${p.method.toUpperCase()}</td>
                <td><span class="badge completed">${p.status}</span></td>
            </tr>`;
        });
    }
};
document.getElementById('form-payments').addEventListener('submit', async (e) => {
    e.preventDefault();
    const resId = document.getElementById('p-res').value;
    if (!resId) { showToast('Seleccione una reserva válida', 'error'); return; }

    await postData('/payments', {
        reservationId: parseInt(resId),
        amount: parseFloat(document.getElementById('p-amount').value),
        method: document.getElementById('p-method').value
    });
    showToast('Pago Registrado con Éxito!');
    e.target.reset();
    Payments.load();
    Reservations.populateSelects(); // Refresca lista
});

// Init
window.onload = () => {
    Dashboard.load();
};
