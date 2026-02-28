import React, { useEffect, useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../hooks/useAuth';
import { useDatabase } from '../contexts/DatabaseContext';
import { Loader2, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS: Record<string, string> = {
  pending: 'รอการอนุมัติ',
  staff: 'เจ้าหน้าที่',
  researcher: 'นักวิจัย',
  executive: 'ผู้บริหาร',
  external: 'บุคคลภายนอก',
  admin: 'ผู้ดูแลระบบ',
};

const ProfilePage: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const db = useDatabase();
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [position, setPosition] = useState('');
  const [organization, setOrganization] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form from profile data
  useEffect(() => {
    if (profile) {
      setFullname(profile.fullname || '');
      setPosition(profile.position || '');
      setOrganization(profile.organization || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError(null);

    try {
      await db.updateProfile(user.uid, { fullname, position, organization });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('[ProfilePage] Update error:', err);
      setError(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/plots');
  };

  // Guest user — not logged in
  if (!user) {
    return (
      <AppShell>
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-5">โปรไฟล์</h1>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 text-center text-gray-500 text-sm">
            กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">โปรไฟล์ของฉัน</h1>

        {/* Read-only info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs block mb-1">อีเมล</span>
              <span className="text-gray-800 font-medium">{user.email}</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block mb-1">บทบาท</span>
              <span className="text-gray-800 font-medium">
                {profile?.role ? ROLE_LABELS[profile.role] || profile.role : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block mb-1">สถานะ</span>
              <span className={`font-medium ${profile?.approved ? 'text-green-700' : 'text-yellow-600'}`}>
                {profile?.approved ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
              </span>
            </div>
          </div>
        </div>

        {/* Editable form */}
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saved ? 'บันทึกแล้ว' : isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut size={15} />
                ออกจากระบบ
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
};

export default ProfilePage;
