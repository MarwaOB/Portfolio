const express = require('express');
const router = express.Router();
const db = require('../db');
const streamifier = require('streamifier');


// add a project /api/projects
router.post('/',async(req,res)=> {
  console.log('POST /api/projects - Request received');
  console.log('Request body:', req.body);
  
  const {
    // remember no project_id it's auto_incremented
    title,
    description,
    live_link,
    git_link,
    start_date,
    end_date
  } = req.body;

  // Validate required fields
  if (!title) {
    console.log('Validation failed: title is required');
    return res.status(400).json({ error: 'Title is required' });
  }

  console.log('Extracted fields:', {
    title,
    description,
    live_link,
    git_link,
    start_date,
    end_date
  });

  try{
    const quer = 'insert into project (title, description, live_link, git_link, start_date, end_date) values (?, ?, ?, ?, ?, ?)';
    const result = await db.query(quer, [
        title,
        description,
        live_link,
        git_link,
        formatDate(start_date),
        formatDate(end_date)
      ]);

    
    // Check if result has insertId (for mysql2) or if it's an array with insertId
    let insertId;
    if (result.insertId) {
      insertId = result.insertId;
    } else if (result[0] && result[0].insertId) {
      insertId = result[0].insertId;
    } else {
      console.log('Warning: Could not get insertId from result');
      insertId = null;
    }

    console.log('Insert ID:', insertId);

    // Return the project_id in the response
    res.status(201).json({ 
      message: 'Project added successfully',
      project_id: insertId 
    });

  } catch (err) {
    console.error('Error in POST /api/projects:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Failed to add project', details: err.message });
  }
});

// modify a project
// modify a project - FIXED VERSION
router.post('/modify', async (req, res) => {
  console.log('POST /api/projects/modify - Request received');
  console.log('Request body:', req.body);
  
  const { project_id, title, description, live_link, git_link, start_date, end_date } = req.body;

  // Validate required fields
  if (!project_id) {
    console.log('Validation failed: project_id is required');
    return res.status(400).json({ error: 'Project ID is required' });
  }

  if (!title) {
    console.log('Validation failed: title is required');
    return res.status(400).json({ error: 'Title is required' });
  }

  console.log('Extracted fields:', {
    project_id,
    title,
    description,
    live_link,
    git_link,
    start_date,
    end_date
  });

  try {
    // Format dates before using them
    const formattedStartDate = start_date ? formatDate(start_date) : null;
    const formattedEndDate = end_date ? formatDate(end_date) : null;
    
    console.log('Formatted dates:', {
      original_start: start_date,
      formatted_start: formattedStartDate,
      original_end: end_date,
      formatted_end: formattedEndDate
    });

    const query = 'UPDATE project SET title=?, description=?, live_link=?, git_link=?, start_date=?, end_date=? WHERE project_id=?';
    const params = [
      title,
      description,
      live_link,
      git_link,
      formattedStartDate,
      formattedEndDate,
      project_id
    ];

    console.log('Executing query:', query);
    console.log('Query parameters:', params);

    const result = await db.query(query, params);
    console.log('Update result:', result);

    res.status(200).json({ message: 'Project modified successfully' });

  } catch (err) {
    console.error('Error in POST /api/projects/modify:', err);
    res.status(500).json({ error: 'Failed to modify project', details: err.message });
  }
});

// Improved formatDate function to handle edge cases
const formatDate = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided:', date);
      return null;
    }
    
    // Return in YYYY-MM-DD format
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};


