/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Save, RefreshCw, CheckCircle, Info, ShieldAlert } from 'lucide-react';

const AVATAR_COLORS = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#F59E0B', // Amber
  '#DC2626', // Red
  '#7C3AED', // Violet
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const SettingsPanel: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, resetToDefault } = useTaskFlow();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  
  // Local notification toasts
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // App preferences (client-only mock configs)
  const [defaultView, setDefaultView] = useState<'board' | 'list'>('board');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Load profile values
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setRole(currentUser.role);
      setAvatarColor(currentUser.avatarColor);
    }
  }, [currentUser]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateCurrentUserProfile(name.trim(), email.trim(), role.trim(), avatarColor);
    triggerToast('Profile updated successfully.');
  };

  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('App preferences saved.');
  };

  const handleDatabaseReset = () => {
    if (window.confirm('This will wipe all custom updates and restore original demo projects, tasks, and users. Proceed?')) {
      resetToDefault();
      triggerToast('Database reset to defaults.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Toast alert */}
      {showToast && (
        <div className="fixed top-20 right-4 bg-slate-900 text-white text-xs font-semibold px-4.5 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 z-50">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">App Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your profile identity, accent themes, and personal preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* LEFT: Profile configurations (Col span 2) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile form */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-800">My Profile</h2>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 text-sm px-3.5 py-2 rounded-lg outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@taskflow.app"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 text-sm px-3.5 py-2 rounded-lg outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Position / Role */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Role / Designation</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Product Manager"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 text-sm px-3.5 py-2 rounded-lg outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Color swatch selection for profile avatar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Avatar Color Accent</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVATAR_COLORS.map((colorHex) => (
                    <button
                      key={colorHex}
                      type="button"
                      onClick={() => setAvatarColor(colorHex)}
                      className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        avatarColor === colorHex 
                          ? 'border-slate-900 ring-2 ring-slate-200 scale-105' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorHex }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Profile
                </button>
              </div>

            </form>
          </div>

          {/* Preferences form */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-800">Workspace Preferences</h2>
            
            <form onSubmit={handlePreferencesSave} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Default Board mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Default Projects View</label>
                  <select
                    value={defaultView}
                    onChange={(e) => setDefaultView(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg outline-hidden cursor-pointer"
                  >
                    <option value="board">Kanban Board (S4)</option>
                    <option value="list">Tabular List View (S5)</option>
                  </select>
                </div>

                {/* Theme choice */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Visual Appearance</label>
                  <select
                    value={themeMode}
                    onChange={(e) => setThemeMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg outline-hidden cursor-pointer"
                  >
                    <option value="light">Standard Light Mode</option>
                    <option value="dark">Cosmic Slate Mode (Stubbed)</option>
                  </select>
                </div>

              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Preferences
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* RIGHT: Developer rollback tool */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-800">Admin Operations</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              If you wish to restore the application's mock data back to its original demo state, you can reset the LocalStorage cache here.
            </p>

            <button
              onClick={handleDatabaseReset}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              id="btn-admin-reset"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Database Cache
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Environment Specs
            </h4>
            <div className="text-[10px] text-slate-400 font-mono space-y-1">
              <p>TaskFlow client v1.0.0</p>
              <p>Cache: localStorage provider</p>
              <p>Role constraints: Admin</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
