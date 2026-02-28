import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Trees, BarChart3, ClipboardList, User, Settings, LogOut, RefreshCw } from 'lucide-react';
import { useOffline } from '../../contexts/OfflineContext';
import OfflineIndicator from './OfflineIndicator';
import { useAuth } from '../../hooks/useAuth';

interface AppShellProps {
  children: React.ReactNode;
}

const TabButton: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
        isActive
          ? 'text-white border-green-400 bg-white/5'
          : 'text-white/60 border-transparent hover:text-white/80'
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
);

const BottomNavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; width: string }> = ({ to, icon, label, width }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center shrink-0 py-2 transition-colors active:scale-95 ${
        isActive ? 'text-green-700 bg-green-50' : 'text-gray-500 hover:bg-gray-50'
      }`
    }
    style={{ width }}
  >
    <div>{icon}</div>
    <span className="text-[9px] font-medium mt-1 whitespace-nowrap">{label}</span>
  </NavLink>
);

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, profile, logout } = useAuth();
  const { pendingCount, syncNow, syncStatus, isOnline } = useOffline();
  const navigate = useNavigate();

  const isAdmin = profile?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/plots');
  };

  const mobileItems = isAdmin ? 5 : 4;
  const mobileWidth = `${100 / mobileItems}%`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OfflineIndicator />

      <header className="bg-gradient-to-r from-[#1f4d2b] via-[#2d5a27] to-[#1f4d2b] text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 md:px-6 py-3 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-white/20 p-2 rounded-lg">
                <Trees size={22} className="text-green-300" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-lg font-bold tracking-wide whitespace-nowrap">ระบบบันทึกข้อมูลรายแปลง</h1>
                <p className="text-[10px] md:text-xs text-white/90 font-medium whitespace-nowrap">สำนักวิจัยและพัฒนาการป่าไม้</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {pendingCount > 0 && (
                <span className="bg-yellow-300 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  รอส่ง {pendingCount}
                </span>
              )}
              <button
                onClick={syncNow}
                disabled={!isOnline || syncStatus === 'syncing' || pendingCount === 0}
                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                title="ซิงค์ข้อมูล"
              >
                <RefreshCw size={18} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
              </button>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `hidden md:flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
                    isActive ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/10 hover:bg-white/20'
                  }`
                }
              >
                <User size={15} className="text-white/90" />
                <span className="text-xs font-semibold truncate max-w-28">{profile?.fullname ?? user?.email ?? 'ผู้ใช้'}</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut size={14} />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        <nav className="hidden md:block border-t border-white/10">
          <div className="max-w-7xl mx-auto w-full px-4 flex overflow-x-auto no-scrollbar">
            <TabButton to="/plots" icon={<Trees size={18} />} label="แปลงปลูก" />
            <TabButton to="/survey" icon={<ClipboardList size={18} />} label="สำรวจภาคสนาม" />
            <TabButton to="/dashboard" icon={<BarChart3 size={18} />} label="สถิติ" />
            {isAdmin && <TabButton to="/admin" icon={<Settings size={18} />} label="จัดการระบบ" />}
            <TabButton to="/profile" icon={<User size={18} />} label="โปรไฟล์" />
          </div>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-gray-50/50">{children}</main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[3000] flex overflow-x-auto no-scrollbar shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <BottomNavItem to="/plots" icon={<Trees size={20} />} label="แปลง" width={mobileWidth} />
        <BottomNavItem to="/survey" icon={<ClipboardList size={20} />} label="สำรวจ" width={mobileWidth} />
        <BottomNavItem to="/dashboard" icon={<BarChart3 size={20} />} label="สถิติ" width={mobileWidth} />
        {isAdmin && <BottomNavItem to="/admin" icon={<Settings size={20} />} label="จัดการ" width={mobileWidth} />}
        <BottomNavItem to="/profile" icon={<User size={20} />} label="โปรไฟล์" width={mobileWidth} />
      </nav>
    </div>
  );
};

export default AppShell;