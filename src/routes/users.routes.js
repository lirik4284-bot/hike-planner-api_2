const express = require('express');
const { auth } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/:id', auth, authController.getUser);

module.exports = router;
