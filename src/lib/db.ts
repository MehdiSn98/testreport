import fs from 'fs';
import path from 'path';
import { User, Project, UserProject, Role, UserRoleAssignment, ProjectFilterOptions, DashboardStats } from '@/types';
import { getSqlPool, isSqlConfigured } from './mssql';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  roles: Role[];
  users: User[];
  userRoles: UserRoleAssignment[];
  projects: Project[];
  userProjects: UserProject[];
}

const INITIAL_ROLES: Role[] = [
  {
    id: '1',
    name: 'ADMIN',
    title: 'مدیر سیستم',
    description: 'دسترسی کامل مدیریتی و مشاهده کلیه پروژه‌ها و دانلود خروجی گزارش‌ها',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: '2',
    name: 'DEVELOPER',
    title: 'توسعه‌دهنده',
    description: 'توسعه‌دهنده سیستم و مسئول به‌روزرسانی درصد پیشرفت پروژه‌های اختصاص‌یافته',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

const INITIAL_USER_ROLES: UserRoleAssignment[] = [
  { id: '1', userId: '1', roleId: '1', assignedAt: '2026-01-01T08:00:00.000Z' },
  { id: '2', userId: '2', roleId: '2', assignedAt: '2026-01-15T09:30:00.000Z' },
  { id: '3', userId: '3', roleId: '2', assignedAt: '2026-01-20T10:00:00.000Z' },
];

const INITIAL_DATA: DatabaseSchema = {
  roles: INITIAL_ROLES,
  userRoles: INITIAL_USER_ROLES,
  users: [
    {
      id: '1',
      name: 'مهندس محمدی (مدیر سیستم)',
      email: 'admin@company.com',
      passwordHash: '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.',
      role: 'ADMIN',
      ssoId: 'SSO-ADM-001',
      department: 'تیم توسعه نرم‌افزار پالایشگاه',
      avatar: 'admin',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: '2',
      name: 'سارا رضایی (فرانت‌اند)',
      email: 'sara@company.com',
      passwordHash: '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.',
      role: 'DEVELOPER',
      ssoId: 'SSO-DEV-101',
      department: 'تیم توسعه نرم‌افزار پالایشگاه',
      avatar: 'dev1',
      createdAt: '2026-01-15T09:30:00.000Z',
      updatedAt: '2026-01-15T09:30:00.000Z',
    },
    {
      id: '3',
      name: 'علی اکبری (بک‌اند)',
      email: 'ali@company.com',
      passwordHash: '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.',
      role: 'DEVELOPER',
      ssoId: 'SSO-DEV-102',
      department: 'تیم داده و زیرساخت پالایشگاه',
      avatar: 'dev2',
      createdAt: '2026-01-20T10:00:00.000Z',
      updatedAt: '2026-01-20T10:00:00.000Z',
    },
  ],
  projects: [],
  userProjects: [],
};

function formatDateString(val: any): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  const s = String(val);
  return s.includes('T') ? s.split('T')[0] : s;
}

function ensureDataFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    return INITIAL_DATA;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    let modified = false;

    if (!parsed.roles) {
      parsed.roles = INITIAL_ROLES;
      modified = true;
    }
    if (!parsed.userRoles) {
      parsed.userRoles = INITIAL_USER_ROLES;
      modified = true;
    }
    if (!parsed.userProjects) {
      parsed.userProjects = INITIAL_DATA.userProjects;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed as DatabaseSchema;
  } catch {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    return INITIAL_DATA;
  }
}

