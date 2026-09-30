const { Hike, RoutePoint } = require('../models');
const ApiError = require('../utils/ApiError');
const { assertOrganizer } = require('../utils/hikeAccess');

async function listRoute(req, res, next) {
  try {
    const points = await RoutePoint.findAll({
      where: { hikeId: req.params.id },
      order: [['dayNumber', 'ASC'], ['orderIndex', 'ASC']],
    });
    res.json({ success: true, routePoints: points });
  } catch (error) {
    next(error);
  }
}

async function addPoint(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertOrganizer(hike, req.user);

    if (!req.body.title) {
      throw new ApiError(400, 'Укажите название точки маршрута');
    }

    const point = await RoutePoint.create({
      hikeId: hike.id,
      title: req.body.title,
      description: req.body.description,
      dayNumber: req.body.dayNumber || 1,
      orderIndex: req.body.orderIndex || 1,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    res.status(201).json({ success: true, routePoint: point });
  } catch (error) {
    next(error);
  }
}

async function updatePoint(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertOrganizer(hike, req.user);

    const point = await RoutePoint.findOne({ where: { id: req.params.pointId, hikeId: hike.id } });
    if (!point) {
      throw new ApiError(404, 'Точка маршрута не найдена');
    }

    await point.update(req.body);
    res.json({ success: true, routePoint: point });
  } catch (error) {
    next(error);
  }
}

async function deletePoint(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertOrganizer(hike, req.user);

    const deleted = await RoutePoint.destroy({ where: { id: req.params.pointId, hikeId: hike.id } });
    if (!deleted) {
      throw new ApiError(404, 'Точка маршрута не найдена');
    }
    res.json({ success: true, message: 'Точка маршрута удалена' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listRoute, addPoint, updatePoint, deletePoint };