//delete a project
router.post("/delete",async (req,res)=>{
  console.log('POST /api/projects/delete - Request received');
  console.log('Request body:', req.body);
  
  const {project_id}= req.body;
  
  if (!project_id) {
    console.log('Validation failed: project_id is required');
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  const quer = "delete from project where project_id=?";
  
  try{
    console.log('Executing query:', quer);
    console.log('Query parameters:', [project_id]);
    
    const result = await db.query(quer,[project_id]);
    console.log('Delete result:', result);
    
    res.status(200).json({message:'Project deleted successfully'});
  } catch(err) {
    console.error('Error in POST /api/projects/delete:', err);
    res.status(500).json({ error: 'Failed to delete project', details: err.message });
  }
});

// add a tool
router.post("/tools/add",async (req,res)=>{
  console.log('POST /api/projects/tools/add - Request received');
  console.log('Request body:', req.body);
  
  const {name,type,image}= req.body;
  
  if (!name || !type) {
    console.log('Validation failed: name and type are required');
    return res.status(400).json({ error: 'Name and type are required' });
  }
  
  const quer = "insert into tool (name,type,image) values (?,?,?)";
  
  try{
    console.log('Executing query:', quer);
    console.log('Query parameters:', [name, type, image]);
    
    const result = await db.query(quer,[name,type,image]);
    console.log('Insert result:', result);
    
    res.status(201).json({message:'Tool added successfully'});
  } catch(err) {
    console.error('Error in POST /api/projects/tools/add:', err);
    res.status(500).json({ error: 'Failed to add the tool', details: err.message });
  }
});

// delete a tool
router.post("/tools/delete",async (req,res)=>{
  console.log('POST /api/projects/tools/delete - Request received');
  console.log('Request body:', req.body);
  
  const {tool_id}= req.body;
  
  if (!tool_id) {
    console.log('Validation failed: tool_id is required');
    return res.status(400).json({ error: 'Tool ID is required' });
  }
  
  const quer = "delete from tool where tool_id=?";
  
  try{
    console.log('Executing query:', quer);
    console.log('Query parameters:', [tool_id]);
    
    const result = await db.query(quer,[tool_id]);
    console.log('Delete result:', result);
    
    res.status(200).json({message:'Tool deleted successfully'});
  } catch(err) {
    console.error('Error in POST /api/projects/tools/delete:', err);
    res.status(500).json({ error: 'Failed to delete the tool', details: err.message });
  }
});

// add a tool to a project
router.post("/add_project_tool",async (req,res)=>{
  console.log('POST /api/projects/add_project_tool - Request received');
  console.log('Request body:', req.body);
  
  const {project_id,tool_id}= req.body;
  
  if (!project_id || !tool_id) {
    console.log('Validation failed: project_id and tool_id are required');
    return res.status(400).json({ error: 'Project ID and Tool ID are required' });
  }
  
  const quer = "insert into project_tool (project_id,tool_id) values (?,?)";
  
  try{
    console.log('Executing query:', quer);
    console.log('Query parameters:', [project_id, tool_id]);
    
    const result = await db.query(quer,[project_id,tool_id]);
    console.log('Insert result:', result);
    
    res.status(201).json({message:'Tool added to project successfully'});
  } catch(err) {
    console.error('Error in POST /api/projects/add_project_tool:', err);
    res.status(500).json({ error: 'Failed to add the tool', details: err.message });
  }
});

// remove a tool from a project
router.post("/remove_project_tool",async (req,res)=>{
  console.log('POST /api/projects/remove_project_tool - Request received');
  console.log('Request body:', req.body);
  
  const {project_id,tool_id}= req.body;
  
  if (!project_id || !tool_id) {
    console.log('Validation failed: project_id and tool_id are required');
    return res.status(400).json({ error: 'Project ID and Tool ID are required' });
  }
  
  const quer = "delete from project_tool where tool_id=? and project_id=?";
  
  try{
    console.log('Executing query:', quer);
    console.log('Query parameters:', [tool_id, project_id]);
    
    const result = await db.query(quer,[tool_id,project_id]);
    console.log('Delete result:', result);
    
    res.status(200).json({message:'Tool removed from project successfully'});
  } catch(err) {
    console.error('Error in POST /api/projects/remove_project_tool:', err);
    res.status(500).json({ error: 'Failed to remove the tool', details: err.message });
  }
});

//add a client
router.post('/clients', async (req, res) => {
  console.log('POST /api/projects/clients - Request received');
  console.log('Request body:', req.body);
  
  const { name, tel, e_mail, image } = req.body;

  if (!name) {
    console.log('Validation failed: name is required');
    return res.status(400).json({ error: 'Name is required' });
  }

  const sql = `INSERT INTO client (name, tel, e_mail, image) VALUES (?, ?, ?, ?)`;

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [name, tel, e_mail, image]);
    
    const result = await db.query(sql, [name, tel, e_mail, image]);
    console.log('Insert result:', result);
    
    res.status(201).json({ message: 'Client added successfully' });
  } catch (err) {
    console.error('Error in POST /api/projects/clients:', err);
    res.status(500).json({ error: 'Failed to add client', details: err.message });
  }
});

