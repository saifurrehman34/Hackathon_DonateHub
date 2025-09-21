const Campaign = require('../models/Campaign');
const User = require('../models/User');

// @desc    Get all campaigns with filters and search
// @route   GET /api/campaigns
// @access  Public
const getCampaigns = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      query.status = 'active'; // Default to active campaigns
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Public
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private (NGO only)
const createCampaign = async (req, res) => {
  try {
    const { title, description, category, goalAmount } = req.body;

    const campaign = await Campaign.create({
      title,
      description,
      category,
      goalAmount,
      createdBy: req.user._id
    });

    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private (NGO only, own campaigns)
const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign
    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this campaign' });
    }

    const { title, description, category, goalAmount, status } = req.body;

    campaign.title = title || campaign.title;
    campaign.description = description || campaign.description;
    campaign.category = category || campaign.category;
    campaign.goalAmount = goalAmount || campaign.goalAmount;
    campaign.status = status || campaign.status;

    const updatedCampaign = await campaign.save();
    const populatedCampaign = await Campaign.findById(updatedCampaign._id)
      .populate('createdBy', 'name email');

    res.json(populatedCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (NGO only, own campaigns)
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign
    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this campaign' });
    }

    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get campaigns by NGO
// @route   GET /api/campaigns/ngo/:userId
// @access  Private
const getCampaignsByNGO = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.params.userId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignsByNGO
};

