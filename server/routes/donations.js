const express = require('express');
const {
  makeDonation,
  getDonationHistory,
  getDonationsForCampaign,
  getDonationStats
} = require('../controllers/donationController');
const { protect, donorOnly, ngoOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, donorOnly, makeDonation);
router.get('/history', protect, donorOnly, getDonationHistory);
router.get('/campaign/:campaignId', protect, ngoOnly, getDonationsForCampaign);
router.get('/stats', protect, ngoOnly, getDonationStats);

module.exports = router;

