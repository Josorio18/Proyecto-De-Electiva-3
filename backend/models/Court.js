const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Court = sequelize.define('Court', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING, // Ejemplo: Cancha Sintética 1
        allowNull: false
    },
    sport: {
        type: DataTypes.STRING, // fútbol, tenis, básquet, etc
        allowNull: false
    },
    pricePerHour: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Court;
