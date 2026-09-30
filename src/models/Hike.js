const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hike = sequelize.define('Hike', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('hiking', 'camping', 'trekking', 'climbing', 'mixed'),
    allowNull: false,
    defaultValue: 'hiking',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'moderate', 'hard', 'expert'),
    allowNull: false,
    defaultValue: 'moderate',
  },
  status: {
    type: DataTypes.ENUM('draft', 'open', 'full', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  meetingPoint: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  maxParticipants: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 10,
  },
  estimatedDistanceKm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  estimatedDurationDays: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  requiredGear: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  organizerId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
});

module.exports = Hike;
