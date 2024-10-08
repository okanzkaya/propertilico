const { Contact } = require('../models/Contact');
const { Op } = require('sequelize');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

exports.createContact = async (req, res) => {
  try {
    const newContact = await Contact.create({
      ...req.body,
      userId: req.user.id,
      avatar: req.file ? req.file.path : null
    });
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(400).json({ message: 'Error creating contact' });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Error fetching contact' });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const [updatedRowsCount, updatedContacts] = await Contact.update(
      {
        ...req.body,
        avatar: req.file ? req.file.path : undefined
      },
      {
        where: { id: req.params.id, userId: req.user.id },
        returning: true
      }
    );
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(updatedContacts[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(400).json({ message: 'Error updating contact' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const deletedRowsCount = await Contact.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Error deleting contact' });
  }
};