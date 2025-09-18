import Lead from '../models/Lead.mjs';

// Create lead
const createLead = async (req, res) => {
  const {
    first_name, last_name, email, phone, company, city, state, source, status,
    score, lead_value, last_activity_at, is_qualified,
  } = req.body;

  if (!first_name || !last_name || !email || !source) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const lead = await Lead.create({
      first_name,
      last_name,
      email,
      phone,
      company,
      city,
      state,
      source,
      status: status || 'new',
      score: score || 0,
      lead_value: lead_value || 0,
      last_activity_at,
      is_qualified: is_qualified || false,
      user: req.user,
    });

    res.status(201).json(lead);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leads with pagination and filters
const getLeads = async (req, res) => {
  const { page = 1, limit = 20, ...filters } = req.query;
  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 100); // Max limit 100

  try {
    const query = buildQuery(filters, req.user);

    const leads = await Lead.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      data: leads,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single lead
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user });
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update lead
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user });
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    Object.assign(lead, req.body, { updated_at: Date.now() });
    await lead.save();

    res.status(200).json(lead);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Build query for filtering
const buildQuery = (filters, userId) => {
  const query = { user: userId };

  // String filters (equals, contains)
  ['email', 'company', 'city'].forEach((field) => {
    if (filters[field]) {
      if (filters[`${field}_contains`]) {
        query[field] = { $regex: filters[field], $options: 'i' };
      } else {
        query[field] = filters[field];
      }
    }
  });

  // Enum filters (equals, in)
  ['source', 'status'].forEach((field) => {
    if (filters[field]) {
      if (filters[`${field}_in`]) {
        query[field] = { $in: filters[field].split(',') };
      } else {
        query[field] = filters[field];
      }
    }
  });

  // Number filters (equals, gt, lt, between)
  ['score', 'lead_value'].forEach((field) => {
    if (filters[field]) {
      if (filters[`${field}_gt`]) {
        query[field] = { ...query[field], $gt: parseFloat(filters[field]) };
      } else if (filters[`${field}_lt`]) {
        query[field] = { ...query[field], $lt: parseFloat(filters[field]) };
      } else if (filters[`${field}_between`]) {
        const [min, max] = filters[field].split(',').map(Number);
        query[field] = { $gte: min, $lte: max };
      } else {
        query[field] = parseFloat(filters[field]);
      }
    }
  });

  // Date filters (on, before, after, between)
  ['created_at', 'last_activity_at'].forEach((field) => {
    if (filters[field]) {
      if (filters[`${field}_on`]) {
        const start = new Date(filters[field]);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        query[field] = { $gte: start, $lte: end };
      } else if (filters[`${field}_before`]) {
        query[field] = { $lt: new Date(filters[field]) };
      } else if (filters[`${field}_after`]) {
        query[field] = { $gt: new Date(filters[field]) };
      } else if (filters[`${field}_between`]) {
        const [start, end] = filters[field].split(',').map((d) => new Date(d));
        query[field] = { $gte: start, $lte: end };
      }
    }
  });

  // Boolean filter
  if (filters.is_qualified) {
    query.is_qualified = filters.is_qualified === 'true';
  }

  return query;
};

export { createLead, getLeads, getLead, updateLead, deleteLead };