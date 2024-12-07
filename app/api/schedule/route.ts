// app/api/schedule/route.ts
import { NextResponse } from 'next/server'
import { loadSchedule } from '@/utils/loadSchedule'

export async function GET() {
  try {
    const schedule = await loadSchedule()
    return NextResponse.json(schedule)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при загрузке расписания' }, { status: 500 })
  }
}