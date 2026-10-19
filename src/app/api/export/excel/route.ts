import { NextRequest, NextResponse } from 'next/server';
import { getProjects, getUserById } from '@/lib/db';
import { generateProjectsExcelReport } from '@/lib/excel';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'عدم احراز هویت' }, { status: 401 });
    }

    // Only Admin can export Excel reports (both overall and developer-specific)
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز. خروجی اکسل منحصراً در اختیار مدیر سیستم است.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');
    const effectiveUserId = requestedUserId;

    let developer = null;
    if (effectiveUserId) {
      developer = await getUserById(effectiveUserId);
    }

    const projects = await getProjects({
      userId: effectiveUserId || undefined,
    });

    const buffer = await generateProjectsExcelReport({
      projects,
      developer,
      generatedBy: currentUser?.name || 'مدیر سیستم',
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const asciiSafeFilename = developer
      ? `Projects_Report_${developer.id}_${timestamp}.xlsx`
      : `Projects_Report_Overall_${timestamp}.xlsx`;
    const fullPersianFilename = developer
      ? `گزارش_پروژه_${developer.name.replace(/[\s\(\)]+/g, '_')}_${timestamp}.xlsx`
      : `گزارش_جامع_پروژه‌ها_${timestamp}.xlsx`;

    // Encode filename for Persian characters in Content-Disposition according to RFC 5987 / RFC 6266
    const encodedFilename = encodeURIComponent(fullPersianFilename);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${asciiSafeFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطا در صدور فایل اکسل' }, { status: 500 });
  }
}
