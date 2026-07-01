/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, TaskStatus, Priority } from '../types';
import { 
  Plus, 
  MessageSquare, 
  Calendar, 
  User as UserIcon, 
  Search,
  ChevronUp,
  ChevronDown,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { getDeadlineAlertState, formatDeadlineFriendly } from '../utils/dateUtils';
import { CreateTaskModal } from './CreateTaskModal';

interface ListViewProps {
  projectId: string;
}

export const ListView: React.FC<ListViewProps> = ({ projectId }) => {
  const { 
    tasks, 
    users, 
    comments, 
    updateTask, 
    setSelectedTaskId,
    filters,
    setFilters
  } = useTaskFlow();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [sortField, setSortField] = useState<'title' | 'priority' | 'status' | 'deadline'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter tasks belonging to active project
  const projectTasks = tasks.filter(t => t.projectId === projectId);

  // Apply Toolbar filters & live search text matches
  const filteredTasks = projectTasks.filter(task => {
    // Search query match
    if (searchWord.trim() !== '') {
      const matchWord = searchWord.toLowerCase().trim();
      const titleMatch = task.title.toLowerCase().includes(matchWord);
      const descMatch = (task.description || '').toLowerCase().includes(matchWord);
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

  // Sort tasks
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  const statusWeight = { todo: 1, in_progress: 2, in_review: 3, done: 4 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'title') {
      return multiplier * a.title.localeCompare(b.title);
    }
    if (sortField === 'priority') {
      return multiplier * (priorityWeight[a.priority] - priorityWeight[b.priority]);
    }
    if (sortField === 'status') {
      return multiplier * (statusWeight[a.status] - statusWeight[b.status]);
    }
    if (sortField === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return multiplier * (new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    return 0;
  });

  // Toggle sort direction
  const handleSort = (field: 'title' | 'priority' | 'status' | 'deadline') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const priorityColors = {
    low: 'bg-slate-50 text-slate-600 border-slate-100',
    medium: 'bg-blue-50 text-blue-600 border-blue-100',
    high: 'bg-amber-50 text-amber-700 border-amber-100',
    urgent: 'bg-rose-50 text-rose-700 border-rose-100 font-semibold',
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 placeholder-slate-400 text-xs pl-9 pr-4 py-2 rounded-lg outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Priority:</span>
            <select
              value={filters.priority || 'all'}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg outline-hidden cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Assignee:</span>
            <select
              value={filters.assigneeId || 'all'}
              onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value as any })}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg outline-hidden cursor-pointer"
            >
              <option value="all">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Create Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            id="btn-list-add-task"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Table S5 list view */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="project-list-table">
            
            {/* Table Headers */}
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
              <tr>
                <th className="py-3 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1.5">
                    Task Details
                    {sortField === 'title' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="py-3 px-6">Assignee</th>
                <th className="py-3 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1.5">
                    Priority
                    {sortField === 'priority' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="py-3 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1.5">
                    Status
                    {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="py-3 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('deadline')}>
                  <div className="flex items-center gap-1.5">
                    Deadline
                    {sortField === 'deadline' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="py-3 px-6 text-center">Comments</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium italic bg-slate-50/20">
                    No tasks match the active board filters.
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const taskComments = comments.filter(c => c.taskId === task.id);
                  const deadlineAlert = getDeadlineAlertState(task.deadline, task.status);

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      id={`list-task-row-${task.id}`}
                    >
                      {/* Name / ID */}
                      <td className="py-4 px-6 font-semibold text-slate-900 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400">{task.id}</span>
                            <h4 className="text-sm font-semibold truncate hover:text-blue-600 transition-colors">{task.title}</h4>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-400 font-normal truncate max-w-xs">{task.description}</p>
                          )}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="py-4 px-6">
                        {task.assigneeIds && task.assigneeIds.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                              {task.assigneeIds.map(id => {
                                const user = users.find(u => u.id === id);
                                if (!user) return null;
                                return (
                                  <div 
                                    key={user.id}
                                    className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white shrink-0 select-none shadow-xs"
                                    style={{ backgroundColor: user.avatarColor }}
                                    title={`${user.name} - ${user.role}`}
                                  >
                                    {user.initials}
                                  </div>
                                );
                              })}
                            </div>
                            <span className="font-medium text-slate-500 hidden sm:inline truncate max-w-[150px]">
                              {task.assigneeIds.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-6">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Status Dropdown selector */}
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => updateTask({ ...task, status: e.target.value as TaskStatus })}
                          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-1 px-2.5 rounded-lg focus:border-blue-500 outline-hidden cursor-pointer"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="done">Done</option>
                        </select>
                      </td>

                      {/* Deadline Countdown */}
                      <td className="py-4 px-6 font-semibold">
                        {task.deadline ? (
                          <div className={`text-[11px] font-semibold flex items-center gap-1.5 w-fit p-1 rounded-md border ${
                            task.status === 'done'
                              ? 'bg-slate-50 text-slate-400 border-slate-100'
                              : deadlineAlert === 'overdue'
                                ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                                : deadlineAlert === 'soon'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{formatDeadlineFriendly(task.deadline)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">No deadline</span>
                        )}
                      </td>

                      {/* Comments count */}
                      <td className="py-4 px-6 text-center font-bold text-slate-500">
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{taskComments.length}</span>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Task builder Modal */}
      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

    </div>
  );
};
