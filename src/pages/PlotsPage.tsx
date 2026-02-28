import React from 'react';
import AppShell from '../components/layout/AppShell';
import PlotList from '../components/plots/PlotList';

const PlotsPage: React.FC = () => (
  <AppShell>
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🌲 ข้อมูลแปลงปลูกแม่แจ่ม</h1>
            <p className="text-sm text-gray-500 mt-1">โครงการปลูกป่าอเนกประสงค์ อ.แม่แจ่ม จ.เชียงใหม่</p>
          </div>
        </div>
        <PlotList />
      </div>
    </div>
  </AppShell>
);

export default PlotsPage;
