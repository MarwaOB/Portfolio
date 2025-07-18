const express = require('express');
const router = express.Router();
const db = require('../db');

// get all posts
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM post ORDER BY date DESC');
    res.status(200).json(rows);
  } catch (err) {
   
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des posts' });
  }
});

// add a post
router.post('/', async (req, res) => {
  const { title, abstract, head_image, status, content, date } = req.body;
  const sql = `INSERT INTO post (title, abstract, head_image, status, content, date) VALUES (?, ?, ?, ?, ?, ?)`;

  try {
    const [result] = await db.query(sql, [
      title,
      abstract,
      head_image,
      status || false,
      JSON.stringify(content),
      date || new Date().toISOString().slice(0, 19).replace('T', ' '),
    ]);

    const post_id = result.insertId;
    res.status(201).json({ message: 'Post added successfully', post_id });
  } catch (err) {
  
    res.status(500).json({ error: 'Failed to add post' });
  }
});

// UPDATE a post - NEW ENDPOINT
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, abstract, head_image, status, content, date } = req.body;
  
  // Validate required fields
  if (!title || !abstract) {
    return res.status(400).json({ error: 'Title and abstract are required' });
  }
  
  const sql = `UPDATE post SET title = ?, abstract = ?, head_image = ?, status = ?, content = ?, date = ? WHERE post_id = ?`;

  try {
    // Safely stringify content
    let contentToStore = '';
    if (content) {
      if (typeof content === 'object') {
        contentToStore = JSON.stringify(content);
      } else {
        contentToStore = content;
      }
    }

    const [result] = await db.query(sql, [
      title,
      abstract,
      head_image,
      status || false,
      contentToStore,
      date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Post updated successfully' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to update post' });
  }
});

// UPDATE keywords for a post - NEW ENDPOINT
router.post('/update_keywords', async (req, res) => {
  const { post_id, keywords } = req.body;

  try {
    // First, delete all existing keywords for this post
    await db.query('DELETE FROM post_keywords WHERE post_id = ?', [post_id]);
    
    // Then, insert the new keywords
    if (keywords && keywords.length > 0) {
      const values = keywords.map(keyword => [post_id, keyword]);
      const placeholders = keywords.map(() => '(?, ?)').join(', ');
      const sql = `INSERT INTO post_keywords (post_id, keyword) VALUES ${placeholders}`;
      const flatValues = values.flat();
      
      await db.query(sql, flatValues);
    }
    
    res.status(200).json({ message: 'Keywords updated successfully' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to update keywords' });
  }
});

// delete a post
router.post('/delete', async (req, res) => {
  const { post_id } = req.body;

  const sql = `DELETE FROM post WHERE post_id = ?`;

  try {
    await db.query(sql, [post_id]);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// add an image to the post
router.post('/add_image', async (req, res) => {
  const { post_id, image } = req.body;

  const sql = `INSERT INTO post_images (post_id, image) VALUES (?, ?)`;

  try {
    await db.query(sql, [post_id, image]);
    res.status(201).json({ message: 'Image added to post' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to add image to post' });
  }
});

//remove an image from the post
router.post('/remove_image', async (req, res) => {
  const { post_id, image } = req.body;

  const sql = `DELETE FROM post_images WHERE post_id = ? AND image = ?`;

  try {
    await db.query(sql, [post_id, image]);
    res.status(200).json({ message: 'Image removed from post' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to remove image from post' });
  }
});

//add a text
router.post('/add_text', async (req, res) => {
  const { post_id, part } = req.body;

  const sql = `INSERT INTO post_texts (post_id, part) VALUES (?, ?)`;

  try {
    await db.query(sql, [post_id, part]);
    res.status(201).json({ message: 'Text block added to post' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to add text block' });
  }
});

// remove text //nb: this is particular as we return the id for deletion as the part is long
router.post('/remove_text', async (req, res) => {
  const { post_text_id } = req.body;

  const sql = `DELETE FROM post_texts WHERE post_text_id=?`;

  try {
    await db.query(sql, [post_text_id]);
    res.status(200).json({ message: 'Text block removed from post' });
  } catch (err) {
    
    res.status(500).json({ error: 'Failed to remove text block' });
  }
});

// add a keyword to a post
router.post('/add_keyword', async (req, res) => {
  const { post_id, keyword } = req.body;

  const sql = `INSERT INTO post_keywords (post_id, keyword) VALUES (?, ?)`;

  try {
    await db.query(sql, [post_id, keyword]);
    res.status(201).json({ message: 'Keyword added to post' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to add keyword' });
  }
});

// remove a keyword from a post
router.post('/remove_keyword', async (req, res) => {
  const { post_id, keyword } = req.body;

  const sql = `DELETE FROM post_keywords WHERE post_id = ? AND keyword = ?`;

  try {
    await db.query(sql, [post_id, keyword]);
    res.status(200).json({ message: 'Keyword removed from post' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to remove keyword' });
  }
});

// add a message
router.post('/message', async (req, res) => {
  const { content, contact, date } = req.body;

  const sql = `INSERT INTO message (content, contact, date) VALUES (?, ?, ?)`;

  try {
    await db.query(sql, [content, contact, date]);
    res.status(201).json({ message: 'Message received' });
  } catch (err) {
  
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// remove a message
router.post('/message/delete', async (req, res) => {
  const { message_id } = req.body;

  const sql = `DELETE FROM message WHERE message_id = ?`;

  try {
    await db.query(sql, [message_id]);
    res.status(200).json({ message: 'Message deleted' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// get one post by id with keywords
router.get('/:id', async (req, res) => {
  const { id } = req.params;


  try {
    const [postResult] = await db.query('SELECT * FROM post WHERE post_id = ?', [id]);
    
  

    if (postResult.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult[0];
  

    const [keywordsResult] = await db.query('SELECT keyword FROM post_keywords WHERE post_id = ?', [id]);
    const keywords = keywordsResult.map(row => row.keyword);

    // Safely parse content - handle cases where content might be null, undefined, or invalid JSON
    let parsedContent = {};
    if (post.content) {
      try {
        // If content is already an object, use it directly
        if (typeof post.content === 'object') {
          parsedContent = post.content;
        } else {
          // If it's a string, try to parse it
          parsedContent = JSON.parse(post.content);
        }
      } catch (parseError) {
      
        // If parsing fails, use empty object or the raw content
        parsedContent = { blocks: [] };
      }
    }

  

    res.status(200).json({
      ...post,
      keywords,
      content: parsedContent,
    });
  } catch (err) {
 
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

module.exports = router;