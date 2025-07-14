
const express = require('express');
const router = express.Router();
const db = require('../db');

// add a post
router.post('/', async (req, res) => {
  const { title, abstract, head_image, status,content,date} = req.body;

  const sql = `INSERT INTO post (title, abstract, head_image, status) VALUES (?, ?, ?, ?)`;

  try {
    await db.query(sql, [title, abstract, head_image, status || false,content,date]);
    res.status(201).json({ message: 'Post added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add post' });
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
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// add an  image to the post
router.post('/add_image', async (req, res) => {
  const { post_id, image } = req.body;

  const sql = `INSERT INTO post_images (post_id, image) VALUES (?, ?)`;

  try {
    await db.query(sql, [post_id, image]);
    res.status(201).json({ message: 'Image added to post' });
  } catch (err) {
    console.error(err.message);
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
    console.error(err.message);
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
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add text block' });
  }
});

// remove text  //nb: this is particular as we return the id for deletion as the part is long
router.post('/remove_text', async (req, res) => {
  const { post_text_id } = req.body;

  const sql = `DELETE FROM post_texts WHERE post_text_id=?`;

  try {
    await db.query(sql, [post_text_id]);
    res.status(200).json({ message: 'Text block removed from post' });
  } catch (err) {
    console.error(err.message);
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
    console.error(err.message);
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
    console.error(err.message);
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
    console.error(err.message);
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
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});


  
module.exports = router;




