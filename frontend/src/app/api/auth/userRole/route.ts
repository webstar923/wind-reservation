import { NextResponse } from 'next/server';
import { getCookie } from '@/utils/cookieUtils';
import { jwtDecode } from 'jwt-decode';

export async function GET() {
  try {  
    const token = await getCookie('accessToken');
    
    if (!token) {
      return NextResponse.json({ message: 'No token found' }, { status: 401 });
    }

    const decoded = jwtDecode<{ role: string }>(token);
    const userRole = decoded.role;
    
    return NextResponse.json({ role: userRole }, { status: 200 });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
