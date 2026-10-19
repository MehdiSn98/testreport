import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject, getDashboardStats, getUsers } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const searchQuery = searchParams.get('search') || undefined;

    // Developer can only view their own projects, while Admin can view all or filter by requested user
    const effectiveUserId =
      currentUser?.role === 'ADMIN'
        ? requestedUserId
        : currentUser?.id;

    const projects = await getProjects({
      userId: effectiveUserId,
      status,
      searchQuery,
    });

    const stats = await getDashboardStats();
    const users = await getUsers();

    return NextResponse.json({
      success: true,
      projects,
      stats,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        avatar: u.avatar,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطا در دریافت پروژه‌ها' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'عدم احراز هویت. لطفاً ابتدا وارد شوید.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status, progress, startDate, endDate, targetUserId } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'عنوان پروژه و تاریخ‌های شروع و پایان الزامی هستند.' },
        { status: 400 }
      );
    }

    // Admins do not create projects; only developers create projects for themselves
    if (currentUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'مدیران سیستم نقش نظارتی دارند و ثبت پروژه منحصراً بر عهده توسعه‌دهندگان است.' },
        { status: 403 }
      );
    }

    const assignedUserId = currentUser.id;

    const newProject = await createProject({
      userIds: [assignedUserId],
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status === 'COMPLETED' ? 'COMPLETED' : status === 'PLANNED' ? 'PLANNED' : 'IN_PROGRESS',
      progress: typeof progress === 'number' ? progress : 0,
      startDate,
      endDate,
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطا در ایجاد پروژه' }, { status: 500 });
  }
}
