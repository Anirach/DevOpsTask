/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, TaskStatus, Priority } from '../types';
import { 
  Search, 
  X, 
  Calendar, 
  User as UserIcon, 
  ArrowRight,
  Filter,
  CheckCircle,
  Clock,
  Folder,
  AlertTriangle
} from 'lucide-react';
import { formatDeadlineFriendly, getDeadlineAlertState } from '../utils/dateUtils';

export const SearchResults: React.FC = () => {
  const { 
    tasks, 
    projects, 
    users, 
    searchQuery, 
    setSearchQuery, 
    filters, 
    setFilters, 
    setSelectedTaskId,
    setSelectedProjectId,
    setCurrentTab
  } = useTaskFlow();

  // Keep a local copy of search query for typing inputs
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Apply filters on ALL tasks
  const matchedTasks = tasks.filter(task => {
    // Search query matches title or description
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = task.title.toLowerCase().includes(q);
      const descMatch = (task.description || '').toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }

    // Status Filter
    if (filters.status && filters.status !== 'all') {
      if (task.status !== filters.status) return false;
    }

    // Assignee Filter
    if (filters.assigneeId && filters.assigneeId !== 'all') {
      if (!task.assigneeIds || !task.assigneeIds.includes(filters.assigneeId)) return false;
    }

    // Priority Filter
    if (filters.priority && filters.priority !== 'all') {
      if (task.priority !== filters.priority) return false;
    }

    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  const handleClearFilters = () => {
    setFilters({ status: 'all', priority: 'all', assigneeId: 'all' });
    setSearchQuery('');
    setLocalSearch('');
  };

  const removeFilter = (key: keyof typeof filters) => {
    setFilters({
      ...filters,
      [key]: 'all'
    });
  };

  const priorityColors = {
    low: 'bg-slate-50 text-slate-600 border-slate-200',
    medium: 'bg-blue-50 text-blue-600 border-blue-100',
    high: 'bg-amber-50 text-amber-700 border-amber-100',
    urgent: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse font-semibold',
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

  const handleProjectBadgeClick = (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjectId(projId);
    setCurrentTab('projects');
  };

  // Find label of active assignee filter
  const getAssigneeLabel = (id: string) => {
    const u = users.find(x => x.id === id);
    return u ? u.name : id;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">Global Search & Filters</h1>
        <p className="text-sm text-slate-500 mt-1">Cross-reference tasks, filter statuses, and query priorities across all projects.</p>
      </div>

      {/* Primary Query Inputs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="search"
              placeholder="Search by keywords..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Query
          </button>
        </form>

        {/* Filters Grid selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Status Filter</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Priority Filter</label>
            <select
              value={filters.priority || 'all'}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg outline-hidden cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Assignee Filter</label>
            <select
              value={filters.assigneeId || 'all'}
              onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg outline-hidden cursor-pointer"
            >
              <option value="all">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* S7 Active Filter chips indicator */}
      {(filters.status !== 'all' || filters.priority !== 'all' || filters.assigneeId !== 'all' || searchQuery !== '') && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-400">Active Tags:</span>
          
          {searchQuery && (
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 font-medium">
              Keyword: "{searchQuery}"
              <button onClick={() => { setSearchQuery(''); setLocalSearch(''); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.status && filters.status !== 'all' && (
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 font-medium">
              Status: {statusLabels[filters.status]}
              <button onClick={() => removeFilter('status')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.priority && filters.priority !== 'all' && (
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 font-medium capitalize">
              Priority: {filters.priority}
              <button onClick={() => removeFilter('priority')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.assigneeId && filters.assigneeId !== 'all' && (
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 font-medium">
              Assignee: {getAssigneeLabel(filters.assigneeId)}
              <button onClick={() => removeFilter('assigneeId')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleClearFilters}
            className="text-blue-600 hover:text-blue-800 font-bold ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Match Count header */}
      <h2 className="text-sm font-bold text-slate-800 px-1 pt-1">
        Results ({matchedTasks.length} task{matchedTasks.length !== 1 ? 's' : ''} found)
      </h2>

      {/* Results Feed */}
      {matchedTasks.length === 0 ? (
        <div className="py-16 px-4 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-4xl text-slate-300">🔍</span>
          <h3 className="text-sm font-bold text-slate-800 mt-4">No matching results found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">We couldn't find any tasks matching your keywords or filter parameters. Try revising your selections.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 px-4 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
          {matchedTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            const deadlineAlert = getDeadlineAlertState(task.deadline, task.status);

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 cursor-pointer transition-colors group"
              >
                {/* Task main body */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {project && (
                      <span 
                        onClick={(e) => handleProjectBadgeClick(project.id, e)}
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-1"
                        style={{ backgroundColor: project.color + '12', color: project.color }}
                      >
                        <Folder className="h-3 w-3 shrink-0" />
                        {project.name}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">{task.id}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Metadata Details (Assignee, Priority, Status, Deadline) */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                  
                  {/* Assignees */}
                  {task.assigneeIds && task.assigneeIds.length > 0 ? (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 p-1 rounded-lg">
                      <div className="flex -space-x-1 overflow-hidden shrink-0">
                        {task.assigneeIds.map(id => {
                          const user = users.find(u => u.id === id);
                          if (!user) return null;
                          return (
                            <div 
                              key={user.id}
                              className="h-5.5 w-5.5 rounded-full flex items-center justify-center text-white text-[8px] font-bold ring-1.5 ring-white shrink-0 select-none shadow-xs"
                              style={{ backgroundColor: user.avatarColor }}
                              title={`${user.name} - ${user.role}`}
                            >
                              {user.initials}
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 pr-1.5 hidden md:inline truncate max-w-[80px]">
                        {task.assigneeIds.map(id => users.find(u => u.id === id)?.name?.split(' ')[0]).filter(Boolean).join(', ')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300 italic">Unassigned</span>
                  )}

                  {/* Priority */}
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>

                  {/* Status */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>

                  {/* Deadline countdown */}
                  {task.deadline ? (
                    <div className={`text-[10px] font-semibold flex items-center gap-1 p-1 rounded-md border ${
                      task.status === 'done' 
                        ? 'bg-slate-50 text-slate-400 border-slate-100' 
                        : deadlineAlert === 'overdue' 
                          ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{formatDeadlineFriendly(task.deadline)}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300 italic">No date</span>
                  )}

                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
