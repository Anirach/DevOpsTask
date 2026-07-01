import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { 
  FolderKanban, 
  CheckSquare, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Plus, 
  TrendingUp,
  BarChart3,
  Sparkles,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Project, Task, User, Priority, TaskStatus } from '../types';
import { CreateTaskModal } from './CreateTaskModal';

export const OverviewDashboard: React.FC = () => {
  const { 
    projects, 
    tasks, 
    users, 
    setSelectedProjectId, 
    setCurrentTab,
    addProject
  } = useTaskFlow();

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  
  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3b82f6'); // default blue

  // KPI Calculations
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const activeTasks = tasks.filter(t => t.status !== 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const inReviewTasks = tasks.filter(t => t.status === 'in_review').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const highTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  // Colors for brand selection
  const brandColors = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#ef4444', label: 'Rose' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#64748b', label: 'Slate' },
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    addProject({
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      color: newProjectColor,
      memberIds: users.map(u => u.id), // Add all members by default
    });

    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectColor('#3b82f6');
    setIsCreateProjectOpen(false);
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('projects');
  };

  return (
    <div className="space-y-6" id="overview-dashboard-container">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Workspace Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of all initiatives, task distributions, and team workload.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-xs cursor-pointer"
            id="btn-overview-add-project"
          >
            <FolderKanban className="h-4 w-4 text-slate-500" />
            New Project
          </button>
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-blue-600/10 cursor-pointer animate-fade-in"
            id="btn-overview-add-task"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Projects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 shrink-0">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Active Projects</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalProjects}</h3>
          </div>
        </div>

        {/* KPI 2: Total Tasks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600 shrink-0">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Total Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalTasks}</h3>
          </div>
        </div>

        {/* KPI 3: Task Completion Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 shrink-0 animate-pulse">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Completion Rate</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-bold text-slate-900">{completionRate}%</h3>
              <span className="text-[10px] text-emerald-600 font-bold">{completedTasks}/{totalTasks} done</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Urgent & High Attention Items */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className={`p-3 rounded-lg shrink-0 ${urgentTasks > 0 ? 'bg-rose-50 text-rose-600 animate-bounce' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Urgent Active</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{urgentTasks}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects, Tasks Breakdown and Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT & CENTER: Projects and Task Distribution (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Projects Status Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-slate-500" />
                <h2 className="text-base font-bold text-slate-800">Project Progress Breakdown</h2>
              </div>
              <span className="text-xs font-medium text-slate-400">{projects.length} Total</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
              {projects.map((proj) => {
                const projectTasks = tasks.filter(t => t.projectId === proj.id);
                const projDone = projectTasks.filter(t => t.status === 'done').length;
                const projTotal = projectTasks.length;
                const projProgress = projTotal > 0 ? Math.round((projDone / projTotal) * 100) : 0;
                
                // Active task status subgroups
                const projTodo = projectTasks.filter(t => t.status === 'todo').length;
                const projInProgress = projectTasks.filter(t => t.status === 'in_progress').length;
                const projInReview = projectTasks.filter(t => t.status === 'in_review').length;

                return (
                  <div 
                    key={proj.id} 
                    className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer"
                    onClick={() => handleProjectClick(proj.id)}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                          style={{ backgroundColor: proj.color }}
                        />
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {proj.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {proj.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Progress Bar & Status Counts */}
                    <div className="flex items-center gap-6 shrink-0">
                      {/* Interactive pill counts */}
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600" title="Todo">
                          {projTodo}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-600" title="In Progress">
                          {projInProgress}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-600" title="In Review">
                          {projInReview}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-600" title="Done">
                          {projDone}
                        </span>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-36 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>{projProgress}% Done</span>
                          <span className="text-slate-400">{projDone}/{projTotal} Tasks</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${projProgress}%`,
                              backgroundColor: proj.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {projects.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <FolderKanban className="h-10 w-10 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-500 mt-3">No active projects found.</p>
                  <button 
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="mt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Add a project to get started
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task Status Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Status distribution bars */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Tasks by Status
              </h3>
              
              <div className="space-y-3.5">
                {[
                  { label: 'To Do', count: todoTasks, total: totalTasks, color: 'bg-slate-400' },
                  { label: 'In Progress', count: inProgressTasks, total: totalTasks, color: 'bg-blue-500' },
                  { label: 'In Review', count: inReviewTasks, total: totalTasks, color: 'bg-amber-500' },
                  { label: 'Completed', count: completedTasks, total: totalTasks, color: 'bg-emerald-500' },
                ].map((item) => {
                  const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{item.label}</span>
                        <span>{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution Bar */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Active Tasks by Priority
              </h3>

              <div className="space-y-3.5">
                {[
                  { label: 'Urgent', count: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length, color: 'bg-rose-500' },
                  { label: 'High', count: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length, color: 'bg-amber-500' },
                  { label: 'Medium', count: tasks.filter(t => t.priority === 'medium' && t.status !== 'done').length, color: 'bg-blue-500' },
                  { label: 'Low', count: tasks.filter(t => t.priority === 'low' && t.status !== 'done').length, color: 'bg-slate-400' },
                ].map((item) => {
                  const activeTotal = tasks.filter(t => t.status !== 'done').length;
                  const pct = activeTotal > 0 ? Math.round((item.count / activeTotal) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{item.label}</span>
                        <span>{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT: Team Workload Analysis */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4 h-fit">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              Team Workload
            </h3>
            <p className="text-xs text-slate-400 mt-1">Active task count per member and load balance status.</p>
          </div>

          <div className="space-y-4">
            {users.map((user) => {
              const userActiveTasks = tasks.filter(t => t.assigneeIds?.includes(user.id) && t.status !== 'done');
              const userDoneTasks = tasks.filter(t => t.assigneeIds?.includes(user.id) && t.status === 'done');
              const activeCount = userActiveTasks.length;
              const totalCount = activeCount + userDoneTasks.length;

              // Workload load level category
              let loadLabel = 'Light';
              let loadBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
              let loadBarColor = 'bg-emerald-500';

              if (activeCount >= 6) {
                loadLabel = 'Overloaded';
                loadBadgeColor = 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
                loadBarColor = 'bg-rose-500';
              } else if (activeCount >= 3) {
                loadLabel = 'Balanced';
                loadBadgeColor = 'bg-blue-50 text-blue-700 border-blue-100';
                loadBarColor = 'bg-blue-500';
              }

              return (
                <div key={user.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="h-8.5 w-8.5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${loadBadgeColor}`}>
                      {loadLabel} ({activeCount})
                    </span>
                  </div>

                  {/* Load progress meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Active Workload</span>
                      <span>{activeCount} active / {totalCount} total</span>
                    </div>
                    {/* Progress track, Max benchmark is 8 tasks */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${loadBarColor} rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min((activeCount / 8) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Project Modal Backdrop */}
      {isCreateProjectOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FolderKanban className="text-blue-600 h-5 w-5" />
                Create New Project
              </h3>
              <button 
                onClick={() => setIsCreateProjectOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Project Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Q3 Summer Marketing"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Description</label>
                <textarea 
                  placeholder="Summarize the core goal of this initiative..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-blue-500 outline-hidden min-h-[80px]"
                />
              </div>

              {/* Theme Color selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Theme Color</label>
                <div className="flex flex-wrap gap-2">
                  {brandColors.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setNewProjectColor(col.value)}
                      className="w-6 h-6 rounded-full border-2 transition-all shrink-0 cursor-pointer flex items-center justify-center relative"
                      style={{ 
                        backgroundColor: col.value,
                        borderColor: newProjectColor === col.value ? '#0f172a' : 'transparent'
                      }}
                      title={col.label}
                    >
                      {newProjectColor === col.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Create Task Modal */}
      <CreateTaskModal 
        isOpen={isCreateTaskOpen} 
        onClose={() => setIsCreateTaskOpen(false)} 
      />
    </div>
  );
};
