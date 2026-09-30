const { Hike, Expense, User, Participant } = require('../models');
const ApiError = require('../utils/ApiError');
const { assertApprovedMember } = require('../utils/hikeAccess');

async function listExpenses(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertApprovedMember(hike.id, req.user);

    const expenses = await Expense.findAll({
      where: { hikeId: hike.id },
      include: [{ model: User, as: 'payer', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const members = await Participant.count({ where: { hikeId: hike.id, status: 'approved' } });
    const perPerson = members > 0 ? Number((total / members).toFixed(2)) : total;

    res.json({
      success: true,
      total,
      members,
      perPerson,
      expenses,
    });
  } catch (error) {
    next(error);
  }
}

async function addExpense(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertApprovedMember(hike.id, req.user);

    if (!req.body.title || req.body.amount === undefined) {
      throw new ApiError(400, 'Укажите название и сумму расхода');
    }

    const expense = await Expense.create({
      hikeId: hike.id,
      paidByUserId: req.body.paidByUserId || req.user.id,
      title: req.body.title,
      amount: req.body.amount,
      category: req.body.category || 'other',
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertApprovedMember(hike.id, req.user);

    const expense = await Expense.findOne({ where: { id: req.params.expenseId, hikeId: hike.id } });
    if (!expense) {
      throw new ApiError(404, 'Расход не найден');
    }
    if (req.user.role !== 'admin' && expense.paidByUserId !== req.user.id && hike.organizerId !== req.user.id) {
      throw new ApiError(403, 'Недостаточно прав для удаления расхода');
    }

    await expense.destroy();
    res.json({ success: true, message: 'Расход удалён' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listExpenses, addExpense, deleteExpense };
