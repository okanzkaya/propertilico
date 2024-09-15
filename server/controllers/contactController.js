// In your server/controllers/contactController.js file:

const Contact = require('../models/Contact');
const fs = require('fs');
const path = require('path');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user._id });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const newContact = new Contact({
      ...req.body,
      user: req.user._id,
      avatar: req.file ? `/uploads/contacts/${req.file.filename}` : undefined
    });
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: 'Error creating contact', error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      updateData.avatar = `/uploads/contacts/${req.file.filename}`;
    }

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Remove old avatar if a new one is uploaded
    if (req.file && updatedContact.avatar && updatedContact.avatar !== updateData.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', updatedContact.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    res.json(updatedContact);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: 'Error updating contact', error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Remove avatar file if it exists
    if (deletedContact.avatar) {
      const avatarPath = path.join(__dirname, '..', deletedContact.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
};