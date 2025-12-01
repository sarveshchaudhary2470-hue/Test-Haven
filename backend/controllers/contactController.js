const Contact = require('../models/Contact');

// @route   POST /api/contact
// @desc    Create a new contact message
// @access  Public
exports.createContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            message
        });

        res.status(201).json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Error creating contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private/Admin/Manager
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private/Admin/Manager
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await contact.deleteOne();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
