-- ========================================================
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
(1, N'یکپارچه‌سازی داده‌های پالایشگاه', N'پایپ‌لاین تجمیع داده‌های عملیاتی و لاگ‌های پالایشی', 'IN_PROGRESS', 72, '2026-09-10', '2026-11-04', NULL),
(2, N'سیستم مدیریت تعمیرات', N'سیستم جامع مدیریت و نگهداری تجهیزات و ماشین‌آلات', 'IN_PROGRESS', 45, '2026-09-15', '2026-12-09', NULL),
(3, N'سامانه اسناد مهندسی', N'آرشیو الکترونیک نقشه‌ها، مدارک فنی و استانداردهای مهندسی', 'IN_PROGRESS', 88, '2026-08-20', '2026-10-24', NULL),
(4, N'سامانه ثبت اموال IT', N'ردیابی و پلاک‌کوبی تجهیزات شبکه و سیستم‌های اداری', 'COMPLETED', 100, '2026-08-01', '2026-10-11', '2026-10-11'),
(5, N'آماده‌سازی محیط کاری توسعه‌دهندگان', N'پیکربندی سرورهای تست، گیت و کانتینرهای توسعه', 'COMPLETED', 100, '2026-07-15', '2026-09-29', '2026-09-29'),
(6, N'ماژول گزارش‌گیری CMIS', N'سامانه گزارش‌دهی مدیریت قراردادها و صورت‌وضعیت‌ها', 'PLANNED', 0, '2026-11-15', '2026-12-30', NULL),
(7, N'داشبورد عملیات پالایشگاه', N'مانیتورینگ لحظه‌ای شاخص‌های تولید و مصرف انرژی', 'PLANNED', 0, '2026-12-01', '2027-01-20', NULL),
(8, N'سامانه پایش خودکار پشتیبان‌گیری', N'نظارت مستمر بر صحت نسخه‌های پشتیبان دیتابیس‌ها', 'PLANNED', 0, '2026-12-15', '2027-02-10', NULL),
(9, N'سیستم جامع مدیریت آزمایشگاه نفت', N'ثبت نتایج آزمون‌های کیفی و تحلیل نمونه‌های پالایشی', 'IN_PROGRESS', 65, '2026-09-20', '2026-11-20', NULL),
(10, N'سامانه مانیتورینگ خطوط انتقال گاز', N'سنجش لحظه‌ای فشار، دما و دبی خطوط لوله خوراک', 'IN_PROGRESS', 30, '2026-10-01', '2026-12-15', NULL),
(11, N'پرتال کنترل کیفیت و بازرسی فنی', N'مدیریت فرم‌ها، گزارش‌های بازرسی ادواری و استانداردها', 'COMPLETED', 100, '2026-07-01', '2026-09-15', '2026-09-15'),
(12, N'سامانه رزرو سالن جلسات و مهمانسرا', N'مدیریت هوشمند امکانات رفاهی و اقامتی مجتمع پالایشگاه', 'COMPLETED', 100, '2026-06-15', '2026-08-30', '2026-08-30'),
(13, N'یکپارچه‌سازی سامانه پیامکی هشدار حوادث HSE', N'ارسال خودکار هشدارهای ایمنی و تخلیه اضطراری به کارکنان', 'PLANNED', 0, '2027-01-10', '2027-03-05', NULL),
(14, N'سامانه هوشمند مدیریت تردد خودروهای سوخت‌رسان', N'پلاک‌خوان هوشمند و اتصال به سامانه توزین الکترونیکی', 'PLANNED', 0, '2027-02-01', '2027-04-15', NULL);
SET IDENTITY_INSERT dbo.Projects OFF;
GO

-- ========================================================
-- Seed Data: UserProjects
-- ========================================================
SET IDENTITY_INSERT dbo.UserProjects ON;
INSERT INTO dbo.UserProjects (Id, UserId, ProjectId, RoleInProject)
VALUES
(1, 2, 1, N'Lead Frontend'),
(2, 3, 1, N'Backend Engineer'),
(3, 2, 2, N'Frontend Developer'),
(4, 3, 3, N'Fullstack Engineer'),
(5, 2, 4, N'Developer'),
(6, 3, 5, N'DevOps & Backend'),
(7, 2, 6, N'Assigned Developer'),
(8, 3, 7, N'Assigned Developer'),
(9, 3, 8, N'Assigned Developer'),
(10, 2, 9, N'Frontend Developer'),
(11, 3, 10, N'Backend Engineer'),
(12, 2, 11, N'Lead Developer'),
(13, 3, 12, N'Fullstack Developer'),
(14, 2, 13, N'Assigned Developer'),
(15, 3, 14, N'Assigned Developer');
SET IDENTITY_INSERT dbo.UserProjects OFF;
GO
