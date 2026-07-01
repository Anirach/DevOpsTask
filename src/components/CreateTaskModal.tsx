/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Priority, TaskStatus } from '../types';
import { X, Calendar, User as UserIcon, AlertTriangle, Plus, Clipboard } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, defaultStatus = 'todo' }) => {
  const { addTask, users, projects, selectedProjectId } = useTaskFlow();

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [deadline, setDeadline] = useState('');

  // Validations & Errors
  const [errors, setErrors] = useState<{ title?: string; deadline?: string }>({});
  const [showPastWarning, setShowPastWarning] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync defaults on open
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setAssigneeIds([]);
      setPriority('medium');
      setStatus(defaultStatus);
      setDeadline('');
      setErrors({});
      setShowPastWarning(false);

      if (selectedProjectId) {
        setProjectId(selectedProjectId);
      } else if (projects.length > 0) {
        setProjectId(projects[0].id);
      } else {
        setProjectId('');
      }

      // Auto-focus title
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, selectedProjectId, projects, defaultStatus]);

  // Handle escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validate fields
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const newErrors = { ...errors };
    if (!val.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (val.length > 120) {
      newErrors.title = 'Keep it under 120 characters.';
    } else {
      delete newErrors.title;
    }
    setErrors(newErrors);
  };

  const handleDeadlineChange = (val: string) => {
    setDeadline(val);
    const newErrors = { ...errors };
    if (!val) {
      delete newErrors.deadline;
      setShowPastWarning(false);
      setErrors(newErrors);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(val);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() < today.getTime()) {
      setShowPastWarning(true);
    } else {
      setShowPastWarning(false);
    }
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final validate checks
    const finalErrors: { title?: string } = {};
    if (!title.trim()) {
      finalErrors.title = 'Task title is required.';
    } else if (title.length > 120) {
      finalErrors.title = 'Keep it under 120 characters.';
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    // Call add task
    addTask({
      projectId,
      title: title.trim(),
      description: description.trim(),
      assigneeIds,
      priority,
      status,
      deadline,
      order: 1, // Default order
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="create-task-modal"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Project Selection */}
          {!selectedProjectId && projects.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">
                Target Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden cursor-pointer"
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Task Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              ref={titleInputRef}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Implement responsive layouts"
              className={`w-full bg-white border ${
                errors.title ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              } rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 outline-hidden transition-all`}
              id="input-task-title"
              required
            />
            {errors.title && (
              <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What needs to be done? Provide clear instructions..."
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-blue-100 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Multiple Assignees Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 text-slate-400" />
              Assignees <span className="text-[10px] text-slate-400 font-normal">(Select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 min-h-[48px]">
              {users.map(u => {
                const isSelected = assigneeIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setAssigneeIds(prev => prev.filter(id => id !== u.id));
                      } else {
                        setAssigneeIds(prev => [...prev, u.id]);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer select-none ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div 
                      className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: isSelected ? '#ffffff2b' : u.avatarColor }}
                    >
                      {u.initials}
                    </div>
                    <span>{u.name}</span>
                  </button>
                );
              })}
              {users.length === 0 && (
                <span className="text-xs text-slate-400 italic">No team members available.</span>
              )}
            </div>
          </div>

          {/* Two Columns for Meta Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 outline-hidden cursor-pointer"
                id="input-task-status"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-400" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 outline-hidden cursor-pointer"
                id="input-task-priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Deadline Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* Past Date Warning Notice */}
          {showPastWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                That date is in the past — is that intended? The task will still be created, but flagged as overdue.
              </span>
            </div>
          )}

          {/* Form Actions */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!errors.title}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
              id="btn-submit-task"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