function saveData(data: DatabaseSchema): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getRoles(): Promise<Role[]> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const result = await pool.request().query(`
        SELECT Id, Name, Title, Description, CreatedAt FROM dbo.Roles ORDER BY Id ASC
      `);
      return result.recordset.map((r) => ({
        id: String(r.Id),
        name: r.Name,
        title: r.Title,
        description: r.Description,
        createdAt: r.CreatedAt ? new Date(r.CreatedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error('SQL Server getRoles error, fallback to JSON:', err);
    }
  }

  const db = ensureDataFile();
  return db.roles || INITIAL_ROLES;
}

export async function getUserRoles(): Promise<UserRoleAssignment[]> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const result = await pool.request().query(`
        SELECT Id, UserId, RoleId, AssignedAt FROM dbo.UserRoles
      `);
      return result.recordset.map((ur) => ({
        id: String(ur.Id),
        userId: String(ur.UserId),
        roleId: String(ur.RoleId),
        assignedAt: ur.AssignedAt ? new Date(ur.AssignedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error('SQL Server getUserRoles error, fallback to JSON:', err);
    }
  }

  const db = ensureDataFile();
  return db.userRoles || INITIAL_USER_ROLES;
}

export async function getUsers(): Promise<User[]> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const usersResult = await pool.request().query(`
        SELECT Id, Name, Email, PasswordHash, Role, SsoId, Department, Avatar, CreatedAt, UpdatedAt
        FROM dbo.Users ORDER BY Id ASC
      `);
      const urResult = await pool.request().query(`
        SELECT ur.UserId, r.Id as RoleId, r.Name, r.Title, r.Description, r.CreatedAt
        FROM dbo.UserRoles ur
        JOIN dbo.Roles r ON ur.RoleId = r.Id
      `);

      const userRolesMap = new Map<string, Role[]>();
      urResult.recordset.forEach((ur) => {
        const uKey = String(ur.UserId);
        const list = userRolesMap.get(uKey) || [];
        list.push({
          id: String(ur.RoleId),
          name: ur.Name,
          title: ur.Title,
          description: ur.Description,
          createdAt: ur.CreatedAt ? new Date(ur.CreatedAt).toISOString() : new Date().toISOString(),
        });
        userRolesMap.set(uKey, list);
      });

      return usersResult.recordset.map((u) => ({
        id: String(u.Id),
        name: u.Name,
        email: u.Email,
        passwordHash: u.PasswordHash,
        role: u.Role as 'ADMIN' | 'DEVELOPER',
        ssoId: u.SsoId,
        department: u.Department,
        avatar: u.Avatar,
        createdAt: u.CreatedAt ? new Date(u.CreatedAt).toISOString() : new Date().toISOString(),
        updatedAt: u.UpdatedAt ? new Date(u.UpdatedAt).toISOString() : new Date().toISOString(),
        roles: userRolesMap.get(String(u.Id)) || [],
      }));
    } catch (err) {
      console.error('SQL Server getUsers error, fallback to JSON:', err);
    }
  }

  const db = ensureDataFile();
  const rolesMap = new Map((db.roles || INITIAL_ROLES).map((r) => [String(r.id), r]));
  const userRolesMap = new Map<string, Role[]>();

  (db.userRoles || INITIAL_USER_ROLES).forEach((ur) => {
    const role = rolesMap.get(String(ur.roleId));
    if (role) {
      const uKey = String(ur.userId);
      const list = userRolesMap.get(uKey) || [];
      list.push(role);
      userRolesMap.set(uKey, list);
    }
  });

  return db.users.map((u) => ({
    ...u,
    id: String(u.id),
    roles: userRolesMap.get(String(u.id)) || [],
  }));
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => String(u.id) === String(id)) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserBySsoId(ssoId: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.ssoId === ssoId) || null;
}