// Get all tools
router.get('/allTools', async (req, res) => {
  console.log('GET /api/projects/allTools - Request received');

  const sql = 'SELECT * FROM tool';

  try {
    console.log('Executing query:', sql);
    const [rows] = await db.query(sql);
    console.log('Query result - rows count:', rows.length);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in GET /api/projects/allTools:', err);
    res.status(500).json({ error: 'Failed to fetch tools', details: err.message });
  }
});

// get all the clients
router.get('/allClients', async (req, res) => {
  console.log('GET /api/projects/allClients - Request received');
  
  const sql = 'SELECT * FROM client';

  try {
    console.log('Executing query:', sql);
    const [rows] = await db.query(sql);
    console.log('Query result - rows count:', rows.length);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in GET /api/projects/allClients:', err);
    res.status(500).json({ error: 'Failed to fetch clients', details: err.message });
  }
});

//delete a client
router.post("/clients/delete",async (req,res)=>{
  console.log('POST /api/projects/clients/delete - Request received');
  console.log('Request body:', req.body);
  
  const {client_id}= req.body;
  
  if (!client_id) {
    console.log('Validation failed: client_id is required');
    return res.status(400).json({ error: 'Client ID is required' });
  }
  
  const quer = "delete from client where client_id=?";
  
  try{
    console.log('Executing query:', quer);
    console.log('Query parameters:', [client_id]);
    
    const result = await db.query(quer,[client_id]);
    console.log('Delete result:', result);
    
    res.status(200).json({message:'Client deleted successfully'});
  } catch(err) {
    console.error('Error in POST /api/projects/clients/delete:', err);
    res.status(500).json({ error: 'Failed to delete the client', details: err.message });
  }
});

// link a client to a project
router.post('/add_project_client', async (req, res) => {
  console.log('POST /api/projects/add_project_client - Request received');
  console.log('Request body:', req.body);
  
  const { project_id, client_id } = req.body;

  if (!project_id || !client_id) {
    console.log('Validation failed: project_id and client_id are required');
    return res.status(400).json({ error: 'Project ID and Client ID are required' });
  }

  const sql = `INSERT INTO project_client (project_id, client_id) VALUES (?, ?)`;

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [project_id, client_id]);
    
    const result = await db.query(sql, [project_id, client_id]);
    console.log('Insert result:', result);
    
    res.status(201).json({ message: 'Client linked to project successfully' });
  } catch (err) {
    console.error('Error in POST /api/projects/add_project_client:', err);
    res.status(500).json({ error: 'Failed to link client to project', details: err.message });
  }
});

// remove a client from a project
router.post("/remove_project_client",async (req,res)=>{
  console.log('POST /api/projects/remove_project_client - Request received');
  console.log('Request body:', req.body);
  
  const {project_id,client_id}= req.body;
  
  if (!project_id || !client_id) {
    console.log('Validation failed: project_id and client_id are required');
    return res.status(400).json({ error: 'Project ID and Client ID are required' });
  }
  
  const quer = "delete from project_client where client_id=? and project_id=?";
  
  try{
    console.log('Executing query:', quer);
    console.log('Query parameters:', [client_id, project_id]);
    
    const result = await db.query(quer,[client_id,project_id]);
    console.log('Delete result:', result);
    
    res.status(200).json({message:'Client removed from project successfully'});
  } catch(err) {
    console.error('Error in POST /api/projects/remove_project_client:', err);
    res.status(500).json({ error: 'Failed to remove the client', details: err.message });
  }
});

