const { Op } = require('sequelize');
const { body } = require('express-validator');
const { Hike, User, Participant, RoutePoint, ChecklistItem, Comment, Expense } = require('../models');
const ApiError = require('../utils/ApiError');
const { getApprovedCount, assertOrganizer } = require('../utils/hikeAccess');

const hikeRules = [
  body('title').trim().isLength({ min: 3 }).withMessage('Укажите название похода'),
  body('startDate').isISO8601().withMessage('Укажите дату начала'),
  body('endDate').isISO8601().withMessage('Укажите дату окончания'),
  body('location').trim().notEmpty().withMessage('Укажите место проведения'),
  body('type').optional().isIn(['hiking', 'camping', 'trekking', 'climbing', 'mixed']),
  body('difficulty').optional().isIn(['easy', 'moderate', 'hard', 'expert']),
  body('maxParticipants').optional().isInt({ min: 1 }),
];

function hikeIncludes() {
  return [
    { model: User, as: 'organizer', attributes: ['id', 'name', 'experienceLevel', 'city'] },
    { model: Participant, as: 'participants', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'experienceLevel'] }] },
    { model: RoutePoint, as: 'routePoints' },
    { model: ChecklistItem, as: 'checklist' },
    { model: Comment, as: 'comments', include: [{ model: User, as: 'author', attributes: ['id', 'name'] }] },
    { model: Expense, as: 'expenses', include: [{ model: User, as: 'payer', attributes: ['id', 'name'] }] },
  ];
}

async function listHikes(req, res, next) {
  try {
    const { difficulty, type, status, q, from, to } = req.query;
    const where = {};

    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (status) {
      where.status = status;
    } else if (!req.user) {
      where.status = { [Op.notIn]: ['draft', 'cancelled'] };
    }
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { location: { [Op.like]: `%${q}%` } },
        { region: { [Op.like]: `%${q}%` } },
      ];
    }
    if (from || to) {
      where.startDate = {};
      if (from) where.startDate[Op.gte] = from;
      if (to) where.startDate[Op.lte] = to;
    }

    const hikes = await Hike.findAll({
      where,
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'city'] }],
      order: [['startDate', 'ASC']],
    });

    res.json({ success: true, count: hikes.length, hikes });
  } catch (error) {
    next(error);
  }
}

async function getHike(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id, { include: hikeIncludes() });
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }

    if (hike.status === 'draft') {
      const isOwner = req.user && (req.user.role === 'admin' || req.user.id === hike.organizerId);
      if (!isOwner) {
        throw new ApiError(404, 'Поход не найден');
      }
    }

    res.json({ success: true, hike });
  } catch (error) {
    next(error);
  }
}

async function createHike(req, res, next) {
  try {
    if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
      throw new ApiError(400, 'Дата окончания не может быть раньше даты начала');
    }

    const hike = await Hike.create({
      ...req.body,
      organizerId: req.user.id,
      status: req.body.status || 'draft',
    });

    await Participant.create({
      hikeId: hike.id,
      userId: req.user.id,
      role: 'organizer',
      status: 'approved',
    });

    const created = await Hike.findByPk(hike.id, { include: hikeIncludes() });
    res.status(201).json({ success: true, hike: created });
  } catch (error) {
    next(error);
  }
}

async function updateHike(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertOrganizer(hike, req.user);

    const allowed = [
      'title', 'description', 'type', 'difficulty', 'status', 'startDate', 'endDate',
      'location', 'region', 'meetingPoint', 'latitude', 'longitude',
      'maxParticipants', 'estimatedDistanceKm', 'estimatedDurationDays', 'requiredGear',
    ];
    const payload = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    });

    await hike.update(payload);
    const updated = await Hike.findByPk(hike.id, { include: hikeIncludes() });
    res.json({ success: true, hike: updated });
  } catch (error) {
    next(error);
  }
}

async function deleteHike(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertOrganizer(hike, req.user);
    await hike.destroy();
    res.json({ success: true, message: 'Поход удалён' });
  } catch (error) {
    next(error);
  }
}

async function refreshCapacity(hike) {
  const count = await getApprovedCount(hike.id);
  if (hike.status === 'open' && count >= hike.maxParticipants) {
    await hike.update({ status: 'full' });
  } else if (hike.status === 'full' && count < hike.maxParticipants) {
    await hike.update({ status: 'open' });
  }
}

module.exports = {
  hikeRules,
  listHikes,
  getHike,
  createHike,
  updateHike,
  deleteHike,
  refreshCapacity,
};
