const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const { formatDateForMySQL, getFullImageUrl, deleteImageFile } = require('./utils');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 5000;

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio',
});

// Image storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database!');
});

app.get('/', (req, res) => {
    res.send('Server is running!');
});

// 🟢 Add Project
app.post('/api/add_project', upload.array('project_images'), (req, res) => {
    try {
        const {
            title,
            description,
            toolsFront,
            toolsBack,
            toolsBd,
            demo_link,
            github_link,
            completed,
            startDate,
            Period
        } = req.body;

        const completedBool = completed === 'true';
        const formattedStartDate = formatDateForMySQL(startDate);

        const projectSql = `
            INSERT INTO project
            (title, description, toolsFront, toolsBack, toolsBd, demo_link, github_link, completed, startDate, Period)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const projectValues = [
            title,
            description,
            toolsFront || '',
            toolsBack || '',
            toolsBd || '',
            demo_link || '',
            github_link || '',
            completedBool,
            formattedStartDate,
            Period
        ];

        db.query(projectSql, projectValues, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            const projectId = result.insertId;
            if (req.files && req.files.length > 0) {
                const imageSql = 'INSERT INTO image (image_url, projectId) VALUES ?';
                const imageValues = req.files.map(file => [
                    `/uploads/${file.filename}`,
                    projectId
                ]);
                db.query(imageSql, [imageValues], (imgErr) => {
                    if (imgErr) {
                        console.error('Error inserting images:', imgErr);
                        return res.status(200).json({
                            message: 'Project added, but image upload failed',
                            projectId,
                            warning: 'Image upload incomplete'
                        });
                    }
                    return res.status(200).json({
                        message: 'Project and images added successfully',
                        projectId,
                        imagesCount: req.files.length
                    });
                });
            } else {
                res.status(200).json({
                    message: 'Project added successfully',
                    projectId,
                    imagesCount: 0
                });
            }
        });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ error: 'Failed to add project' });
    }
});

// 🟡 Get project by ID
app.get('/api/project/:id', (req, res) => {
    const projectId = req.params.id;
    const sql = `
        SELECT p.*, GROUP_CONCAT(i.image_url) AS image_urls
        FROM project p
        LEFT JOIN image i ON p.id = i.projectId
        WHERE p.id = ?
        GROUP BY p.id
    `;
    db.query(sql, [projectId], (err, result) => {
        if (err) {
            console.error('Error fetching project:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const project = result[0];
        project.images = project.image_urls
            ? project.image_urls.split(',').map(getFullImageUrl)
            : [];
        delete project.image_urls;
        // No JSON parsing for tools fields, just return as text
        res.json(project);
    });
});

// 🔵 Get all projects
app.get('/api/projects', (req, res) => {
    const sql = `
        SELECT p.*, MIN(i.image_url) as thumbnail
        FROM project p
        LEFT JOIN image i ON p.id = i.projectId
        GROUP BY p.id
        ORDER BY p.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching projects:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        results.forEach(project => {
            if (project.thumbnail) {
                project.thumbnail = getFullImageUrl(project.thumbnail, port);
            }
            // No JSON parsing for tools fields, just return as text
        });
        res.json(results);
    });
});

