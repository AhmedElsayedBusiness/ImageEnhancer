# 🖼️ ImageEnhancer

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Flask](https://img.shields.io/badge/Flask-Python_3.11-000000?logo=flask)](https://flask.palletsprojects.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.x-5C3EE8?logo=opencv)](https://opencv.org/)

A full-stack web application for enhancing images using classic computer vision techniques. Upload an image, pick an enhancement technique, fine-tune its parameters with live sliders, and compare the result side-by-side with the original before downloading.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Enhancement Techniques](#enhancement-techniques)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Architecture

The project is split into **three services**:

```
┌──────────────┐      ┌──────────────────┐      ┌─────────────────┐
│    Client    │─────▶│   Node.js API    │─────▶│  Flask Service  │
│ React (3000) │      │  Express (5000)  │     │ OpenCV  (5001)  │
└──────────────┘      └──────────────────┘      └─────────────────┘
```

- **`client/`** – React SPA (Create React App) for uploading images, selecting techniques, adjusting parameters, and comparing before/after results.
- **`server/`** – Node.js/Express REST API that handles uploads, stores files on disk, extracts metadata (via `sharp`), and forwards enhancement requests to the Python service.
- **`flask_service/`** – Flask microservice that performs the actual image processing with OpenCV, NumPy, Pillow, and scikit-image.

## Features

- 📤 **Image upload** with drag & drop support (max 10 MB)
- 🎛️ **8 enhancement techniques**, each with adjustable parameters via sliders
- 🔀 **Before/After comparison slider** for visual inspection
- ⚡ Real-time CSS filter preview (brightness / contrast / saturation / hue) before download
- 💾 **Download** the enhanced image as high-quality JPEG (95%)
- 🌙 Modern dark UI with animated gradients and particles (Tailwind CSS + Framer Motion)

## Enhancement Techniques

| Technique | Description | Parameters |
|---|---|---|
| Histogram Equalization (LAB) | Equalizes the lightness channel in LAB color space | `intensity` (0–100) |
| Gaussian Filter | Smooths the image to reduce noise | `sigma` (0.1–5) |
| Unsharp Masking | Sharpens by amplifying high-frequency details | `amount`, `radius`, `threshold` |
| Color Balance | Adjusts R/G/B channels individually | `red`, `green`, `blue` (-100–100) |
| Advanced Unsharp Masking | skimage-based unsharp mask on the LAB L-channel | `radius`, `amount` |
| CLAHE | Contrast Limited Adaptive Histogram Equalization | `clip_limit`, `tile_grid_size` |
| Gamma Correction | Power-law brightness/contrast transformation | `gamma` (0.1–3) |
| Contrast Stretching | Percentile-based linear contrast stretch | `low_percent`, `high_percent` |

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Wouter, TanStack Query, Tailwind CSS, Radix UI, Framer Motion, Lucide icons |
| Backend | Node.js, Express, Multer, Sharp, Axios, CORS |
| Processing | Python, Flask, OpenCV, NumPy, Pillow, scikit-image |

## Project Structure

```
ImageEnhancer/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, MainContent
│   │   │   ├── ui/             # Reusable UI primitives (shadcn-style)
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── EnhancementTechniques.jsx
│   │   │   ├── ImageComparison.jsx
│   │   │   └── BeforeAfterSlider.js
│   │   ├── pages/              # Dashboard, HistoryPage, NotFound
│   │   ├── services/api.js     # HTTP helpers
│   │   ├── lib/                # queryClient, api, utils
│   │   └── hooks/              # use-toast, use-mobile
│   └── package.json
├── server/                     # Node.js Express API
│   ├── index.js                # App bootstrap (port 5000)
│   ├── routes.js               # /api/images, /api/enhance
│   ├── imageService.js         # Helper client for the Flask service
│   └── uploads/                # Stored images
├── flask_service/              # Python image processing service
│   ├── app.py                  # /enhance endpoint (port 5001)
│   └── requirements.txt
├── uploads/                    # Legacy upload folder
└── README.md
```

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Python** >= 3.8 (3.10+ recommended)
- **pip** (Python package manager)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd ImageEnhancer
```

### 2. Install dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd server
npm install
```

**Flask Service:**
```bash
cd flask_service
pip install -r requirements.txt
```

> **Note:** If `skimage` is missing, install it separately:
> ```bash
> pip install scikit-image
> ```

### 3. Start all services

**Terminal 1 — Flask service (port 5001):**
```bash
cd flask_service
python app.py
```

**Terminal 2 — Node.js API (port 5000):**
```bash
cd server
npm run dev
```

**Terminal 3 — React client (port 3000):**
```bash
cd client
npm start
```

Then open **http://localhost:3000**.

## Configuration

All ports fall back to sensible defaults; you can override them with environment variables:

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `REACT_APP_BACKEND_URL` | client | `http://localhost:5000` | URL of the Node API |
| `FLASK_SERVICE_URL` | server | `http://localhost:5001` | URL of the Flask processing service |

### Client Environment

Create a `.env` file in the `client/` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Server Environment

Create a `.env` file in the `server/` directory (optional):

```env
FLASK_SERVICE_URL=http://localhost:5001
PORT=5000
```

## API Reference

Base URL: `http://localhost:5000`

### `POST /api/images`

Uploads an image and returns its metadata.

**Body:** `multipart/form-data` with field `image` (file, max 10 MB)

**Response:**
```json
{
  "filename": "1746386232305-ab12cd.jpg",
  "size": "1.2 MB",
  "width": 1920,
  "height": 1080,
  "format": "jpeg",
  "path": "/api/images/1746386232305-ab12cd.jpg"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/images \
  -F "image=@/path/to/photo.jpg"
```

### `POST /api/enhance`

Applies an enhancement technique. Proxies the request to the Flask service and returns the processed image binary.

**Body:** `multipart/form-data`
- `image` – file
- `technique` – one of: `histogram_lab`, `gaussian`, `unsharp`, `color`, `advanced_unsharp`, `clahe`, `gamma`, `contrast_stretch`
- `parameters` – JSON string of technique options, e.g. `{"sigma": 1.5}`

**Response:** enhanced image (`image/jpeg`)

**Example:**
```bash
curl -X POST http://localhost:5000/api/enhance \
  -F "image=@/path/to/photo.jpg" \
  -F "technique=histogram_lab" \
  -F 'parameters={"intensity": 80}'
```

### `GET /api/images/:filename`

Serves a previously uploaded image from disk.

**Example:**
```bash
curl http://localhost:5000/api/images/1746386232305-ab12cd.jpg
```

## Usage Flow

1. Open the dashboard and **upload an image**.
2. Pick an **enhancement technique** card and adjust its sliders.
3. Click **Apply Technique** — the enhanced result appears next to the original.
4. Optionally tweak preview filters (brightness/contrast/saturation/hue).
5. Hit **Download** to save the enhanced JPEG.

## Troubleshooting

**Port already in use:**
- Make sure no other application is using ports 3000, 5000, or 5001.
- On Windows: `netstat -ano | findstr :5000`

**Flask service not starting:**
- Ensure Python dependencies are installed: `pip install -r requirements.txt`
- Check that port 5001 is available.

**Client not compiling:**
- Delete `node_modules` and `package-lock.json`, then run `npm install` again.
- Ensure Node.js version is >= 18.

**Enhancement fails with 500 error:**
- Check the Flask service logs for detailed error messages.
- Verify the image format is supported (JPEG, PNG).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
