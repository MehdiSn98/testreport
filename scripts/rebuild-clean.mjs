import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbJsonPath = path.join(__dirname, '..', 'data', 'db.json');
const sqlPath = path.join(__dirname, '..', 'sql', 'schema.sql');

// Complete pristine database with numeric integer IDs for all entities
const cleanNumericData = {
  roles: [
    {
      id: 1,
      name: 'ADMIN',
      title: 'مدیر سیستم',
      description: 'دسترسی کامل مدیریتی و مشاهده کلیه پروژه‌ها و دانلود خروجی گزارش‌ها',
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 2,
      name: 'DEVELOPER',
      title: 'توسعه‌دهنده',
      description: 'توسعه‌دهنده سیستم و مسئول به‌روزرسانی درصد پیشرفت پروژه‌های اختصاص‌یافته',
      createdAt: '2026-01-01T08:00:00.000Z'
    }
  ],
  users: [
    {
      id: 1,
      name: 'مهندس محمدی (مدیر سیستم)',
      email: 'admin@company.com',
      passwordHash: '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.',
      role: 'ADMIN',
      ssoId: 'SSO-ADM-001',
      department: 'تیم توسعه نرم‌افزار پالایشگاه',
      avatar: 'admin',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 2,
      name: 'سارا رضایی (فرانت‌اند)',
      email: 'sara@company.com',
      passwordHash: '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.',
      role: 'DEVELOPER',
      ssoId: 'SSO-DEV-101',
      department: 'تیم توسعه نرم‌افزار پالایشگاه',
      avatar: 'dev1',
      createdAt: '2026-01-15T09:30:00.000Z',
      updatedAt: '2026-01-15T09:30:00.000Z'
    },
    {
      id: 3,
      name: 'علی اکبری (بک‌اند)',
      email: 'ali@company.com',
      passwordHash: '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.',
      role: 'DEVELOPER',
      ssoId: 'SSO-DEV-102',
      department: 'تیم داده و زیرساخت پالایشگاه',
      avatar: 'dev2',
      createdAt: '2026-01-20T10:00:00.000Z',
      updatedAt: '2026-01-20T10:00:00.000Z'
    }
  ],
  userRoles: [
    {
      id: 1,
      userId: 1,
      roleId: 1,
      assignedAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 2,
      userId: 2,
      roleId: 2,
      assignedAt: '2026-01-15T09:30:00.000Z'
    },
    {
      id: 3,
      userId: 3,
      roleId: 2,
      assignedAt: '2026-01-20T10:00:00.000Z'
    }
  ],
  projects: [
    {
      id: 1,
      title: 'یکپارچه‌سازی داده‌های پالایشگاه',
      description: 'پایپ‌لاین تجمیع داده‌های عملیاتی و لاگ‌های پالایشی',
      status: 'IN_PROGRESS',
      progress: 72,
      startDate: '2026-09-10',
      endDate: '2026-11-04',
      deliveredDate: null,
      createdAt: '2026-09-10T08:00:00.000Z',
      updatedAt: '2026-10-18T14:20:00.000Z'
    },
    {
      id: 2,
      title: 'سیستم مدیریت تعمیرات',
      description: 'سیستم جامع مدیریت و نگهداری تجهیزات و ماشین‌آلات',
      status: 'IN_PROGRESS',
      progress: 45,
      startDate: '2026-09-15',
      endDate: '2026-12-09',
      deliveredDate: null,
      createdAt: '2026-09-15T09:00:00.000Z',
      updatedAt: '2026-10-18T16:00:00.000Z'
    },
    {
      id: 3,
      title: 'سامانه اسناد مهندسی',
      description: 'آرشیو الکترونیک نقشه‌ها، مدارک فنی و استانداردهای مهندسی',
      status: 'IN_PROGRESS',
      progress: 88,
      startDate: '2026-08-20',
      endDate: '2026-10-24',
      deliveredDate: null,
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-10-19T07:45:00.000Z'
    },
    {
      id: 4,
      title: 'سامانه ثبت اموال IT',
      description: 'ردیابی و پلاک‌کوبی تجهیزات شبکه و سیستم‌های اداری',
      status: 'COMPLETED',
      progress: 100,
      startDate: '2026-08-01',
      endDate: '2026-10-11',
      deliveredDate: '2026-10-11',
      createdAt: '2026-08-01T11:00:00.000Z',
      updatedAt: '2026-10-11T17:30:00.000Z'
    },
    {
      id: 5,
      title: 'آماده‌سازی محیط کاری توسعه‌دهندگان',
      description: 'پیکربندی سرورهای تست، گیت و کانتینرهای توسعه',
      status: 'COMPLETED',
      progress: 100,
      startDate: '2026-07-15',
      endDate: '2026-09-29',
      deliveredDate: '2026-09-29',
      createdAt: '2026-07-15T12:00:00.000Z',
      updatedAt: '2026-09-29T10:15:00.000Z'
    },
    {
      id: 6,
      title: 'ماژول گزارش‌گیری CMIS',
      description: 'سامانه گزارش‌دهی مدیریت قراردادها و صورت‌وضعیت‌ها',
      status: 'PLANNED',
      progress: 0,
      startDate: '2026-11-15',
      endDate: '2026-12-30',
      deliveredDate: null,
      createdAt: '2026-10-19T08:00:00.000Z',
      updatedAt: '2026-10-19T08:00:00.000Z'
    },
    {
      id: 7,
      title: 'داشبورد عملیات پالایشگاه',
      description: 'مانیتورینگ لحظه‌ای شاخص‌های تولید و مصرف انرژی',
      status: 'PLANNED',
      progress: 0,
      startDate: '2026-12-01',
      endDate: '2027-01-20',
      deliveredDate: null,
      createdAt: '2026-10-19T08:00:00.000Z',
      updatedAt: '2026-10-19T08:00:00.000Z'
    },
    {
      id: 8,
      title: 'سامانه پایش خودکار پشتیبان‌گیری',
      description: 'نظارت مستمر بر صحت نسخه‌های پشتیبان دیتابیس‌ها',
      status: 'PLANNED',
      progress: 0,
      startDate: '2026-12-15',
      endDate: '2027-02-10',
      deliveredDate: null,
      createdAt: '2026-10-19T08:00:00.000Z',
      updatedAt: '2026-10-19T08:00:00.000Z'
    },
    {
      id: 9,
      title: 'سیستم جامع مدیریت آزمایشگاه نفت',
      description: 'ثبت نتایج آزمون‌های کیفی و تحلیل نمونه‌های پالایشی',
      status: 'IN_PROGRESS',
      progress: 65,
      startDate: '2026-09-20',
      endDate: '2026-11-20',
      deliveredDate: null,
      createdAt: '2026-09-20T08:00:00.000Z',
      updatedAt: '2026-10-19T09:00:00.000Z'
    },
    {
      id: 10,
      title: 'سامانه مانیتورینگ خطوط انتقال گاز',
      description: 'سنجش لحظه‌ای فشار، دما و دبی خطوط لوله خوراک',
      status: 'IN_PROGRESS',
      progress: 30,
      startDate: '2026-10-01',
      endDate: '2026-12-15',
      deliveredDate: null,
      createdAt: '2026-10-01T08:00:00.000Z',
      updatedAt: '2026-10-19T09:00:00.000Z'
    },
    {
      id: 11,
      title: 'پرتال کنترل کیفیت و بازرسی فنی',
      description: 'مدیریت فرم‌ها، گزارش‌های بازرسی ادواری و استانداردها',
      status: 'COMPLETED',
      progress: 100,
      startDate: '2026-07-01',
      endDate: '2026-09-15',
      deliveredDate: '2026-09-15',
      createdAt: '2026-07-01T08:00:00.000Z',
      updatedAt: '2026-09-15T16:00:00.000Z'
    },
    {
      id: 12,
      title: 'سامانه رزرو سالن جلسات و مهمانسرا',
      description: 'مدیریت هوشمند امکانات رفاهی و اقامتی مجتمع پالایشگاه',
      status: 'COMPLETED',
      progress: 100,
      startDate: '2026-06-15',
      endDate: '2026-08-30',
      deliveredDate: '2026-08-30',
      createdAt: '2026-06-15T08:00:00.000Z',
      updatedAt: '2026-08-30T14:00:00.000Z'
    },
    {
      id: 13,
      title: 'یکپارچه‌سازی سامانه پیامکی هشدار حوادث HSE',
      description: 'ارسال خودکار هشدارهای ایمنی و تخلیه اضطراری به کارکنان',
      status: 'PLANNED',
      progress: 0,
      startDate: '2027-01-10',
      endDate: '2027-03-05',
      deliveredDate: null,
      createdAt: '2026-10-19T09:00:00.000Z',
      updatedAt: '2026-10-19T09:00:00.000Z'
    },
    {
      id: 14,
      title: 'سامانه هوشمند مدیریت تردد خودروهای سوخت‌رسان',
      description: 'پلاک‌خوان هوشمند و اتصال به سامانه توزین الکترونیکی',
      status: 'PLANNED',
      progress: 0,
      startDate: '2027-02-01',
      endDate: '2027-04-15',
      deliveredDate: null,
      createdAt: '2026-10-19T09:00:00.000Z',
      updatedAt: '2026-10-19T09:00:00.000Z'
    }
  ],
  userProjects: [
    { id: 1, userId: 2, projectId: 1, roleInProject: 'Lead Frontend', assignedAt: '2026-09-10T08:00:00Z' },
    { id: 2, userId: 3, projectId: 1, roleInProject: 'Backend Engineer', assignedAt: '2026-09-10T08:00:00Z' },
    { id: 3, userId: 2, projectId: 2, roleInProject: 'Frontend Developer', assignedAt: '2026-09-15T09:00:00Z' },
    { id: 4, userId: 3, projectId: 3, roleInProject: 'Fullstack Engineer', assignedAt: '2026-08-20T10:00:00Z' },
    { id: 5, userId: 2, projectId: 4, roleInProject: 'Developer', assignedAt: '2026-08-01T11:00:00Z' },
    { id: 6, userId: 3, projectId: 5, roleInProject: 'DevOps & Backend', assignedAt: '2026-07-15T12:00:00Z' },
    { id: 7, userId: 2, projectId: 6, roleInProject: 'Assigned Developer', assignedAt: '2026-10-19T08:00:00Z' },
    { id: 8, userId: 3, projectId: 7, roleInProject: 'Assigned Developer', assignedAt: '2026-10-19T08:00:00Z' },
    { id: 9, userId: 3, projectId: 8, roleInProject: 'Assigned Developer', assignedAt: '2026-10-19T08:00:00Z' },
    { id: 10, userId: 2, projectId: 9, roleInProject: 'Frontend Developer', assignedAt: '2026-09-20T08:00:00Z' },
    { id: 11, userId: 3, projectId: 10, roleInProject: 'Backend Engineer', assignedAt: '2026-10-01T08:00:00Z' },
    { id: 12, userId: 2, projectId: 11, roleInProject: 'Lead Developer', assignedAt: '2026-07-01T08:00:00Z' },
    { id: 13, userId: 3, projectId: 12, roleInProject: 'Fullstack Developer', assignedAt: '2026-06-15T08:00:00Z' },
    { id: 14, userId: 2, projectId: 13, roleInProject: 'Assigned Developer', assignedAt: '2026-10-19T09:00:00Z' },
    { id: 15, userId: 3, projectId: 14, roleInProject: 'Assigned Developer', assignedAt: '2026-10-19T09:00:00Z' }
  ]
};