// add an image to a project
router.post('/image', async (req, res) => {
  console.log('POST /api/projects/image - Request received');
  console.log('Request body:', req.body);
  
  const { project_id, image } = req.body;

  if (!project_id || !image) {
    console.log('Validation failed: project_id and image are required');
    return res.status(400).json({ error: 'Project ID and image are required' });
  }

  const sql = `INSERT INTO project_images (project_id, image) VALUES (?, ?)`;

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [project_id, image]);
    
    const result = await db.query(sql, [project_id, image]);
    console.log('Insert result:', result);
    
    res.status(201).json({ message: 'Image added to project successfully' });
  } catch (err) {
    console.error('Error in POST /api/projects/image:', err);
    res.status(500).json({ error: 'Failed to add image', details: err.message });
  }
});

// add a demo for a project
router.post('/demo', async (req, res) => {
  console.log('POST /api/projects/demo - Request received');
  console.log('Request body:', req.body);
  
  const { project_id, demo } = req.body;

  if (!project_id || !demo) {
    console.log('Validation failed: project_id and demo are required');
    return res.status(400).json({ error: 'Project ID and demo are required' });
  }

  const sql = `INSERT INTO project_demos (project_id, demo) VALUES (?, ?)`;

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [project_id, demo]);
    
    const result = await db.query(sql, [project_id, demo]);
    console.log('Insert result:', result);
    
    res.status(201).json({ message: 'Demo added to project successfully' });
  } catch (err) {
    console.error('Error in POST /api/projects/demo:', err);
    res.status(500).json({ error: 'Failed to add demo', details: err.message });
  }
});

// remove an image from a project
router.post('/remove_image', async (req, res) => {
  console.log('POST /api/projects/remove_image - Request received');
  console.log('Request body:', req.body);
  const cloudinary = req.app.get('cloudinary');
  const { project_id, image } = req.body;
  if (!project_id || !image) {
    console.log('Validation failed: project_id and image are required');
    return res.status(400).json({ error: 'Project ID and image are required' });
  }
  try {
    // Get the public_id from the DB
    const [rows] = await db.query('SELECT public_id FROM project_images WHERE project_id = ? AND image = ?', [project_id, image]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Image not found in DB' });
    }
    const public_id = rows[0].public_id;
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
    // Delete from DB
    const sql = `DELETE FROM project_images WHERE project_id = ? AND image = ?`;
    await db.query(sql, [project_id, image]);
    res.status(200).json({ message: 'Image removed from project and Cloudinary successfully' });
  } catch (err) {
    console.error('Error in POST /api/projects/remove_image:', err);
    res.status(500).json({ error: 'Failed to remove image', details: err.message });
  }
});

