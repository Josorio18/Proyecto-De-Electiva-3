// Verificar sesión - solo usuarios
const session = JSON.parse(localStorage.getItem('canchapro_session') || 'null');
let reservationsCache = [];
let payContext = null;

if (!session || session.type !== 'user') {
    window.location.href = 'login.html';
} else {
    document.getElementById('user-name').textContent = session.user.name;
    document.getElementById('user-email').textContent = session.user.email;
    document.getElementById('user-phone').textContent = session.user.phone || 'No registrado';

    initUserPanel();
}

async function initUserPanel() {
    await loadCourts();
    await loadReservations();
    await loadPayments();
    wireReservationEstimate();
}

function wireReservationEstimate() {
    const ids = ['sel-court', 'res-date', 'res-start', 'res-end'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateEstimate);
    });
    updateEstimate();
}

function parseTimeToMinutes(hhmm) {
    // Acepta "HH:MM" y "HH:MM:SS" (Sequelize suele devolver con segundos)
    if (!hhmm || !/^\d{2}:\d{2}(:\d{2})?$/.test(hhmm)) return null;
    const [h, m] = hhmm.split(':').slice(0, 2).map(n => parseInt(n, 10));
    return h * 60 + m;
}

function updateEstimate() {
    const estimateEl = document.getElementById('res-estimate');
    if (!estimateEl) return;

    const courtSel = document.getElementById('sel-court');
    const start = parseTimeToMinutes(document.getElementById('res-start')?.value);
    const end = parseTimeToMinutes(document.getElementById('res-end')?.value);
    const price = courtSel?.selectedOptions?.[0]?.dataset?.price ? parseFloat(courtSel.selectedOptions[0].dataset.price) : null;

    if (start == null || end == null || !price || !courtSel?.value) {
        estimateEl.textContent = '';
        return;
    }

    const mins = end - start;
    if (mins <= 0) {
        estimateEl.textContent = 'El fin debe ser mayor que el inicio.';
        return;
    }
    const hours = mins / 60;
    const total = price * hours;
    estimateEl.textContent = `Estimado: ${hours.toFixed(2)} horas × $${price}/h = $${total.toFixed(2)}`;
}

