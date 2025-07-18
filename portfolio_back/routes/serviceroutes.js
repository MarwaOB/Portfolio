const express = require('express');
const router = express.Router();
const db = require('../db');

// Add a service
router.post('/', async (req, res) => {
  const { title, description, status, created_at, pricing } = req.body;

  const sql = `INSERT INTO service (title, description, status, created_at, pricing) VALUES (?, ?, ?, ?, ?)`;

  try {
    const result = await db.query(sql, [
      title,
      description,
      status || false,
      created_at,
      pricing
    ]);

    let insertId = result.insertId || (result[0] && result[0].insertId) || null;

    res.status(201).json({
      message: 'Service added successfully',
      service_id: insertId
    });
  } catch (err) {
    console.error('Error in POST /api/services:', err);
    res.status(500).json({ error: 'Failed to add service', details: err.message });
  }
});

// Modify a service
router.post('/modify', async (req, res) => {
  const { service_id, title, description, status, created_at, pricing } = req.body;

  if (!service_id) {
    return res.status(400).json({ error: 'Service ID is required' });
  }

  const sql = `UPDATE service SET title = ?, description = ?, status = ?, created_at = ?, pricing = ? WHERE service_id = ?`;

  try {
    await db.query(sql, [title, description, status, created_at, pricing, service_id]);
    res.status(200).json({ message: 'Service modified successfully' });
  } catch (err) {
    console.error('Error in POST /api/services/modify:', err);
    res.status(500).json({ error: 'Failed to modify service', details: err.message });
  }
});

// Delete a service
router.post('/delete', async (req, res) => {
  const { service_id } = req.body;

  if (!service_id) {
    return res.status(400).json({ error: 'Service ID is required' });
  }

  const sql = `DELETE FROM service WHERE service_id = ?`;

  try {
    await db.query(sql, [service_id]);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error in POST /api/services/delete:', err);
    res.status(500).json({ error: 'Failed to delete service', details: err.message });
  }
});

// Add an image to a service
router.post('/image', async (req, res) => {
  const { service_id, image } = req.body;

  if (!service_id || !image) {
    return res.status(400).json({ error: 'Service ID and image are required' });
  }

  const sql = `INSERT INTO service_image (service_id, image) VALUES (?, ?)`;

  try {
    await db.query(sql, [service_id, image]);
    res.status(201).json({ message: 'Image linked to service successfully' });
  } catch (err) {
    console.error('Error in POST /api/services/image:', err);
    res.status(500).json({ error: 'Failed to add service image', details: err.message });
  }
});

// Remove an image from a service
router.post('/remove_image', async (req, res) => {
  const cloudinary = req.app.get('cloudinary');
  const { service_id, image } = req.body;

  if (!service_id || !image) {
    return res.status(400).json({ error: 'Service ID and image are required' });
  }

  try {
    // Get the public_id from the DB
    const [rows] = await db.query('SELECT public_id FROM service_image WHERE service_id = ? AND image = ?', [service_id, image]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Image not found in DB' });
    }
    const public_id = rows[0].public_id;
    // Delete from Cloudinary
    if (public_id) {
      await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
    }
    // Delete from DB
    const sql = `DELETE FROM service_image WHERE service_id = ? AND image = ?`;
    await db.query(sql, [service_id, image]);
    res.status(200).json({ message: 'Image removed from service and Cloudinary successfully' });
  } catch (err) {
    console.error('Error in POST /api/services/remove_image:', err);
    res.status(500).json({ error: 'Failed to remove service image', details: err.message });
  }
});

// Add image upload to Cloudinary and store URL and public_id in DB
router.post('/upload_image', (req, res, next) => {
  const upload = req.app.get('upload');
  upload.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: 'Image upload failed', details: err.message });
    }
    next();
  });
}, async (req, res) => {
  const cloudinary = req.app.get('cloudinary');
  const db = require('../db');
  const streamifier = require('streamifier');
  const { service_id } = req.body;
  if (!service_id || !req.file) {
    return res.status(400).json({ error: 'Service ID and image file are required' });
  }
  try {
    // Wrap upload_stream in a Promise
    const uploadToCloudinary = () => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'portfolio_services' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    const result = await uploadToCloudinary();
    // Store the URL and public_id in the DB
    const sql = 'INSERT INTO service_image (service_id, image, public_id) VALUES (?, ?, ?)';
    await db.query(sql, [service_id, result.secure_url, result.public_id]);
    return res.status(201).json({ message: 'Image uploaded and linked to service', url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload image', details: err.message });
  }
});

// GET all services
router.get('/', async (req, res) => {
  const sql = 'SELECT * FROM service';

  try {
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in GET /api/services:', err);
    res.status(500).json({ error: 'Failed to fetch services', details: err.message });
  }
});

// GET a specific service (by id)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM service WHERE service_id = ?';

  try {
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error in GET /api/services/:id:', err);
    res.status(500).json({ error: 'Failed to fetch service', details: err.message });
  }
});

// GET images of a service
router.get('/:id/images', async (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT image FROM service_image WHERE service_id = ?';

  try {
    const [rows] = await db.query(sql, [id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in GET /api/services/:id/images:', err);
    res.status(500).json({ error: 'Failed to fetch service images', details: err.message });
  }
});

module.exports = router;
