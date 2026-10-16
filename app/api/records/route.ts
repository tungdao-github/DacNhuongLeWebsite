import { NextResponse } from 'next/server'
import { getRecords, saveRecord } from '@/lib/content-store'
import type { Entry } from '@/data/model'

export const dynamic = 'force-dynamic'

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export function GET() {
  return json({ records: getRecords() })
}

export async function POST(request: Request) {
  if (!request.headers.get('oai-authenticated-user-id')) return json({ error: 'Please sign in.' }, 401)
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, 403)
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Invalid content type' }, 415)

  try {
    const raw = await request.text()
    if (raw.length > 65000) return json({ error: 'Content is too long.' }, 413)
    const { record, remove } = JSON.parse(raw) as { record?: Partial<Entry>; remove?: boolean }
    if (!record || typeof record.id !== 'string' || !/^[a-zA-Z0-9_-]{1,90}$/.test(record.id)) return json({ error: 'Invalid ID' }, 400)

    if (!remove) {
      const fields = ['kind', 'category', 'titleVi', 'titleEn', 'year', 'authors', 'detailVi', 'detailEn', 'url', 'status'] as const
      if (fields.some((field) => typeof record[field] !== 'string' || record[field].length > 20000)) return json({ error: 'Invalid field.' }, 400)
      if (!['book', 'publication', 'project', 'student', 'service', 'section'].includes(record.kind!) || (!(record.titleEn?.trim()) && !(record.titleVi?.trim()))) return json({ error: 'A title is required.' }, 400)
      if (record.url && !/^https?:\/\//i.test(record.url)) return json({ error: 'The URL must begin with https:// or http://.' }, 400)
      if (record.kind === 'section' && !record.id.startsWith('section-')) return json({ error: 'Invalid section.' }, 400)
    }

    saveRecord(record as Entry, Boolean(remove))
    return json({ ok: true })
  } catch {
    return json({ error: 'Could not save. Please retry.' }, 500)
  }
}
