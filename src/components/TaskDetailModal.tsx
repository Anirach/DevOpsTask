/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, Priority, TaskStatus, User } from '../types';
import { 
  X, 
  Trash2, 
  Calendar, 
  User as UserIcon, 
  AlertTriangle, 
  MessageSquare, 
  Send,
  Folder,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { getDeadlineAlertState, formatDeadlineFriendly, formatRelativeTime } from '../utils/dateUtils';

export const TaskDetailModal: React.FC = () => {
  const { 
    selectedTaskId, 
    setSelectedTaskId, 
    tasks, 
    updateTask, 
    deleteTask, 
    comments, 
    addComment, 
    users, 
    projects,
    currentUserId
  } = useTaskFlow();

  const task = tasks.find(t => t.id === selectedTaskId);
  const project = task ? projects.find(p => p.id === task.projectId) : null;
  const currentAssignees = task ? users.filter(u => task.assigneeIds?.includes(u.id)) : [];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync state with selected task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeIds(task.assigneeIds || []);
      setDeadline(task.deadline);
      setShowDeleteConfirm(false);
    }
  }, [task, selectedTaskId]);

  // Handle escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTaskId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedTaskId]);

  if (!task) return null;

  // Filter comments for this task
  const taskComments = comments
    .filter(c => c.taskId === task.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Show quick status toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2000);
  };

  // Save changes back to context on edit actions
  const handleFieldChange = (updates: Partial<Task>) => {
    const updatedTask = { ...task, ...updates } as Task;
    updateTask(updatedTask);
    triggerToast('Changes saved.');
  };

  // Submit comment
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment(task.id, newComment.trim());
    setNewComment('');
    triggerToast('Comment added.');
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setSelectedTaskId(null);
  };

  // Helpers for alert coloring
  const deadlineAlert = getDeadlineAlertState(deadline, status);
  const deadlineBadgeClass = () => {
    if (status === 'done') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (deadlineAlert === 'overdue') return 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
    if (deadlineAlert === 'soon') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-100',
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
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={() => setSelectedTaskId(null)}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        id="task-detail-modal"
      >
        {/* Quick Toast */}
        {isToastVisible && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold z-50 flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Folder className="h-3.5 w-3.5" style={{ color: project?.color }} />
            <span>{project?.name || 'Project'}</span>
            <span>/</span>
            <span className="font-mono text-slate-400">{task.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Delete Trigger */}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                <span className="text-xs text-rose-700 font-medium px-1">Delete task?</span>
                <button 
                  onClick={handleDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-2.5 py-1 rounded-md transition-colors"
                >
                  Yes
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Delete Task"
                id="btn-delete-task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Close Modal"
              id="btn-close-modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT: Task Content & Discussion (Col span 2) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Task Title (Inline-Editable) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && title.trim() !== task.title) {
                    handleFieldChange({ title: title.trim() });
                  } else {
                    setTitle(task.title);
                  }
                }}
                className="w-full text-xl font-bold text-slate-900 border-0 border-b border-transparent hover:border-slate-200 focus:border-blue-500 py-1 focus:ring-0 rounded-none outline-hidden transition-all px-0"
                placeholder="Name of the task..."
              />
            </div>

            {/* Task Description (Inline-Editable) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description !== task.description) {
                    handleFieldChange({ description });
                  }
                }}
                rows={4}
                className="w-full text-sm text-slate-700 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-3 outline-hidden transition-all placeholder-slate-400 resize-none"
                placeholder="What is this task about? Provide clear guidelines..."
              />
            </div>

            {/* S6: Comments Thread */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                Comments ({taskComments.length})
              </h3>

              {/* Thread list */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {taskComments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No comments posted yet. Start the conversation!</p>
                ) : (
                  taskComments.map((c) => {
                    const author = users.find(u => u.id === c.authorId);
                    return (
                      <div key={c.id} className="flex gap-3 text-sm group">
                        <div 
                          className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                          style={{ backgroundColor: author?.avatarColor || '#64748B' }}
                        >
                          {author?.initials || '?'}
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 flex-1 border border-slate-100/70">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-xs text-slate-800">{author?.name || 'Unknown User'}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed break-words">{c.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Composer */}
              <form onSubmit={handleCommentSubmit} className="flex gap-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 outline-hidden transition-all placeholder-slate-400 resize-none"
                  placeholder="Write a comment..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 px-3 py-2 rounded-lg transition-all flex items-center justify-center shrink-0 self-end shadow-sm cursor-pointer"
                  title="Submit Comment"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Meta Side panel */}
          <div className="space-y-5 bg-slate-50/50 p-4 rounded-xl border border-slate-100 h-fit">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metadata</h3>

            {/* Assignees Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                Assignees
              </label>
              <div className="flex flex-col gap-1.5 p-2 rounded-lg border border-slate-200 bg-white max-h-48 overflow-y-auto">
                {users.map(u => {
                  const isSelected = assigneeIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        let nextIds;
                        if (isSelected) {
                          nextIds = assigneeIds.filter(id => id !== u.id);
                        } else {
                          nextIds = [...assigneeIds, u.id];
                        }
                        setAssigneeIds(nextIds);
                        handleFieldChange({ assigneeIds: nextIds });
                      }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-1">
                        <div 
                          className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 font-sans"
                          style={{ backgroundColor: u.avatarColor }}
                        >
                          {u.initials}
                        </div>
                        <span className="truncate text-[11px]">{u.name}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // toggled by button onClick
                        className="h-3.5 w-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as TaskStatus;
                  setStatus(val);
                  handleFieldChange({ status: val });
                }}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden cursor-pointer"
                id="select-status"
              >
                {(['todo', 'in_progress', 'in_review', 'done'] as TaskStatus[]).map(st => (
                  <option key={st} value={st}>
                    {statusLabels[st]}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-400" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  const val = e.target.value as Priority;
                  setPriority(val);
                  handleFieldChange({ priority: val });
                }}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden cursor-pointer"
                id="select-priority"
              >
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map(pr => (
                  <option key={pr} value={pr} className="capitalize">
                    {pr}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => {
                  const val = e.target.value;
                  setDeadline(val);
                  handleFieldChange({ deadline: val });
                }}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden cursor-pointer"
              />
              {deadline && (
                <div className={`mt-2 p-2 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${deadlineBadgeClass()}`}>
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatDeadlineFriendly(deadline)}</span>
                </div>
              )}
            </div>

            {/* Creation Audit */}
            <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 space-y-1 font-mono">
              <p>Created: {new Date(task.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
