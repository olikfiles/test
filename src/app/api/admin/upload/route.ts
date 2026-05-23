import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';

const CTX = 'admin/upload';

const BUCKET = 'menu-images';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// POST /api/admin/upload
// Upload a menu item image to Supabase Storage.
// Accepts multipart/form-data with a single field named "file".
// Returns: { url: string }  — the public URL of the uploaded image.
//
// Supabase Storage setup required:
//   1. Create a bucket named "menu-images" in Supabase Dashboard → Storage
//   2. Set the bucket to Public (so images are accessible without a signed URL)
export async function POST(req: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logger.error(CTX, 'Storage upload failed', { message: uploadError.message });
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    logger.info(CTX, `Uploaded ${filename} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)`);
    return NextResponse.json({ url: urlData.publicUrl }, { status: 201 });
  } catch (err: any) {
    logger.error(CTX, 'Upload error', { message: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