async function loadCourts() {
    const sel = document.getElementById('sel-court');
    if (!sel) return;
    try {
        const res = await fetch(`${API_URL}/courts`);
        const courts = await res.json();
        const active = (courts || []).filter(c => c.isActive);
        sel.innerHTML = '<option value="">Seleccione Cancha...</option>';
        active.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.name} - ${c.sport} - $${c.pricePerHour}/h`;
            opt.dataset.price = c.pricePerHour;
            sel.appendChild(opt);
        });
    } catch {
        sel.innerHTML = '<option value="">Error cargando canchas</option>';
    }
}

async function loadReservations() {
    const container = document.getElementById('user-reservations');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/reservations?userId=${session.user.id}`);
        const mine = await res.json();
        reservationsCache = Array.isArray(mine) ? mine : [];

        if (!reservationsCache || reservationsCache.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No tienes reservas aún.</p>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Cancha</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${reservationsCache.map(r => {
                        const canPay = r.status === 'pending';
                        const courtName = r.Court ? r.Court.name : 'N/A';
                        const payBtn = canPay
                            ? `<button class="btn-primary" style="padding: 0.5rem 0.9rem;" onclick="openPayModal(${r.id})"><i class="fa-solid fa-credit-card"></i> Pagar</button>`
                            : '';
                        const cancelBtn = r.status !== 'completed'
                            ? `<button class="btn-delete" onclick="cancelReservation(${r.id})" title="Cancelar"><i class="fa fa-trash"></i></button>`
                            : '';

                        return `
                            <tr>
                                <td>${courtName}</td>
                                <td>${r.date}</td>
                                <td>${r.startTime} - ${r.endTime}</td>
                                <td><span class="badge ${r.status}">${r.status}</span></td>
                                <td style="display:flex; gap:8px; align-items:center;">${payBtn} ${cancelBtn}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        container.innerHTML = '<p style="color: var(--danger);">Error al cargar reservas.</p>';
    }
}

async function loadPayments() {
    const container = document.getElementById('user-payments');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/payments?userId=${session.user.id}`);
        const pays = await res.json();
        if (!pays || pays.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Aún no tienes pagos registrados.</p>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead><tr><th>ID</th><th>Reserva</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead>
                <tbody>
                    ${pays.map(p => `
                        <tr>
                            <td>#${p.id}</td>
                            <td>${p.reservationId}</td>
                            <td>$${p.amount}</td>
                            <td>${String(p.method || '').toUpperCase()}</td>
                            <td><span class="badge completed">${p.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch {
        container.innerHTML = '<p style="color: var(--danger);">Error al cargar pagos.</p>';
    }
}

document.getElementById('form-new-reservation')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const courtId = parseInt(document.getElementById('sel-court').value, 10);
    const date = document.getElementById('res-date').value;
    const startTime = document.getElementById('res-start').value;
    const endTime = document.getElementById('res-end').value;

    if (!courtId || !date || !startTime || !endTime) {
        showToast('Completa todos los campos de la reserva', 'error');
        return;
    }

    const startM = parseTimeToMinutes(startTime);
    const endM = parseTimeToMinutes(endTime);
    if (startM == null || endM == null || endM <= startM) {
        showToast('Horario inválido. El fin debe ser mayor que el inicio.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: session.user.id,
                courtId,
                date,
                startTime,
                endTime
            })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            showToast((data && data.error) ? data.error : 'No se pudo crear la reserva', 'error');
            return;
        }
        showToast('Reserva creada (pendiente de pago).');
        e.target.reset();
        document.getElementById('res-estimate').textContent = '';
        await loadReservations();
    } catch {
        showToast('Error de conexión al crear reserva', 'error');
    }
});

async function cancelReservation(id) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
        const res = await fetch(`${API_URL}/reservations/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            showToast((data && data.error) ? data.error : 'No se pudo cancelar', 'error');
            return;
        }
        showToast('Reserva cancelada');
        await loadReservations();
    } catch {
        showToast('Error de conexión al cancelar', 'error');
    }
}

function setPayError(msg) {
    const el = document.getElementById('pay-error');
    if (!el) return;
    if (!msg) {
        el.style.display = 'none';
        el.textContent = '';
        return;
    }
    el.style.display = 'block';
    el.textContent = msg;
}

function setPayLoading(isLoading) {
    const btn = document.getElementById('btn-confirm-pay');
    if (!btn) return;
    const label = btn.querySelector('.btn-label');
    const loading = btn.querySelector('.btn-loading');
    btn.disabled = isLoading;
    if (label) label.style.display = isLoading ? 'none' : 'inline';
    if (loading) loading.style.display = isLoading ? 'inline' : 'none';
}

function getSelectedPayMethod() {
    const checked = document.querySelector('input[name="pay-method"]:checked');
    return checked ? checked.value : 'card';
}

function updatePayMethodUI() {
    const method = getSelectedPayMethod();
    document.querySelectorAll('.method-option').forEach(opt => opt.classList.remove('active'));
    document.querySelectorAll('input[name="pay-method"]').forEach(inp => {
        if (inp.checked) inp.closest('.method-option')?.classList.add('active');
    });

    const card = document.getElementById('pay-fields-card');
    const transfer = document.getElementById('pay-fields-transfer');
    const cash = document.getElementById('pay-fields-cash');
    if (card) card.style.display = method === 'card' ? 'block' : 'none';
    if (transfer) transfer.style.display = method === 'transfer' ? 'block' : 'none';
    if (cash) cash.style.display = method === 'cash' ? 'block' : 'none';
}

function openPayModal(reservationId) {
    const overlay = document.getElementById('pay-overlay');
    if (!overlay) return;

    const r = reservationsCache.find(x => x.id === reservationId);
    if (!r) {
        showToast('No se encontró la reserva a pagar.', 'error');
        return;
    }
    if (r.status !== 'pending') {
        showToast('Esta reserva ya no está pendiente.', 'error');
        return;
    }

    const price = r.Court ? parseFloat(r.Court.pricePerHour) : NaN;
    const startM = parseTimeToMinutes(r.startTime);
    const endM = parseTimeToMinutes(r.endTime);
    const hours = (startM != null && endM != null) ? (endM - startM) / 60 : 0;
    const amount = (Number.isFinite(price) && hours > 0) ? (price * hours) : 0;

    if (!amount || amount <= 0) {
        showToast('No se pudo calcular el monto del pago.', 'error');
        return;
    }

    payContext = {
        reservationId: r.id,
        amount: parseFloat(amount.toFixed(2)),
        courtName: r.Court ? r.Court.name : 'N/A',
        date: r.date,
        time: `${r.startTime} - ${r.endTime}`
    };

    document.getElementById('pay-res-id').textContent = `#${payContext.reservationId}`;
    document.getElementById('pay-court').textContent = payContext.courtName;
    document.getElementById('pay-date').textContent = payContext.date;
    document.getElementById('pay-time').textContent = payContext.time;
    document.getElementById('pay-amount').textContent = `$${payContext.amount.toFixed(2)}`;

    setPayError('');
    setPayLoading(false);

    // Reset método a tarjeta por defecto
    const cardRadio = document.querySelector('input[name="pay-method"][value="card"]');
    if (cardRadio) cardRadio.checked = true;
    updatePayMethodUI();

    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
}

function closePayModal() {
    const overlay = document.getElementById('pay-overlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    setPayError('');
    setPayLoading(false);
    payContext = null;
}

// Cerrar al hacer click fuera del modal
document.getElementById('pay-overlay')?.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'pay-overlay') closePayModal();
});

// Cambios de método
document.querySelectorAll('input[name="pay-method"]').forEach(inp => {
    inp.addEventListener('change', updatePayMethodUI);
});

async function confirmPay() {
    if (!payContext) return;

    const method = getSelectedPayMethod();
    setPayError('');
    setPayLoading(true);

    // Simulación visual (pequeña espera)
    await new Promise(r => setTimeout(r, 900));

    try {
        const res = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reservationId: payContext.reservationId,
                amount: payContext.amount,
                method
            })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            setPayLoading(false);
            setPayError((data && data.error) ? data.error : 'No se pudo registrar el pago.');
            return;
        }

        showToast('Pago simulado con éxito. Reserva confirmada.');
        closePayModal();
        await loadReservations();
        await loadPayments();
    } catch {
        setPayLoading(false);
        setPayError('Error de conexión al pagar. Verifica el servidor.');
    }
}

function logout() {
    localStorage.removeItem('canchapro_session');
    window.location.href = 'login.html';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