// 🔴 Delete project by ID - FIXED VERSION
app.post('/api/delete_project', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Project id is required' });
    }

    // Get images that will be completely deleted (only associated with this project)
    const getOrphanImagesSql = 'SELECT image_url FROM image WHERE projectId = ? AND blogId IS NULL';
    
    db.query(getOrphanImagesSql, [id], (err, orphanImages) => {
        if (err) {
            console.error('Error fetching orphan images:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Update images that are shared with blogs (remove project association only)
        const updateSharedImagesSql = 'UPDATE image SET projectId = NULL WHERE projectId = ? AND blogId IS NOT NULL';
        
        db.query(updateSharedImagesSql, [id], (err, updateResult) => {
            if (err) {
                console.error('Error updating shared images:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Delete images that are only associated with this project
            const deleteOrphanImagesSql = 'DELETE FROM image WHERE projectId = ? AND blogId IS NULL';
            
            db.query(deleteOrphanImagesSql, [id], (err, deleteResult) => {
                if (err) {
                    console.error('Error deleting orphan images:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                // Delete physical files for orphan images
                orphanImages.forEach(img => {
                    deleteImageFile(img.image_url);
                });

                // Finally, delete the project
                const deleteProjectSql = 'DELETE FROM project WHERE id = ?';
                db.query(deleteProjectSql, [id], (err, result) => {
                    if (err) {
                        console.error('Error deleting project:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Project not found' });
                    }

                    res.json({ 
                        message: 'Project deleted successfully',
                        deletedImages: orphanImages.length,
                        updatedImages: updateResult.affectedRows
                    });
                });
            });
        });
    });
});

app.put('/api/update_project/:id', upload.array('project_images'), (req, res) => {
    const projectId = req.params.id;

    try {
        const {
            title,
            description,
            toolsFront,
            toolsBack,
            toolsBd,
            demo_link,
            github_link,
            completed,
            startDate,
            Period,
            deleted_images
        } = req.body;

        const completedBool = completed === 'true' || completed === true;
        const formattedStartDate = formatDateForMySQL(startDate);

        let deletedImageUrls = [];
        if (deleted_images) {
            try {
                // Parse the deleted images array
                const parsedDeletedImages = JSON.parse(deleted_images);
                deletedImageUrls = parsedDeletedImages.map(url => {
                    // Clean the URL to match database format
                    if (url.startsWith('http')) {
                        // Extract just the path part (e.g., "/uploads/filename.jpg")
                        const urlObj = new URL(url);
                        return urlObj.pathname;
                    }
                    // If it's already a relative path, ensure it starts with /
                    return url.startsWith('/') ? url : '/' + url;
                });
                console.log('Parsed deleted image URLs:', deletedImageUrls);
            } catch (e) {
                console.warn('Invalid deleted_images format:', deleted_images);
            }
        }

        const updateSql = `
            UPDATE project 
            SET title = ?, description = ?, toolsFront = ?, toolsBack = ?, toolsBd = ?, 
                demo_link = ?, github_link = ?, completed = ?, startDate = ?, Period = ?
            WHERE id = ?
        `;

        const updateValues = [
            title,
            description,
            toolsFront || '',
            toolsBack || '',
            toolsBd || '',
            demo_link || '',
            github_link || '',
            completedBool,
            formattedStartDate,
            Period,
            projectId
        ];

        db.query(updateSql, updateValues, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const handleDeletedImages = () => {
                if (deletedImageUrls.length === 0) return Promise.resolve({ deleted: 0, updated: 0 });

                return new Promise((resolve, reject) => {
                    console.log('Looking for images to delete:', deletedImageUrls);
                    
                    // Use LIKE or exact match for better matching
                    const placeholders = deletedImageUrls.map(() => '?').join(',');
                    const getImagesSql = `
                        SELECT id, image_url, blogId 
                        FROM image 
                        WHERE projectId = ? AND image_url IN (${placeholders})
                    `;
                    
                    db.query(getImagesSql, [projectId, ...deletedImageUrls], (err, imageRecords) => {
                        if (err) {
                            console.error('Error fetching images for deletion:', err);
                            return reject(err);
                        }

                        console.log('Found images to process:', imageRecords);

                        if (imageRecords.length === 0) {
                            console.log('No images found to delete');
                            return resolve({ deleted: 0, updated: 0 });
                        }

                        const imagesToDelete = imageRecords.filter(img => img.blogId === null);
                        const imagesToUpdate = imageRecords.filter(img => img.blogId !== null);

                        console.log('Images to delete completely:', imagesToDelete);
                        console.log('Images to update (remove project association):', imagesToUpdate);

                        const deletePromises = [];

                        // Delete images that are only associated with this project
                        if (imagesToDelete.length > 0) {
                            const deleteImageUrls = imagesToDelete.map(img => img.image_url);
                            const deletePlaceholders = deleteImageUrls.map(() => '?').join(',');
                            const deleteSql = `
                                DELETE FROM image 
                                WHERE projectId = ? AND image_url IN (${deletePlaceholders}) AND blogId IS NULL
                            `;
                            
                            deletePromises.push(new Promise((resolve, reject) => {
                                db.query(deleteSql, [projectId, ...deleteImageUrls], (err, deleteResult) => {
                                    if (err) {
                                        console.error('Error deleting images from DB:', err);
                                        return reject(err);
                                    }
                                    console.log('Deleted from DB:', deleteResult.affectedRows, 'images');
                                    
                                    // Delete physical files
                                    imagesToDelete.forEach(img => {
                                        deleteImageFile(img.image_url);
                                    });
                                    
                                    resolve({ deleted: deleteResult.affectedRows });
                                });
                            }));
                        }

                        // Update images that are shared with blogs (remove project association only)
                        if (imagesToUpdate.length > 0) {
                            const updateImageUrls = imagesToUpdate.map(img => img.image_url);
                            const updatePlaceholders = updateImageUrls.map(() => '?').join(',');
                            const updateSql = `
                                UPDATE image 
                                SET projectId = NULL 
                                WHERE projectId = ? AND image_url IN (${updatePlaceholders}) AND blogId IS NOT NULL
                            `;
                            
                            deletePromises.push(new Promise((resolve, reject) => {
                                db.query(updateSql, [projectId, ...updateImageUrls], (err, updateResult) => {
                                    if (err) {
                                        console.error('Error updating shared images:', err);
                                        return reject(err);
                                    }
                                    console.log('Updated shared images:', updateResult.affectedRows);
                                    resolve({ updated: updateResult.affectedRows });
                                });
                            }));
                        }

                        if (deletePromises.length === 0) {
                            return resolve({ deleted: 0, updated: 0 });
                        }

                        Promise.all(deletePromises)
                            .then(results => {
                                const summary = results.reduce((acc, curr) => ({
                                    deleted: (acc.deleted || 0) + (curr.deleted || 0),
                                    updated: (acc.updated || 0) + (curr.updated || 0)
                                }), { deleted: 0, updated: 0 });
                                console.log('Image deletion summary:', summary);
                                resolve(summary);
                            })
                            .catch(reject);
                    });
                });
            };

            const handleNewImages = () => {
                if (!req.files || req.files.length === 0) return Promise.resolve(0);

                return new Promise((resolve, reject) => {
                    const insertSql = 'INSERT INTO image (image_url, projectId) VALUES ?';
                    const values = req.files.map(file => [`/uploads/${file.filename}`, projectId]);
                    db.query(insertSql, [values], (err) => {
                        if (err) {
                            console.error('Error inserting new images:', err);
                            return reject(err);
                        }
                        console.log('Added new images:', req.files.length);
                        resolve(req.files.length);
                    });
                });
            };

            Promise.all([handleDeletedImages(), handleNewImages()])
                .then(([deletionSummary, newImagesCount]) => {
                    res.status(200).json({
                        message: 'Project updated successfully',
                        projectId,
                        imagesAdded: newImagesCount,
                        imagesDeleted: deletionSummary.deleted || 0,
                        imagesUpdated: deletionSummary.updated || 0
                    });
                })
                .catch((error) => {
                    console.error('Error handling images:', error);
                    res.status(200).json({
                        message: 'Project updated, but there were issues with image operations',
                        projectId,
                        warning: 'Some image operations failed',
                        error: error.message
                    });
                });
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});