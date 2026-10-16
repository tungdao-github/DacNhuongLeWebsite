import { getUpload } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response('Not found', { status: 404 })
  const upload = getUpload(id)
  if (!upload) return new Response('Not found', { status: 404 })
  return new Response(upload.bytes, {
    headers: {
      'Content-Type': upload.contentType,
      'Cache-Control': 'private, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
