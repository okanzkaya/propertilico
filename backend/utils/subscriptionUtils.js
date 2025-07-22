const updateSubscriptionEndDate = (currentEndDate, days) => {
  const updatedEndDate = new Date(currentEndDate);
  updatedEndDate.setDate(updatedEndDate.getDate() + days);
  return updatedEndDate;
};

module.exports = { updateSubscriptionEndDate };