export async function getUserProjects(): Promise<UserProject[]> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const result = await pool.request().query(`
        SELECT Id, UserId, ProjectId, RoleInProject, AssignedAt FROM dbo.UserProjects
      `);
      return result.recordset.map((up) => ({
        id: String(up.Id),
        userId: String(up.UserId),
        projectId: String(up.ProjectId),
        roleInProject: up.RoleInProject,
        assignedAt: up.AssignedAt ? new Date(up.AssignedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error('SQL Server getUserProjects error, fallback to JSON:', err);
    }
  }

  const db = ensureDataFile();
  return db.userProjects.map((up) => ({
    ...up,
    id: String(up.id),
    userId: String(up.userId),
    projectId: String(up.projectId),
  }));
}

/**
 * Get projects with assigned users resolved via userProjects relation
 */
export async function getProjects(filters?: ProjectFilterOptions): Promise<Project[]> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const users = await getUsers();
      const usersMap = new Map(users.map((u) => [String(u.id), u]));

      const upResult = await pool.request().query(`
        SELECT Id, UserId, ProjectId, RoleInProject, AssignedAt FROM dbo.UserProjects
      `);
      const projectUsersMap = new Map<string, User[]>();
      upResult.recordset.forEach((up) => {
        const user = usersMap.get(String(up.UserId));
        if (user) {
          const pKey = String(up.ProjectId);
          const list = projectUsersMap.get(pKey) || [];
          list.push(user);
          projectUsersMap.set(pKey, list);
        }
      });

      let query = `
        SELECT Id, Title, Description, Status, Progress, StartDate, EndDate, DeliveredDate, CreatedAt, UpdatedAt
        FROM dbo.Projects WHERE 1=1
      `;
      const req = pool.request();

      if (filters?.userId) {
        query += ` AND Id IN (SELECT ProjectId FROM dbo.UserProjects WHERE UserId = @userId)`;
        req.input('userId', filters.userId);
      }
      if (filters?.status && filters.status !== 'ALL') {
        query += ` AND Status = @status`;
        req.input('status', filters.status);
      }
      if (filters?.searchQuery) {
        query += ` AND (Title LIKE @search OR Description LIKE @search)`;
        req.input('search', `%${filters.searchQuery}%`);
      }

      query += ` ORDER BY UpdatedAt DESC`;
      const projResult = await req.query(query);

      return projResult.recordset.map((p) => {
        const pIdStr = String(p.Id);
        const assignedUsers = projectUsersMap.get(pIdStr) || [];
        const ups = upResult.recordset
          .filter((up) => String(up.ProjectId) === pIdStr)
          .map((up) => ({
            id: String(up.Id),
            userId: String(up.UserId),
            projectId: pIdStr,
            roleInProject: up.RoleInProject,
            assignedAt: up.AssignedAt ? new Date(up.AssignedAt).toISOString() : new Date().toISOString(),
            user: usersMap.get(String(up.UserId)),
          }));

        return {
          id: pIdStr,
          title: p.Title,
          description: p.Description || '',
          status: p.Status,
          progress: p.Progress,
          startDate: formatDateString(p.StartDate),
          endDate: formatDateString(p.EndDate),
          deliveredDate: p.DeliveredDate ? formatDateString(p.DeliveredDate) : null,
          createdAt: p.CreatedAt ? new Date(p.CreatedAt).toISOString() : new Date().toISOString(),
          updatedAt: p.UpdatedAt ? new Date(p.UpdatedAt).toISOString() : new Date().toISOString(),
          userId: assignedUsers[0]?.id || '2',
          user: assignedUsers[0],
          users: assignedUsers,
          userProjects: ups,
        };
      });
    } catch (err) {
      console.error('SQL Server getProjects error, fallback to JSON:', err);
    }
  }

  // Fallback to JSON
  const db = ensureDataFile();
  const users = await getUsers();
  const usersMap = new Map(users.map((u) => [String(u.id), u]));

  const projectUsersMap = new Map<string, User[]>();
  db.userProjects.forEach((up) => {
    const user = usersMap.get(String(up.userId));
    if (user) {
      const pKey = String(up.projectId);
      const list = projectUsersMap.get(pKey) || [];
      list.push(user);
      projectUsersMap.set(pKey, list);
    }
  });

  let results = db.projects.map((p) => {
    const pIdStr = String(p.id);
    const assignedUsers = projectUsersMap.get(pIdStr) || [];
    const ups = db.userProjects
      .filter((up) => String(up.projectId) === pIdStr)
      .map((up) => ({
        ...up,
        id: String(up.id),
        userId: String(up.userId),
        projectId: pIdStr,
        user: usersMap.get(String(up.userId)),
      }));
    return {
      ...p,
      id: pIdStr,
      userId: assignedUsers[0]?.id || '2',
      user: assignedUsers[0],
      users: assignedUsers,
      userProjects: ups,
    };
  });

  if (filters?.userId) {
    const targetUserIdStr = String(filters.userId);
    const assignedProjectIds = new Set(
      db.userProjects
        .filter((up) => String(up.userId) === targetUserIdStr)
        .map((up) => String(up.projectId))
    );
    results = results.filter((p) => assignedProjectIds.has(String(p.id)));
  }

  if (filters?.status && filters.status !== 'ALL') {
    results = results.filter((p) => p.status === filters.status);
  }

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => String(p.id) === String(id)) || null;
}

