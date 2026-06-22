import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const { image, filename } = await req.json();
    // Strip data URI prefix
    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(base64, 'base64');

    const dir = path.join(process.cwd(), 'demo-frames');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buf);

    return NextResponse.json({ ok: true, filename });
  } catch (err) {
    console.error('demo-capture error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