// 1. Write clean JSON database with numeric integer IDs
fs.writeFileSync(dbJsonPath, JSON.stringify(cleanNumericData, null, 2), 'utf-8');

// 2. Generate clean SQL Server DDL & DML using INT IDENTITY / INT Primary Keys
let sql = `-- ========================================================
-- Developer Project Tracker - SQL Server Database Schema
-- Pure Numeric IDs (INT IDENTITY) with UTF-8 BOM
-- Tables: Roles, Users, UserRoles, Projects, UserProjects
-- ========================================================

-- Drop tables in reverse dependency order
IF OBJECT_ID('dbo.UserProjects', 'U') IS NOT NULL DROP TABLE dbo.UserProjects;
IF OBJECT_ID('dbo.UserRoles', 'U') IS NOT NULL DROP TABLE dbo.UserRoles;
IF OBJECT_ID('dbo.Projects', 'U') IS NOT NULL DROP TABLE dbo.Projects;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ========================================================
-- 1. Table: Roles
-- ========================================================
CREATE TABLE dbo.Roles (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Roles_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO

-- ========================================================
-- 2. Table: Users
-- ========================================================
CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'DEVELOPER',
    SsoId NVARCHAR(100) NULL,
    Department NVARCHAR(100) NULL,
    Avatar NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX IX_Users_Email ON dbo.Users(Email);
CREATE INDEX IX_Users_SsoId ON dbo.Users(SsoId);
GO

-- ========================================================
-- 3. Table: UserRoles (Many-to-Many: Users <-> Roles)
-- ========================================================
CREATE TABLE dbo.UserRoles (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    AssignedAt DATETIME2 NOT NULL CONSTRAINT DF_UserRoles_AssignedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_User_Role UNIQUE (UserId, RoleId)
);
GO

CREATE INDEX IX_UserRoles_UserId ON dbo.UserRoles(UserId);
CREATE INDEX IX_UserRoles_RoleId ON dbo.UserRoles(RoleId);
GO

-- ========================================================
-- 4. Table: Projects
-- ========================================================
CREATE TABLE dbo.Projects (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Projects_Status DEFAULT 'IN_PROGRESS',
    Progress INT NOT NULL CONSTRAINT DF_Projects_Progress DEFAULT 0,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    DeliveredDate DATE NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Projects_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Projects_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Projects_Progress CHECK (Progress >= 0 AND Progress <= 100),
    CONSTRAINT CK_Projects_Status CHECK (Status IN ('IN_PROGRESS', 'COMPLETED', 'PLANNED'))
);
GO

CREATE INDEX IX_Projects_Status ON dbo.Projects(Status);
CREATE INDEX IX_Projects_Dates ON dbo.Projects(StartDate, EndDate);
GO

-- ========================================================
-- 5. Table: UserProjects (Many-to-Many: Projects <-> Users)
-- ========================================================
CREATE TABLE dbo.UserProjects (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    ProjectId INT NOT NULL,
    RoleInProject NVARCHAR(50) NULL CONSTRAINT DF_UserProjects_Role DEFAULT 'DEVELOPER',
    AssignedAt DATETIME2 NOT NULL CONSTRAINT DF_UserProjects_AssignedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_UserProjects_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserProjects_Projects FOREIGN KEY (ProjectId) REFERENCES dbo.Projects(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_User_Project UNIQUE (UserId, ProjectId)
);
GO

CREATE INDEX IX_UserProjects_UserId ON dbo.UserProjects(UserId);
CREATE INDEX IX_UserProjects_ProjectId ON dbo.UserProjects(ProjectId);
GO

-- ========================================================
-- Seed Data: Roles
-- ========================================================
SET IDENTITY_INSERT dbo.Roles ON;
INSERT INTO dbo.Roles (Id, Name, Title, Description)
VALUES
(1, 'ADMIN', N'مدیر سیستم', N'دسترسی کامل مدیریتی و مشاهده کلیه پروژه‌ها و دانلود خروجی گزارش‌ها'),
(2, 'DEVELOPER', N'توسعه‌دهنده', N'توسعه‌دهنده سیستم و مسئول به‌روزرسانی درصد پیشرفت پروژه‌های اختصاص‌یافته');
SET IDENTITY_INSERT dbo.Roles OFF;
GO

-- ========================================================
-- Seed Data: Users
-- ========================================================
SET IDENTITY_INSERT dbo.Users ON;
INSERT INTO dbo.Users (Id, Name, Email, PasswordHash, Role, SsoId, Department, Avatar)
VALUES
(1, N'مهندس محمدی (مدیر سیستم)', 'admin@company.com', '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.', 'ADMIN', 'SSO-ADM-001', N'تیم توسعه نرم‌افزار پالایشگاه', 'admin'),
(2, N'سارا رضایی (فرانت‌اند)', 'sara@company.com', '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.', 'DEVELOPER', 'SSO-DEV-101', N'تیم توسعه نرم‌افزار پالایشگاه', 'dev1'),
(3, N'علی اکبری (بک‌اند)', 'ali@company.com', '$2a$10$fQJ.7H7.p0vPzJbBvJqEseU247lC7aK/vjA7Yq08Oa.gD.1qFkUq.', 'DEVELOPER', 'SSO-DEV-102', N'تیم داده و زیرساخت پالایشگاه', 'dev2');
SET IDENTITY_INSERT dbo.Users OFF;
GO

-- ========================================================
-- Seed Data: UserRoles
-- ========================================================
SET IDENTITY_INSERT dbo.UserRoles ON;
INSERT INTO dbo.UserRoles (Id, UserId, RoleId)
VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 2);
SET IDENTITY_INSERT dbo.UserRoles OFF;
GO

-- ========================================================
-- Seed Data: Projects
-- ========================================================
SET IDENTITY_INSERT dbo.Projects ON;
INSERT INTO dbo.Projects (Id, Title, Description, Status, Progress, StartDate, EndDate, DeliveredDate)
VALUES
`;

