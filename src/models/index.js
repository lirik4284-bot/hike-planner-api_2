const sequelize = require('../config/database');
const User = require('./User');
const Hike = require('./Hike');
const Participant = require('./Participant');
const RoutePoint = require('./RoutePoint');
const ChecklistItem = require('./ChecklistItem');
const Comment = require('./Comment');
const Expense = require('./Expense');

User.hasMany(Hike, { foreignKey: 'organizerId', as: 'organizedHikes' });
Hike.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

User.belongsToMany(Hike, {
  through: Participant,
  foreignKey: 'userId',
  otherKey: 'hikeId',
  as: 'hikes',
});
Hike.belongsToMany(User, {
  through: Participant,
  foreignKey: 'hikeId',
  otherKey: 'userId',
  as: 'members',
});

Hike.hasMany(Participant, { foreignKey: 'hikeId', as: 'participants', onDelete: 'CASCADE' });
Participant.belongsTo(Hike, { foreignKey: 'hikeId' });
Participant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Hike.hasMany(RoutePoint, { foreignKey: 'hikeId', as: 'routePoints', onDelete: 'CASCADE' });
RoutePoint.belongsTo(Hike, { foreignKey: 'hikeId' });

Hike.hasMany(ChecklistItem, { foreignKey: 'hikeId', as: 'checklist', onDelete: 'CASCADE' });
ChecklistItem.belongsTo(Hike, { foreignKey: 'hikeId' });
ChecklistItem.belongsTo(User, { foreignKey: 'assignedToUserId', as: 'assignee' });

Hike.hasMany(Comment, { foreignKey: 'hikeId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Hike, { foreignKey: 'hikeId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Hike.hasMany(Expense, { foreignKey: 'hikeId', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(Hike, { foreignKey: 'hikeId' });
Expense.belongsTo(User, { foreignKey: 'paidByUserId', as: 'payer' });

module.exports = {
  sequelize,
  User,
  Hike,
  Participant,
  RoutePoint,
  ChecklistItem,
  Comment,
  Expense,
};
