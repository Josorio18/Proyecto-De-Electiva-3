const { Reservation, User, Court, Payment } = require('../models');

exports.getReservations = async (req, res) => {
    try {
        const where = {};
        if (req.query.userId) {
            where.userId = parseInt(req.query.userId, 10);
        }

        const reservations = await Reservation.findAll({
            where,
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Court, attributes: ['id', 'name', 'pricePerHour'] },
                { model: Payment, attributes: ['id', 'amount', 'status'] }
            ]
        });
        res.status(200).json(reservations);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Court, attributes: ['id', 'name', 'pricePerHour'] },
                { model: Payment, attributes: ['id', 'amount', 'status'] }
            ]
        });

        if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

        res.status(200).json(reservation);
    } catch (error) {
        console.error('Error al obtener reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.createReservation = async (req, res) => {
    try {
        const { userId, courtId, date, startTime, endTime } = req.body;

        if (!userId || !courtId || !date || !startTime || !endTime) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }

        // Opcional: Validar disponibilidad, choques de horario, etc. (Simplificado para el ejemplo)

        const newReservation = await Reservation.create({
            userId,
            courtId,
            date,
            startTime,
            endTime
        });

        res.status(201).json(newReservation);
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ error: 'Error interno al crear reserva.' });
    }
};

exports.updateReservationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const reservation = await Reservation.findByPk(req.params.id);

        if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

        await reservation.update({ status });
        res.status(200).json(reservation);
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
        res.status(500).json({ error: 'Error interno al actualizar.' });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);

        if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

        await reservation.destroy();
        res.status(200).json({ message: 'Reserva eliminada con éxito.' });
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        res.status(500).json({ error: 'Error interno al eliminar.' });
    }
};
