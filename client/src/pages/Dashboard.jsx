import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import Sidebar from '../components/layout/Sidebar';
import MainContent from '../components/layout/MainContent';
import ImageUpload from '../components/ImageUpload';
import EnhancementTechniques from '../components/EnhancementTechniques';
import ImageComparison from '../components/ImageComparison';
import { uploadImage, enhanceImage } from '../lib/api';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [lastToastTime, setLastToastTime] = useState(0);
  const imageComparisonRef = useRef(null);

  const { toast } = useToast();

  useEffect(() => {
    if (enhancedImage) {
      URL.revokeObjectURL(enhancedImage);
      setEnhancedImage(null);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (enhancedImage && imageComparisonRef.current) {
      imageComparisonRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [enhancedImage]);

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data, file) => {
      console.log('Upload success:', data);
      setOriginalFile(file);
      setSelectedImage(data.filename);
      setOriginalImage(`${BASE_URL}${data.path}`);
      setImageInfo({
        originalSize: data.size,
        dimensions: `${data.width} × ${data.height} px`,
        format: data.format,
      });
      toast({ title: 'Image uploaded', description: 'Success!' });
    },
    onError: (error) => {
      console.error('Upload mutation error:', error.message, error.stack);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const enhanceMutation = useMutation({
    mutationFn: enhanceImage,
    onSuccess: (data) => {
      console.log('Enhance success, received blob:', data);
      console.log('Blob type:', data.type, 'Blob size:', data.size);
      if (enhancedImage) {
        URL.revokeObjectURL(enhancedImage);
      }
      const url = URL.createObjectURL(data);
      console.log('Created blob URL for enhanced image:', url);
      setEnhancedImage(url);
      const now = Date.now();
      if (now - lastToastTime > 2000) {
        toast({ title: 'Image enhanced', description: 'Enhancement applied successfully!' });
        setLastToastTime(now);
      }
    },
    onError: (error) => {
      console.error('Enhance error:', error.response?.data || error.message);
      toast({
        title: 'Enhancement failed',
        description: error.response?.data?.error || error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleImageUpload = (file) => {
    console.log('Handling image upload:', file.name, file.size);
    uploadMutation.mutate(file);
  };

  const handleApplyTechnique = (technique, params) => {
    if (!originalFile) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }
    console.log('Applying technique:', technique, params);
    enhanceMutation.mutate({
      file: originalFile,
      technique,
      parameters: params,
    });
  };

  const handleDownload = (parameters) => {
    if (!enhancedImage) {
      console.error('No enhanced image available for download');
      toast({
        title: 'Download failed',
        description: 'Enhanced image is not available.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Downloading enhanced image with parameters:', parameters);

    // Create an image element to load the enhanced image
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // In case the image is from a different origin
    img.src = enhancedImage;

    img.onload = () => {
      // Create a canvas to apply the CSS filters
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Apply CSS filters to the canvas
      const { contrast = 0, brightness = 0, saturation = 0, hue = 0 } = parameters;
      ctx.filter = `
        contrast(${100 + contrast}%)
        brightness(${100 + brightness}%)
        saturate(${100 + saturation}%)
        hue-rotate(${hue}deg)
      `;

      // Draw the image onto the canvas with filters applied
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to a blob and download it
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced_${selectedImage}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95); // Use JPEG with 95% quality
    };

    img.onerror = () => {
      console.error('Failed to load enhanced image for download');
      toast({
        title: 'Download failed',
        description: 'Failed to load enhanced image.',
        variant: 'destructive',
      });
    };
  };

  useEffect(() => {
    return () => {
      if (enhancedImage) URL.revokeObjectURL(enhancedImage);
    };
  }, [enhancedImage]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <Sidebar />
      <MainContent title="Image Enhancement" description="Upload & enhance with powerful techniques">
        <ImageUpload onImageUpload={handleImageUpload} isProcessing={uploadMutation.isLoading} />
        {selectedImage && (
          <>
            <EnhancementTechniques onApplyTechnique={handleApplyTechnique} disabled={enhanceMutation.isLoading} />
            <div ref={imageComparisonRef}>
              <ImageComparison
                originalImage={originalImage}
                enhancedImage={enhancedImage}
                isProcessing={enhanceMutation.isLoading}
                imageInfo={imageInfo}
                onDownload={handleDownload}
              />
            </div>
          </>
        )}
      </MainContent>
    </div>
  );
};

export default Dashboard;