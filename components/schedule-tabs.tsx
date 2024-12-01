'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduleView } from './schedule-view'
import ScheduleTable from '@/components/ScheduleTable'
import { ScheduleItem } from '../types/schedule'

interface ScheduleTabsProps {
  scheduleData: ScheduleItem[]
}

export function ScheduleTabs({ scheduleData }: ScheduleTabsProps) {
  return (
    <Tabs defaultValue="calendar" className="container mx-auto">
      <TabsList className="grid max-w-xs sm:max-w-sm my-10 mx-auto grid-cols-2">
        <TabsTrigger value="calendar">Календарь</TabsTrigger>
        <TabsTrigger value="table">Таблица</TabsTrigger>
      </TabsList>
      <TabsContent value="calendar">
        <ScheduleView scheduleData={scheduleData} />
      </TabsContent>
      <TabsContent value="table">
        <ScheduleTable scheduleData={scheduleData} />
      </TabsContent>
    </Tabs>
  )
}

