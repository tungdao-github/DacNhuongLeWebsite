import { NextResponse } from 'next/server'
import { seed } from '@/data/model'

export function GET() {
  return NextResponse.json({ records: seed })
}
