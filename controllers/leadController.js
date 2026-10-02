const Lead = require('../models/Lead');

// @desc    Get all leads (with search & filter)
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    const { status, source, search, sort } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (source && source !== 'all') {
      query.source = source;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 }; // newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    } else if (sort === 'value') {
      sortOption = { value: -1 };
    }

    const leads = await Lead.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leads' });
  }
};

// @desc    Get lead statistics summary
// @route   GET /api/leads/stats
// @access  Private
exports.getLeadStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const contactedLeads = await Lead.countDocuments({ status: 'Contacted' });
    const inDiscussionLeads = await Lead.countDocuments({ status: 'In Discussion' });
    const convertedLeads = await Lead.countDocuments({ status: 'Converted' });
    const lostLeads = await Lead.countDocuments({ status: 'Lost' });

    // Pipeline value
    const valueResult = await Lead.aggregate([
      { $group: { _id: null, totalValue: { $sum: '$value' } } }
    ]);
    const totalValue = valueResult.length > 0 ? valueResult[0].totalValue : 0;

    // Upcoming follow-ups due
    const allLeadsWithFollowups = await Lead.find({ 'followups.status': 'Pending' }).select('name company followups');
    
    let pendingFollowups = [];
    allLeadsWithFollowups.forEach(lead => {
      lead.followups.forEach(f => {
        if (f.status === 'Pending') {
          pendingFollowups.push({
            leadId: lead._id,
            leadName: lead.name,
            company: lead.company,
            followupId: f._id,
            title: f.title,
            date: f.date,
            notes: f.notes
          });
        }
      });
    });

    // Sort follow-ups by date ascending
    pendingFollowups.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        inDiscussionLeads,
        convertedLeads,
        lostLeads,
        totalValue,
        pendingFollowupsCount: pendingFollowups.length
      },
      upcomingFollowups: pendingFollowups.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching lead' });
  }
};

// @desc    Create new lead (Admin Manual Entry)
// @route   POST /api/leads
// @access  Private
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, value, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide Name, Email, and Phone' });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company: company || 'N/A',
      source: source || 'Direct',
      status: status || 'New',
      value: value || 0,
      message: message || ''
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ success: false, message: 'Server error creating lead' });
  }
};

// @desc    Update lead information / status
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ success: false, message: 'Server error updating lead' });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ success: false, message: 'Server error deleting lead' });
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes.unshift({
      content,
      author: req.user ? req.user.name : 'Admin',
      createdAt: new Date()
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding note' });
  }
};

// @desc    Delete note from lead
// @route   DELETE /api/leads/:id/notes/:noteId
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes = lead.notes.filter(note => note._id.toString() !== req.params.noteId);
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting note' });
  }
};

// @desc    Add follow-up to lead
// @route   POST /api/leads/:id/followups
// @access  Private
exports.addFollowup = async (req, res) => {
  try {
    const { title, date, notes } = req.body;
    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and Date are required for follow-up' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.followups.push({
      title,
      date,
      notes: notes || '',
      status: 'Pending'
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error scheduling follow-up' });
  }
};

// @desc    Update follow-up status (Pending / Completed)
// @route   PUT /api/leads/:id/followups/:followupId
// @access  Private
exports.updateFollowup = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const followup = lead.followups.id(req.params.followupId);
    if (!followup) {
      return res.status(404).json({ success: false, message: 'Follow-up task not found' });
    }

    if (status) followup.status = status;
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Follow-up status updated',
      data: lead
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating follow-up' });
  }
};

// @desc    Public contact form submission (generates lead)
// @route   POST /api/public/contact
// @access  Public
exports.publicContactForm = async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email and phone are required fields' });
    }

    const newLead = await Lead.create({
      name,
      email,
      phone,
      company: company || 'Website Visitor',
      source: 'Website Contact Form',
      status: 'New',
      message: message || '',
      notes: message ? [{ content: `Client message from contact form: "${message}"`, author: 'System' }] : []
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your inquiry has been submitted successfully.',
      leadId: newLead._id
    });
  } catch (error) {
    console.error('Error handling public contact submission:', error);
    res.status(500).json({ success: false, message: 'Error submitting contact form' });
  }
};
