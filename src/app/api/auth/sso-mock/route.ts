import { NextRequest, NextResponse } from 'next/server';
import { getUserBySsoId, getUsers } from '@/lib/db';
import { setAuthCookie, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ssoId = body.ssoId || 'SSO-DEV-101'; // Default demo developer

    let user = await getUserBySsoId(ssoId);
    if (!user) {
      const allUsers = await getUsers();
      user = allUsers.find((u) => u.ssoId === ssoId) || allUsers[0];
    }

    if (!user) {
      return NextResponse.json({ error: 'کاربر SSO یافت نشد.' }, { status: 404 });
    }

    const token = signToken(user);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'ورود از طریق SSO سازمانی با موفقیت انجام شد.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ssoId: user.ssoId,
        department: user.department,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطا در ورود SSO' }, { status: 500 });
  }
}
