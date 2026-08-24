import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { createServer } from 'http';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const uploads = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);

const fmtSize = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`);

export async function registerRoutes(app) {
  const FLASK = process.env.FLASK_SERVICE_URL || 'http://localhost:5001';

  // Technique mapping
  const TECHNIQUE_MAP = {
    histogram_lab: 'histogram_lab',
    gaussian: 'gaussian',
    unsharp: 'unsharp',
    color: 'color',
    advanced_unsharp: 'advanced_unsharp',
    clahe: 'clahe',
    gamma: 'gamma',
    contrast_stretch: 'contrast_stretch',
  };

  // Serve images
  app.get('/api/images/:fn', (req, res) => {
    const fp = path.join(uploads, req.params.fn);
    if (!fs.existsSync(fp)) return res.status(404).json({ message: 'Not found' });
    res.sendFile(fp);
  });

  // Upload
  app.post('/api/images', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image' });
    const ext = path.extname(req.file.originalname);
    const fn = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const fp = path.join(uploads, fn);
    const meta = await import('sharp').then((m) => m.default(req.file.buffer).metadata());
    fs.writeFileSync(fp, req.file.buffer);
    const responseData = {
      filename: fn,
      size: fmtSize(req.file.size),
      width: meta.width,
      height: meta.height,
      format: meta.format,
      path: `/api/images/${fn}`,
    };
    console.log('Upload response sent:', responseData);
    res.json(responseData);
  });

  // Enhance
  app.post('/api/enhance', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const technique = req.body.technique;
      if (!technique) {
        return res.status(400).json({ error: 'No enhancement technique specified' });
      }

      const flaskTechnique = TECHNIQUE_MAP[technique];
      if (!flaskTechnique) {
        return res.status(400).json({ error: `Unknown technique: ${technique}` });
      }

      let parameters = {};
      if (req.body.parameters) {
        try {
          parameters = JSON.parse(req.body.parameters);
          console.log('Enhance parameters:', parameters); // Debug log for parameters
        } catch (error) {
          console.error('Failed to parse parameters:', error);
          return res.status(400).json({ error: 'Invalid parameters format' });
        }
      }

      const formData = new FormData();
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      formData.append('technique', flaskTechnique);
      formData.append('parameters', JSON.stringify(parameters));

      console.log('Sending request to Flask with technique:', flaskTechnique);
      const flaskResponse = await axios.post(`${FLASK}/enhance`, formData, {
        headers: {
          ...formData.getHeaders(),
          Accept: 'application/json',
        },
        responseType: 'arraybuffer',
      });

      res.set('Content-Type', flaskResponse.headers['content-type']);
      res.send(flaskResponse.data);
    } catch (error) {
      if (error.response?.data) {
        const errorText = Buffer.from(error.response.data).toString();
        console.error('Flask service error:', errorText);
        res.status(500).json({ error: errorText });
      } else {
        console.error('Enhancement error:', error.message);
        res.status(500).json({ error: 'Failed to enhance image' });
      }
    }
  });

  return createServer(app);
}