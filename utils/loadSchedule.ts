import { google } from 'googleapis'
import { ScheduleItem } from '../types/schedule'

export async function loadSchedule(): Promise<ScheduleItem[]> {
  try {
    // Инициализация API таблиц
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    // Получить данные таблицы
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '11yZuQH7QFKQ7KZARLXaShu8U9DlhS1Usubn2hKqjn78',
      range: 'A2:H', // Assuming data starts from A2 and includes columns A through H
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      console.log('Данные не найдены.')
      return []
    }

    // Преобразуйте строки в объекты ScheduleItem
    const schedule: ScheduleItem[] = rows.map((row) => ({
      group: row[0] || '',
      dayOfWeek: row[1] || '',
      date: row[2] || '',
      time: row[3] || '',
      subject: row[4] || '',
      lessonType: row[5] || '',
      teacher: row[6] || '',
      classroom: row[7] || '',
    }))

    return schedule
  } catch (error) {
    console.error('Ошибка загрузки расписания:', error)
    throw error
  }
}
