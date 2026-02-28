import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import UserManagement from '../components/admin/UserManagement';
import DataExport from '../components/admin/DataExport';
import { Users, Download, Settings } from 'lucide-react';

type Tab = 'users' | 'export';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('users');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'users', label: 'จัดการผู้ใช้', icon: <Users size={16} /> },
    { id: 'export', label: 'ส่งออกข้อมูล', icon: <Download size={16} /> },
  ];

  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto pb-20">
        <div className="mb-5 flex items-center gap-3">
          <Settings size={20} className="text-[#2d5a27]" />
          <h1 className="text-2xl font-bold text-gray-800">จัดการระบบ</h1>
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-gray-200 bg-white px-2 rounded-t-xl mb-5 overflow-x-auto">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                tab === id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-green-600'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {tab === 'users' && <UserManagement />}
        {tab === 'export' && <DataExport />}
        </div>
      </div>
    </AppShell>
  );
};

export default AdminPage;
