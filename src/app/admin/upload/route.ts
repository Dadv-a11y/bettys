import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import sharp from 'sharp';
import { uploadDir, uploadFile } from '@/lib/uploads';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
export const runtime = 'nodejs';
const isImg = (b: Buffer) => (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || (b.subarray(0, 4).toString('hex') === '89504e47') || (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP');
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const f = (await req.formData()).get('file');
  if (!(f instanceof File)) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  if (f.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Image trop lourde (8 Mo max)' }, { status: 413 });
  const buf = Buffer.from(await f.arrayBuffer());
  if (!isImg(buf)) return NextResponse.json({ error: 'Format accepté : JPEG, PNG ou WebP' }, { status: 415 });
  await mkdir(uploadDir(), { recursive: true });
  const id = randomBytes(12).toString('hex'); const img = sharp(buf).rotate();
  await writeFile(uploadFile(`${id}.webp`), await img.clone().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer());
  await writeFile(uploadFile(`${id}-sm.webp`), await img.clone().resize({ width: 480, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer());
  await logActivity('produit', `Image téléversée (${id.slice(0, 6)})`);
  return NextResponse.json({ url: `/uploads/${id}.webp` });
}
