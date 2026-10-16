import { saveUpload } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

function detectImage(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index])) return 'image/png'
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP') return 'image/webp'
  return null
}

export async function POST(request: Request) {
  if (!request.headers.get('oai-authenticated-user-id')) return Response.json({ error: 'Please sign in.' }, { status: 401 })
  try {
    const bytes = new Uint8Array(await request.arrayBuffer())
    if (bytes.byteLength > 5 * 1024 * 1024) return Response.json({ error: 'Choose an image smaller than 5 MB.' }, { status: 413 })
    const contentType = detectImage(bytes)
    if (!contentType) return Response.json({ error: 'Use a JPG, PNG or WebP cover image.' }, { status: 400 })
    const id = crypto.randomUUID()
    saveUpload(id, { bytes, contentType })
    return Response.json({ url: `/api/media/${id}` })
  } catch {
    return Response.json({ error: 'Could not upload this image. Please retry.' }, { status: 400 })
  }
}
