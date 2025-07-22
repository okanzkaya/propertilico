const { models } = require('../config/db');
const AppError = require('../utils/appError');

exports.getTaxes = async (req, res, next) => {
  try {
    const taxes = await models.Tax.findAll({ where: { userId: req.user.id } });
    res.json(taxes);
  } catch (error) {
    next(new AppError('Error fetching taxes', 500));
  }
};

exports.addTax = async (req, res, next) => {
  try {
    const newTax = await models.Tax.create({ ...req.body, userId: req.user.id });
    res.status(201).json(newTax);
  } catch (error) {
    next(new AppError('Error adding tax', 400));
  }
};

exports.updateTax = async (req, res, next) => {
  try {
    const tax = await models.Tax.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!tax) {
      return next(new AppError('Tax not found', 404));
    }
    const updatedTax = await tax.update(req.body);
    res.json(updatedTax);
  } catch (error) {
    next(new AppError('Error updating tax', 400));
  }
};

exports.deleteTax = async (req, res, next) => {
  try {
    const tax = await models.Tax.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!tax) {
      return next(new AppError('Tax not found', 404));
    }
    await tax.destroy();
    res.status(204).json({ message: 'Tax deleted successfully' });
  } catch (error) {
    next(new AppError('Error deleting tax', 400));
  }
};

exports.importTaxes = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }
    
    const taxes = JSON.parse(req.file.buffer.toString());
    
    if (!Array.isArray(taxes)) {
      return next(new AppError('Invalid file format', 400));
    }
    
    const importedTaxes = await Promise.all(
      taxes.map(tax => models.Tax.create({ ...tax, userId: req.user.id }))
    );
    
    res.status(201).json(importedTaxes);
  } catch (error) {
    next(new AppError('Error importing taxes', 400));
  }
};