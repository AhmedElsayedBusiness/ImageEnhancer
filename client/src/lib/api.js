const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    console.log('Uploading image to:', `${BASE_URL}/api/images`);
    const response = await fetch(`${BASE_URL}/api/images`, {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image: ${errorText}`);
    }

    const data = await response.json();
    console.log('Upload response data:', data);
    return data;
  } catch (error) {
    console.error('UploadImage error:', error);
    throw error; // Re-throw to let react-query handle the error
  }
};

export const enhanceImage = async ({ file, technique, parameters }) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('technique', technique);
  if (parameters) {
    formData.append('parameters', JSON.stringify(parameters));
  }
  const response = await fetch(`${BASE_URL}/api/enhance`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Enhancement failed: ${errorText}`);
  }
  return response.blob();
};