import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { Loader2, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [fullname, setFullname] = useState('');
  const [position, setPosition] = useState('');
  const [organization, setOrganization] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Profile update would go here if needed
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-5">โปรไฟล์ของฉัน</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <form onSubmit={handleSave} className="space-y-4">
            {[
              { label: 'ชื่อ-นามสกุล', value: fullname, setter: setFullname },
              { label: 'ตำแหน่ง', value: position, setter: setPosition },
              { label: 'หน่วยงาน', value: organization, setter: setOrganization },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white text-sm font-medium rounded-lg hover:bg-[#234820] transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saved ? 'บันทึกแล้ว ✓' : isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
};

export default ProfilePage;
