/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { ViewTab } from '../types';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings as SettingsIcon, 
  CheckSquare, 
  Menu,
  Sparkles,
  HelpCircle,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, currentUser, setSelectedProjectId, logout } = useTaskFlow();

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const navItems = [
    { id: 'dashboard' as ViewTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'my-work' as ViewTab, label: 'My Work', icon: LayoutDashboard },
    { id: 'projects' as ViewTab, label: 'Projects', icon: FolderKanban },
    { id: 'team' as ViewTab, label: 'Team Members', icon: Users },
    { id: 'settings' as ViewTab, label: 'Settings', icon: SettingsIcon },
  ];

  const handleTabChange = (tabId: ViewTab) => {
    setCurrentTab(tabId);
    // When switching tabs, clean up the project selection unless clicking on projects tab
    if (tabId !== 'projects') {
      setSelectedProjectId(null);
    }
  };

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar-collapsed', String(nextState));
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside 
        id="app-sidebar"
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 shrink-0 z-20 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-slate-800 shrink-0 gap-3 transition-all duration-300 ${
          isCollapsed ? 'justify-center px-2' : 'px-4 lg:px-6'
        }`}>
          <div className="p-2 bg-blue-600 rounded-lg text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <CheckSquare className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span 
              className="font-bold text-lg text-white tracking-tight animate-fade-in truncate"
              style={{ fontFamily: 'Verdana, sans-serif' }}
            >
              TaskFlow
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-14 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-md border border-slate-800 z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}

          <div className="border-t border-slate-800/60 my-2" />

          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={toggleCollapse}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 transition-all duration-150 relative group cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            id="sidebar-toggle-collapse"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 shrink-0" />
            ) : (
              <ChevronLeft className="h-5 w-5 shrink-0" />
            )}
            {!isCollapsed && <span className="truncate">Collapse Menu</span>}

            {isCollapsed && (
              <div className="absolute left-14 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-md border border-slate-800 z-50">
                Expand Menu
              </div>
            )}
          </button>
        </nav>

        {/* User Card at bottom of sidebar (Desktop/Tablet) */}
        {currentUser && (
          <div className={`p-4 border-t border-slate-800 bg-slate-950/40 shrink-0 flex flex-col gap-3 ${
            isCollapsed ? 'items-center' : ''
          }`}>
            <div className="flex items-center justify-between gap-3 w-full">
              <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : 'flex-1'}`}>
                <div 
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                  style={{ backgroundColor: currentUser.avatarColor }}
                  title={isCollapsed ? `${currentUser.name} - ${currentUser.role}` : undefined}
                >
                  {currentUser.initials}
                </div>
                {!isCollapsed && (
                  <div className="truncate min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white leading-none truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 leading-none mt-1.5 truncate">{currentUser.role}</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Sign Out Button (when expanded) */}
              {!isCollapsed && (
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                  id="sidebar-signout-desktop"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            {/* Collapsed view logout button */}
            {isCollapsed && (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group relative"
                title="Sign Out"
                id="sidebar-signout-collapsed"
              >
                <LogOut className="h-5 w-5" />
                <div className="absolute left-14 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-md border border-slate-800 z-50">
                  Sign Out
                </div>
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav 
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 z-40 shadow-xl"
      >
        <div className="flex-1 flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1 sm:px-3 rounded-lg gap-1 transition-all duration-150 ${
                  isActive ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
          
          {/* Mobile Sign Out Button */}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center py-1 px-1 sm:px-3 rounded-lg gap-1 text-slate-400 hover:text-rose-400 transition-all duration-150 cursor-pointer"
            id="mobile-nav-signout"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
};
