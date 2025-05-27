import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  
  // Set the session cookie
  (await
        // Set the session cookie
        cookies()).set({
    name: 'session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 5, // 5 days
    path: '/',
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  // Clear the session cookie on logout
  (await
        // Clear the session cookie on logout
        cookies()).delete('session');
  return NextResponse.json({ success: true });
}