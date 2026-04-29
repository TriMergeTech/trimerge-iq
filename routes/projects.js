const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function createProjectsRouter(projects, authMiddleware, requireRole) {
  const router = express.Router();

  // POST /projects — create a new project (staff + admin)
  router.post('/', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    const { name, description, project_manager, team, client, service } = req.body;

    if (!name || !description || !project_manager || !client || !service) {
      return res.status(400).json({ message: 'Name, description, project_manager, client, and service are required' });
    }

    if (!Array.isArray(team)) {
      return res.status(400).json({ message: 'Team must be an array' });
    }

    const doc = {
      name: name.trim(),
      description: description.trim(),
      project_manager,
      team,
      client,
      service,
      created_at: new Date(),
    };

    const result = await projects.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  });

  // GET /projects — retrieve all projects (any authenticated user)
  router.get('/', authMiddleware, async (req, res) => {
    const all = await projects.find({}).toArray();
    return res.json({ projects: all });
  });

  // GET /projects/:id — retrieve a single project (any authenticated user)
  router.get('/:id', authMiddleware, async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await projects.findOne({ _id: id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json(project);
  });

  // PUT /projects/:id — update a project (staff + admin)
  router.put('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const { name, description, project_manager, team, client, service } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description) updates.description = description.trim();
    if (project_manager) updates.project_manager = project_manager;
    if (Array.isArray(team)) updates.team = team;
    if (client) updates.client = client;
    if (service) updates.service = service;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const result = await projects.updateOne({ _id: id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json({ message: 'Project updated' });
  });

  // DELETE /projects/:id — remove a project (staff + admin)
  router.delete('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const result = await projects.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json({ message: 'Project deleted' });
  });

  return router;
};