/**
 * Create a new project and assign to user(s) via userProjects table
 */
export async function createProject(data: {
  userIds: string[];
  title: string;
  description?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNED';
  progress: number;
  startDate: string;
  endDate: string;
  deliveredDate?: string | null;
}): Promise<Project> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const req = pool.request();
      req.input('title', data.title);
      req.input('description', data.description || '');
      req.input('status', data.status);
      req.input('progress', Math.min(100, Math.max(0, data.progress)));
      req.input('startDate', data.startDate);
      req.input('endDate', data.endDate);
      req.input('deliveredDate', data.status === 'COMPLETED' ? (data.deliveredDate || data.endDate) : null);

      const insertRes = await req.query(`
        INSERT INTO dbo.Projects (Title, Description, Status, Progress, StartDate, EndDate, DeliveredDate, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.Id
        VALUES (@title, @description, @status, @progress, @startDate, @endDate, @deliveredDate, SYSUTCDATETIME(), SYSUTCDATETIME())
      `);
      const newProjectId = String(insertRes.recordset[0].Id);

      const userIds = data.userIds.length > 0 ? data.userIds : ['2'];
      for (const uId of userIds) {
        const upReq = pool.request();
        upReq.input('userId', uId);
        upReq.input('projectId', newProjectId);
        await upReq.query(`
          INSERT INTO dbo.UserProjects (UserId, ProjectId, RoleInProject, AssignedAt)
          VALUES (@userId, @projectId, N'Developer', SYSUTCDATETIME())
        `);
      }

      const created = await getProjectById(newProjectId);
      return created!;
    } catch (err) {
      console.error('SQL Server createProject error, fallback to JSON:', err);
    }
  }

  // Fallback to JSON
  const db = ensureDataFile();
  const maxProjId = db.projects.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
  const newProjectId = String(maxProjId + 1);

  const newProject: Project = {
    id: newProjectId,
    title: data.title,
    description: data.description || '',
    status: data.status,
    progress: Math.min(100, Math.max(0, data.progress)),
    startDate: data.startDate,
    endDate: data.endDate,
    deliveredDate: data.status === 'COMPLETED' ? (data.deliveredDate || data.endDate) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);

  const userIds = data.userIds.length > 0 ? data.userIds : ['2'];
  let maxUpId = db.userProjects.reduce((max, up) => Math.max(max, Number(up.id) || 0), 0);

  userIds.forEach((uId) => {
    maxUpId++;
    db.userProjects.push({
      id: String(maxUpId),
      userId: String(uId),
      projectId: newProjectId,
      roleInProject: 'Developer',
      assignedAt: new Date().toISOString(),
    });
  });

  saveData(db);

  const created = await getProjectById(newProjectId);
  return created!;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'users' | 'userProjects'>>
): Promise<Project | null> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const current = await getProjectById(id);
      if (!current) return null;

      const updatedProgress =
        data.progress !== undefined ? Math.min(100, Math.max(0, data.progress)) : current.progress;

      let updatedStatus = data.status || current.status;
      if (updatedProgress === 100 && !data.status) {
        updatedStatus = 'COMPLETED';
      } else if (updatedProgress < 100 && current.status === 'COMPLETED' && !data.status) {
        updatedStatus = 'IN_PROGRESS';
      }

      const deliveredDate = updatedStatus === 'COMPLETED'
        ? (data.deliveredDate || current.deliveredDate || new Date().toISOString().split('T')[0])
        : null;

      const req = pool.request();
      req.input('id', id);
      req.input('title', data.title !== undefined ? data.title : current.title);
      req.input('description', data.description !== undefined ? data.description : current.description);
      req.input('status', updatedStatus);
      req.input('progress', updatedProgress);
      req.input('startDate', data.startDate !== undefined ? data.startDate : current.startDate);
      req.input('endDate', data.endDate !== undefined ? data.endDate : current.endDate);
      req.input('deliveredDate', deliveredDate);

      await req.query(`
        UPDATE dbo.Projects
        SET Title = @title,
            Description = @description,
            Status = @status,
            Progress = @progress,
            StartDate = @startDate,
            EndDate = @endDate,
            DeliveredDate = @deliveredDate,
            UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);

      return getProjectById(id);
    } catch (err) {
      console.error('SQL Server updateProject error, fallback to JSON:', err);
    }
  }

  // Fallback to JSON
  const db = ensureDataFile();
  const index = db.projects.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return null;

  const current = db.projects[index];
  const updatedProgress =
    data.progress !== undefined ? Math.min(100, Math.max(0, data.progress)) : current.progress;

  let updatedStatus = data.status || current.status;
  if (updatedProgress === 100 && !data.status) {
    updatedStatus = 'COMPLETED';
  } else if (updatedProgress < 100 && current.status === 'COMPLETED' && !data.status) {
    updatedStatus = 'IN_PROGRESS';
  }

  const updated: Project = {
    ...current,
    ...data,
    status: updatedStatus,
    progress: updatedProgress,
    deliveredDate: updatedStatus === 'COMPLETED' ? (data.deliveredDate || current.deliveredDate || new Date().toISOString().split('T')[0]) : null,
    updatedAt: new Date().toISOString(),
  };

  db.projects[index] = updated;
  saveData(db);

  return getProjectById(id);
}

export async function updateProjectProgress(id: string, progress: number): Promise<Project | null> {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const status = clamped === 100 ? 'COMPLETED' : 'IN_PROGRESS';
  return updateProject(id, { progress: clamped, status });
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const req = pool.request();
      req.input('id', id);
      await req.query(`
        DELETE FROM dbo.UserProjects WHERE ProjectId = @id;
        DELETE FROM dbo.Projects WHERE Id = @id;
      `);
      return true;
    } catch (err) {
      console.error('SQL Server deleteProject error, fallback to JSON:', err);
    }
  }

  // Fallback to JSON
  const db = ensureDataFile();
  const initialLength = db.projects.length;
  db.projects = db.projects.filter((p) => String(p.id) !== String(id));
  db.userProjects = db.userProjects.filter((up) => String(up.projectId) !== String(id));
  if (db.projects.length !== initialLength) {
    saveData(db);
    return true;
  }
  return false;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isSqlConfigured) {
    try {
      const pool = await getSqlPool();
      const statsRes = await pool.request().query(`
        SELECT
          COUNT(*) AS TotalProjects,
          SUM(CASE WHEN Status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS InProgressProjects,
          SUM(CASE WHEN Status = 'COMPLETED' THEN 1 ELSE 0 END) AS CompletedProjects,
          SUM(CASE WHEN Status = 'PLANNED' THEN 1 ELSE 0 END) AS PlannedProjects,
          AVG(CAST(Progress AS FLOAT)) AS AverageProgress
        FROM dbo.Projects
      `);
      const devRes = await pool.request().query(`
        SELECT COUNT(*) AS TotalDevelopers FROM dbo.Users WHERE Role = 'DEVELOPER'
      `);

      const row = statsRes.recordset[0] || {};
      return {
        totalProjects: row.TotalProjects || 0,
        inProgressProjects: row.InProgressProjects || 0,
        completedProjects: row.CompletedProjects || 0,
        plannedProjects: row.PlannedProjects || 0,
        averageProgress: Math.round(row.AverageProgress || 0),
        totalDevelopers: devRes.recordset[0]?.TotalDevelopers || 0,
      };
    } catch (err) {
      console.error('SQL Server getDashboardStats error, fallback to JSON:', err);
    }
  }

  // Fallback to JSON
  const db = ensureDataFile();
  const totalProjects = db.projects.length;
  const inProgressProjects = db.projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedProjects = db.projects.filter((p) => p.status === 'COMPLETED').length;
  const plannedProjects = db.projects.filter((p) => p.status === 'PLANNED').length;
  const totalDevelopers = db.users.filter((u) => u.role === 'DEVELOPER').length;

  const totalProgress = db.projects.reduce((acc, curr) => acc + curr.progress, 0);
  const averageProgress = totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0;

  return {
    totalProjects,
    inProgressProjects,
    completedProjects,
    plannedProjects,
    averageProgress,
    totalDevelopers,
  };
}
