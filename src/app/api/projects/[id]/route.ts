import { NextRequest, NextResponse } from 'next/server';
import { updateProject, updateProjectProgress, deleteProject, getProjectById } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    return NextResponse.json({ error: 'پروژه یافت نشد.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, project });
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'عدم احراز هویت' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getProjectById(id);
    if (!existing) {
      return NextResponse.json({ error: 'پروژه یافت نشد.' }, { status: 404 });
    }

    // Only project owner or Admin can update
    if (currentUser.role !== 'ADMIN' && existing.userId !== currentUser.id) {
      return NextResponse.json({ error: 'شما دسترسی ویرایش این پروژه را ندارید.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await updateProject(id, body);

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطا در ویرایش پروژه' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'عدم احراز هویت' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getProjectById(id);
    if (!existing) {
      return NextResponse.json({ error: 'پروژه یافت نشد.' }, { status: 404 });
    }

    // Admin cannot change progress bar; only the assigned developer can update progress
    const isAssigned = existing.users?.some((u) => u.id === currentUser.id) || false;
    if (currentUser.role === 'ADMIN' || !isAssigned) {
      return NextResponse.json(
        { error: 'مدیران مجاز به تغییر اسلایدر درصد پیشرفت نیستند. تنها توسعه‌دهنده مسئول پروژه می‌تواند پیشرفت را بهروزرسانی کند.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { progress } = body;

    if (typeof progress !== 'number') {
      return NextResponse.json({ error: 'مقدار درصد پیشرفت معتبر نیست.' }, { status: 400 });
    }

    const updated = await updateProjectProgress(id, progress);
    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطا در بهروزرسانی پیشرفت' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'عدم احراز هویت' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getProjectById(id);
    if (!existing) {
      return NextResponse.json({ error: 'پروژه یافت نشد.' }, { status: 404 });
    }

    if (currentUser.role !== 'ADMIN' && existing.userId !== currentUser.id) {
      return NextResponse.json({ error: 'شما دسترسی حذف این پروژه را ندارید.' }, { status: 403 });
    }

    const deleted = await deleteProject(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطا در حذف پروژه' }, { status: 500 });
  }
}
