const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function createToolsRouter(tools, staff, authMiddleware, requireRole) {
  const router = express.Router();

  // POST /assign_tools_to_staff — assign tools to a staff member (replaces existing)
  router.post('/assign_tools_to_staff', /* authMiddleware, requireRole('admin', 'staff'), */ async (req, res) => {
    const { staff: staffId, tools: toolIds } = req.body;

    if (!staffId || !Array.isArray(toolIds)) {
      return res.status(400).json({ message: 'Staff ID and tools array are required' });
    }

    let id;
    try {
      id = new ObjectId(staffId);
    } catch {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    const result = await staff.updateOne({ _id: id }, { $set: { tools: toolIds } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    return res.json({ message: 'Tools assigned' });
  });

  // GET /get_staff_tools/:staff_id — return full tool objects for a staff member
  router.get('/get_staff_tools/:staff_id', /* authMiddleware, */ async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.staff_id);
    } catch {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    const member = await staff.findOne({ _id: id });
    if (!member) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const toolIds = (member.tools || [])
      .map(tid => { try { return new ObjectId(tid); } catch { return null; } })
      .filter(Boolean);

    const staffTools = await tools.find({ _id: { $in: toolIds } }).toArray();
    return res.json(staffTools);
  });

  // POST /tools — create a new tool
  router.post('/tools', /* authMiddleware, requireRole('admin', 'staff'), */ async (req, res) => {
    const { name, description, arguments: args } = req.body;

    if (!name || !description || args === undefined) {
      return res.status(400).json({ message: 'Name, description, and arguments are required' });
    }

    if (typeof args !== 'object' || Array.isArray(args)) {
      return res.status(400).json({ message: 'Arguments must be an object' });
    }

    const doc = {
      name: name.trim(),
      description: description.trim(),
      arguments: args,
      created_at: new Date(),
    };

    const result = await tools.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  });

  // GET /tools — retrieve all tools
  router.get('/tools', /* authMiddleware, */ async (req, res) => {
    const all = await tools.find({}).toArray();
    return res.json({ tools: all });
  });

  // GET /tools/:id — retrieve a single tool
  router.get('/tools/:id', /* authMiddleware, */ async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid tool ID' });
    }

    const tool = await tools.findOne({ _id: id });
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    return res.json(tool);
  });

  // PUT /tools/:id — update a tool
  router.put('/tools/:id', /* authMiddleware, requireRole('admin', 'staff'), */ async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid tool ID' });
    }

    const { name, description, arguments: args } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description) updates.description = description.trim();
    if (args !== undefined) {
      if (typeof args !== 'object' || Array.isArray(args)) {
        return res.status(400).json({ message: 'Arguments must be an object' });
      }
      updates.arguments = args;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const result = await tools.updateOne({ _id: id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    return res.json({ message: 'Tool updated' });
  });

  // DELETE /tools/:id — delete a tool
  router.delete('/tools/:id', /* authMiddleware, requireRole('admin', 'staff'), */ async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid tool ID' });
    }

    const result = await tools.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    return res.json({ message: 'Tool deleted' });
  });

  return router;
};
