import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  Clock, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  Stethoscope,
  LayoutDashboard,
  TrendingUp,
  Languages
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, isAuthenticated, logout, loginDemo } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  Dermalytics
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                  AI-XAI
                </span>
              </div>
              <p className={`text-[11px] font-medium text-slate-500 hidden sm:block ${language === 'ur' ? 'font-urdu' : ''}`}>
                {t('nav.brandSubtitle')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-white text-sky-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              } ${language === 'ur' ? 'font-urdu' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('nav.dashboard')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('skin-analysis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'skin-analysis'
                  ? 'bg-white text-sky-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              } ${language === 'ur' ? 'font-urdu' : ''}`}
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>{t('nav.skinAnalysis')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('hair-analysis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'hair-analysis'
                  ? 'bg-white text-teal-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              } ${language === 'ur' ? 'font-urdu' : ''}`}
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>{t('nav.hairAnalysis')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'history'
                  ? 'bg-white text-sky-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              } ${language === 'ur' ? 'font-urdu' : ''}`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('nav.history')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'progress'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              } ${language === 'ur' ? 'font-urdu' : ''}`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.progress')}</span>
            </button>

            {user?.is_admin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                } ${language === 'ur' ? 'font-urdu' : ''}`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>{t('nav.admin')}</span>
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-2.5">
            
            {/* Bilingual Switcher Toggle Pill */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all shadow-sm group"
              title={language === 'en' ? 'اردو میں تبدیل کریں (Switch to Urdu)' : 'Switch to English'}
            >
              <Languages className="w-4 h-4 text-sky-600 group-hover:rotate-12 transition-transform" />
              <span className={language === 'en' ? 'text-sky-700 font-extrabold' : 'text-slate-400 font-normal'}>EN</span>
              <span className="text-slate-300">/</span>
              <span className={`text-sm ${language === 'ur' ? 'text-sky-700 font-black font-urdu' : 'text-slate-400 font-normal font-urdu'}`}>اردو</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentTab('profile')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    currentTab === 'profile'
                      ? 'bg-sky-50 border-sky-300 text-sky-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">
                    {user?.first_name ? user.first_name[0] : 'U'}
                  </div>
                  <span>{user?.first_name || user?.username}</span>
                  {user?.is_admin && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                      Admin
                    </span>
                  )}
                </button>

                <button
                  onClick={logout}
                  title={t('auth.signOut')}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loginDemo('patient')}
                  className={`text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all ${language === 'ur' ? 'font-urdu' : ''}`}
                >
                  {t('auth.demoPatient')}
                </button>
                <button
                  onClick={onOpenAuth}
                  className={`text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-xl shadow-sm shadow-sky-600/20 transition-all ${language === 'ur' ? 'font-urdu' : ''}`}
                >
                  {t('auth.signIn')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="p-1.5 text-xs font-bold rounded-lg bg-slate-100 text-sky-700 flex items-center space-x-1"
            >
              <span>{language === 'en' ? 'EN' : 'اردو'}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => { setCurrentTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4 text-sky-600" />
            <span>{t('nav.dashboard')}</span>
          </button>
          <button
            onClick={() => { setCurrentTab('skin-analysis'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            <Stethoscope className="w-4 h-4 text-sky-600" />
            <span>{t('nav.skinAnalysis')}</span>
          </button>
          <button
            onClick={() => { setCurrentTab('hair-analysis'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{t('nav.hairAnalysis')}</span>
          </button>
          <button
            onClick={() => { setCurrentTab('history'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            <Clock className="w-4 h-4 text-slate-600" />
            <span>{t('nav.history')}</span>
          </button>
          <button
            onClick={() => { setCurrentTab('progress'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>{t('nav.progress')}</span>
          </button>
          <button
            onClick={() => { setCurrentTab('profile'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            <UserIcon className="w-4 h-4 text-slate-600" />
            <span>{t('nav.profile')}</span>
          </button>
          {user?.is_admin && (
            <button
              onClick={() => { setCurrentTab('admin'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center space-x-2 ${language === 'ur' ? 'font-urdu' : ''}`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{t('nav.admin')}</span>
            </button>
          )}
          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {!isAuthenticated ? (
              <button
                onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                className="w-full bg-sky-600 text-white py-2 rounded-xl text-sm font-bold shadow-sm"
              >
                {t('auth.signIn')}
              </button>
            ) : (
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full bg-rose-50 text-rose-700 py-2 rounded-xl text-sm font-semibold"
              >
                {t('auth.signOut')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
