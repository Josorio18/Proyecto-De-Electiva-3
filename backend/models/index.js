const sequelize = require('../config/database');
const User = require('./User');
const Admin = require('./Admin');
const Court = require('./Court');
const Reservation = require('./Reservation');
const Payment = require('./Payment');

// Definir relaciones

// Un Usuario puede tener muchas Reservas
User.hasMany(Reservation, { foreignKey: 'userId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });

// Una Cancha puede tener muchas Reservas
Court.hasMany(Reservation, { foreignKey: 'courtId' });
Reservation.belongsTo(Court, { foreignKey: 'courtId' });

// Una Reserva tiene un Pago (1:1)
Reservation.hasOne(Payment, { foreignKey: 'reservationId' });
Payment.belongsTo(Reservation, { foreignKey: 'reservationId' });

const db = {
    sequelize,
    User,
    Admin,
    Court,
    Reservation,
    Payment
};

module.exports = db;
