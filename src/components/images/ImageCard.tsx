import React, { useState } from 'react';
import { Trash2, ZoomIn } from 'lucide-react';
import { ref, deleteObject } from 'firebase/storage';
import { doc, deleteDoc } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import type { PlotImage } from '../../lib/database.types';

interface ImageCardProps {
  image: PlotImage;
  onDeleted?: () => void;
}

function getDisplayUrl(image: PlotImage): string {
  // Use download_url stored in Firestore (set during upload)
  if (image.download_url) {
    return image.download_url;
  }
  return image.legacy_url ?? '';
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onDeleted }) => {

  const [isDeleting, setIsDeleting] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const url = getDisplayUrl(image);

  const handleDelete = async () => {
    if (!window.confirm('ลบรูปภาพนี้?')) return;
    setIsDeleting(true);
    
    try {
      // Delete from Firebase Storage
      if (image.storage_path) {
        const storageRef = ref(storage, image.storage_path);
        await deleteObject(storageRef);
      }
      
      // Delete from Firestore
      const imageDoc = doc(db, 'plot_images', image.id);
      await deleteDoc(imageDoc);
      
      onDeleted?.();
    } catch (err) {
      console.error('[ImageCard] Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square">
        {url ? (
          <img src={url} alt={image.description ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">ไม่มีรูป</div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => setLightbox(true)}
            className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white"
          >
            <ZoomIn size={16} />
          </button>
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-white disabled:opacity-60"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {image.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
            {image.description}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img src={url} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </>
  );
};

export default ImageCard;
