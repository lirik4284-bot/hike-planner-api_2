const { Hike, ChecklistItem } = require('../models');
const ApiError = require('../utils/ApiError');
const { assertOrganizer, assertApprovedMember } = require('../utils/hikeAccess');

async function listChecklist(req, res, next) {
  try {
    const items = await ChecklistItem.findAll({
      where: { hikeId: req.params.id },
      order: [['category', 'ASC'], ['id', 'ASC']],
    });
    res.json({ success: true, checklist: items });
  } catch (error) {
    next(error);
  }
}

async function addItem(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertApprovedMember(hike.id, req.user);

    if (!req.body.title) {
      throw new ApiError(400, 'Укажите название пункта');
    }

    const item = await ChecklistItem.create({
      hikeId: hike.id,
      title: req.body.title,
      category: req.body.category || 'gear',
      quantity: req.body.quantity || 1,
      isRequired: req.body.isRequired !== undefined ? req.body.isRequired : true,
      assignedToUserId: req.body.assignedToUserId || null,
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertApprovedMember(hike.id, req.user);

    const item = await ChecklistItem.findOne({ where: { id: req.params.itemId, hikeId: hike.id } });
    if (!item) {
      throw new ApiError(404, 'Пункт чек-листа не найден');
    }

    await item.update(req.body);
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
}

async function deleteItem(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertOrganizer(hike, req.user);

    const deleted = await ChecklistItem.destroy({ where: { id: req.params.itemId, hikeId: hike.id } });
    if (!deleted) {
      throw new ApiError(404, 'Пункт чек-листа не найден');
    }
    res.json({ success: true, message: 'Пункт удалён' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listChecklist, addItem, updateItem, deleteItem };
