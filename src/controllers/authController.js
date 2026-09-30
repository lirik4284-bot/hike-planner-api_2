const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const config = require('../config/config');
const { User, Participant, Hike } = require('../models');
const ApiError = require('../utils/ApiError');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function publicUser(user) {
  const data = user.toJSON ? user.toJSON() : user;
  delete data.passwordHash;
  return data;
}

const registerRules = [
  body('email').isEmail().withMessage('Укажите корректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не короче 6 символов'),
  body('name').trim().isLength({ min: 2 }).withMessage('Укажите имя'),
  body('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Некорректный уровень опыта'),
];

const loginRules = [
  body('email').isEmail().withMessage('Укажите корректный email'),
  body('password').notEmpty().withMessage('Укажите пароль'),
];

async function register(req, res, next) {
  try {
    const existing = await User.findOne({ where: { email: req.body.email } });
    if (existing) {
      throw new ApiError(409, 'Пользователь с таким email уже зарегистрирован');
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      email: req.body.email.toLowerCase().trim(),
      passwordHash,
      name: req.body.name.trim(),
      bio: req.body.bio,
      city: req.body.city,
      phone: req.body.phone,
      experienceLevel: req.body.experienceLevel || 'beginner',
    });

    res.status(201).json({
      success: true,
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const user = await User.findOne({ where: { email: req.body.email.toLowerCase().trim() } });
    if (!user) {
      throw new ApiError(401, 'Неверный email или пароль');
    }

    const ok = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!ok) {
      throw new ApiError(401, 'Неверный email или пароль');
    }

    res.json({
      success: true,
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const participations = await Participant.findAll({
      where: { userId: req.user.id },
      include: [{ model: Hike }],
    });

    res.json({
      success: true,
      user: req.user,
      hikes: participations.map((item) => ({
        status: item.status,
        role: item.role,
        hike: item.Hike,
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const allowed = ['name', 'bio', 'city', 'phone', 'experienceLevel'];
    const payload = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        payload[key] = req.body[key];
      }
    });

    await req.user.update(payload);
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) {
      throw new ApiError(404, 'Пользователь не найден');
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerRules,
  loginRules,
  register,
  login,
  me,
  updateMe,
  getUser,
};
