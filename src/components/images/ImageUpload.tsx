import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import type { ImageType, GalleryCategory } from '../../lib/database.types';
import { useAuth } from '../../hooks/useAuth';

interface ImageUploadProps {
  plotId: string;
  imageType: ImageType;
  galleryCategory?: GalleryCategory;
  onUploaded?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  plotId,
  imageType,
  galleryCategory,
  onUploaded,
}) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    setIsUploading(true);

    try {
      // Upload to Firebase Storage
      const path = `plot-images/${plotId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, path);
      
      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save metadata to Firestore
      const imagesRef = collection(db, 'plot_images');
      await addDoc(imagesRef, {
        plot_id: plotId,
        image_type: imageType,
        gallery_category: galleryCategory ?? null,
        storage_path: path,
        download_url: downloadURL, // Store download URL for easy access
        description: null,
        uploaded_by: user?.uid ?? null,
        upload_date: new Date().toISOString().split('T')[0],
        created_at: Timestamp.now(),
      });

      setIsUploading(false);
      onUploaded?.();
    } catch (err: any) {
      console.error('[ImageUpload] Error:', err);
      setError(err.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white text-sm font-medium rounded-lg hover:bg-[#234820] transition-colors disabled:opacity-60"
      >
        {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default ImageUpload;
