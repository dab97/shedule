'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduleView } from './schedule-view'
import ScheduleTable from '@/components/ScheduleTable'
import { ScheduleItem } from '../types/schedule'
import { Skeleton } from "@/components/ui/skeleton"

interface ScheduleTabsProps {
  scheduleData: ScheduleItem[],
  isLoading: boolean,
  initialGroup?: string,
  initialTeacher?: string
}

export function ScheduleTabs({ scheduleData, isLoading, initialGroup, initialTeacher }: ScheduleTabsProps) {
  return (
    <Tabs defaultValue="calendar" className="container mx-auto">
      <TabsList className="grid max-w-xs sm:max-w-sm my-10 mx-auto grid-cols-2">
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