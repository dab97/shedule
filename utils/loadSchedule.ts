import { parse } from 'csv-parse/sync'
import { ScheduleItem } from '../types/schedule'
import fs from 'fs'
import path from 'path'

export async function loadSchedule(): Promise<ScheduleItem[]> {
  const filePath = path.join(process.cwd(), 'public', 'shedule.csv')
  const csvData = fs.readFileSync(filePath, 'utf-8')
  
  console.log('Raw CSV data:', csvData) // Добавим лог для отладки

  const records = parse(csvData, {
    columns: ['group', 'dayOfWeek', 'date', 'time', 'subject', 'lessonType', 'teacher', 'classroom'],
    delimiter: ';',
    from_line: 2
  })

  console.log('Parsed records:', records) // Добавим лог для отладки

  return records
}

