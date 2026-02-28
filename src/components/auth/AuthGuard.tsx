import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Loader2, Trees, LogOut } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, profile, loading, logout } = useAuthContext();

  // Still initializing Firebase Auth
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-[#2d5a27] mb-4" />
        <p className="text-sm text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  // Logged in but profile not yet approved
  if (user && profile && !profile.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f4d2b] via-[#2d5a27] to-[#1f4d2b] p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center bg-white/20 p-4 rounded-2xl mb-4">
            <Trees size={36} className="text-green-300" />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">รอการอนุมัติ</h2>
            <p className="text-sm text-gray-600 mb-5">
              บัญชีของคุณกำลังรอผู้ดูแลระบบอนุมัติ กรุณารอสักครู่
            </p>
            <p className="text-xs text-gray-400 mb-5">
              อีเมล: {user.email}
            </p>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut size={14} />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guest or authenticated — render app
  // Guest users can browse (public read), write features are controlled by canWrite
  return <>{children}</>;
};

export default AuthGuard;
