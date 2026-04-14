const express = require('express');
const { ObjectId } = require('mongodb');

/**
 * Factory function — receives the positions collection and shared middleware,
 * returns a configured Express Router. Matches the native-driver pattern used
 * throughout the rest of this project (no Mongoose).
 */
module.exports = function createPositionsRouter(positions, authMiddleware, requireRole) {
  const router = express.Router();

  // POST /positions — create a new position (staff + admin)
  router.post('/', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    const { name, description, responsibility } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const doc = {
      name: name.trim(),
      description: description.trim(),
      responsibility: Array.isArray(responsibility) ? responsibility : [],
      created_at: new Date(),
    };

    const result = await positions.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  });

  // GET /positions — retrieve all positions (any authenticated user)
  router.get('/', authMiddleware, async (req, res) => {
    const all = await positions.find({}).toArray();
    return res.json({ positions: all });
  });

  // GET /positions/:id — retrieve a single position (any authenticated user)
  router.get('/:id', authMiddleware, async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid position ID' });
    }

    const position = await positions.findOne({ _id: id });
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }

    return res.json(position);
  });

  // PUT /positions/:id — update a position (staff + admin)
  router.put('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid position ID' });
    }

    const { name, description, responsibility } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description) updates.description = description.trim();
    if (Array.isArray(responsibility)) updates.responsibility = responsibility;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const result = await positions.updateOne({ _id: id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Position not found' });
    }

    return res.json({ message: 'Position updated' });
  });

  // DELETE /positions/:id — remove a position (staff + admin)
  router.delete('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid position ID' });
    }

    const result = await positions.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Position not found' });
    }

    return res.json({ message: 'Position deleted' });
  });

  return router;
};
