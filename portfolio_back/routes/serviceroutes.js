const express = require('express');
const router = express.Router();
const db = require('../db');

// add a service
router.post('/', async (req, res) => {
  const { title, description, status, created_at, pricing } = req.body;

  const sql = `INSERT INTO service (title, description, status, created_at, pricing) VALUES (?, ?, ?, ?, ?)`;

  try {
    await db.query(sql, [title, description, status || false, created_at, pricing]);
    res.status(201).json({ message: 'Service added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add service' });
  }
});

//modify a service
router.post('/modify', async (req, res) => {
  const { service_id, title, description, status, created_at, pricing } = req.body;

  const sql = `UPDATE service SET title = ?, description = ?, status = ?, created_at = ?, pricing = ? WHERE service_id = ?`;

  try {
    await db.query(sql, [title, description, status, created_at, pricing, service_id]);
    res.status(200).json({ message: 'Service modified' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to modify service' });
  }
});

//delete a service
router.post('/delete', async (req, res) => {
  const { service_id } = req.body;

  const sql = `DELETE FROM service WHERE service_id = ?`;

  try {
    await db.query(sql, [service_id]);
    res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});


// add an image to a service
router.post('/image', async (req, res) => {
  const { service_id, image } = req.body;

  const sql = `INSERT INTO service_image (service_id, image) VALUES (?, ?)`;

  try {
    await db.query(sql, [service_id, image]);
    res.status(201).json({ message: 'Image linked to service' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add service image' });
  }
});

//remove an image from a service
router.post('/remove_image', async (req, res) => {
  const { service_id, image } = req.body;

  const sql = `DELETE FROM service_image WHERE service_id = ? AND image = ?`;

  try {
    await db.query(sql, [service_id, image]);
    res.status(200).json({ message: 'Image removed from service' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to remove service image' });
  }
});

module.exports = router;



