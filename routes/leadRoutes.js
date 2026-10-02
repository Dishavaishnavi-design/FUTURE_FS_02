const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadStats,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  deleteNote,
  addFollowup,
  updateFollowup
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// All lead management routes are protected by auth middleware
router.use(protect);

router.get('/stats', getLeadStats);
router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);

router.post('/:id/followups', addFollowup);
router.put('/:id/followups/:followupId', updateFollowup);

module.exports = router;
