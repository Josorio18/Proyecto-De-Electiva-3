const { Court } = require('../models');

exports.getCourts = async (req, res) => {
    try {
        const courts = await Court.findAll();
        res.status(200).json(courts);
    } catch (error) {
        console.error('Error al obtener canchas:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.getCourtById = async (req, res) => {
    try {
        const court = await Court.findByPk(req.params.id);
        if (!court) return res.status(404).json({ error: 'Cancha no encontrada.' });
        res.status(200).json(court);
    } catch (error) {
        console.error('Error al obtener cancha:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.createCourt = async (req, res) => {
    try {
        const { name, sport, pricePerHour, isActive } = req.body;

        if (!name || !sport || !pricePerHour) {
            return res.status(400).json({ error: 'Faltan campos requeridos (name, sport, pricePerHour).' });
        }

        const newCourt = await Court.create({ name, sport, pricePerHour, isActive });
        res.status(201).json(newCourt);
    } catch (error) {
        console.error('Error al crear cancha:', error);
        res.status(500).json({ error: 'Error interno al crear la cancha.' });
    }
};

exports.updateCourt = async (req, res) => {
    try {
        const { name, sport, pricePerHour, isActive } = req.body;
        const court = await Court.findByPk(req.params.id);

        if (!court) return res.status(404).json({ error: 'Cancha no encontrada.' });

        await court.update({ name, sport, pricePerHour, isActive });
        res.status(200).json(court);
    } catch (error) {
        console.error('Error al actualizar cancha:', error);
        res.status(500).json({ error: 'Error interno al actualizar.' });
    }
};

exports.deleteCourt = async (req, res) => {
    try {
        const court = await Court.findByPk(req.params.id);

        if (!court) return res.status(404).json({ error: 'Cancha no encontrada.' });

        await court.destroy();
        res.status(200).json({ message: 'Cancha eliminada con éxito.' });
    } catch (error) {
        console.error('Error al eliminar cancha:', error);
        res.status(500).json({ error: 'Error interno al eliminar.' });
    }
};
