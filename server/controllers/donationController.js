const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

// @desc    Make a donation
// @route   POST /api/donations
// @access  Private (Donor only)
const makeDonation = async (req, res) => {
  try {
    const { campaignId, amount } = req.body;

    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ message: 'Campaign is not active' });
    }

    // Create donation
    const donation = await Donation.create({
      donorId: req.user._id,
      campaignId,
      amount
    });

    // Update campaign raised amount
    campaign.raisedAmount += amount;
    await campaign.save();

    // Populate donation with campaign and donor info
    const populatedDonation = await Donation.findById(donation._id)
      .populate('campaignId', 'title description goalAmount raisedAmount')
      .populate('donorId', 'name email');

    res.status(201).json(populatedDonation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donor's donation history
// @route   GET /api/donations/history
// @access  Private (Donor only)
const getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate('campaignId', 'title description goalAmount raisedAmount createdBy')
      .populate({
        path: 'campaignId',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .sort({ donatedAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donations for a specific campaign
// @route   GET /api/donations/campaign/:campaignId
// @access  Private (NGO only, own campaigns)
const getDonationsForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Check if campaign exists and user owns it
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view donations for this campaign' });
    }

    const donations = await Donation.find({ campaignId })
      .populate('donorId', 'name email')
      .sort({ donatedAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donation statistics for NGO
// @route   GET /api/donations/stats
// @access  Private (NGO only)
const getDonationStats = async (req, res) => {
  try {
    // Get all campaigns by this NGO
    const campaigns = await Campaign.find({ createdBy: req.user._id });
    const campaignIds = campaigns.map(campaign => campaign._id);

    // Get all donations for these campaigns
    const donations = await Donation.find({ campaignId: { $in: campaignIds } })
      .populate('campaignId', 'title')
      .populate('donorId', 'name');

    // Calculate statistics
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

    // Group donations by campaign
    const donationsByCampaign = {};
    donations.forEach(donation => {
      const campaignTitle = donation.campaignId.title;
      if (!donationsByCampaign[campaignTitle]) {
        donationsByCampaign[campaignTitle] = {
          count: 0,
          total: 0
        };
      }
      donationsByCampaign[campaignTitle].count++;
      donationsByCampaign[campaignTitle].total += donation.amount;
    });

    res.json({
      totalDonations,
      totalAmount,
      averageDonation: Math.round(averageDonation * 100) / 100,
      donationsByCampaign,
      recentDonations: donations.slice(0, 10) // Last 10 donations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  makeDonation,
  getDonationHistory,
  getDonationsForCampaign,
  getDonationStats
};

