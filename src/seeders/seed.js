require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Hike, Participant, RoutePoint, ChecklistItem, Comment, Expense } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  const passwordHash = await bcrypt.hash('password123', 10);

  const anna = await User.create({
    email: 'anna@example.com',
    passwordHash,
    name: 'Анна Организатор',
    city: 'Москва',
    experienceLevel: 'advanced',
  });

  const ivan = await User.create({
    email: 'ivan@example.com',
    passwordHash,
    name: 'Иван Новичок',
    city: 'Москва',
    experienceLevel: 'beginner',
  });

  const hike = await Hike.create({
    title: 'Выходные в Карелии',
    description: 'Двухдневный поход вдоль озёр: ночёвка в палатках, общий котёл и лёгкий маршрут для новичков.',
    type: 'hiking',
    difficulty: 'easy',
    status: 'open',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
    location: 'Ладожские шхеры',
    region: 'Карелия',
    meetingPoint: 'Вокзал, 07:30',
    maxParticipants: 8,
    estimatedDistanceKm: 18,
    estimatedDurationDays: 3,
    requiredGear: 'Палатка, спальник, треккинговая обувь',
    organizerId: anna.id,
  });

  await Participant.bulkCreate([
    { hikeId: hike.id, userId: anna.id, role: 'organizer', status: 'approved' },
    { hikeId: hike.id, userId: ivan.id, role: 'member', status: 'pending', note: 'Готов помочь с кухней' },
  ]);

  await RoutePoint.bulkCreate([
    { hikeId: hike.id, title: 'Старт у причала', dayNumber: 1, orderIndex: 1 },
    { hikeId: hike.id, title: 'Привал у скалы', dayNumber: 1, orderIndex: 2 },
    { hikeId: hike.id, title: 'Лагерь на острове', dayNumber: 1, orderIndex: 3 },
    { hikeId: hike.id, title: 'Возвращение', dayNumber: 3, orderIndex: 1 },
  ]);

  await ChecklistItem.bulkCreate([
    { hikeId: hike.id, title: 'Газовая горелка', category: 'gear', assignedToUserId: anna.id },
    { hikeId: hike.id, title: 'Аптечка', category: 'medicine', assignedToUserId: anna.id },
    { hikeId: hike.id, title: 'Крупа и чай', category: 'food', assignedToUserId: ivan.id },
  ]);

  await Comment.create({
    hikeId: hike.id,
    userId: anna.id,
    text: 'Присылайте заявки до 1 июня. Возьмём общего трансфера от вокзала.',
  });

  await Expense.create({
    hikeId: hike.id,
    paidByUserId: anna.id,
    title: 'Бронь лодки',
    amount: 4800,
    category: 'transport',
  });

  console.log('Тестовые данные загружены.');
  console.log('Организатор: anna@example.com / password123');
  console.log('Участник: ivan@example.com / password123');
  await sequelize.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
