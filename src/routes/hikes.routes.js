const express = require('express');
const validate = require('../middlewares/validate');
const { auth, optionalAuth } = require('../middlewares/auth');
const hikeController = require('../controllers/hikeController');
const participantController = require('../controllers/participantController');
const routeController = require('../controllers/routeController');
const checklistController = require('../controllers/checklistController');
const commentController = require('../controllers/commentController');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

router.get('/', optionalAuth, hikeController.listHikes);
router.get('/:id', optionalAuth, hikeController.getHike);
router.post('/', auth, hikeController.hikeRules, validate, hikeController.createHike);
router.patch('/:id', auth, hikeController.updateHike);
router.delete('/:id', auth, hikeController.deleteHike);

router.get('/:id/participants', optionalAuth, participantController.listParticipants);
router.post('/:id/join', auth, participantController.joinHike);
router.post('/:id/leave', auth, participantController.leaveHike);
router.patch('/:id/participants/:userId', auth, participantController.reviewParticipant);

router.get('/:id/route', optionalAuth, routeController.listRoute);
router.post('/:id/route', auth, routeController.addPoint);
router.patch('/:id/route/:pointId', auth, routeController.updatePoint);
router.delete('/:id/route/:pointId', auth, routeController.deletePoint);

router.get('/:id/checklist', optionalAuth, checklistController.listChecklist);
router.post('/:id/checklist', auth, checklistController.addItem);
router.patch('/:id/checklist/:itemId', auth, checklistController.updateItem);
router.delete('/:id/checklist/:itemId', auth, checklistController.deleteItem);

router.get('/:id/comments', optionalAuth, commentController.listComments);
router.post('/:id/comments', auth, commentController.addComment);
router.delete('/:id/comments/:commentId', auth, commentController.deleteComment);

router.get('/:id/expenses', auth, expenseController.listExpenses);
router.post('/:id/expenses', auth, expenseController.addExpense);
router.delete('/:id/expenses/:expenseId', auth, expenseController.deleteExpense);

module.exports = router;
