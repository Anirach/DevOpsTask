/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { X, Plus, FolderPlus, Info } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROJECT_COLORS = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#F59E0B', // Amber
  '#DC2626', // Red
  '#7C3AED', // Violet
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject, projects, users, currentUserId, setSelectedProjectId, setCurrentTab } = useTaskFlow();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedColor(PROJECT_COLORS[0]);
      setSelectedMemberIds([currentUserId]); // Always include self
      setErrors({});

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, currentUserId]);

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

  // Validate Project Name
  const handleNameChange = (val: string) => {
    setName(val);
    const newErrors = { ...errors };

    if (!val.trim()) {
      newErrors.name = 'Project name is required.';
    } else if (val.length > 60) {
      newErrors.name = 'Keep it under 60 characters.';
    } else {
      const isDuplicate = projects.some(p => p.name.toLowerCase().trim() === val.toLowerCase().trim());
      if (isDuplicate) {
        newErrors.name = 'A project with this name already exists.';
      } else {
        delete newErrors.name;
      }
    }

    setErrors(newErrors);
  };

  // Toggle member selections
  const handleMemberToggle = (userId: string) => {
    // Current user should always be locked in as a project member
    if (userId === currentUserId) return;

    setSelectedMemberIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final checks
    const finalErrors: { name?: string } = {};
    if (!name.trim()) {
      finalErrors.name = 'Project name is required.';
    } else if (name.length > 60) {
      finalErrors.name = 'Keep it under 60 characters.';
    } else {
      const isDuplicate = projects.some(p => p.name.toLowerCase().trim() === name.toLowerCase().trim());
      if (isDuplicate) {
        finalErrors.name = 'A project with this name already exists.';
      }
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    // Call add project
    const created = addProject({
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
      memberIds: selectedMemberIds,
    });

    onClose();

    // Route directly to Board View of the newly created project
    setSelectedProjectId(created.id);
    setCurrentTab('projects');
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="create-project-modal"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-blue-600" />
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Project Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              ref={nameInputRef}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Marketing Revamp Q3"
              className={`w-full bg-white border ${
                errors.name ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              } rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 outline-hidden transition-all`}
              id="input-project-name"
              required
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">
              Short Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A brief overview of the project objectives..."
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-blue-100 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Predefined Colors Swatches */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              Project Accent Color
            </label>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {PROJECT_COLORS.map((hexColor) => (
                <button
                  key={hexColor}
                  type="button"
                  onClick={() => setSelectedColor(hexColor)}
                  className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    selectedColor === hexColor 
                      ? 'border-slate-900 ring-2 ring-slate-200 scale-110' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: hexColor }}
                  title={hexColor}
                />
              ))}
            </div>
          </div>

          {/* Member Checklist Multi-Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              Assign Team Members
            </label>
            <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-36 overflow-y-auto bg-slate-50/50">
              {users.map((u) => {
                const isCurrent = u.id === currentUserId;
                const isChecked = selectedMemberIds.includes(u.id);
                return (
                  <label 
                    key={u.id}
                    className="flex items-center justify-between p-1.5 rounded-md hover:bg-white text-xs text-slate-700 cursor-pointer select-none transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.initials}
                      </div>
                      <span className="font-medium text-slate-800">
                        {u.name} {isCurrent && <span className="text-[10px] text-blue-600 font-semibold">(You)</span>}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isCurrent} // Always forced to belong to the project you build
                      onChange={() => handleMemberToggle(u.id)}
                      className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
              <Info className="h-3 w-3 shrink-0" />
              <span>Project creator is added by default.</span>
            </div>
          </div>

          {/* Actions */}
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
              disabled={!!errors.name}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
              id="btn-submit-project"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
