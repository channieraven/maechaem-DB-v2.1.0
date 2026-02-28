import React from 'react';
import AppShell from '../components/layout/AppShell';
import DashboardOverview from '../components/dashboard/DashboardOverview';

const DashboardPage: React.FC = () => (
  <AppShell>
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📊 แดชบอร์ดสถิติ</h1>
            <p className="text-sm text-gray-500 mt-1">วิเคราะห์ข้อมูลการเจริญเติบโตของต้นไม้ในโครงการ</p>
          </div>
        </div>
        <DashboardOverview />
      </div>
    </div>
  </AppShell>
);

export default DashboardPage;
