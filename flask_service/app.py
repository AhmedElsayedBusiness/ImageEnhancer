from flask import Flask, request, send_file, Response
from flask_cors import CORS
from PIL import Image
import numpy as np
import cv2
import io
import json
import logging
from skimage.filters import unsharp_mask

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

def power_law_transform_color(image, gamma):
    """Apply Power-Law (Gamma) Transformation to the image with color preservation."""
    normalized = image / 255.0
    corrected = np.power(normalized, gamma)
    return np.uint8(np.clip(corrected * 255, 0, 255))

def linear_contrast_stretch(image, low_percent=2, high_percent=98):
    """Apply Linear Contrast Stretching to each channel of the image."""
    for i in range(3):
        c = image[:, :, i]
        low, high = np.percentile(c, (low_percent, high_percent))
        if high > low:
            image[:, :, i] = np.clip((c - low) * 255.0 / (high - low), 0, 255)
    return image.astype(np.uint8)

def apply_clahe(image_np, clip_limit, tile_grid_size):
    """Apply CLAHE to the L channel in LAB color space."""
    bgr_img = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    lab = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid_size, tile_grid_size))
    l_clahe = clahe.apply(l)
    merged = cv2.merge((l_clahe, a, b))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)

@app.route('/enhance', methods=['POST'])
def enhance_image():
    try:
        if 'image' not in request.files:
            return Response('No image file provided', status=400)

        file = request.files['image']
        technique = request.form.get('technique')
        parameters = request.form.get('parameters')

        if not technique or not parameters:
            return Response('Missing technique or parameters', status=400)

        parameters = json.loads(parameters)
        logging.info(f"Received enhancement request: technique={technique}, parameters={parameters}")

        img = Image.open(file.stream).convert('RGB')
        img_np = np.array(img)

        if technique == 'histogram_lab':
            intensity = min(max(parameters.get('intensity', 0), 0), 100) / 100.0  # Normalize to [0, 1]
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            lab_img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab_img)
            equ = cv2.equalizeHist(l)
            # Blend original and equalized L channel based on intensity
            l_blended = cv2.addWeighted(l, 1 - intensity, equ, intensity, 0)
            updated_lab = cv2.merge((l_blended, a, b))
            img_np = cv2.cvtColor(updated_lab, cv2.COLOR_LAB2RGB)

        elif technique == 'gaussian':
            sigma = max(parameters.get('sigma', 1), 0.1)  # Ensure positive sigma
            img_np = cv2.GaussianBlur(img_np, (5, 5), sigma)  # Explicit kernel size

        elif technique == 'unsharp':
            amount = max(parameters.get('amount', 1), 0)
            radius = max(parameters.get('radius', 1), 0.1)
            threshold = max(parameters.get('threshold', 0), 0)
            blurred = cv2.GaussianBlur(img_np, (0, 0), radius)
            diff = cv2.convertScaleAbs(np.absolute(img_np - blurred))
            diff = cv2.threshold(diff, threshold, 255, cv2.THRESH_BINARY)[1]
            img_np = cv2.addWeighted(img_np, 1 + amount, blurred, -amount, 0)
            img_np = cv2.addWeighted(img_np, 1, diff, 0, 0)

        elif technique == 'color':
            red = max(min(parameters.get('red', 0), 100), -100)
            green = max(min(parameters.get('green', 0), 100), -100)
            blue = max(min(parameters.get('blue', 0), 100), -100)
            img_np = img_np.astype(np.float32)
            img_np[:, :, 0] = np.clip(img_np[:, :, 0] + red, 0, 255)
            img_np[:, :, 1] = np.clip(img_np[:, :, 1] + green, 0, 255)
            img_np[:, :, 2] = np.clip(img_np[:, :, 2] + blue, 0, 255)
            img_np = img_np.astype(np.uint8)

        elif technique == 'advanced_unsharp':
            radius = max(parameters.get('radius', 5), 1)
            amount = max(parameters.get('amount', 1.0), 0.1)
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            lab_img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab_img)
            l_unsharp = unsharp_mask(l / 255.0, radius=radius, amount=amount)
            l_unsharp = np.clip(l_unsharp * 255, 0, 255).astype(np.uint8)
            updated_lab = cv2.merge((l_unsharp, a, b))
            img_np = cv2.cvtColor(updated_lab, cv2.COLOR_LAB2RGB)

        elif technique == 'clahe':
            clip_limit = max(min(parameters.get('clip_limit', 3.0), 10.0), 1.0)
            tile_grid_size = max(min(parameters.get('tile_grid_size', 8), 16), 4)
            img_np = apply_clahe(img_np, clip_limit, tile_grid_size)

        elif technique == 'gamma':
            gamma = max(min(parameters.get('gamma', 0.5), 3.0), 0.1)
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            lab_img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab_img)
            l_gamma = power_law_transform_color(l, gamma)
            updated_lab = cv2.merge((l_gamma, a, b))
            img_np = cv2.cvtColor(updated_lab, cv2.COLOR_LAB2RGB)

        elif technique == 'contrast_stretch':
            low_percent = max(min(parameters.get('low_percent', 2), 10), 0)
            high_percent = max(min(parameters.get('high_percent', 98), 100), 90)
            img_np = linear_contrast_stretch(img_np, low_percent=low_percent, high_percent=high_percent)

        else:
            return Response('Invalid technique', status=400)

        enhanced_img = Image.fromarray(img_np)
        output = io.BytesIO()
        enhanced_img.save(output, format='JPEG', quality=95)
        output.seek(0)

        logging.info("Enhancement successful, returning image")
        return send_file(output, mimetype='image/jpeg')

    except Exception as e:
        logging.error(f"Enhance error: {str(e)}")
        return Response(f"Enhance error: {str(e)}", status=500)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)