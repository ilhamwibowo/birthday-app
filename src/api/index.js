const express = require('express');
const userRoutes = require('./routes/userRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello From Birthday App'
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Birthday Reminder API is running'
  });
});

router.use('/users', userRoutes);

module.exports = router;