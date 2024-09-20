const Joi = require('joi');

exports.validateTransaction = (transaction) => {
  const schema = Joi.object({
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().required(),
    date: Joi.date().iso().required()
  });

  return schema.validate(transaction);
};