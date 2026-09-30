const { Participant } = require('../models');
const ApiError = require('../utils/ApiError');

async function getApprovedCount(hikeId) {
  return Participant.count({
    where: { hikeId, status: 'approved' },
  });
}

async function findMembership(hikeId, userId) {
  return Participant.findOne({ where: { hikeId, userId } });
}

async function assertOrganizer(hike, user) {
  if (user.role !== 'admin' && hike.organizerId !== user.id) {
    throw new ApiError(403, 'Только организатор может выполнить это действие');
  }
}

async function assertApprovedMember(hikeId, user) {
  if (user.role === 'admin') {
    return;
  }
  const membership = await findMembership(hikeId, user.id);
  if (!membership || membership.status !== 'approved') {
    throw new ApiError(403, 'Доступно только участникам похода');
  }
}

module.exports = {
  getApprovedCount,
  findMembership,
  assertOrganizer,
  assertApprovedMember,
};
