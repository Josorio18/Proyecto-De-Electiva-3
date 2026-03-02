const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas de API para Usuarios
router.get('/', userController.getUsers);
router.post('/', userController.createUser);

module.exports = router;
