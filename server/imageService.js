const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const FLASK_SERVICE_URL = 'http://localhost:5001';

class ImageService {
  /**
   * Enhance an image using one of the available techniques
   * @param {string} imagePath - Path to the original image
   * @param {string} technique - Enhancement technique to apply
   * @param {Object} parameters - Additional parameters for enhancement
   * @returns {Promise<Buffer>} - Enhanced image data
   */
  async enhanceImage(imagePath, technique, parameters = {}) {
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));
      formData.append('technique', technique);
      
      if (parameters) {
        formData.append('parameters', JSON.stringify(parameters));
      }

      const response = await axios.post(`${FLASK_SERVICE_URL}/enhance`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer',
      });

      return response.data;
    } catch (error) {
      console.error('Error enhancing image:', error);
      throw new Error('Failed to enhance image');
    }
  }

  /**
   * Get image dimensions
   * @param {string} imagePath - Path to the image
   * @returns {Promise<{width: number, height: number}>} - Image dimensions
   */
  async getImageDimensions(imagePath) {
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));

      const response = await axios.post(`${FLASK_SERVICE_URL}/dimensions`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      throw new Error('Failed to get image dimensions');
    }
  }
}

module.exports = new ImageService();