// remove a demo from a project
router.post('/remove_demo', async (req, res) => {
  console.log('POST /api/projects/remove_demo - Request received');
  console.log('Request body:', req.body);
  
  const { project_id, demo } = req.body;

  if (!project_id || !demo) {
    console.log('Validation failed: project_id and demo are required');
    return res.status(400).json({ error: 'Project ID and demo are required' });
  }

  const sql = `DELETE FROM project_demos WHERE project_id = ? AND demo = ?`;

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [project_id, demo]);
    
    const result = await db.query(sql, [project_id, demo]);
    console.log('Delete result:', result);
    
    res.status(200).json({ message: 'Demo removed from project successfully' });
  } catch (err) {
    console.error('Error in POST /api/projects/remove_demo:', err);
    res.status(500).json({ error: 'Failed to remove demo', details: err.message });
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
  const { project_id } = req.body;
  if (!project_id || !req.file) {
    return res.status(400).json({ error: 'Project ID and image file are required' });
  }
  try {
    // Wrap upload_stream in a Promise
    const uploadToCloudinary = () => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'portfolio_projects' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    const result = await uploadToCloudinary();
    // Store the URL and public_id in the DB
    const sql = 'INSERT INTO project_images (project_id, image, public_id) VALUES (?, ?, ?)';
    await db.query(sql, [project_id, result.secure_url, result.public_id]);
    return res.status(201).json({ message: 'Image uploaded and linked to project', url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload image', details: err.message });
  }
});

// Get methods
// Get all projects
router.get('/', async (req, res) => {
  console.log('GET /api/projects - Request received');
  
  const sql = 'SELECT * FROM project';

  try {
    console.log('Executing query:', sql);
    const [rows] = await db.query(sql);
    console.log('Query result - rows count:', rows.length);

    // Automatic status update logic
    const today = new Date().toISOString().split('T')[0];
    const updatePromises = rows.map(async (project) => {
      if (project.end_date) {
        let newStatus = (project.end_date < today) ? 1 : 0;
        if (project.status !== newStatus) {
          await db.query('UPDATE project SET status=? WHERE project_id=?', [newStatus, project.project_id]);
          project.status = newStatus;
        }
      }
      return project;
    });
    await Promise.all(updatePromises);

    // Re-fetch updated projects
    const [updatedRows] = await db.query(sql);
    res.status(200).json(updatedRows);
  } catch (err) {
    console.error('Error in GET /api/projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

// get a specific project (by id)
router.get('/:id', async (req, res) => {
  console.log('GET /api/projects/:id - Request received');
  
  const { id } = req.params;
  console.log('Project ID:', id);
  
  const sql = 'SELECT * FROM project WHERE project_id = ?';

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [id]);
    
    const [rows] = await db.query(sql, [id]);
    console.log('Query result - rows count:', rows.length);

    if (rows.length === 0) {
      console.log('Project not found');
      return res.status(404).json({ error: 'Project not found' });
    }

    // Automatic status update logic for single project
    const project = rows[0];
    if (project.end_date) {
      const today = new Date().toISOString().split('T')[0];
      let newStatus = (project.end_date < today) ? 1 : 0;
      if (project.status !== newStatus) {
        await db.query('UPDATE project SET status=? WHERE project_id=?', [newStatus, project.project_id]);
        project.status = newStatus;
      }
    }

    res.status(200).json(project);
  } catch (err) {
    console.error('Error in GET /api/projects/:id:', err);
    res.status(500).json({ error: 'Failed to fetch project', details: err.message });
  }
});

//get Tools used in a project 
router.get('/:id/tools', async (req, res) => {
  console.log('GET /api/projects/:id/tools - Request received');
  
  const { id } = req.params;
  console.log('Project ID:', id);
  
  const sql = `
    SELECT T.* FROM tool T 
    JOIN project_tool PT ON T.tool_id = PT.tool_id
    WHERE PT.project_id = ?`;
    
  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [id]);
    
    const [rows] = await db.query(sql, [id]);
    console.log('Query result - rows count:', rows.length);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in GET /api/projects/:id/tools:', err);
    res.status(500).json({ error: 'Failed to fetch tools for project', details: err.message });
  }
});

// get clients linked to a project
router.get('/:id/clients', async (req, res) => {
  console.log('GET /api/projects/:id/clients - Request received');
  
  const { id } = req.params;
  console.log('Project ID:', id);
  
  const sql = `
    SELECT c.* FROM client c
    JOIN project_client pc ON pc.client_id = c.client_id
    WHERE pc.project_id = ?
  `;

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [id]);
    
    const [rows] = await db.query(sql, [id]);
    console.log('Query result - rows count:', rows.length);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in GET /api/projects/:id/clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients for project', details: err.message });
  }
});

// get the images of a project
router.get('/:id/images', async (req, res) => {
  console.log('GET /api/projects/:id/images - Request received');
  
  const { id } = req.params;
  console.log('Project ID:', id);
  
  const sql = `SELECT image FROM project_images WHERE project_id = ?`;

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [id]);
    
    const [rows] = await db.query(sql, [id]);
    console.log('Query result - rows count:', rows.length);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in GET /api/projects/:id/images:', err);
    res.status(500).json({ error: 'Failed to fetch images', details: err.message });
  }
});

//get the demos of a project
router.get('/:id/demos', async (req, res) => {
  console.log('GET /api/projects/:id/demos - Request received');
  
  const { id } = req.params;
  console.log('Project ID:', id);
  
  const sql = `SELECT demo FROM project_demos WHERE project_id = ?`;

  try {
    console.log('Executing query:', sql);
    console.log('Query parameters:', [id]);
    
    const [rows] = await db.query(sql, [id]);
    console.log('Query result - rows count:', rows.length);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in GET /api/projects/:id/demos:', err);
    res.status(500).json({ error: 'Failed to fetch demos', details: err.message });
  }
});

module.exports = router;