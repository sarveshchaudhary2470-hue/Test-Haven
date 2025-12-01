const express = require('express');
const router = express.Router();
const { createContact, getContacts, deleteContact } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', createContact);
router.get('/', protect, authorize('admin', 'manager'), getContacts);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteContact);

module.exports = router;
