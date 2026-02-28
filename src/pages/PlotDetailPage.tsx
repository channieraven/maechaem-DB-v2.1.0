import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Plot } from '../lib/database.types';
import AppShell from '../components/layout/AppShell';
import TreeTable from '../components/trees/TreeTable';
import TreeMap from '../components/trees/TreeMap';
import ImageGallery from '../components/images/ImageGallery';
import { useTrees } from '../hooks/useTrees';
import { useGrowthLogs } from '../hooks/useGrowthLogs';

type Tab = 'trees' | 'growth' | 'images';

const PlotDetailPage: React.FC = () => {
  const { plotCode } = useParams<{ plotCode: string }>();
  const navigate = useNavigate();
  const [plot, setPlot] = useState<Plot | null>(null);
  const [isLoadingPlot, setIsLoadingPlot] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('trees');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!plotCode) return;
    
    const fetchPlot = async () => {
      const plotsRef = collection(db, 'plots');
      const q = query(plotsRef, where('plot_code', '==', plotCode));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setPlot({ id: doc.id, ...doc.data() } as Plot);
      }
      setIsLoadingPlot(false);
    };
    
    fetchPlot();
  }, [plotCode]);

  const { trees, isLoading: treesLoading } = useTrees(plot?.id);
  const { logs, isLoading: logsLoading } = useGrowthLogs(plot?.id);

  if (isLoadingPlot) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#2d5a27]" />
        </div>
      </AppShell>
    );
  }

  if (!plot) {
    return (
      <AppShell>
        <div className="p-4 text-center text-gray-500">ไม่พบแปลงดังกล่าว</div>
      </AppShell>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'trees', label: `ต้นไม้ (${trees.length})` },
    { id: 'growth', label: `บันทึกการเจริญเติบโต (${logs.length})` },
    { id: 'images', label: 'รูปภาพ' },
  ];

  return (
    <AppShell>
      <div className="p-4 lg:p-6">
        {/* Back + header */}
        <button
          onClick={() => navigate('/plots')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          <span>แปลงทั้งหมด</span>
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[#2d5a27] text-white text-sm font-bold px-3 py-1 rounded">
              {plot.name_short}
            </span>
            <h1 className="text-lg font-bold text-gray-900">{plot.owner_name}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            กลุ่มที่ {plot.group_number}
            {plot.tambon && ` · ${plot.tambon}`}
            {plot.area_sq_m && ` · ${plot.area_sq_m.toLocaleString()} ตร.ม.`}
          </p>
        </div>

        {/* Tab strip */}
        <div className="flex gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-[#2d5a27] text-[#2d5a27]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'trees' && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setShowMap((m) => !m)}
                className="text-xs text-[#2d5a27] font-medium hover:underline"
              >
                {showMap ? 'แสดงตาราง' : '🗺 แสดงแผนที่'}
              </button>
            </div>
            {showMap ? (
              <TreeMap trees={trees} plotCode={plotCode} />
            ) : (
              <TreeTable trees={trees} isLoading={treesLoading} />
            )}
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['วันที่', 'รหัสต้นไม้', 'ชนิด', 'ความสูง (ม.)', 'สถานะ', 'บันทึกโดย'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <Loader2 size={20} className="animate-spin text-[#2d5a27] mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">ยังไม่มีข้อมูล</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{log.survey_date}</td>
                      <td className="px-4 py-3 font-mono font-semibold">{log.tree?.tree_code}</td>
                      <td className="px-4 py-3 text-gray-600">{log.tree?.species?.name_th}</td>
                      <td className="px-4 py-3">{log.height_m ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          log.status === 'alive'
                            ? 'bg-green-100 text-green-700'
                            : log.status === 'dead'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {log.status === 'alive' ? 'มีชีวิต' : log.status === 'dead' ? 'ตาย' : log.status ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{log.recorder?.fullname ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'images' && plot.id && (
          <ImageGallery plotId={plot.id} />
        )}
      </div>
    </AppShell>
  );
};

export default PlotDetailPage;
