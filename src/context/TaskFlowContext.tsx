/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Task, Comment, ViewTab, Priority, TaskStatus } from '../types';
import { DEFAULT_USERS, DEFAULT_PROJECTS, DEFAULT_TASKS, DEFAULT_COMMENTS, CURRENT_USER_ID } from '../mockData';

interface TaskFilters {
  status?: TaskStatus | 'all';
  assigneeId?: string | 'all';
  priority?: Priority | 'all';
}

interface TaskFlowContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  currentUserId: string;
  currentUser: User | undefined;
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  
  // Operations
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addComment: (taskId: string, body: string) => void;
  updateCurrentUserProfile: (name: string, email: string, role: string, avatarColor: string) => void;
  resetToDefault: () => void;
  isAuthenticated: boolean;
  login: (userId?: string) => void;
  logout: () => void;
}

const TaskFlowContext = createContext<TaskFlowContextType | undefined>(undefined);

export const useTaskFlow = () => {
  const context = useContext(TaskFlowContext);
  if (!context) {
    throw new Error('useTaskFlow must be used within a TaskFlowProvider');
  }
  return context;
};

export const TaskFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or default mock data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tf_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('tf_projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tf_tasks');
    const rawTasks = saved ? JSON.parse(saved) : DEFAULT_TASKS;
    return rawTasks.map((t: any) => {
      if (!t.assigneeIds && t.assigneeId) {
        return {
          ...t,
          assigneeIds: [t.assigneeId]
        };
      }
      if (!t.assigneeIds) {
        return {
          ...t,
          assigneeIds: []
        };
      }
      return t;
    });
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('tf_comments');
    return saved ? JSON.parse(saved) : DEFAULT_COMMENTS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('tf_current_user_id') || CURRENT_USER_ID;
  });
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tf_authenticated') === 'true';
  });

  const login = (userId?: string) => {
    if (userId) {
      setCurrentUserId(userId);
      localStorage.setItem('tf_current_user_id', userId);
    }
    setIsAuthenticated(true);
    localStorage.setItem('tf_authenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tf_authenticated');
  };

  // UI States
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    assigneeId: 'all',
    priority: 'all',
  });

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem('tf_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tf_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tf_comments', JSON.stringify(comments));
  }, [comments]);

  // Derived current user details
  const currentUser = users.find(u => u.id === currentUserId);

  // Reset to default helper
  const resetToDefault = () => {
    setUsers(DEFAULT_USERS);
    setProjects(DEFAULT_PROJECTS);
    setTasks(DEFAULT_TASKS);
    setComments(DEFAULT_COMMENTS);
    setCurrentUserId(CURRENT_USER_ID);
    localStorage.setItem('tf_current_user_id', CURRENT_USER_ID);
    setCurrentTab('dashboard');
    setSelectedProjectId(null);
    setSelectedTaskId(null);
    setSearchQuery('');
    setFilters({ status: 'all', assigneeId: 'all', priority: 'all' });
  };

  // --- Task Operations ---
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `t_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    // Clean up comments related to this task
    setComments(prev => prev.filter(c => c.taskId !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  // --- Project Operations ---
  const addProject = (newProject: Omit<Project, 'id' | 'createdAt'>): Project => {
    const project: Project = {
      ...newProject,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, project]);
    return project;
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // Clean up tasks and comments for this project
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectTaskIds = projectTasks.map(t => t.id);
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    setComments(prev => prev.filter(c => !projectTaskIds.includes(c.taskId)));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setCurrentTab('projects');
    }
  };

  // --- Comment Operations ---
  const addComment = (taskId: string, body: string) => {
    const comment: Comment = {
      id: `c_${Date.now()}`,
      taskId,
      authorId: currentUserId,
      body,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, comment]);
  };

  // --- Profile Operations ---
  const updateCurrentUserProfile = (name: string, email: string, role: string, avatarColor: string) => {
    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    setUsers(prev =>
      prev.map(u => (u.id === currentUserId ? { ...u, name, email, role, avatarColor, initials } : u))
    );
  };

  return (
    <TaskFlowContext.Provider
      value={{
        users,
        projects,
        tasks,
        comments,
        currentUserId,
        currentUser,
        currentTab,
        setCurrentTab,
        selectedProjectId,
        setSelectedProjectId,
        selectedTaskId,
        setSelectedTaskId,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        addTask,
        updateTask,
        deleteTask,
        addProject,
        updateProject,
        deleteProject,
        addComment,
        updateCurrentUserProfile,
        resetToDefault,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </TaskFlowContext.Provider>
  );
};
