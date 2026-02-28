import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Plot } from '../lib/database.types';
import AppShell from '../components/layout/AppShell';
import PlotSelector from '../components/survey/PlotSelector';
import TreeSelector from '../components/survey/TreeSelector';
import OfflineIndicator from '../components/layout/OfflineIndicator';

// ── Survey home: choose plot ──────────────────────────────────────────────────

export const SurveyPage: React.FC = () => (
  <AppShell>
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📋 สำรวจภาคสนาม</h1>
          <p className="text-sm text-gray-500 mt-1">เลือกแปลงที่ต้องการสำรวจ</p>
        </div>
        <PlotSelector />
      </div>
    </div>
  </AppShell>
);

// ── Survey plot: choose tree ──────────────────────────────────────────────────

export const SurveyPlotPage: React.FC = () => {
  const { plotCode } = useParams<{ plotCode: string }>();
  const navigate = useNavigate();
  const [plot, setPlot] = useState<Plot | null>(null);

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
    };
    
    fetchPlot();
  }, [plotCode]);

  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto pb-20">
        <button
          onClick={() => navigate('/survey')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          <span>เลือกแปลงอื่น</span>
        </button>

          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-800">
            แปลง {plot?.name_short ?? plotCode}
            </h1>
            <p className="text-sm text-gray-500">{plot?.owner_name}</p>
          </div>

          {plot && <TreeSelector plotCode={plotCode!} plotId={plot.id} />}
        </div>
      </div>
    </AppShell>
  );
};
