const express = require('express');
const validate = require('../middlewares/validate');
const { auth } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.registerRules, validate, authController.register);
router.post('/login', authController.loginRules, validate, authController.login);
router.get('/me', auth, authController.me);
router.patch('/me', auth, authController.updateMe);

module.exports = router;
