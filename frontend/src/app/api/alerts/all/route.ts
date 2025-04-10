import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/utils/fetchUtils';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const res = await fetchWithAuth(`${NEXT_PUBLIC_API_BASE_URL}/alert/all`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const responseText = await res.text();
    const data = responseText ? JSON.parse(responseText) : {};
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500  });
  }
}