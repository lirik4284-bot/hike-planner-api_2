require('dotenv').config();
const app = require('./app');
const config = require('./config/config');
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(config.port, () => {
      console.log(`Hike Planner API listening on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Не удалось запустить сервер:', error.message);
    process.exit(1);
  }
}

start();
