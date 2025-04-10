import { NextResponse } from 'next/server';
import { setCookie } from '@/utils/cookieUtils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';  
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    
    if (!res.ok) {     
      const responseText = await res.text();
      const errorData = responseText ? JSON.parse(responseText) : { message: 'Error during login' };
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    
    // Set cookies with security flags
    await setCookie('accessToken', data.accessToken, { maxAge: 60 * 60 * 300});
    await setCookie('refreshToken', data.refreshToken, { maxAge: 60 * 60 * 300 });

    const response = NextResponse.json(data);
    response.cookies.set('accessToken', data.accessToken, {
      httpOnly: true, // Prevents JavaScript access
      secure: false, // HTTPS only in production
      sameSite: 'strict', // Protects against CSRF
      maxAge: 60 * 60, // 1 hour
      path: '/' // Accessible across the site
    });

    response.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    });
    return response;

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out');
      return NextResponse.json({ error: 'Request timed out' }, { status: 408 });
    }

    console.error('Fetch failed:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
