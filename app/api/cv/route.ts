import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-dynamic'

export async function GET() {
  const file = await readFile(path.join(process.cwd(), 'public/assets/Nhuongld-CV.pdf'))

  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Dac-Nhuong-Le-CV.pdf"',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
