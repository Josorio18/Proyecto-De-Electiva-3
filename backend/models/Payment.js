const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    method: {
        type: DataTypes.STRING, // cash, transfer, card
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, // completed, pending
        defaultValue: 'pending'
    }
}, {
    timestamps: true
});

module.exports = Payment;
