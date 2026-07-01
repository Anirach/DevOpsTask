/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Search, ChevronRight, Settings, CheckSquare, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    selectedProjectId, 
    projects, 
    searchQuery, 
    setSearchQuery,
    currentUser
  } = useTaskFlow();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync global search to local search input
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Handle live search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    
    // Auto-route to search tab if user starts typing, or return to dashboard if cleared
    if (val.trim() !== '') {
      if (currentTab !== 'search') {
        setCurrentTab('search');
      }
      setSearchQuery(val);
    } else {
      setSearchQuery('');
    }
  };

  // Get current active project name if relevant
  const activeProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  // Format breadcrumb text
  const renderBreadcrumbs = () => {
    if (activeProject) {
      return (
        <div className="flex items-center text-sm font-medium text-slate-500 truncate">
          <button 
            onClick={() => { setCurrentTab('projects'); }}
            className="hover:text-blue-600 transition-colors"
          >
            Projects
          </button>
          <ChevronRight className="h-4 w-4 mx-1.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-semibold truncate">{activeProject.name}</span>
        </div>
      );
    }

    const tabLabels: Record<string, string> = {
      dashboard: 'Workspace Overview',
      'my-work': 'My Work',
      projects: 'Projects Overview',
      team: 'Team Directory',
      settings: 'App Settings',
      search: 'Search Directory'
    };

    return (
      <span className="text-sm font-semibold text-slate-900 capitalize">
        {tabLabels[currentTab] || currentTab}
      </span>
    );
  };

  return (
    <header 
      id="app-navbar"
      className="h-16 border-b border-slate-200 bg-white sticky top-0 px-4 md:px-6 flex items-center justify-between gap-4 z-10 shadow-xs"
    >
      {/* Mobile Brand / Breadcrumb Area */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden p-1.5 bg-blue-600 rounded-lg text-white shrink-0">
          <CheckSquare className="h-5 w-5" />
        </div>
        {renderBreadcrumbs()}
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search tasks, descriptions..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder-slate-400 text-sm pl-10 pr-4 py-2 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Quick Settings & Profile Accent */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile Search Icon Toggle */}
        <button 
          onClick={() => setCurrentTab('search')}
          className="sm:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Search Tasks"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Dummy Notification Bell */}
        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-600 rounded-full border border-white"></span>
          </button>
        </div>

        {/* Small settings gear quick shortcut */}
        <button 
          onClick={() => setCurrentTab('settings')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            currentTab === 'settings' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Go to settings"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Compact User Identity */}
        {currentUser && (
          <div 
            onClick={() => setCurrentTab('settings')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
          >
            <div 
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-blue-500/10 transition-all"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.initials}
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors hidden lg:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
