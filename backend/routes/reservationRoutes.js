const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/', reservationController.getReservations);
router.get('/:id', reservationController.getReservationById);
router.post('/', reservationController.createReservation);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
