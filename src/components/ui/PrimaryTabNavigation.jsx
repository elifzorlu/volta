import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import VoltaLogo from '../VoltaLogo';
import { useAuth } from '../../contexts/AuthContext';

const PrimaryTabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/today');
  const { user, userProfile, signOut, isDemoMode } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigationItems = [
    {
      label: 'Today',
      path: '/today',
      icon: 'Calendar'
    },
    {
      label: 'Log',
      path: '/log',
      icon: 'PenLine'
    },
    {
      label: 'Pomodoro',
      path: '/pomodoro-timer',
      icon: 'Timer'
    },
    {
      label: 'Schedule',
      path: '/schedule',
      icon: 'CalendarClock'
    },
    {
      label: 'History',
      path: '/history',
      icon: 'TrendingUp'
    },
    {
      label: 'Predictions',
      path: '/predictions',
      icon: 'Brain'
    },
    {
      label: 'Goals',
      path: '/goal-setting',
      icon: 'Target'
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: 'Settings'
    }
  ];

  useEffect(() => {
    setActiveTab(location?.pathname);
  }, [location?.pathname]);

  const handleTabClick = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  const handleKeyDown = (e, path) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      handleTabClick(path);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth');
    }
  };

  return (
    <nav className="primary-tab-navigation" role="navigation" aria-label="Primary navigation">
      <div className="primary-tab-navigation-container">
        <div className="primary-tab-navigation-logo">
          <div className="primary-tab-navigation-logo-icon">
            <VoltaLogo size={28} color="var(--color-accent)" />
          </div>
          <span className="primary-tab-navigation-logo-text">Volta</span>
        </div>

        <div className="primary-tab-navigation-tabs" role="tablist">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              role="tab"
              aria-selected={activeTab === item?.path}
              aria-label={item?.label}
              tabIndex={activeTab === item?.path ? 0 : -1}
              className={`primary-tab-navigation-tab ${activeTab === item?.path ? 'active' : ''}`}
              onClick={() => handleTabClick(item?.path)}
              onKeyDown={(e) => handleKeyDown(e, item?.path)}
            >
              <Icon 
                name={item?.icon} 
                size={20} 
                color={activeTab === item?.path ? 'var(--color-accent)' : 'currentColor'} 
                strokeWidth={2}
              />
              <span className="hidden lg:inline">{item?.label}</span>
              <span className="lg:hidden">{item?.label}</span>
            </button>
          ))}
        </div>

        {/* User Profile / Auth Section */}
        <div className="relative ml-auto">
          {user && !isDemoMode ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#39FF88] flex items-center justify-center">
                  <span className="text-black font-medium text-sm">
                    {userProfile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="hidden lg:inline text-sm text-zinc-300">
                  {userProfile?.displayName || user?.email?.split('@')?.[0]}
                </span>
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-zinc-800">
                      <p className="text-sm text-zinc-300 truncate">{user?.email}</p>
                      <p className="text-xs text-zinc-500 mt-1">Authenticated</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                    >
                      <Icon name="LogOut" size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-sm bg-[#39FF88] hover:bg-[#2ee077] text-black font-medium rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PrimaryTabNavigation;