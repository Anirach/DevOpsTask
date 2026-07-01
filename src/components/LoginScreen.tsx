/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckSquare, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { DEFAULT_USERS } from '../mockData';

interface LoginScreenProps {
  onLoginSuccess: (userId?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate email structure
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError('');
      return;
    }

    // Standard RFC-2822 email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError('Enter a valid email address.');
      return;
    }

    if (emailError) return;

    setIsSubmitting(true);
    // Simulate brief network delay for hyper-realism
    setTimeout(() => {
      setIsSubmitting(false);
      const matchedUser = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      onLoginSuccess(matchedUser?.id || 'u1');
    }, 600);
  };

  const handleUserDemoLogin = (userId: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(userId);
    }, 400);
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 select-none"
      id="login-screen-workspace"
    >
      <div className="w-full max-w-md space-y-8 bg-white rounded-2xl border border-slate-200 p-8 shadow-xl relative overflow-hidden">
        
        {/* Subtle accent line on top card */}
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-blue-600" />

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 inline-flex items-center justify-center">
            <CheckSquare className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">TaskFlow</h1>
            <p className="text-xs text-slate-400 font-medium">Collaborative, high-fidelity team task management</p>
          </div>
        </div>

        {/* Main interactive form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          
          {/* Email Box */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="alex@taskflow.app"
              className={`w-full bg-slate-50 border ${
                emailError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              } text-slate-800 text-sm px-3.5 py-2.5 rounded-xl outline-hidden focus:ring-2 outline-hidden transition-all placeholder-slate-400`}
              required
              id="input-login-email"
              disabled={isSubmitting}
            />
            {emailError && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {emailError}
              </p>
            )}
          </div>

          {/* Password Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 block">Password</label>
              <a href="#" className="text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-colors">Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-blue-100 text-slate-800 text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 outline-hidden transition-all placeholder-slate-400"
              disabled={isSubmitting}
              id="input-login-password"
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting || !!emailError}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/10"
            id="btn-login-submit"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

        </form>

        {/* Separator / Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200/70"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-slate-200/70"></div>
        </div>

        {/* Demo Accounts List */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quick Demo Accounts
            </h3>
          </div>

          {/* Manager Account Card */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Workspace Administrator</span>
            {DEFAULT_USERS.filter(u => u.id === 'u1').map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleUserDemoLogin(user.id)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-2.5 bg-blue-50/50 hover:bg-blue-50/90 border border-blue-100 rounded-xl transition-all cursor-pointer text-left group"
                id={`btn-login-demo-${user.id}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="h-7.5 w-7.5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-blue-600 font-semibold">{user.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-white border border-blue-200/60 px-2.5 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                  Sign In
                </span>
              </button>
            ))}
          </div>

          {/* Normal Team Members Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Normal Users / Team Members</span>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_USERS.filter(u => u.id !== 'u1').map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserDemoLogin(user.id)}
                  disabled={isSubmitting}
                  className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl transition-all cursor-pointer text-left group"
                  id={`btn-login-demo-${user.id}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: user.avatarColor }}
                    >
                      {user.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-400 truncate font-medium">{user.role}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 pt-1 font-medium">
            <Shield className="h-3 w-3 text-slate-300 shrink-0" />
            <span>Sandbox prototype workspace. No real credentials needed.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
