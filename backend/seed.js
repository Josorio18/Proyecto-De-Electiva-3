/**
 * Seed para crear usuario y admin por defecto (quemados)
 * Usuario: demo@canchapro.com / demo123
 * Admin: admin@canchapro.com / admin123
 */
require('dotenv').config();
const { User, Admin } = require('./models');

async function seed() {
    try {
        await User.findOrCreate({
            where: { email: 'demo@canchapro.com' },
            defaults: {
                name: 'Usuario Demo',
                email: 'demo@canchapro.com',
                password: 'demo123',
                phone: '3001234567'
            }
        });

        await Admin.findOrCreate({
            where: { email: 'admin@canchapro.com' },
            defaults: {
                name: 'Admin Root',
                email: 'admin@canchapro.com',
                password: 'admin123'
            }
        });

        console.log('✓ Usuario y Admin por defecto creados/verificados.');
        console.log('  Usuario: demo@canchapro.com / demo123');
        console.log('  Admin: admin@canchapro.com / admin123');
    } catch (err) {
        console.error('Error en seed:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seed();
