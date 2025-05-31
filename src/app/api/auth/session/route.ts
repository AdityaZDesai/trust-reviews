import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { token, email } = await request.json();
  
  // Set the session cookie
  (await cookies()).set({
    name: 'session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 5, // 5 days
    path: '/',
  });

  // Also set the user-email cookie
  if (email) {
    (await cookies()).set({
      name: 'user-email',
      value: email,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  // Clear both cookies on logout
  (await cookies()).delete('session');
  (await cookies()).delete('user-email');
  return NextResponse.json({ success: true });
}