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

exports.validateFeedback = (feedback) => {
  const schema = Joi.object({
    message: Joi.string().required().max(1000),
    rating: Joi.number().min(0).max(5),
    feedbackType: Joi.string().valid('bug', 'feature', 'improvement', 'general').required()
  });

  return schema.validate(feedback);
};