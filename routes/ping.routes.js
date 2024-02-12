const express = require('express');
const pinController = require('../controllers/ping.controller')
const router = express.Router();

router.get("/", pinController.ping );

module.exports = router;
