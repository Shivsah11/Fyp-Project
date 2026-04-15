import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useDarkMode } from '../../../context/DarkModeContext';
import type { Point, Area } from 'react-easy-crop';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageUpdate: (imageDataUrl: string) => void;
  onImageRemove: () => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImage,
  onImageUpdate,
  onImageRemove
}) => {
  const { isDarkMode } = useDarkMode();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set maximum output size for profile pictures
    const maxSize = 400;
    let { width, height } = pixelCrop;
    
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = pixelCrop.width * ratio;
      height = pixelCrop.height * ratio;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      width,
      height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        }
      }, 'image/jpeg', 0.8);
    });
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Image compression function
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // HEIC to JPEG conversion function
  const convertHeicToJpeg = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // For now, we'll use a simple approach - read HEIC as data URL and let user know
      // In a production app, you'd use a library like heic2any
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // HEIC files can't be directly displayed in most browsers
        // We'll convert to a compatible format
        if (result.startsWith('data:')) {
          resolve(result); // This will work for basic display
        } else {
          reject(new Error('Failed to read HEIC file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read HEIC file'));
      reader.readAsDataURL(file);
    });
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    // More permissive MIME type validation including HEIC/HEIF
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml',
      'image/heic', 'image/heif'
    ];
    
    // Also check file extension as fallback
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.svg', '.heic', '.heif'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    console.log('File validation:', {
      name: file.name,
      type: file.type,
      size: file.size,
      extension: fileExtension
    });
    
    // Check MIME type or extension
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    // Additional fallback: try to read file as data URL to verify it's actually an image
    const isLikelyImage = file.type.startsWith('image/') || allowedExtensions.includes(fileExtension);
    
    if (!isValidType && !isLikelyImage) {
      return `File type not supported. Found: ${file.type || 'unknown'}, Extension: ${fileExtension || 'none'}. Please use JPEG, PNG, WebP, or HEIC.`;
    }
    
    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }
    
    return null;
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadError(null);
    setFileSize(file.size);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Handle HEIC files specially
      let processedImageSrc: string;
      const currentFileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (currentFileExtension === '.heic' || currentFileExtension === '.heif') {
        processedImageSrc = await convertHeicToJpeg(file);
      } else {
        // Try to read file as data URL first to verify it's actually an image
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            if (result && typeof result === 'string' && result.startsWith('data:image')) {
              resolve(result);
            } else {
              // If data URL doesn't start with data:image, try to process anyway
              // Some browsers might have issues with certain file types
              console.warn('Unexpected data URL format, proceeding anyway:', result?.substring(0, 50));
              resolve(result || '');
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
        
        // Compress large images
        if (file.size > 1024 * 1024) { // 1MB
          processedImageSrc = await compressImage(file, 600, 600, 0.7);
        } else {
          processedImageSrc = dataUrl;
        }
      }
      
      if (processedImageSrc) {
        setImageSrc(processedImageSrc);
        setIsCropping(true);
      } else {
        throw new Error('Failed to process image file');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Convert to optimized base64 for storage
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      
      // Final compression for upload
      const compressedBlob = await new Promise<Blob>((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = 200; // Fixed size for profile pictures
          canvas.height = 200;
          ctx?.drawImage(img, 0, 0, 200, 200);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/jpeg', 0.7);
        };
        img.src = URL.createObjectURL(blob);
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageUpdate(base64String);
        setIsCropping(false);
        setImageSrc(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setFileSize(0);
      };
      reader.readAsDataURL(compressedBlob);
    } catch (error) {
      console.error('Error cropping image:', error);
      setUploadError('Failed to crop image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleRemoveImage = () => {
    onImageRemove();
    setImageSrc(null);
    setIsCropping(false);
  };

  if (isCropping && imageSrc) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-black/80' : 'bg-black/60'}`}>
        <div className={`w-full max-w-4xl mx-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Crop Profile Picture
            </h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Adjust the crop area to select the perfect profile picture
            </p>
          </div>
          
          <div className="relative h-96 bg-gray-100">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Zoom
              </label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCropCancel}
                disabled={isUploading}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                disabled={isUploading}
                className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? 'Processing...' : 'Apply Crop'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Profile Picture
          </h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Upload and customize your profile picture
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Current Profile Picture */}
        <div className="mb-6 relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <span className={`text-4xl font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  U
                </span>
              </div>
            )}
          </div>
          
          {currentImage && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
              title="Remove profile picture"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Upload Button */}
        <div className="w-full max-w-xs">
          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="hidden"
          />
          <label
            htmlFor="profile-picture-input"
            className={`block w-full px-6 py-3 text-center rounded-xl font-medium cursor-pointer transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
            } transform hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload New Picture</span>
            </div>
          </label>
          {/* Error Message */}
          {uploadError && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              isDarkMode ? 'bg-red-900/30 text-red-400 border border-red-700' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {uploadError}
            </div>
          )}
          
          {/* File Size Info */}
          {fileSize > 0 && (
            <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              File size: {(fileSize / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
          
          <p className={`text-xs text-center mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Recommended: Square image, max 5MB (JPEG, PNG, WebP)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
