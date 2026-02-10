import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import VoltaLogo from '../VoltaLogo';

const PrimaryTabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/today');

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
      </div>
    </nav>
  );
};

export default PrimaryTabNavigation;