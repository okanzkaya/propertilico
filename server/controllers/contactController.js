const Contact = require('../models/Contact');

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
      avatar: req.file ? req.file.path : undefined
    });
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ message: 'Error creating contact', error: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact', error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { 
        ...req.body,
        avatar: req.file ? req.file.path : undefined
      },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: 'Error updating contact', error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
};