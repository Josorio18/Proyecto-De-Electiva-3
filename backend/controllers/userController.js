const { User } = require('../models');

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error del servidor al obtener usuarios.' });
    }
};

// Crear un usuario
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validación básica
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }

        const newUser = await User.create({ name, email, password, phone });

        // No devolver la contraseña en la respuesta
        const userData = newUser.toJSON();
        delete userData.password;

        res.status(201).json(userData);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno o el correo ya existe.' });
    }
};
