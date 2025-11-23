// app/api/frame/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Hello from Frame!" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://example.com/frame.jpg" />
        <meta property="fc:frame:button:1" content="Tap me" />
      </head>
      <body></body>
    </html>
  `;

  const response = new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return response;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
