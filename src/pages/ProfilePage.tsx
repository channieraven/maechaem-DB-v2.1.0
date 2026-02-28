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
      <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">โปรไฟล์ของฉัน</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
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
