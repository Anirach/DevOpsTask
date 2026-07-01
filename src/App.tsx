/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TaskFlowProvider, useTaskFlow } from './context/TaskFlowContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { MyWorkDashboard } from './components/MyWorkDashboard';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ProjectsList } from './components/ProjectsList';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { TeamRoster } from './components/TeamRoster';
import { SettingsPanel } from './components/SettingsPanel';
import { SearchResults } from './components/SearchResults';
import { TaskDetailModal } from './components/TaskDetailModal';
import { AdminPanel } from './components/AdminPanel';

// Inner App content that has access to TaskFlow context
const AppContent: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab,
    selectedProjectId, 
    setSelectedProjectId,
    selectedTaskId, 
    setSelectedTaskId,
    isAuthenticated,
    login
  } = useTaskFlow();

  // S6: Deep Link Fallback Parser (e.g. ?projectId=p1&taskId=t1 on mount)
  useEffect(() => {
    if (isAuthenticated) {
      const queryParams = new URLSearchParams(window.location.search);
      const projectIdParam = queryParams.get('projectId');
      const taskIdParam = queryParams.get('taskId');

      if (projectIdParam) {
        setSelectedProjectId(projectIdParam);
        setCurrentTab('projects');
      }
      if (taskIdParam) {
        setSelectedTaskId(taskIdParam);
      }
    }
  }, [isAuthenticated, setSelectedProjectId, setSelectedTaskId, setCurrentTab]);

  // If not authenticated, force S1 Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={login} />;
  }

  // Active View Tab Router Switch
  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'my-work':
        return <MyWorkDashboard />;
      case 'projects':
        if (selectedProjectId) {
          return <ProjectWorkspace projectId={selectedProjectId} />;
        }
        return <ProjectsList />;
      case 'team':
        return <TeamRoster />;
      case 'settings':
        return <SettingsPanel />;
      case 'admin':
        return <AdminPanel />;
      case 'search':
        return <SearchResults />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" id="taskflow-app-shell">
      {/* Persistent Left Navigation Sidebar (collapses on mobile/tablet) */}
      <Sidebar />

      {/* Main workspace layout content stream */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar headers */}
        <Navbar />

        {/* Scrollable View Frame */}
        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8" 
          id="workspace-view-container"
        >
          <div className="max-w-7xl mx-auto">
            {renderActiveTab()}
          </div>
        </main>
      </div>

      {/* Global S6 Detail Modal layered over workspace when task clicked */}
      {selectedTaskId && <TaskDetailModal />}
    </div>
  );
};

export default function App() {
  return (
    <TaskFlowProvider>
      <AppContent />
    </TaskFlowProvider>
  );
}
