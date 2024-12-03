import { Suspense } from 'react'
import { loadSchedule } from '../utils/loadSchedule'
import { ScheduleTabs } from '@/components/schedule-tabs'
import { ScheduleItem } from '../types/schedule';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

export default async function SchedulePage() {
  let scheduleData: ScheduleItem[] = [];
  let error = null

  try {
    scheduleData = await loadSchedule()
  } catch (err) {
    console.error('Error loading schedule data:', err)
    error = err instanceof Error ? err.message : 'An unknown error occurred'
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>
          Не удалось загрузить данные расписания: {error}
          <br />
          Пожалуйста, проверьте файл shedule.csv и попробуйте снова.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Suspense fallback={<SchedulePageSkeleton />}>
      {scheduleData.length > 0 ? (
        <ScheduleTabs scheduleData={scheduleData} />
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Внимание</AlertTitle>
          <AlertDescription>
            Данные расписания пусты. Пожалуйста, проверьте файл shedule.csv
          </AlertDescription>
        </Alert>
      )}
    </Suspense>
  )
}

function SchedulePageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}

