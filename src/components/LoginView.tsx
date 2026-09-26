import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, User, Loader2, LogIn } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('प्रयोगकर्ता नाम र पासवर्ड अनिवार्य छन्।');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'लगइन गर्दा प्राविधिक समस्या उत्पन्न भयो।');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-red-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl z-10 border border-slate-100">
        <div className="flex flex-col items-center mb-8 text-center space-y-4">
          <img
            src="/emblem.webp"
            alt="निशाना छाप"
            className="w-24 h-24"
          />
          <div>
            <span className="inline-block text-xs font-bold tracking-wider text-red-800 uppercase bg-red-50 px-2 py-0.5 rounded border border-red-200 mb-2">
              नेपाल सरकार | राष्ट्रिय सतर्कता केन्द्र
            </span>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              सार्वजनिक खरिद अनुगमन तथा निरीक्षण प्रणाली
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              प्रणालीमा प्रवेश गर्न आफ्नो विवरण भर्नुहोस्
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md flex items-start space-x-2">
            <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
              <span>प्रयोगकर्ता नाम</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-colors"
                placeholder="आफ्नो प्रयोगकर्ता नाम राख्नुहोस्"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
              <span>पासवर्ड</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting || isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                लगइन गर्नुहोस्
              </>
            )}
          </button>
        </form>

        {/* <div className="mt-4 text-center">
          <a
            href="/checklist"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
          >
            सार्वजनिक खरिद निर्देशिका र चेकलिस्ट
          </a>
        </div> */}

        <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
          <p>&copy; {new Date().getFullYear()} राष्ट्रिय सतर्कता केन्द्र। सबै अधिकार सुरक्षित।</p>
        </div>
      </div>
    </div>
  );
};
