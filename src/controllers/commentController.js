const { Hike, Comment, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { assertApprovedMember } = require('../utils/hikeAccess');

async function listComments(req, res, next) {
  try {
    const comments = await Comment.findAll({
      where: { hikeId: req.params.id },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
}

async function addComment(req, res, next) {
  try {
    const hike = await Hike.findByPk(req.params.id);
    if (!hike) {
      throw new ApiError(404, 'Поход не найден');
    }
    await assertApprovedMember(hike.id, req.user);

    if (!req.body.text || !req.body.text.trim()) {
      throw new ApiError(400, 'Введите текст комментария');
    }

    const comment = await Comment.create({
      hikeId: hike.id,
      userId: req.user.id,
      text: req.body.text.trim(),
    });

    const created = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
    });

    res.status(201).json({ success: true, comment: created });
  } catch (error) {
    next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    const comment = await Comment.findOne({
      where: { id: req.params.commentId, hikeId: req.params.id },
    });
    if (!comment) {
      throw new ApiError(404, 'Комментарий не найден');
    }
    if (req.user.role !== 'admin' && comment.userId !== req.user.id) {
      throw new ApiError(403, 'Можно удалить только свой комментарий');
    }

    await comment.destroy();
    res.json({ success: true, message: 'Комментарий удалён' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listComments, addComment, deleteComment };
