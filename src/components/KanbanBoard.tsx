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
  Filter, 
  Search,
  Grid,
  List as ListIcon,
  Settings,
  MoreVertical,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { getDeadlineAlertState, formatDeadlineFriendly } from '../utils/dateUtils';
import { CreateTaskModal } from './CreateTaskModal';

interface KanbanBoardProps {
  projectId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const { 
    tasks, 
    users, 
    updateTask, 
    setSelectedTaskId,
    filters,
    setFilters
  } = useTaskFlow();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('todo');
  const [searchWord, setSearchWord] = useState('');

  // 1. Filter tasks by active project
  const projectTasks = tasks.filter(t => t.projectId === projectId);

  // 2. Apply Toolbar Filters & live text search word
  const filteredTasks = projectTasks.filter(task => {
    // Search word match
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

  // Native HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual feedback class when dragging
    const target = e.currentTarget as HTMLElement;
    target.classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-40');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const matchedTask = tasks.find(t => t.id === taskId);
    if (matchedTask && matchedTask.status !== targetStatus) {
      updateTask({ ...matchedTask, status: targetStatus });
    }
  };

  // Open Create task modal with specific default status column clicked
  const handleOpenCreateWithStatus = (colStatus: TaskStatus) => {
    setCreateDefaultStatus(colStatus);
    setIsCreateOpen(true);
  };

  // Predefined Column mapping
  const columns: { id: TaskStatus; label: string; headerColor: string; bgBadge: string }[] = [
    { id: 'todo', label: 'To Do', headerColor: 'text-slate-500', bgBadge: 'bg-slate-100 text-slate-700' },
    { id: 'in_progress', label: 'In Progress', headerColor: 'text-blue-600', bgBadge: 'bg-blue-50 text-blue-700' },
    { id: 'in_review', label: 'In Review', headerColor: 'text-amber-600', bgBadge: 'bg-amber-50 text-amber-700' },
    { id: 'done', label: 'Done', headerColor: 'text-emerald-600', bgBadge: 'bg-emerald-50 text-emerald-700' },
  ];

  const priorityBadgeStyle = (pr: Priority) => {
    switch (pr) {
      case 'low': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'medium': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'high': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'urgent': return 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse font-semibold';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Live Project Filter Search Textbox */}
        <div className="relative w-full md:w-72 shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search this board..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 placeholder-slate-400 text-xs pl-9 pr-4 py-2 rounded-lg outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters Select boxes */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Priority Select filter */}
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

          {/* Assignee Select filter */}
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

          {/* Reset Filters */}
          {(filters.priority !== 'all' || filters.assigneeId !== 'all' || searchWord !== '') && (
            <button
              onClick={() => {
                setFilters({ status: 'all', priority: 'all', assigneeId: 'all' });
                setSearchWord('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Kanban Layout Scroll Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4 items-start">
        {columns.map((col) => {
          // Filter tasks belonging to this column status
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              id={`column-${col.id}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-50 rounded-xl border border-slate-200/60 p-4 flex flex-col min-h-[450px] shrink-0"
            >
              {/* Column Title with count details */}
              <div className="flex items-center justify-between pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold ${col.headerColor}`}>{col.label}</h3>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${col.bgBadge}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Add Quick Card Trigger */}
                <button
                  onClick={() => handleOpenCreateWithStatus(col.id)}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all cursor-pointer"
                  title={`Add task to ${col.label}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Stack of Cards (S4) */}
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[500px] pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="h-20 rounded-lg border border-dashed border-slate-200/80 flex items-center justify-center text-xs text-slate-400 font-medium italic">
                    Drop tasks here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const deadlineAlert = getDeadlineAlertState(task.deadline, task.status);

                    return (
                      <div
                        key={task.id}
                        id={`task-card-${task.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md p-3.5 space-y-3 cursor-grab active:cursor-grabbing transition-all duration-150 group relative"
                      >
                        {/* Priority Banner and Task ID */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${priorityBadgeStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-300 font-mono group-hover:text-slate-400 transition-colors">
                            {task.id}
                          </span>
                        </div>

                        {/* Task Title and Description snippet */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Footer details: Assignee avatar, Deadline warning badge, Fallback select */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                          
                          {/* Deadline chip (overdue is red, soon is amber, neutral is slate) */}
                          {task.deadline ? (
                            <div className={`text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded border ${
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
                            <div className="text-[10px] text-slate-300 italic">No date</div>
                          )}

                          {/* Multiple Assignees Avatars */}
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {task.assigneeIds && task.assigneeIds.length > 0 ? (
                              task.assigneeIds.map(id => {
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
                              })
                            ) : (
                              <div 
                                className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 select-none"
                                title="Unassigned"
                              >
                                <UserIcon className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Touch Screen Dropdown Fallback selector */}
                        <div 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={task.status}
                            onChange={(e) => updateTask({ ...task, status: e.target.value as TaskStatus })}
                            className="bg-slate-100 border-0 text-[10px] font-semibold text-slate-500 py-0.5 px-1.5 rounded-md outline-hidden cursor-pointer"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="in_review">In Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal wrapper */}
      <CreateTaskModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        defaultStatus={createDefaultStatus} 
      />

    </div>
  );
};