const projectRows = cleanNumericData.projects.map((p) => {
  const desc = p.description ? `N'${p.description.replace(/'/g, "''")}'` : 'NULL';
  const delDate = p.deliveredDate ? `'${p.deliveredDate}'` : 'NULL';
  return `(${p.id}, N'${p.title.replace(/'/g, "''")}', ${desc}, '${p.status}', ${p.progress}, '${p.startDate}', '${p.endDate}', ${delDate})`;
}).join(',\n');

sql += projectRows + ';\nSET IDENTITY_INSERT dbo.Projects OFF;\nGO\n\n';

sql += `-- ========================================================
-- Seed Data: UserProjects
-- ========================================================
SET IDENTITY_INSERT dbo.UserProjects ON;
INSERT INTO dbo.UserProjects (Id, UserId, ProjectId, RoleInProject)
VALUES
`;

const upRows = cleanNumericData.userProjects.map((up) => {
  const role = up.roleInProject ? `N'${up.roleInProject.replace(/'/g, "''")}'` : 'NULL';
  return `(${up.id}, ${up.userId}, ${up.projectId}, ${role})`;
}).join(',\n');

sql += upRows + ';\nSET IDENTITY_INSERT dbo.UserProjects OFF;\nGO\n';

// Write schema.sql with UTF-8 BOM
const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
const fileBuffer = Buffer.concat([bom, Buffer.from(sql, 'utf-8')]);
fs.writeFileSync(sqlPath, fileBuffer);

console.log('Successfully generated numeric database in data/db.json and sql/schema.sql!');
