import React from 'react';
import { MainNavTab } from '../types';

interface BottomNavProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  isAuthenticated: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isAuthenticated,
}) => {
  const navItems: { id: MainNavTab; label: string; icon: string }[] = [
    {
      id: 'vault',
      label: isAuthenticated ? 'Vault Suite' : 'Vault Access',
      icon: 'shield_person',
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'enhanced_encryption',
    },
    {
      id: 'support',
      label: 'Support',
      icon: 'contact_phone',
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: 'domain',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#f6f9ff]/90 backdrop-blur-xl border-t border-[#dde3eb]/70 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
      aria-label="Main Navigation"
    >
      <div className="max-w-md md:max-w-xl mx-auto flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all rounded-lg py-1 px-2.5 ${
                isActive
                  ? 'text-[#0d1c32] font-semibold scale-105'
                  : 'text-[#44474d] hover:text-[#161c22] font-normal'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[22px] transition-transform"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#446180]" />
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-wider uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
