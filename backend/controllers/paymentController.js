const { Payment, Reservation } = require('../models');

exports.getPayments = async (req, res) => {
    try {
        const reservationWhere = {};
        if (req.query.userId) {
            reservationWhere.userId = parseInt(req.query.userId, 10);
        }

        const payments = await Payment.findAll({
            include: [{
                model: Reservation,
                attributes: ['id', 'date', 'userId'],
                where: Object.keys(reservationWhere).length ? reservationWhere : undefined,
                required: Object.keys(reservationWhere).length ? true : false
            }]
        });
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [{ model: Reservation, attributes: ['id', 'date', 'userId'] }]
        });

        if (!payment) return res.status(404).json({ error: 'Pago no encontrado.' });

        res.status(200).json(payment);
    } catch (error) {
        console.error('Error al obtener pago:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const { amount, method, reservationId } = req.body;

        // Validar si existe la reserva antes de crear el pago (opcional, pero buena práctica)
        const reservation = await Reservation.findByPk(reservationId);
        if (!reservation) {
            return res.status(404).json({ error: 'La reserva asociada no existe.' });
        }

        const newPayment = await Payment.create({ amount, method, reservationId, status: 'completed' });

        // Al pagar, se podría actalizar el estado de la reserva
        await reservation.update({ status: 'confirmed' });

        res.status(201).json(newPayment);
    } catch (error) {
        console.error('Error al crear pago:', error);
        res.status(500).json({ error: 'Error interno al crear pago.' });
    }
};
