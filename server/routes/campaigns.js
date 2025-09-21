const express = require('express');
const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignsByNGO
} = require('../controllers/campaignController');
const { protect, ngoOnly } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getCampaigns)
  .post(protect, ngoOnly, createCampaign);

router.route('/:id')
  .get(getCampaignById)
  .put(protect, ngoOnly, updateCampaign)
  .delete(protect, ngoOnly, deleteCampaign);

router.get('/ngo/:userId', protect, getCampaignsByNGO);

module.exports = router;

