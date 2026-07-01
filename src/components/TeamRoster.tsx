/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Mail, Briefcase, CheckSquare, Clock } from 'lucide-react';

export const TeamRoster: React.FC = () => {
  const { users, tasks } = useTaskFlow();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Directory</h1>
        <p className="text-sm text-slate-500 mt-1">Review team members, roles, and load indicators across all active workspaces.</p>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((member) => {
          // Calculate tasks count for this user across all projects
          const memberTasks = tasks.filter(t => t.assigneeIds?.includes(member.id));
          const activeTasksCount = memberTasks.filter(t => t.status !== 'done').length;
          const completedTasksCount = memberTasks.filter(t => t.status === 'done').length;

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
              id={`member-card-${member.id}`}
            >
              {/* Profile Meta Info */}
              <div className="flex items-start gap-4">
                {/* Large colored avatar */}
                <div 
                  className="h-14 w-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0 select-none"
                  style={{ backgroundColor: member.avatarColor }}
                >
                  {member.initials}
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 truncate leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    {member.email}
                  </p>
                </div>
              </div>

              {/* Dynamic workload indicators */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 grid grid-cols-2 gap-4 divide-x divide-slate-200/60 shrink-0">
                
                {/* Active Tasks column */}
                <div className="space-y-0.5 text-center sm:text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Tasks</p>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-base font-extrabold text-slate-800">{activeTasksCount}</span>
                  </div>
                </div>

                {/* Completed Tasks column */}
                <div className="space-y-0.5 pl-4 text-center sm:text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-base font-extrabold text-slate-800">{completedTasksCount}</span>
                  </div>
                </div>

              </div>
              
              {/* Load Warning indicator */}
              <div className="text-[10px] text-slate-400 font-medium italic shrink-0">
                {activeTasksCount > 4 
                  ? '⚠️ High workload load indicator' 
                  : activeTasksCount === 0 
                    ? '✨ Fully available for assignments' 
                    : '🟢 Stable workload load indicator'}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
