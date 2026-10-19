'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { ProjectFormModal } from '@/components/ProjectFormModal';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardFilterTabs, FilterTabType } from '@/components/dashboard/DashboardFilterTabs';
import { InProgressSection } from '@/components/dashboard/InProgressSection';
import { CompletedSection } from '@/components/dashboard/CompletedSection';
import { PlannedSection } from '@/components/dashboard/PlannedSection';
import { Project, User, DashboardStats, AuthSession } from '@/types';
import { getTodayJalali } from '@/lib/date-utils';

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [currentUser, setCurrentUser] = useState<AuthSession['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    plannedProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    averageProgress: 0,
    totalDevelopers: 0,
  });

  // Filter tab state
  const [activeTab, setActiveTab] = useState<FilterTabType>('ALL');

  // Pagination states (always reset to 1 on refresh / data updates)
  const [pageInProgress, setPageInProgress] = useState(1);
  const [pageCompleted, setPageCompleted] = useState(1);
  const [pagePlanned, setPagePlanned] = useState(1);
  const [pageFiltered, setPageFiltered] = useState(1);

  // Modal & Excel states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  // Reset pagination to avoid stale pagination cache on refresh
  const resetPagination = useCallback(() => {
    setPageInProgress(1);
    setPageCompleted(1);
    setPagePlanned(1);
    setPageFiltered(1);
  }, []);

  // Fetch session and projects data with no-store caching
  const fetchData = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me', { cache: 'no-store' });
      const authData = await authRes.json();

      if (!authRes.ok || !authData.authenticated) {
        router.push('/login');
        return;
      }
      setCurrentUser(authData.user);

      const projRes = await fetch('/api/projects', { cache: 'no-store' });
      const projData = await projRes.json();

      if (projRes.ok) {
        setProjects(projData.projects || []);
        if (projData.stats) setStats(projData.stats);
        if (projData.users) setUsers(projData.users);
      }
      // Always reset pagination to page 1 on refresh / load
      resetPagination();
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router, resetPagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Handle project delete
  const handleDeleteProject = async (id: string) => {
    if (!confirm('آیا از حذف این پروژه اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch {
      alert('خطا در حذف پروژه');
    }
  };

  // Download Excel report (overall or specific user)
  const handleDownloadExcel = async (targetUserId?: string, targetName?: string) => {
    try {
      setDownloadingExcel(true);
      const urlParam = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : '';
      const res = await fetch(`/api/export/excel${urlParam}`, { cache: 'no-store' });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'خطا در صدور فایل اکسل');
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      let filename = targetName
        ? `Projects_Report_${targetName}.xlsx`
        : 'Projects_Report_Overall.xlsx';

      if (disposition) {
        const matchUtf8 = disposition.match(/filename\*=UTF-8''([^;]+)/);
        if (matchUtf8 && matchUtf8[1]) {
          filename = decodeURIComponent(matchUtf8[1]);
        } else {
          const matchStandard = disposition.match(/filename="?([^";]+)"?/);
          if (matchStandard && matchStandard[1]) {
            filename = matchStandard[1];
          }
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('خطا در برقراری ارتباط با سرور برای دانلود گزارش اکسل');
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Quick Switch User between Admin and Developer for demo
  const handleQuickSwitchUser = async (ssoId: string) => {
    try {
      const res = await fetch('/api/auth/sso-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssoId }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      alert('خطا در تغییر کاربر');
    }
  };

  // Filtered lists by status
  const inProgressList = useMemo(
    () => projects.filter((p) => p.status === 'IN_PROGRESS'),
    [projects]
  );
  const completedList = useMemo(
    () => projects.filter((p) => p.status === 'COMPLETED' || p.progress === 100),
    [projects]
  );
  const plannedList = useMemo(
    () => projects.filter((p) => p.status === 'PLANNED'),
    [projects]
  );

  // Active list when a specific tab is active
  const filteredList = useMemo(() => {
    if (activeTab === 'IN_PROGRESS') return inProgressList;
    if (activeTab === 'COMPLETED') return completedList;
    if (activeTab === 'PLANNED') return plannedList;
    return projects;
  }, [activeTab, inProgressList, completedList, plannedList, projects]);

  // Tab switching handler that resets pagination
  const handleTabChange = (tab: FilterTabType) => {
    setActiveTab(tab);
    resetPagination();
  };

  // Pagination constants
  const ITEMS_PER_PAGE_ALL = 3;
  const ITEMS_PER_PAGE_FILTERED = 4;

  const totalPagesInProgress = Math.max(1, Math.ceil(inProgressList.length / ITEMS_PER_PAGE_ALL));
  const totalPagesCompleted = Math.max(1, Math.ceil(completedList.length / ITEMS_PER_PAGE_ALL));
  const totalPagesPlanned = Math.max(1, Math.ceil(plannedList.length / ITEMS_PER_PAGE_ALL));
  const totalPagesFiltered = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE_FILTERED));

  // Sliced items for ALL view (3 items each)
  const pagedInProgressAll = inProgressList.slice(
    (pageInProgress - 1) * ITEMS_PER_PAGE_ALL,
    pageInProgress * ITEMS_PER_PAGE_ALL
  );
  const pagedCompletedAll = completedList.slice(
    (pageCompleted - 1) * ITEMS_PER_PAGE_ALL,
    pageCompleted * ITEMS_PER_PAGE_ALL
  );
  const pagedPlannedAll = plannedList.slice(
    (pagePlanned - 1) * ITEMS_PER_PAGE_ALL,
    pagePlanned * ITEMS_PER_PAGE_ALL
  );

  // Sliced items for filtered view (4 items)
  const pagedFilteredList = filteredList.slice(
    (pageFiltered - 1) * ITEMS_PER_PAGE_FILTERED,
    pageFiltered * ITEMS_PER_PAGE_FILTERED
  );

  const isAdmin = currentUser?.role === 'ADMIN';
  const todayShamsi = getTodayJalali();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c1017]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 text-xs">در حال بارگذاری اطلاعات پروژه‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1017] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 space-y-4">
        {/* Modular Header */}
        <DashboardHeader
          isAdmin={isAdmin}
          theme={theme}
          users={users}
          todayShamsi={todayShamsi}
          downloadingExcel={downloadingExcel}
          onToggleTheme={toggleTheme}
          onQuickSwitchUser={handleQuickSwitchUser}
          onDownloadExcel={handleDownloadExcel}
          onOpenNewProjectModal={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          onLogout={handleLogout}
        />

        {/* 3 Metric Summary Cards */}
        <DashboardMetrics
          inProgressCount={inProgressList.length}
          completedCount={completedList.length}
          plannedCount={plannedList.length}
        />

        {/* Filter Tabs */}
        <DashboardFilterTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* SECTION 1: پروژه‌های در حال اجرا */}
        {(activeTab === 'ALL' || activeTab === 'IN_PROGRESS') && (
          <InProgressSection
            projects={activeTab === 'ALL' ? pagedInProgressAll : pagedFilteredList}
            totalCount={inProgressList.length}
            currentPage={activeTab === 'ALL' ? pageInProgress : pageFiltered}
            totalPages={activeTab === 'ALL' ? totalPagesInProgress : totalPagesFiltered}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onPageChange={activeTab === 'ALL' ? setPageInProgress : setPageFiltered}
            onEdit={(p) => {
              setEditingProject(p);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteProject}
            onProgressUpdated={fetchData}
          />
        )}

        {/* SECTION 2: پروژه‌های تکمیل‌شده و تحویل‌شده */}
        {(activeTab === 'ALL' || activeTab === 'COMPLETED') && (
          <CompletedSection
            projects={activeTab === 'ALL' ? pagedCompletedAll : pagedFilteredList}
            totalCount={completedList.length}
            currentPage={activeTab === 'ALL' ? pageCompleted : pageFiltered}
            totalPages={activeTab === 'ALL' ? totalPagesCompleted : totalPagesFiltered}
            onPageChange={activeTab === 'ALL' ? setPageCompleted : setPageFiltered}
            onEdit={(p) => {
              setEditingProject(p);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteProject}
          />
        )}

        {/* SECTION 3: پروژه‌های آتی */}
        {(activeTab === 'ALL' || activeTab === 'PLANNED') && (
          <PlannedSection
            projects={activeTab === 'ALL' ? pagedPlannedAll : pagedFilteredList}
            totalCount={plannedList.length}
            currentPage={activeTab === 'ALL' ? pagePlanned : pageFiltered}
            totalPages={activeTab === 'ALL' ? totalPagesPlanned : totalPagesFiltered}
            onPageChange={activeTab === 'ALL' ? setPagePlanned : setPageFiltered}
            onEdit={(p) => {
              setEditingProject(p);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteProject}
          />
        )}
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchData}
        projectToEdit={editingProject}
        users={users}
        currentUserId={currentUser?.id || ''}
        isAdmin={isAdmin}
      />
    </div>
  );
}
