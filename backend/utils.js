const path = require('path');
const fs = require('fs');

// Helper function to format date for MySQL
const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return null;
        }
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return null;
    }
};

const getFullImageUrl = (imagePath, port = 5000) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `http://localhost:${port}/${cleanPath}`;
};

const deleteImageFile = (imageUrl) => {
    if (!imageUrl) return;
    try {
        const filename = imageUrl.replace('/uploads/', '');
        const filePath = path.join(__dirname, 'public/uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Deleted image file: ${filename}`);
        } else {
            console.warn(`⚠️ Image file not found: ${filename}`);
        }
    } catch (error) {
        console.error(`❌ Error deleting image file: ${imageUrl}`, error);
    }
};

module.exports = {
    formatDateForMySQL,
    getFullImageUrl,
    deleteImageFile
};
