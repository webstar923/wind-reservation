import { NextRequest } from 'next/server';
import { fetchWithAuth } from '@/utils/fetchUtils';

export async function POST(request: NextRequest) {
  let body;

  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON input' }), {
      status: 400,
    });
  }

  try {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/getAvailableCompanies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
