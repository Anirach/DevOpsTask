/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { User, Project } from '../types';
import { 
  ShieldCheck, 
  Users, 
  FolderKanban, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  Mail, 
  Briefcase, 
  Settings, 
  CheckSquare, 
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    users,
    projects,
    tasks,
    comments,
    currentUserId,
    addUser,
    updateUser,
    deleteUser,
    deleteProject,
    allowMemberProjectCreation,
    setAllowMemberProjectCreation,
    allowMemberProjectDeletion,
    setAllowMemberProjectDeletion,
    resetToDefault
  } = useTaskFlow();

  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'team' | 'projects'>('settings');

  // Form states for adding user
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserColor, setNewUserColor] = useState('#2563EB');

  // Editing user states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserColor, setEditUserColor] = useState('#2563EB');

  const AVATAR_COLORS = [
    '#2563EB', // Blue
    '#16A34A', // Green
    '#F59E0B', // Amber
    '#DC2626', // Red
    '#7C3AED', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#14B8A6'  // Teal
  ];

  // System Stats
  const totalUsers = users.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const totalComments = comments.length;

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserRole.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole.trim(),
      avatarColor: newUserColor
    });

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('');
    setNewUserColor('#2563EB');
    setIsAddingUser(false);
  };

  const startEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserColor(user.avatarColor);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserName.trim() || !editUserEmail.trim() || !editUserRole.trim() || !editingUserId) return;

    updateUser({
      id: editingUserId,
      name: editUserName.trim(),
      email: editUserEmail.trim(),
      role: editUserRole.trim(),
      avatarColor: editUserColor,
      initials: '' // initials will be recalculated in context
    });

    setEditingUserId(null);
  };

  const handleResetConfirm = () => {
    if (window.confirm('Are you absolutely sure you want to reset the system workspace database to default? All custom tasks, projects, and users will be reset.')) {
      resetToDefault();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Console</h1>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                System Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Configure workspace rules, manage team accounts, and monitor project board telemetry.</p>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/40 shrink-0 self-start md:self-center">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Settings & Policies
          </button>
          <button
            onClick={() => setActiveSubTab('team')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'team'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Manage Team ({users.length})
          </button>
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'projects'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Projects Master
          </button>
        </div>
      </div>

      {/* --- Tab 1: Settings & Policies --- */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Key Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Team</span>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalUsers}</span>
                <span className="text-xs text-slate-400 font-medium">accounts</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Projects</span>
                <FolderKanban className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalProjects}</span>
                <span className="text-xs text-slate-400 font-medium">active</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
                <CheckSquare className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalTasks}</span>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  ({tasks.filter(t => t.status === 'done').length} done)
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comments</span>
                <MessageSquare className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalComments}</span>
                <span className="text-xs text-slate-400 font-medium">posted</span>
              </div>
            </div>

          </div>

          {/* System Policies */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-blue-600" />
                Workspace Permissions Policies
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Configure global workspace constraints to restrict actions for non-administrator team members.</p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Policy 1 */}
                <div className="flex items-start justify-between gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200/50">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block cursor-pointer" htmlFor="toggle-project-creation">
                      Allow Members to Create Projects
                    </label>
                    <span className="text-[11px] text-slate-400 block font-medium leading-normal">
                      When enabled, any team member can create new project initiatives. When disabled, only system administrators can create projects.
                    </span>
                  </div>
                  <button
                    id="toggle-project-creation"
                    onClick={() => setAllowMemberProjectCreation(!allowMemberProjectCreation)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      allowMemberProjectCreation ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        allowMemberProjectCreation ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Policy 2 */}
                <div className="flex items-start justify-between gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200/50">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block cursor-pointer" htmlFor="toggle-project-deletion">
                      Allow Members to Delete Projects
                    </label>
                    <span className="text-[11px] text-slate-400 block font-medium leading-normal">
                      When enabled, project boards can be deleted by team members involved in them. When disabled, only Administrators can delete project boards.
                    </span>
                  </div>
                  <button
                    id="toggle-project-deletion"
                    onClick={() => setAllowMemberProjectDeletion(!allowMemberProjectDeletion)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      allowMemberProjectDeletion ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        allowMemberProjectDeletion ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Reset Database Zone */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="px-6 py-4 border-b border-slate-100 bg-rose-50/20">
              <h2 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-600" />
                Administrative Utility Zone
              </h2>
            </div>
            
            <div className="p-6 space-y-4 flex-1">
              <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-100 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold text-rose-800">Danger: Reset Database</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-normal font-medium">
                  This action immediately wipes all local changes made to projects, tasks, comments, and members, restoring the application state to default mock telemetry.
                </p>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal font-medium">
                Ensure you have exported or noted down any essential initiatives before proceeding. This operation is client-side irreversible.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleResetConfirm}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm cursor-pointer shadow-rose-600/15"
                id="btn-admin-reset-db"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset System Database
              </button>
            </div>
          </div>

        </div>
      )}

      {/* --- Tab 2: Manage Team --- */}
      {activeSubTab === 'team' && (
        <div className="space-y-6">
          
          {/* Add team member card toggle */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-blue-600" />
                Team Accounts Directory
              </h2>
              {!isAddingUser && (
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                  id="btn-admin-add-user-trigger"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Team Member
                </button>
              )}
            </div>

            {/* Add User Form overlay/expansion */}
            {isAddingUser && (
              <form onSubmit={handleAddUserSubmit} className="p-6 border-b border-slate-100 bg-blue-50/10 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Create New Workspace Account</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Liam Baker"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      id="input-add-user-name"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="liam@taskflow.app"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      id="input-add-user-email"
                    />
                  </div>

                  {/* Role field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Professional Role</label>
                    <input
                      type="text"
                      required
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      placeholder="e.g. Backend Developer"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      id="input-add-user-role"
                    />
                  </div>
                </div>

                {/* Color and controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-600 block">Avatar Branding Accent</span>
                    <div className="flex items-center gap-2">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewUserColor(c)}
                          className={`h-6 w-6 rounded-full transition-all border shrink-0 cursor-pointer ${
                            newUserColor === c 
                              ? 'border-slate-800 scale-110 ring-2 ring-slate-400/40' 
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end">
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                      id="btn-admin-submit-user"
                    >
                      Save Account
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Users Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">User Profile</th>
                    <th className="px-6 py-3.5">System Identifier</th>
                    <th className="px-6 py-3.5">Email / Contacts</th>
                    <th className="px-6 py-3.5">Designated Role</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {users.map((u) => {
                    const isCurrentUser = u.id === currentUserId;
                    const isEditingThisUser = editingUserId === u.id;

                    if (isEditingThisUser) {
                      return (
                        <tr key={u.id} className="bg-blue-50/20">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                                style={{ backgroundColor: editUserColor }}
                              >
                                {u.initials}
                              </div>
                              <input
                                type="text"
                                required
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className="text-xs font-bold border border-slate-300 rounded-md p-1.5 bg-white w-40"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                            {u.id}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="email"
                              required
                              value={editUserEmail}
                              onChange={(e) => setEditUserEmail(e.target.value)}
                              className="text-xs border border-slate-300 rounded-md p-1.5 bg-white w-44"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              required
                              value={editUserRole}
                              onChange={(e) => setEditUserRole(e.target.value)}
                              className="text-xs border border-slate-300 rounded-md p-1.5 bg-white w-40"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Color picker dropdown substitute */}
                              <div className="flex items-center gap-1 mr-2">
                                {AVATAR_COLORS.map(c => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setEditUserColor(c)}
                                    className={`h-4 w-4 rounded-full border border-white shrink-0 ${editUserColor === c ? 'scale-110 ring-1 ring-slate-400' : ''}`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={handleEditUserSubmit}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                title="Confirm edits"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                title="Cancel editing"
                              >
                                <X className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-8.5 w-8.5 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs shrink-0"
                              style={{ backgroundColor: u.avatarColor }}
                            >
                              {u.initials}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block">
                                {u.name}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block mt-0.5">
                                  You (Session Owner)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[10px] text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40">
                            {u.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {u.email}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEditUser(u)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit user profile"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove team member ${u.name}? All tasks and memberships linked to this account will be cleaned up.`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              disabled={isCurrentUser}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isCurrentUser 
                                  ? 'text-slate-200 cursor-not-allowed' 
                                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={isCurrentUser ? 'Cannot delete yourself' : 'Delete user account'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 3: Projects Master --- */}
      {activeSubTab === 'projects' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FolderKanban className="h-4.5 w-4.5 text-blue-600" />
              Comprehensive Initiatives Master
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Project Details</th>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Members Enrolled</th>
                  <th className="px-6 py-3.5">Tasks breakdown</th>
                  <th className="px-6 py-3.5 text-right">System Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {projects.map((proj) => {
                  const projTasks = tasks.filter(t => t.projectId === proj.id);
                  const todoTasks = projTasks.filter(t => t.status === 'todo').length;
                  const inProgressTasks = projTasks.filter(t => t.status === 'in_progress').length;
                  const inReviewTasks = projTasks.filter(t => t.status === 'in_review').length;
                  const doneTasks = projTasks.filter(t => t.status === 'done').length;

                  return (
                    <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: proj.color || '#2563EB' }}
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {proj.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5 max-w-xs truncate">
                              {proj.description || 'No description provided.'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40">
                          {proj.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {proj.memberIds.length} members involved
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
                          <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded" title="To Do">{todoTasks} todo</span>
                          <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded" title="In Progress">{inProgressTasks} doing</span>
                          <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded" title="In Review">{inReviewTasks} review</span>
                          <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded" title="Done">{doneTasks} done</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you absolutely sure you want to FORCE DELETE project ${proj.name}? All tasks, comments, and project associations will be irreversibly erased.`)) {
                              deleteProject(proj.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Force delete project board"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
