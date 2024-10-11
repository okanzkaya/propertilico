const { models, sequelize } = require('../config/db');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await models.Contact.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};

exports.createContact = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const newContact = await models.Contact.create({
      ...req.body,
      userId: req.user.id,
      avatar: req.file ? req.file.path : null
    }, { transaction: t });

    await t.commit();
    res.status(201).json(newContact);
  } catch (error) {
    await t.rollback();
    console.error('Error creating contact:', error);
    res.status(400).json({ message: 'Error creating contact', error: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await models.Contact.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Error fetching contact', error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const [updatedRowsCount, updatedContacts] = await models.Contact.update(
      {
        ...req.body,
        avatar: req.file ? req.file.path : undefined
      },
      {
        where: { id: req.params.id, userId: req.user.id },
        returning: true,
        transaction: t
      }
    );
    if (updatedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Contact not found' });
    }
    await t.commit();
    res.json(updatedContacts[0]);
  } catch (error) {
    await t.rollback();
    console.error('Error updating contact:', error);
    res.status(400).json({ message: 'Error updating contact', error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const deletedRowsCount = await models.Contact.destroy({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t
    });
    if (deletedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Contact not found' });
    }
    await t.commit();
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
};