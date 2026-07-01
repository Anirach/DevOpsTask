/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, ViewTab, Priority, TaskStatus } from '../types';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatDeadlineFriendly, getDeadlineAlertState } from '../utils/dateUtils';
import { CreateTaskModal } from './CreateTaskModal';

export const MyWorkDashboard: React.FC = () => {
  const { 
    tasks, 
    projects, 
    users, 
    currentUserId, 
    setSelectedProjectId, 
    setCurrentTab, 
    setSelectedTaskId 
  } = useTaskFlow();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'status'>('deadline');

  // Filter tasks assigned to current user
  const myTasks = tasks.filter(t => t.assigneeIds.includes(currentUserId));

  // Derive KPI counts
  const totalAssignedCount = myTasks.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = myTasks.filter(t => t.deadline === todayStr && t.status !== 'done').length;

  // Overdue count: deadline in past and status !== done
  const overdueCount = myTasks.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    const deadlineDate = new Date(t.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return deadlineDate.getTime() < todayDate.getTime();
  }).length;

  const completedCount = myTasks.filter(t => t.status === 'done').length;

  // Status breakdown calculations
  const todoCount = myTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = myTasks.filter(t => t.status === 'in_progress').length;
  const inReviewCount = myTasks.filter(t => t.status === 'in_review').length;
  const doneCount = myTasks.filter(t => t.status === 'done').length;

  // Percentage calculations
  const completionPercent = totalAssignedCount > 0 
    ? Math.round((doneCount / totalAssignedCount) * 100) 
    : 100;

  // Handle priority sort weights
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  const statusWeight = { todo: 1, in_progress: 2, in_review: 3, done: 4 };

  // Sorted tasks
  const sortedTasks = [...myTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'priority') {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    if (sortBy === 'status') {
      return statusWeight[a.status] - statusWeight[b.status];
    }
    return 0;
  });

  const priorityColors = {
    low: 'bg-slate-50 text-slate-600 border-slate-100',
    medium: 'bg-blue-50 text-blue-600 border-blue-100',
    high: 'bg-amber-50 text-amber-700 border-amber-100',
    urgent: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse',
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Completed',
  };

  const statusColors = {
    todo: 'bg-slate-100 text-slate-800',
    in_progress: 'bg-blue-100 text-blue-800',
    in_review: 'bg-amber-100 text-amber-800',
    done: 'bg-emerald-100 text-emerald-800',
  };

  const handleProjectBadgeClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjectId(projectId);
    setCurrentTab('projects');
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Header & Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">Here is the latest progress report for your assigned initiatives.</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-blue-600/10 self-start sm:self-center cursor-pointer"
          id="btn-quick-add-task"
        >
          <Plus className="h-4 w-4" />
          Add New Task
        </button>
      </div>

      {/* KPI Cards Row (4 blocks) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Assigned */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assigned to Me</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalAssignedCount}</h3>
          </div>
        </div>

        {/* KPI 2: Due Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Due Today</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{dueTodayCount}</h3>
          </div>
        </div>

        {/* KPI 3: Overdue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className={`p-3 rounded-lg ${overdueCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overdue Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{overdueCount}</h3>
          </div>
        </div>

        {/* KPI 4: Done */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</h3>
          </div>
        </div>

      </div>

      {/* Main Workspace Layout (2 Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT: Task list (Col span 2) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Assigned Tasks ({totalAssignedCount})</h2>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg border-0 outline-hidden cursor-pointer"
                id="select-dashboard-sort"
              >
                <option value="deadline">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* S2 Empty State check */}
          {sortedTasks.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
              <span className="text-4xl">🎉</span>
              <h3 className="text-sm font-bold text-slate-800 mt-3">You're all caught up</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Nothing is currently assigned to you. Enjoy the workspace or quick-add tasks to begin.</p>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 px-4 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Create a Task
              </button>
            </div>
          ) : (
            /* Tasks Feed Table */
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
              {sortedTasks.map((task) => {
                const proj = projects.find(p => p.id === task.projectId);
                const isOverdue = getDeadlineAlertState(task.deadline, task.status) === 'overdue';

                return (
                  <div
                    key={task.id}
                    id={`task-row-${task.id}`}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 -mx-4 px-4 rounded-lg cursor-pointer transition-colors group"
                  >
                    {/* Title and Project Badge */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold truncate hover:scale-105 transition-transform`}
                          style={{ backgroundColor: (proj?.color || '#2563EB') + '10', color: proj?.color || '#2563EB' }}
                          onClick={(e) => handleProjectBadgeClick(task.projectId, e)}
                        >
                          {proj?.name || 'Project'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{task.id}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {task.title}
                      </h4>
                    </div>

                    {/* Metadata details (Priority, Status, Deadline) */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Priority chip */}
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>

                      {/* Status chip */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>

                      {/* Deadline countdown */}
                      {task.deadline ? (
                        <div className={`text-xs font-semibold flex items-center gap-1 p-1 rounded-md border ${
                          task.status === 'done' 
                            ? 'bg-slate-50 text-slate-400 border-slate-100' 
                            : isOverdue 
                              ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' 
                              : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span className="text-[11px]">{formatDeadlineFriendly(task.deadline)}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-300 italic">No date</span>
                      )}

                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Status breakdown mini-widget & helper metrics */}
        <div className="space-y-6">
          
          {/* Status Breakdown Circle Metric Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-800">Progress Breakdown</h2>
            
            {/* Custom SVG Radial Donut Chart */}
            <div className="flex items-center justify-center py-2 relative">
              <svg className="w-36 h-36 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  strokeWidth="10"
                  stroke="#f1f5f9"
                  fill="transparent"
                />
                {/* Colored Active Progress Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  strokeWidth="10"
                  stroke="#2563eb"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionPercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-800">{completionPercent}%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
              </div>
            </div>

            {/* List Metrics details */}
            <div className="space-y-2.5">
              
              {/* To do progress row */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-slate-500">To Do</span>
                </div>
                <span className="text-slate-800">{todoCount} task{todoCount !== 1 ? 's' : ''}</span>
              </div>

              {/* In Progress progress row */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-500">In Progress</span>
                </div>
                <span className="text-slate-800">{inProgressCount} task{inProgressCount !== 1 ? 's' : ''}</span>
              </div>

              {/* In Review progress row */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-500">In Review</span>
                </div>
                <span className="text-slate-800">{inReviewCount} task{inReviewCount !== 1 ? 's' : ''}</span>
              </div>

              {/* Done progress row */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-500">Completed</span>
                </div>
                <span className="text-slate-800">{doneCount} task{doneCount !== 1 ? 's' : ''}</span>
              </div>

            </div>
          </div>

          {/* Insights mini card */}
          <div className="bg-slate-900 text-slate-300 rounded-xl p-5 border border-slate-800 shadow-md space-y-3">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Focus Insights
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              {overdueCount > 0 
                ? `You have ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}. Let's prioritize clearing these items to restore project schedules.` 
                : totalAssignedCount === 0 
                  ? "Great! You have no pending assignments right now. Use the directory to browse projects and request assignments."
                  : `All your assigned items are on schedule. You've cleared ${doneCount} of your ${totalAssignedCount} tasks successfully!`}
            </p>
          </div>

        </div>

      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

    </div>
  );
};
