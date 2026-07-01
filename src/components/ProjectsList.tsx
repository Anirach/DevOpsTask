/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Project } from '../types';
import { Plus, Folder, Calendar, Users, ChevronRight, BarChart } from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';

export const ProjectsList: React.FC = () => {
  const { projects, tasks, users, setSelectedProjectId, setCurrentTab } = useTaskFlow();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Click a card to navigate to project workspace
  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    setCurrentTab('projects');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Browse Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, view, and plan collaborate boards for your team's initiatives.</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-blue-600/10 cursor-pointer"
          id="btn-new-project"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Grid of Projects (3 columns on desktop, 2 on tablet, 1 on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          // Calculate tasks metrics for this project
          const projectTasks = tasks.filter(t => t.projectId === proj.id);
          const totalTasksCount = projectTasks.length;
          const completedTasksCount = projectTasks.filter(t => t.status === 'done').length;
          const progressPercent = totalTasksCount > 0 
            ? Math.round((completedTasksCount / totalTasksCount) * 100) 
            : 0;

          // Map member avatars
          const projectMembers = users.filter(u => proj.memberIds.includes(u.id));

          return (
            <div
              key={proj.id}
              id={`project-card-${proj.id}`}
              onClick={() => handleProjectSelect(proj.id)}
              className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between overflow-hidden relative"
            >
              {/* Project Card Color Bar Accent */}
              <div 
                className="h-1.5 w-full shrink-0" 
                style={{ backgroundColor: proj.color || '#2563EB' }}
              />

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1">
                
                {/* Name & Date */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                      {proj.name}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Created {new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 h-8">
                  {proj.description || 'No description provided for this initiative.'}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <BarChart className="h-3 w-3" />
                      Progress
                    </span>
                    <span className="text-slate-700 font-mono">
                      {completedTasksCount}/{totalTasksCount} done ({progressPercent}%)
                    </span>
                  </div>
                  {/* Outer Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    {/* Inner Bar */}
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progressPercent}%`, 
                        backgroundColor: proj.color || '#2563EB' 
                      }}
                    />
                  </div>
                </div>

              </div>

              {/* Card Footer: Members Stack */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Collaborators
                </span>

                {/* Stacked Avatars cluster */}
                <div className="flex -space-x-2.5 overflow-hidden">
                  {projectMembers.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-xs shrink-0 select-none hover:scale-110 hover:z-10 transition-transform"
                      style={{ backgroundColor: member.avatarColor }}
                      title={`${member.name} - ${member.role}`}
                    >
                      {member.initials}
                    </div>
                  ))}
                  {projectMembers.length > 4 && (
                    <div 
                      className="h-6 w-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-600 text-[9px] font-bold shrink-0 select-none"
                      title={`${projectMembers.length - 4} more collaborators`}
                    >
                      +{projectMembers.length - 4}
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

    </div>
  );
};
