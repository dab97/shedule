'use client'

import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduleView } from './schedule-view'
import ScheduleTable from '@/components/ScheduleTable'
import { ScheduleItem } from '../types/schedule'
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationSettings } from "@/components/NotificationSettings"

interface ScheduleTabsProps {
  scheduleData: ScheduleItem[],
  isLoading: boolean,
  initialGroup?: string,
  initialTeacher?: string
}

export function ScheduleTabs({ scheduleData, isLoading, initialGroup, initialTeacher }: ScheduleTabsProps) {
  // Извлекаем уникальные группы и преподавателей для передачи в NotificationSettings
  const uniqueGroups = useMemo(() => Array.from(
    new Set(scheduleData.map((item) => item.group))
  ).sort(), [scheduleData]);

  const uniqueTeachers = useMemo(() => Array.from(
    new Set(scheduleData.map((item) => item.teacher))
  ).sort(), [scheduleData]);

  return (
    <Tabs defaultValue="calendar" className="container mx-auto">
      <div className="flex items-center justify-center gap-2 my-10">
        <TabsList className="grid max-w-xs sm:max-w-sm grid-cols-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </>
          ) : (
            <>
              <TabsTrigger value="calendar">Календарь</TabsTrigger>
              <TabsTrigger value="table">Таблица</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Кнопка уведомлений */}
        {!isLoading && (
          <NotificationSettings groups={uniqueGroups} teachers={uniqueTeachers} />
        )}
      </div>

      <TabsContent value="calendar">
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <ScheduleView scheduleData={scheduleData} initialGroup={initialGroup} initialTeacher={initialTeacher} />
        )}
      </TabsContent>

      <TabsContent value="table">
        <ScheduleTable scheduleData={scheduleData} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  )
}