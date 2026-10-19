/**
 * System data models: User, Project, and UserProject (many-to-many relationship)
 */

export type UserRole = 'ADMIN' | 'DEVELOPER';

export interface Role {
  id: string;
  name: string; // 'ADMIN' | 'DEVELOPER'
  title: string; // e.g. 'مدیر سیستم' | 'توسعه‌دهنده'
  description?: string | null;
  createdAt: string;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  role?: Role;
}

export type ProjectStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PLANNED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  roles?: Role[];
  ssoId?: string | null;
  department?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProject {
  id: string;
  userId: string;
  projectId: string;
  roleInProject?: string | null;
  assignedAt: string;
  user?: User;
}

export interface Project {
  id: string;
  userId?: string;
  user?: User;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  progress: number; // 0 to 100
  startDate: string; // YYYY-MM-DD (Gregorian)
  endDate: string; // YYYY-MM-DD (Gregorian)
  deliveredDate?: string | null; // YYYY-MM-DD (Gregorian)
  userProjects?: UserProject[];
  users?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    ssoId?: string | null;
    department?: string | null;
    avatar?: string | null;
  };
}

export interface ProjectFilterOptions {
  userId?: string;
  status?: ProjectStatus | 'ALL';
  searchQuery?: string;
}

export interface DashboardStats {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  plannedProjects: number;
  averageProgress: number;
  totalDevelopers: number;
}
