/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { KanbanBoard } from './KanbanBoard';
import { ListView } from './ListView';
import { Grid, List as ListIcon, Trash2, Users, AlertCircle, ArrowLeft, X, UserPlus, Plus } from 'lucide-react';
import { CreateTaskModal } from './CreateTaskModal';

interface ProjectWorkspaceProps {
  projectId: string;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId }) => {
  const { 
    projects, 
    users, 
    deleteProject, 
    updateProject,
    currentUserId,
    currentUser,
    allowMemberProjectDeletion,
    setSelectedProjectId, 
    setCurrentTab 
  } = useTaskFlow();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditMembersOpen, setIsEditMembersOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const project = projects.find(p => p.id === projectId);

  const isAdmin = currentUser?.id === 'u1' || currentUser?.role === 'Workspace Administrator' || currentUser?.role?.toLowerCase().includes('admin');
  const canDeleteProject = allowMemberProjectDeletion || isAdmin;

  useEffect(() => {
    if (isEditMembersOpen && project) {
      setSelectedMemberIds(project.memberIds);
    }
  }, [isEditMembersOpen, project]);

  if (!project) {
    return (
      <div className="py-12 text-center bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Project Not Found</h3>
        <p className="text-xs text-slate-400">The project you are looking for has been removed or does not exist.</p>
        <button 
          onClick={() => { setSelectedProjectId(null); setCurrentTab('projects'); }}
          className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  // Map member details
  const projectMembers = users.filter(u => project.memberIds.includes(u.id));

  const handleMemberToggle = (userId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveMembers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    updateProject({
      ...project,
      memberIds: selectedMemberIds,
    });
    setIsEditMembersOpen(false);
  };

  const handleDelete = () => {
    deleteProject(project.id);
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Header Panel */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        
        {/* Color bar indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: project.color }} />

        {/* Info detail */}
        <div className="space-y-2 pl-2">
          {/* Back button */}
          <button 
            onClick={() => { setSelectedProjectId(null); }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Projects
          </button>
          
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
            {project.name}
          </h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
        </div>

        {/* Members & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pl-2 md:pl-0">
          
          {/* Avatar stack */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Team:
            </span>
            <div className="flex -space-x-1.5 overflow-hidden mr-1">
              {projectMembers.map((member) => (
                <div
                  key={member.id}
                  className="h-6.5 w-6.5 rounded-full border border-white flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-xs"
                  style={{ backgroundColor: member.avatarColor }}
                  title={`${member.name} - ${member.role}`}
                >
                  {member.initials}
                </div>
              ))}
            </div>
            
            {/* Manage members button */}
            <button
              onClick={() => setIsEditMembersOpen(true)}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/40 px-2 py-1 rounded-md transition-all cursor-pointer shadow-xs shrink-0"
              title="Change members involved in this project"
              id="btn-manage-members"
            >
              <UserPlus className="h-3 w-3" />
              Manage
            </button>
          </div>

          {/* Delete triggers */}
          {canDeleteProject && (
            showDeleteConfirm ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-1.5 rounded-lg animate-in fade-in slide-in-from-top-1">
                <span className="text-[10px] text-rose-700 font-bold px-1.5">Delete project?</span>
                <button 
                  onClick={handleDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Yes
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-md transition-colors cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                title="Delete Project"
                id="btn-delete-project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )
          )}

        </div>

        {/* Board vs List Toggle (Segmented Control) + Add Task Button */}
        <div className="border-t border-slate-100 md:border-0 pt-4 md:pt-0 w-full md:w-auto flex flex-wrap items-center gap-3 justify-start pl-2 md:pl-0 shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 shadow-inner select-none">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'board' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              id="btn-toggle-board"
            >
              <Grid className="h-3.5 w-3.5" />
              Board View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              id="btn-toggle-list"
            >
              <ListIcon className="h-3.5 w-3.5" />
              List View
            </button>
          </div>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            id="btn-project-add-task"
            title="Add a new task to this project"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>

      </div>

      {/* Render Active View Layout */}
      <div className="transition-all duration-150">
        {viewMode === 'board' ? (
          <KanbanBoard projectId={projectId} />
        ) : (
          <ListView projectId={projectId} />
        )}
      </div>

      {/* Manage Project Members Modal */}
      {isEditMembersOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setIsEditMembersOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
            id="manage-members-modal"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Manage Project Members
              </h2>
              <button
                onClick={() => setIsEditMembersOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveMembers} className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-700">Project: {project.name}</h3>
                <p className="text-[11px] text-slate-400 font-medium">Select which team members should be involved in this project board.</p>
              </div>

              {/* Member Checklist Multi-Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Assign Team Members
                </label>
                <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-56 overflow-y-auto bg-slate-50/50">
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
                            className="h-6.5 w-6.5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: u.avatarColor }}
                          >
                            {u.initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block leading-tight">
                              {u.name} {isCurrent && <span className="text-[10px] text-blue-600 font-semibold">(You)</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">{u.role}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleMemberToggle(u.id)}
                          className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditMembersOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                  id="btn-save-project-members"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal wrapper */}
      <CreateTaskModal 
        isOpen={isCreateTaskOpen} 
        onClose={() => setIsCreateTaskOpen(false)} 
        defaultStatus="todo" 
      />

    </div>
  );
};
