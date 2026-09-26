import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Search, Bell, LogOut, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onSearch?: (term: string) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, activeView }) => {
  const { currentUser, switchRole, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Emblem & Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/emblem.webp"
              alt="निशाना छाप"
              className="w-10 h-10 rounded-full object-cover shadow-xs ring-2 ring-red-100"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold tracking-wider text-red-800/90 uppercase px-2 py-0.5 ">
                  नेपाल सरकार | राष्ट्रिय सतर्कता केन्द्र
                </span>
                {/* <span className="text-xs text-slate-500 font-mono hidden md:inline">
                  NVC-PPMIS v1.0
                </span> */}
              </div>
              <h1 className="text-base font-bold text-blue-900/90 leading-tight">
                खरिद विधि परिपालना अनुगमन
              </h1>
            </div>
          </div>

          {/* Right: Quick Role Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Demo Quick Role Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="px-2 font-medium text-slate-500">भूमिका स्विच:</span>
              <button
                onClick={() => switchRole('admin')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  currentUser?.role === 'admin'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="एडमिन"
              >
                Admin
              </button>
              <button
                onClick={() => switchRole('inspector')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  currentUser?.role === 'inspector'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="अनुगमनकर्ता / निरीक्षक"
              >
                Inspector
              </button>
              <button
                onClick={() => switchRole('reviewer')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  currentUser?.role === 'reviewer'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="पुनरावलोकनकर्ता / समीक्षक"
              >
                Reviewer
              </button>
              <button
                onClick={() => switchRole('public_officer')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  currentUser?.role === 'public_officer'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="सार्वजनिक निकायको अधिकारी"
              >
                Public Entity
              </button>
            </div>

            {/* Current User Badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                  <span>{currentUser?.full_name || 'गेष्ट युजर'}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {currentUser?.role_display_name || currentUser?.role || 'प्रयोगकर्ता'}
                </div>
              </div>
              
              <button
                onClick={logout}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                title="लगआउट गर्नुहोस्"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
