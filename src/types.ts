/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeIds: string[];
  priority: Priority;
  status: TaskStatus;
  deadline: string; // YYYY-MM-DD
  createdAt: string;
  order: number;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export type ViewTab = 'dashboard' | 'my-work' | 'projects' | 'team' | 'settings' | 'search' | 'admin';
