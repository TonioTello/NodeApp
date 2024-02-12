const express = require('express');
const usersController = require('../controllers/users.controller')
const router = express.Router();

router.post("/", usersController.post );
router.get("/", usersController.get );
router.put("/", usersController.put );
router.delete("/", usersController.delete );

module.exports = router;
