const express = require('express');
const router = express.Router();
const { publicContactForm } = require('../controllers/leadController');

// Public route for client website contact form submission
router.post('/contact', publicContactForm);

module.exports = router;
