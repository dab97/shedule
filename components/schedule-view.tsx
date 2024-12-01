"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, startOfWeek, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import {
  CalendarIcon,
  GraduationCap,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// import {  AcademicCapIcon, UserIcon, MapPinIcon} from "@heroicons/react/outline";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScheduleItem } from "../types/schedule";

const daysOfWeek = [
  { id: "monday", label: "Пн" },
  { id: "tuesday", label: "Вт" },
  { id: "wednesday", label: "Ср" },
  { id: "thursday", label: "Чт" },
  { id: "friday", label: "Пт" },
  { id: "saturday", label: "Сб" },
];

const timeSlots = [
  "08.30 - 10.00",
  "10.10 - 11.40",
  "12.10 - 13.40",
  "13.50 - 15.20",
  "15.30 - 17.00",
  "17.10 - 18.40",
  "18.50 - 20.20",
  "20.30 - 22.00",
];

interface ScheduleViewProps {
  scheduleData: ScheduleItem[];
}

export function ScheduleView({ scheduleData }: ScheduleViewProps) {
  const [date, setDate] = useState<Date>();
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<ScheduleItem | null>(
    null
  );

    // Начало недели
    const startDate = useMemo(() => {
      const currentDate = date || new Date();
      return startOfWeek(currentDate, { weekStartsOn: 1 });
    }, [date]);
  
    // Генерация дней недели с датами
    const daysWithDates = useMemo(() => {
      return daysOfWeek.map((day, index) => {
        const currentDay = addDays(startDate, index);
        return {
          ...day,
          date: format(currentDay, "dd.MM"), // Форматируем дату
        };
      });
    }, [startDate]);

  const handleLessonClick = (lesson: ScheduleItem) => {
    setSelectedLesson(lesson); // Устанавливаем выбранное занятие
  };

  const filteredData = useMemo(() => {
    return scheduleData.filter(
      (item) =>
        (selectedGroup === "all" || item.group === selectedGroup) &&
        (selectedTeacher === "all" || item.teacher === selectedTeacher) &&
        (!date || item.date === format(date, "dd.MM.yyyy"))
    );
  }, [scheduleData, selectedGroup, selectedTeacher, date]);

  const uniqueGroups = Array.from(
    new Set(scheduleData.map((item) => item.group))
  );
  const uniqueTeachers = Array.from(
    new Set(scheduleData.map((item) => item.teacher))
  );

  const isClient = typeof window !== "undefined";

  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      if (isClient) {
        const handleResize = () => {
          setIsMobile(window.innerWidth < 640);
        };

        handleResize(); // Установить состояние при первом рендере
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }
    }, []);

    return isMobile;
  }

  // Внутри компонента
  const isMobile = useIsMobile();
  return (
    <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="min-w-48 space-y-1 sm:space-y-2">
          <label className="text-sm font-medium">Группа</label>
          <Select onValueChange={(value) => setSelectedGroup(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Все группы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все группы</SelectItem>
              {uniqueGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-80 space-y-1 sm:space-y-2">
          <label className="text-sm font-medium">Преподаватель</label>
          <Select onValueChange={(value) => setSelectedTeacher(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Все преподаватели" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все преподаватели</SelectItem>
              {uniqueTeachers.map((teacher) => (
                <SelectItem key={teacher} value={teacher}>
                  {teacher}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-48 space-y-1 sm:space-y-2">
          <label className="text-sm font-medium">Дата</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-center text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd.MM.yyyy") : "дд.мм.гггг"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                }}
                initialFocus
                weekStartsOn={1} // Установка недели с понедельника
                locale={ru} // Русская локализация
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Desktop day headers */}
      <div className="hidden sm:grid sm:grid-cols-7 gap-2 sm:gap-4">
        <div className="flex items-center justify-center bg-blue-400 p-2 sm:p-4 rounded-lg">
          <span className="sr-only">Время</span>
        </div>
        {daysOfWeek.map((day) => (
          <div
            key={day.id}
            className="flex flex-col items-center justify-center bg-blue-400 text-white p-2 sm:p-4 rounded-lg"
          >
            <h2 className="text-sm sm:text-lg font-semibold">{day.label}</h2>
            <h2 className="text-xs sm:text-sm">{day.date}</h2>
          </div>
        ))}
      </div>

      <div className="space-y-2 sm:space-y-4">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className="sm:grid sm:grid-cols-7 gap-2 sm:gap-4">
            <div className="flex items-center justify-center border bg-sky-50 mb-2 sm:mb-0 p-2 sm:p-4 rounded-lg font-semibold text-sm sm:text-base">
              {timeSlot}
            </div>

            {daysOfWeek.map((day, index) => {
              const lesson = filteredData.find(
                (item) =>
                  item.time === timeSlot &&
                  item.dayOfWeek.toLowerCase().includes(day.label.toLowerCase())
              );

              return lesson ? (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div
                      className="mb-2 sm:mb-0 p-2 sm:p-3 border rounded-lg flex flex-col justify-between h-full cursor-pointer"
                      onClick={() => handleLessonClick(lesson)}
                    >
                      {/* Верхний блок */}
                      <div className="space-y-1 leading-relaxed">
                        <div className="font-semibold text-sm sm:text-sm">
                          {lesson.subject}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {lesson.lessonType}
                        </div>
                      </div>
                      {/* Нижний блок */}
                      <div className="mt-4 space-y-1">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-xs sm:text-xs text-right">
                            {lesson.teacher}
                          </span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs sm:text-xs text-right">
                            ауд. {lesson.classroom}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader className="mt-6 mb-2">
                      <DialogTitle>{lesson.subject}</DialogTitle>
                    </DialogHeader>
                    <div className="">
                      <p>
                        <strong>Тип занятия:</strong> {lesson.lessonType}
                      </p>
                      <p>
                        <strong>Преподаватель:</strong> {lesson.teacher}
                      </p>
                      <p>
                        <strong>Группа:</strong> {lesson.group}
                      </p>
                      <p>
                        <strong>Аудитория:</strong> {lesson.classroom}
                      </p>
                      <p>
                        <strong>Дата:</strong> {lesson.date}
                      </p>
                      <p>
                        <strong>Время:</strong> {lesson.time}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div
                  key={index}
                  className="p-2 sm:p-4 border bg-sky-50 rounded-lg border-dashed mt-2 sm:mt-0"
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
