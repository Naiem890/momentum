
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const response = await fetch('https://zenquotes.io/api/random', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`ZenQuotes API responded with status: ${response.status}`);
    }

    const data = await response.json();

    console.log(data);
    
    // ZenQuotes returns an array like [{ q: "quote", a: "author", ... }]
    if (Array.isArray(data) && data.length > 0) {
      return NextResponse.json({
        quote: data[0].q,
        author: data[0].a
      });
    }

    throw new Error('Invalid response format from ZenQuotes');
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
