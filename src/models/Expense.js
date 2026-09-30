const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  hikeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  paidByUserId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('transport', 'food', 'lodging', 'gear', 'permits', 'other'),
    allowNull: false,
    defaultValue: 'other',
  },
});

module.exports = Expense;
