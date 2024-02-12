const express = require('express');
const tokensController = require('../controllers/tokens.controller')
const router = express.Router();

router.post("/", tokensController.post );
router.get("/", tokensController.get );
router.put("/", tokensController.put );
router.delete("/", tokensController.delete );

module.exports = router;
