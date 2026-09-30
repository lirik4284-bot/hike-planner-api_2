const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChecklistItem = sequelize.define('ChecklistItem', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  hikeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  assignedToUserId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('gear', 'food', 'documents', 'medicine', 'other'),
    allowNull: false,
    defaultValue: 'gear',
  },
  quantity: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  isPacked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = ChecklistItem;
