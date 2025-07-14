const express = require('express');
const router = express.Router();
const db = require('../db');

// add a project /api/projects
router.post('/',async(req,res)=>{ const {
    // remember no project_id it's auto_incremented
    title,
    description,
    live_link,
    git_link,
    start_date,
    end_date
  } = req.body;

try{
const quer = 'insert into project  ( title, description, live_link, git_link, start_date, end_date)values (?, ?, ?, ?, ?, ?) ';
  await db.query(quer, [
      title,
      description,
      live_link,
      git_link,
      start_date,
      end_date
    ]);
   res.status(201).json({ message: ' Project added' });

}catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add project' });
  }
});



// modify a project
router.post('/modify',async(req,res)=>{ const {
    project_id,
    title,
    description,
    live_link,
    git_link,
    start_date,
    end_date
  } = req.body;

try{
const quer = 'update project set title=?, description=?, live_link=?, git_link=?, start_date=?, end_date=? where project_id=?';
  await db.query(quer, [
      title,
      description,
      live_link,
      git_link,
      start_date,
      end_date,
      project_id
    ]);
   res.status(201).json({ message: ' Project modified' });

}catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to modify project' });
  }
});

//delete a project
router.post("/delete",async (req,res)=>{
const {project_id}= req.body;
const quer = "delete from project where project_id=?";
try{
await db.query(quer,[project_id]);
res.status(201).json({message:'project deleted'})
}catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete project' });
  }
})

// add a tool
router.post("/tools/add",async (req,res)=>{
const {name,type,image}= req.body;
const quer = "insert into tool (name,type,image) values (?,?,?)";
try{
await db.query(quer,[name,type,image]);
res.status(201).json({message:'tool added'})
}catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add the tool' });
  }
})

// delete a tool
router.post("/tools/delete",async (req,res)=>{
const {tool_id}= req.body;
const quer = "delete from tool where tool_id=? ";
try{
await db.query(quer,[tool_id]);
res.status(201).json({message:'tool deleted'})
}catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete the tool' });
  }
})


// add a tool to a project
router.post("/add_project_tool",async (req,res)=>{
const {project_id,tool_id}= req.body;
const quer = "insert into project_tool (project_id,tool_id) values (?,?)";
try{
await db.query(quer,[project_id,tool_id]);
res.status(201).json({message:'tool added'})
}catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add the tool' });
  }
})

// remove a tool from a project
router.post("/remove_project_tool",async (req,res)=>{
const {project_id,tool_id}= req.body;
const quer = "delete from project_tool where tool_id=? and project_id=? ";
try{
await db.query(quer,[project_id,tool_id]);
res.status(201).json({message:'tool deleted'})
}catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete the tool' });
  }
})


//add a client
router.post('/clients', async (req, res) => {
  const { name, tel, e_mail, image } = req.body;

  const sql = `INSERT INTO client (name, tel, e_mail, image) VALUES (?, ?, ?, ?)`;

  try {
    await db.query(sql, [name, tel, e_mail, image]);
    res.status(201).json({ message: 'Client added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add client' });
  }
});

//delete a client
router.post("/clients/delete",async (req,res)=>{
const {client_id}= req.body;
const quer = "delete from client where client_id=? ";
try{
await db.query(quer,[client_id]);
res.status(201).json({message:'client deleted'})
}catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete the client' });
  }
})


// link a client to a project
router.post('/add_project_client', async (req, res) => {
  const { project_id, client_id } = req.body;

  const sql = `INSERT INTO project_client (project_id, client_id) VALUES (?, ?)`;

  try {
    await db.query(sql, [project_id, client_id]);
    res.status(201).json({ message: 'Client linked to project' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to link client to project' });
  }
});

// remove a client from a project
router.post("/remove_project_client",async (req,res)=>{
const {project_id,client_id}= req.body;
const quer = "delete from project_client where client_id=? and project_id=? ";
try{
await db.query(quer,[project_id,client_id]);
res.status(201).json({message:'client removed from this project'})
}catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to remove the client' });
  }
})

// add an image to a project
router.post('/image', async (req, res) => {
  const { project_id, image } = req.body;

  const sql = `INSERT INTO project_images (project_id, image) VALUES (?, ?)`;

  try {
    await db.query(sql, [project_id, image]);
    res.status(201).json({ message: 'Image added to project' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// add a demo for a project
router.post('/demo', async (req, res) => {
  const { project_id, demo } = req.body;

  const sql = `INSERT INTO project_demos (project_id, demo) VALUES (?, ?)`;

  try {
    await db.query(sql, [project_id, demo]);
    res.status(201).json({ message: 'Demo added to project' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add demo' });
  }
});

// remove an image from a project
router.post('/remove_image', async (req, res) => {
  const { project_id, image } = req.body;

  const sql = `DELETE FROM project_images WHERE project_id = ? AND image = ?`;

  try {
    await db.query(sql, [project_id, image]);
    res.status(200).json({ message: 'Image removed from project' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to remove image' });
  }
});

// remove a demo from a project
router.post('/remove_demo', async (req, res) => {
  const { project_id, demo } = req.body;

  const sql = `DELETE FROM project_demos WHERE project_id = ? AND demo = ?`;

  try {
    await db.query(sql, [project_id, demo]);
    res.status(200).json({ message: 'Demo removed from project' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to remove demo' });
  }
});

// Get methods
// Get all projects  --> it's to be seen whether i modify it so it concerns only achieved projects 
router.get('/', async (req, res) => {
  const sql = 'SELECT * FROM project';

  try {
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// get a specific project (by id)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM project WHERE project_id = ?';

  try {
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

//get Tools used in a project 
router.get('/:id/tools', async (req, res) => {
  const { id } = req.params;
  const sql = `
    select T.* from tool T join project_tool where project_id=?`;
  try {
    const [rows] = await db.query(sql, [id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch tools for project' });
  }
});

// get clients linked to a project
router.get('/:id/clients', async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT c.* FROM client c
    JOIN project_client pc ON pc.client_id = c.client_id
    WHERE pc.project_id = ?
  `;

  try {
    const [rows] = await db.query(sql, [id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch clients for project' });
  }
});

// get all the clients
router.get('/clients', async (req, res) => {
  const { id } = req.params;
  const sql = `
    select * from client
  `;

  try {
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch clients for project' });
  }
});

// get the images of a project
router.get('/:id/images', async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT image FROM project_images WHERE project_id = ?`;

  try {
    const [rows] = await db.query(sql, [id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch images' });
  }

});

//get the demos of a project
router.get('/:id/demos', async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT demo FROM project_demos WHERE project_id = ?`;

  try {
    const [rows] = await db.query(sql, [id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch demos' });
  }
});








module.exports = router;


