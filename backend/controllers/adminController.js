const { Admin } = require('../models');

// Obtener todos los administradores
exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll({ attributes: { exclude: ['password'] } });
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error al obtener administradores:', error);
        res.status(500).json({ error: 'Error del servidor al obtener administradores.' });
    }
};

// Obtener un administrador por ID
exports.getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
        if (!admin) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }
        res.status(200).json(admin);
    } catch (error) {
        console.error('Error al obtener administrador:', error);
        res.status(500).json({ error: 'Error del servidor.' });
    }
};

// Crear un administrador
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }

        const newAdmin = await Admin.create({ name, email, password });

        const adminData = newAdmin.toJSON();
        delete adminData.password;

        res.status(201).json(adminData);
    } catch (error) {
        console.error('Error al crear administrador:', error);
        res.status(500).json({ error: 'Error interno o el correo ya existe.' });
    }
};

// Actualizar un administrador
exports.updateAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const admin = await Admin.findByPk(req.params.id);

        if (!admin) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        await admin.update({ name, email, password });

        const adminData = admin.toJSON();
        delete adminData.password;

        res.status(200).json(adminData);
    } catch (error) {
        console.error('Error al actualizar administrador:', error);
        res.status(500).json({ error: 'Error interno al actualizar.' });
    }
};

// Eliminar un administrador
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);

        if (!admin) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        await admin.destroy();
        res.status(200).json({ message: 'Administrador eliminado con éxito.' });
    } catch (error) {
        console.error('Error al eliminar administrador:', error);
        res.status(500).json({ error: 'Error interno al eliminar.' });
    }
};
