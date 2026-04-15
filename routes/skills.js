const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function createSkillsRouter(skills, authMiddleware, requireRole) {
  const router = express.Router();

  // POST /skills — create a new skill (staff + admin)
  router.post('/', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const doc = {
      name: name.trim(),
      description: description.trim(),
      created_at: new Date(),
    };

    const result = await skills.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  });

  // GET /skills — retrieve all skills (any authenticated user)
  router.get('/', authMiddleware, async (req, res) => {
    const all = await skills.find({}).toArray();
    return res.json({ skills: all });
  });

  // GET /skills/:id — retrieve a single skill (any authenticated user)
  router.get('/:id', authMiddleware, async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }

    const skill = await skills.findOne({ _id: id });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    return res.json(skill);
  });

  // PUT /skills/:id — update a skill (staff + admin)
  router.put('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }

    const { name, description } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description) updates.description = description.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const result = await skills.updateOne({ _id: id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    return res.json({ message: 'Skill updated' });
  });

  // DELETE /skills/:id — remove a skill (staff + admin)
  router.delete('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }

    const result = await skills.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    return res.json({ message: 'Skill deleted' });
  });

  return router;
};
