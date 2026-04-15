const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function createServicesRouter(services, authMiddleware, requireRole) {
  const router = express.Router();

  // POST /services — create a new service (staff + admin)
  router.post('/', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    const { title, descriptions, skills } = req.body;

    if (!title || !descriptions) {
      return res.status(400).json({ message: 'Title and descriptions are required' });
    }

    const doc = {
      title: title.trim(),
      descriptions: descriptions.trim(),
      skills: Array.isArray(skills) ? skills : [],
      created_at: new Date(),
    };

    const result = await services.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  });

  // GET /services — retrieve all services (any authenticated user)
  router.get('/', authMiddleware, async (req, res) => {
    const all = await services.find({}).toArray();
    return res.json({ services: all });
  });

  // GET /services/:id — retrieve a single service (any authenticated user)
  router.get('/:id', authMiddleware, async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const service = await services.findOne({ _id: id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    return res.json(service);
  });

  // PUT /services/:id — update a service (staff + admin)
  router.put('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const { title, descriptions, skills } = req.body;
    const updates = {};
    if (title) updates.title = title.trim();
    if (descriptions) updates.descriptions = descriptions.trim();
    if (Array.isArray(skills)) updates.skills = skills;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const result = await services.updateOne({ _id: id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    return res.json({ message: 'Service updated' });
  });

  // DELETE /services/:id — remove a service (staff + admin)
  router.delete('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const result = await services.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    return res.json({ message: 'Service deleted' });
  });

  return router;
};
