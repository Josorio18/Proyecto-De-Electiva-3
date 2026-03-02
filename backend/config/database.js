const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de Sequelize para MariaDB usando DATABASE_URL
// Ejemplo de DATABASE_URL:
// mariadb://user:password@localhost:3306/canchapro
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mariadb',
    logging: false,
});

module.exports = sequelize;
