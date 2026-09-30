const { Hike, Participant, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { assertOrganizer, getApprovedCount, findMembership } = require('../utils/hikeAccess');
const { refreshCapacity } = require('./hikeController');

async function listParticipants(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }

    const participants = await Participant.findAll({
      where: { hikeId: hike.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'experienceLevel', 'city'] }],
      order: [['createdAt', 'ASC']],
    });

    res.json({ success: true, participants });
  } catch (error) {
    next(error);
  }
}

async function joinHike(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    if (!['open'].includes(hike.status)) {
      throw new ApiError(400, 'Запись в этот поход сейчас закрыта');
    }

    const approved = await getApprovedCount(hike.id);
    if (approved >= hike.maxParticipants) {
      throw new ApiError(400, 'Все места уже заняты');
    }

    const existing = await findMembership(hike.id, req.user.id);
    if (existing) {
      if (existing.status === 'approved') {
        throw new ApiError(409, 'Вы уже участник этого похода');
      }
      if (existing.status === 'pending') {
        throw new ApiError(409, 'Заявка уже отправлена');
      }
      await existing.update({ status: 'pending', role: 'member', note: req.body.note || null });
      return res.status(201).json({ success: true, participant: existing });
    }

    const participant = await Participant.create({
      hikeId: hike.id,
      userId: req.user.id,
      role: 'member',
      status: 'pending',
      note: req.body.note || null,
    });

    res.status(201).json({ success: true, participant });
  } catch (error) {
    next(error);
  }
}

async function leaveHike(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    if (hike.organizerId === req.user.id) {
      throw new ApiError(400, 'Организатор не может покинуть поход. Передайте организацию или отмените поход');
    }

    const membership = await findMembership(hike.id, req.user.id);
    if (!membership) {
      throw new ApiError(404, 'Вы не состоите в этом походе');
    }

    await membership.update({ status: 'left' });
    await refreshCapacity(hike);
    res.json({ success: true, message: 'Вы покинули поход' });
  } catch (error) {
    next(error);
  }
}

async function reviewParticipant(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertOrganizer(hike, req.user);

    const { status } = req.body;
    if (!['approved', 'declined'].includes(status)) {
      throw new ApiError(400, 'Статус должен быть approved или declined');
    }

    const participant = await Participant.findOne({
      where: { hikeId: hike.id, userId: req.params.userId },
    });
    if (!participant) {
      throw new ApiError(404, 'Заявка не найдена');
    }
    if (participant.role === 'organizer') {
      throw new ApiError(400, 'Нельзя изменить статус организатора');
    }

    if (status === 'approved') {
      const approved = await getApprovedCount(hike.id);
      if (approved >= hike.maxParticipants) {
        throw new ApiError(400, 'Все места уже заняты');
      }
    }

    await participant.update({ status });
    await refreshCapacity(hike);
    res.json({ success: true, participant });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listParticipants,
  joinHike,
  leaveHike,
  reviewParticipant,
};
