/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { KanbanBoard } from './KanbanBoard';
import { ListView } from './ListView';
import { Grid, List as ListIcon, Trash2, Users, AlertCircle, ArrowLeft } from 'lucide-react';

interface ProjectWorkspaceProps {
  projectId: string;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId }) => {
  const { 
    projects, 
    users, 
    deleteProject, 
    setSelectedProjectId, 
    setCurrentTab 
  } = useTaskFlow();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const project = projects.find(p => p.id === projectId);

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
            <div className="flex -space-x-1.5 overflow-hidden">
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
          </div>

          {/* Delete triggers */}
          {showDeleteConfirm ? (
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
          )}

        </div>

        {/* Board vs List Toggle (Segmented Control) */}
        <div className="border-t border-slate-100 md:border-0 pt-4 md:pt-0 w-full md:w-auto flex justify-start pl-2 md:pl-0 shrink-0">
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

    </div>
  );
};
