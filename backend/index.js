const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const frontendPath = path.join(__dirname, 'frontend-web');

// Configuración correcta de CORS
app.use(cors({
    origin: '*', // En un entorno real, define los orígenes permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json()); // para parsear application/json

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courtRoutes = require('./routes/courtRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);

const db = require('./models');

// Ruta raíz: mostrar login (antes de static para tener prioridad)
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// Health check para Render
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CanchaPro API' });
});

// Servir frontend estático (index.html, app.js, etc.)
app.use(express.static(frontendPath));

db.sequelize.sync({ alter: true }).then(async () => {
    console.log('Base de datos conectada y sincronizada.');
    // Crear usuario y admin por defecto si no existen
    const { User, Admin } = db;
    await User.findOrCreate({
        where: { email: 'demo@canchapro.com' },
        defaults: { name: 'Usuario Demo', email: 'demo@canchapro.com', password: 'demo123', phone: '3001234567' }
    });
    await Admin.findOrCreate({
        where: { email: 'admin@canchapro.com' },
        defaults: { name: 'Admin Root', email: 'admin@canchapro.com', password: 'admin123' }
    });
    console.log('Usuarios por defecto: demo@canchapro.com / demo123 | admin@canchapro.com / admin123');
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar la BD:', err);
});
