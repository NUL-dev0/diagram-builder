export async function GET() {
  try {
    const res = await fetch('http://localhost:3001/health', {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return Response.json({ status: 'OK' });
    return Response.json({ status: 'DOWN' }, { status: 503 });
  } catch {
    return Response.json({ status: 'DOWN' }, { status: 503 });
  }
}
