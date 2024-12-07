"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { ScheduleItem } from "@/utils/loadSchedule";
import { ScheduleTabs } from "@/components/schedule-tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const {
    data: schedule,
    error,
    isLoading,
  } = useSWR<ScheduleItem[]>("/api/schedule/", fetcher, {
    refreshInterval: 60000, // Обновляем каждую минуту
  });

  // Отображаем ошибку, если есть
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-sm">
          <AlertTitle>Ошибка загрузки расписания</AlertTitle>
          <AlertDescription>
            Не удалось загрузить расписание занятий.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Состояние загрузки с анимацией и информативными сообщениями
  if (isLoading || !schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <motion.div
          className="flex flex-col items-center justify-center p-6 space-y-6 w-full max-w-md border rounded-lg bg-primary-200 shadow-xl mx-4 my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Информативное сообщение */}
          <Alert className="w-full max-w-md bg-transparent text-center border-none">
            <AlertTitle className="text-xl font-semibold text-foreground animate-pulse">
              Загрузка расписания...
            </AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground animate-pulse">
              Пожалуйста, подождите, пока данные загружаются.
            </AlertDescription>
          </Alert>

          {/* Скелетоны для загружаемых данных */}
          <div className="space-y-4 w-full animate-pulse">
            <Skeleton className="h-6 bg-gray-200 dark:bg-muted rounded-lg" />
            <Skeleton className="h-6 bg-gray-200 dark:bg-muted rounded-lg" />
            <Skeleton className="h-6 bg-gray-200 dark:bg-muted rounded-lg" />
            <Skeleton className="h-16 bg-gray-200 dark:bg-muted rounded-lg mt-6" />
            <Skeleton className="h-12 bg-gray-200 dark:bg-muted rounded-lg mt-4" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Отображаем расписание с вкладками и таблицей */}
      <ScheduleTabs scheduleData={schedule} isLoading={isLoading} />
    </div>
  );
}
