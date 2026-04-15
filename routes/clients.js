const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function createClientsRouter(clients, authMiddleware, requireRole) {
  const router = express.Router();

  // POST /clients — create a new client (staff + admin)
  router.post('/', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    const { name, about } = req.body;

    if (!name || !about) {
      return res.status(400).json({ message: 'Name and about are required' });
    }

    const doc = {
      name: name.trim(),
      about: about.trim(),
      created_at: new Date(),
    };

    const result = await clients.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  });

  // GET /clients — retrieve all clients (any authenticated user)
  router.get('/', authMiddleware, async (req, res) => {
    const all = await clients.find({}).toArray();
    return res.json({ clients: all });
  });

  // GET /clients/:id — retrieve a single client (any authenticated user)
  router.get('/:id', authMiddleware, async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const client = await clients.findOne({ _id: id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    return res.json(client);
  });

  // PUT /clients/:id — update a client (staff + admin)
  router.put('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const { name, about } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (about) updates.about = about.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const result = await clients.updateOne({ _id: id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    return res.json({ message: 'Client updated' });
  });

  // DELETE /clients/:id — remove a client (staff + admin)
  router.delete('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const result = await clients.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    return res.json({ message: 'Client deleted' });
  });

  return router;
};
