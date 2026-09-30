# Hike Planner API

Серверная часть приложения для планирования походов: регистрация, создание походов, набор группы, маршрут, чек-лист снаряжения, обсуждение и общие расходы.

Стек: **Node.js**, **Express.js**, **MySQL**, **Sequelize**.

## Возможности

- Регистрация и вход по JWT
- Профиль пользователя с уровнем опыта
- CRUD походов (черновик / набор / полный / завершён / отменён)
- Поиск по названию, месту, сложности, датам
- Заявки участников: вступить, одобрить, отклонить, покинуть группу
- Точки маршрута по дням
- Общий чек-лист снаряжения и продуктов
- Комментарии внутри группы
- Учёт расходов и расчёт доли на человека

## Запуск

1. Установите MySQL 8 или поднимите контейнер:

```bash
docker compose up -d
```

2. Скопируйте переменные окружения и при необходимости поправьте пароль БД:

```bash
copy .env.example .env
```

3. Установите зависимости и запустите API:

```bash
npm install
npm start
```

Таблицы создаются автоматически при старте (`sequelize.sync`).

Демо-данные:

```bash
npm run seed
```

После сида можно войти как `anna@example.com` / `password123` (организатор) или `ivan@example.com` / `password123` (участник).

Сервер: `http://localhost:3000`

## Основные маршруты

| Метод | Путь | Описание |
| --- | --- | --- |
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Текущий пользователь и его походы |
| PATCH | `/api/auth/me` | Обновление профиля |
| GET | `/api/hikes` | Список походов (`q`, `difficulty`, `type`, `status`, `from`, `to`) |
| POST | `/api/hikes` | Создать поход (организатор сразу добавляется в группу) |
| GET | `/api/hikes/:id` | Карточка похода |
| PATCH | `/api/hikes/:id` | Редактировать поход |
| DELETE | `/api/hikes/:id` | Удалить поход |
| POST | `/api/hikes/:id/join` | Подать заявку |
| POST | `/api/hikes/:id/leave` | Покинуть поход |
| PATCH | `/api/hikes/:id/participants/:userId` | `{"status":"approved"}` или `declined` |
| GET/POST | `/api/hikes/:id/route` | Маршрут |
| GET/POST | `/api/hikes/:id/checklist` | Чек-лист |
| GET/POST | `/api/hikes/:id/comments` | Комментарии |
| GET/POST | `/api/hikes/:id/expenses` | Расходы |

Все защищённые запросы: заголовок `Authorization: Bearer <token>`.

## Пример

```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"user@example.com\",\"password\":\"secret12\",\"name\":\"Пётр\",\"experienceLevel\":\"beginner\"}"
```

```bash
curl -X POST http://localhost:3000/api/hikes ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Поход на Эльбрус\",\"startDate\":\"2026-07-10\",\"endDate\":\"2026-07-16\",\"location\":\"Приэльбрусье\",\"difficulty\":\"hard\",\"maxParticipants\":6,\"status\":\"open\"}"
```
