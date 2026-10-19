import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import { comparePassword, setAuthCookie, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'لطفاً ایمیل و رمز عبور را وارد کنید.' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'کاربری با این مشخصات یافت نشد.' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'رمز عبور وارد شده اشتباه است.' }, { status: 401 });
    }

    const token = signToken(user);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
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
    return NextResponse.json({ error: error.message || 'خطای سرور رخ داد.' }, { status: 500 });
  }
}
