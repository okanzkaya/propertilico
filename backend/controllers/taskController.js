const { models, sequelize } = require('../config/db');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await models.Task.findAll({ where: { userId: req.user.id } });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTask = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const newTask = await models.Task.create({
      userId: req.user.id,
      task: req.body.task,
      status: req.body.status || 'Pending',
      dueDate: req.body.dueDate
    }, { transaction: t });

    await t.commit();
    res.status(201).json(newTask);
  } catch (error) {
    await t.rollback();
    console.error('Error creating task:', error);
    res.status(400).json({ message: 'Error creating task', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const [updatedRowsCount, updatedTasks] = await models.Task.update(req.body, {
      where: { id: req.params.id, userId: req.user.id },
      returning: true,
      transaction: t
    });

    if (updatedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Task not found' });
    }

    await t.commit();
    res.json(updatedTasks[0]);
  } catch (error) {
    await t.rollback();
    console.error('Error updating task:', error);
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const deletedRowsCount = await models.Task.destroy({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t
    });

    if (deletedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Task not found' });
    }

    await t.commit();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting task:', error);
    res.status(400).json({ message: 'Error deleting task', error: error.message });
  }
};