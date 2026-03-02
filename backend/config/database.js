const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de Sequelize para PostgreSQL usando DATABASE_URL
// Ejemplo de DATABASE_URL:
// postgres://user:password@localhost:5432/canchapro
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false // Requerido para Render
        } : false
    }
});

module.exports = sequelize;
