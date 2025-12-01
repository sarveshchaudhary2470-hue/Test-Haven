const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addManager, getManagers } = require('../controllers/managerController');

router.use(protect);

router.post('/', addManager);
router.get('/', getManagers);

module.exports = router;
