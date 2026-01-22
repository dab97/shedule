"use client";

import useSWR from "swr";
import { useEffect, useRef } from "react";
import { ScheduleItem } from "@/types/schedule";
import { ScheduleTabs } from "@/components/schedule-tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { showScheduleToast, showToast } from "@/components/ui/sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Создаём уникальный ключ для занятия
const createItemKey = (item: ScheduleItem): string => {
  // Используем id если есть, иначе комбинацию всех ключевых полей
  if (item.id) {
    return item.id;
  }
  // Включаем предмет и преподавателя для уникальности
  // (у одной группы может быть несколько занятий в одно время с разными преподавателями)
  return `${item.date}-${item.time}-${item.group}-${item.subject}-${item.teacher}`;
};

// Сравниваем два набора данных и возвращаем детали изменений
interface ChangeDetails {
  added: ScheduleItem[];
  removed: ScheduleItem[];
  modified: { old: ScheduleItem; new: ScheduleItem }[];
}

const compareScheduleData = (
  oldData: ScheduleItem[],
  newData: ScheduleItem[]
): ChangeDetails => {
  const oldMap = new Map<string, ScheduleItem>();
  const newMap = new Map<string, ScheduleItem>();

  oldData.forEach((item) => oldMap.set(createItemKey(item), item));
  newData.forEach((item) => newMap.set(createItemKey(item), item));

  const added: ScheduleItem[] = [];
  const removed: ScheduleItem[] = [];
  const modified: { old: ScheduleItem; new: ScheduleItem }[] = [];

  // Находим добавленные и изменённые
  newData.forEach((newItem) => {
    const key = createItemKey(newItem);
    const oldItem = oldMap.get(key);

    if (!oldItem) {
      added.push(newItem);
    } else if (
      oldItem.subject !== newItem.subject ||
      oldItem.teacher !== newItem.teacher ||
      oldItem.classroom !== newItem.classroom ||
      oldItem.lessonType !== newItem.lessonType
    ) {
      modified.push({ old: oldItem, new: newItem });
    }
  });

  // Находим удалённые
  oldData.forEach((oldItem) => {
    const key = createItemKey(oldItem);
    if (!newMap.has(key)) {
      removed.push(oldItem);
    }
  });

  return { added, removed, modified };
};

// Получаем краткое описание что изменилось
const getChangeLabel = (old: ScheduleItem, current: ScheduleItem): string => {
  const changes: string[] = [];
  if (old.subject !== current.subject) changes.push("предмет");
  if (old.teacher !== current.teacher) changes.push("препод.");
  if (old.classroom !== current.classroom) changes.push("ауд.");
  if (old.lessonType !== current.lessonType) changes.push("тип");
  return changes.join(", ");
};

// Показываем уведомления об изменениях
const showChangeNotifications = (changes: ChangeDetails): void => {
  const maxToasts = 3;
  let count = 0;

  // Добавленные
  for (const item of changes.added) {
    if (count >= maxToasts) break;
    showScheduleToast({
      group: item.group,
      date: item.date,
      time: item.time,
      subject: item.subject,
      classroom: item.classroom,
      variant: 'success',
    });
    count++;
  }

  // Удалённые  
  for (const item of changes.removed) {
    if (count >= maxToasts) break;
    showScheduleToast({
      group: item.group,
      date: item.date,
      time: item.time,
      subject: item.subject,
      classroom: item.classroom,
      variant: 'error',
    });
    count++;
  }

  // Изменённые
  for (const { old, new: cur } of changes.modified) {
    if (count >= maxToasts) break;
    showScheduleToast({
      group: cur.group,
      date: cur.date,
      time: cur.time,
      subject: cur.subject,
      classroom: cur.classroom,
      teacher: cur.teacher,
      lessonType: cur.lessonType,
      variant: 'warning',
      // Передаём старые значения для отображения изменений
      oldSubject: old.subject !== cur.subject ? old.subject : undefined,
      oldClassroom: old.classroom !== cur.classroom ? old.classroom : undefined,
      oldTeacher: old.teacher !== cur.teacher ? old.teacher : undefined,
      oldLessonType: old.lessonType !== cur.lessonType ? old.lessonType : undefined,
    });
    count++;
  }

  // Если есть ещё изменения
  const total = changes.added.length + changes.removed.length + changes.modified.length;
  if (total > maxToasts) {
    showToast({
      title: 'Расписание обновлено',
      message: `Всего ${total} изменений`,
      variant: 'info',
    });
  }
};

export default function Home() {
  const {
    data: schedule,
    error,
    isLoading,
  } = useSWR<ScheduleItem[]>("/api/schedule/", fetcher, {
    refreshInterval: 60000, // Обновляем каждую минуту
  });

  const previousDataRef = useRef<ScheduleItem[] | null>(null);
  const isFirstLoadRef = useRef(true);

  // Отслеживаем изменения в расписании
  useEffect(() => {
    if (schedule && schedule.length > 0) {
      if (isFirstLoadRef.current) {
        // Первая загрузка — просто сохраняем данные
        previousDataRef.current = [...schedule];
        isFirstLoadRef.current = false;
      } else if (previousDataRef.current) {
        const changes = compareScheduleData(previousDataRef.current, schedule);
        const hasChanges = changes.added.length > 0 || changes.removed.length > 0 || changes.modified.length > 0;

        if (hasChanges) {
          showChangeNotifications(changes);
        }

        previousDataRef.current = [...schedule];
      }
    }
  }, [schedule]);

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
