import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/utils/fetchUtils';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const res = await fetchWithAuth(`${NEXT_PUBLIC_API_BASE_URL}/chat`, {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();    
    const res = await fetchWithAuth(`${NEXT_PUBLIC_API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const responseText = await res.text();
    const data = responseText ? JSON.parse(responseText) : {};
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status:500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');   
    const body = await request.json();    
    const res = await fetchWithAuth(`${NEXT_PUBLIC_API_BASE_URL}/chat/${id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const responseText = await res.text();
    const data = responseText ? JSON.parse(responseText) : {};
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const res = await fetchWithAuth(`${NEXT_PUBLIC_API_BASE_URL}/chat/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const responseText = await res.text();
    const data = responseText ? JSON.parse(responseText) : {};
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
