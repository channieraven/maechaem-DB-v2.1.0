import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { PlotImage, ImageType } from '../../lib/database.types';
import ImageCard from './ImageCard';
import ImageUpload from './ImageUpload';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
  const { canWrite } = useAuth();
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
      <div className="flex border-b border-gray-200 bg-white px-2 rounded-t-xl mb-4 overflow-x-auto">
        {IMAGE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeType === type
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-green-600'
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
        <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-gray-100">
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
