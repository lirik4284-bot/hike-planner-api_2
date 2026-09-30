const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Participant = sequelize.define('Participant', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  hikeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('organizer', 'member'),
    allowNull: false,
    defaultValue: 'member',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'declined', 'left'),
    allowNull: false,
    defaultValue: 'pending',
  },
  note: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

module.exports = Participant;
