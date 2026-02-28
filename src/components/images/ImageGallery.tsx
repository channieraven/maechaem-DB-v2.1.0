import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { PlotImage, ImageType } from '../../lib/database.types';
import ImageCard from './ImageCard';
import ImageUpload from './ImageUpload';
import { Loader2 } from 'lucide-react';

interface ImageGalleryProps {
  plotId: string;
}

const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  plan_pre_1: 'แผนผังก่อนปลูก (แผ่น 1)',
  plan_pre_2: 'แผนผังก่อนปลูก (แผ่น 2)',
  plan_post_1: 'แผนผังหลังปลูก',
  gallery: 'คลังภาพ',
};

const IMAGE_TYPES: ImageType[] = ['plan_pre_1', 'plan_pre_2', 'plan_post_1', 'gallery'];

const ImageGallery: React.FC<ImageGalleryProps> = ({ plotId }) => {
  const [images, setImages] = useState<PlotImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<ImageType>('gallery');

  const fetchImages = async () => {
    setIsLoading(true);
    
    try {
      const imagesRef = collection(db, 'plot_images');
      const q = query(
        imagesRef,
        where('plot_id', '==', plotId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PlotImage[];
      
      setImages(data);
    } catch (err) {
      console.error('[ImageGallery] Error fetching images:', err);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, [plotId]);

  const filtered = images.filter((img) => img.image_type === activeType);

  return (
    <div>
      {/* Tab strip */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {IMAGE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeType === type
                ? 'bg-[#2d5a27] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {IMAGE_TYPE_LABELS[type]}
            {images.filter((i) => i.image_type === type).length > 0 && (
              <span className="ml-1.5 opacity-70">
                ({images.filter((i) => i.image_type === type).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Upload button */}
      {canWrite && (
        <div className="mb-4">
          <ImageUpload
            plotId={plotId}
            imageType={activeType}
            galleryCategory={activeType === 'gallery' ? 'tree' : undefined}
            onUploaded={fetchImages}
          />
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#2d5a27]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-xl">
          ยังไม่มีรูปภาพในหมวดหมู่นี้
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((img) => (
            <ImageCard key={img.id} image={img} onDeleted={fetchImages} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
