const { User, Admin } = require('../models');

// Login de usuario
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        const userData = user.toJSON();
        delete userData.password;

        res.status(200).json({
            success: true,
            type: 'user',
            user: userData
        });
    } catch (error) {
        console.error('Error en login usuario:', error);
        res.status(500).json({ error: 'Error del servidor.' });
    }
};

// Login de admin
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        if (admin.password !== password) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        const adminData = admin.toJSON();
        delete adminData.password;

        res.status(200).json({
            success: true,
            type: 'admin',
            user: adminData
        });
    } catch (error) {
        console.error('Error en login admin:', error);
        res.status(500).json({ error: 'Error del servidor.' });
    }
};

// Registro de nuevo usuario
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        const newUser = await User.create({ name, email, password, phone: phone || null });

        const userData = newUser.toJSON();
        delete userData.password;

        res.status(201).json({
            success: true,
            type: 'user',
            user: userData
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno al registrar.' });
    }
};
