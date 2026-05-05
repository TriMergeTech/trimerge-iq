const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function createStaffRouter(staff, authMiddleware, requireRole) {
  const router = express.Router();

  // POST /staff — create a staff member (staff + admin)
  router.post('/', /* authMiddleware, requireRole('admin', 'staff'), */ async (req, res) => {
    const { name, email, position } = req.body;

    if (!name || !email || !position) {
      return res.status(400).json({ message: 'Name, email, and position are required' });
    }

    const doc = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      position,
      created_at: new Date(),
    };

    const result = await staff.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  });

  // GET /staff — retrieve all staff members (any authenticated user)
  router.get('/', /* authMiddleware, */ async (req, res) => {
    const all = await staff.find({}).toArray();
    return res.json({ staff: all });
  });

  // GET /staff/:id — retrieve a single staff member (any authenticated user)
  router.get('/:id', /* authMiddleware, */ async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    const member = await staff.findOne({ _id: id });
    if (!member) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    return res.json(member);
  });

  // PUT /staff/:id — update a staff member (staff + admin)
  router.put('/:id', /* authMiddleware, requireRole('admin', 'staff'), */ async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    const { name, email, position } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (position) updates.position = position;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const result = await staff.updateOne({ _id: id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    return res.json({ message: 'Staff member updated' });
  });

  // DELETE /staff/:id — remove a staff member (staff + admin)
  router.delete('/:id', /* authMiddleware, requireRole('admin', 'staff'), */ async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    const result = await staff.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    return res.json({ message: 'Staff member deleted' });
  });

  return router;
};
