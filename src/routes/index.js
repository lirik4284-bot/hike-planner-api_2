const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const hikesRoutes = require('./hikes.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, service: 'hike-planner-api_2', status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/hikes', hikesRoutes);

module.exports = router;
