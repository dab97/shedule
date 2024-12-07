"use client";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  format,
  startOfWeek,
  addDays,
  parse,
  isWithinInterval,
} from "date-fns";
import { ru } from "date-fns/locale";
import {
  CalendarDays,
  CalendarIcon,
  MapPin,
  Clock,
  FileText,
  User,
  Users,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
  const [date, setDate] = useState<Date>(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<ScheduleItem | null>(
    null
  );

  const getCurrentWeekDates = () => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = addDays(start, 6);
    return { start, end };
  };

  const daysWithDates = useMemo(() => {
    const { start } = getCurrentWeekDates();
    return daysOfWeek.map((day, index) => {
      const currentDay = addDays(start, index);
      return {
        ...day,
        date: format(currentDay, "dd.MM"),
      };
    });
  }, [date]);

  const handleLessonClick = (lesson: ScheduleItem) => {
    setSelectedLesson(lesson);
  };

  const filteredData = useMemo(() => {
    const { start, end } = getCurrentWeekDates();
    return scheduleData.filter((item) => {
      const itemDate = parse(item.date, "dd.MM.yyyy", new Date());
      return (
        (selectedGroup === "all" || item.group === selectedGroup) &&
        (selectedTeacher === "all" || item.teacher === selectedTeacher) &&
        item.teacher.toLowerCase().includes(searchTerm.toLowerCase()) &&
        isWithinInterval(itemDate, { start, end })
      );
    });
  }, [scheduleData, selectedGroup, selectedTeacher, date]);

  const uniqueGroups = Array.from(
    new Set(scheduleData.map((item) => item.group))
  );
  const uniqueTeachers = Array.from(
    new Set(scheduleData.map((item) => item.teacher))
  );

  return (
    <div className="container mx-auto p-4 space-y-6 overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="min-w-48 space-y-2">
          <label className="text-sm font-medium">Группа</label>
          <Select onValueChange={(value) => setSelectedGroup(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Все группы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все группы</SelectItem>
              {uniqueGroups
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-48 space-y-2">
          <label className="text-sm font-medium">Преподаватель</label>
          <Select onValueChange={(value) => setSelectedTeacher(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Все преподаватели" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все преподаватели</SelectItem>
              {uniqueTeachers
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map((teacher) => (
                  <SelectItem key={teacher} value={teacher}>
                    {teacher}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-40 space-y-2">
          <label className="text-sm font-medium">Неделя</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {format(date, "dd.MM.yyyy")}
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                weekStartsOn={1}
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <h2 className="text-center text-xl font-bold mb-4">
        Расписание на неделю:{" "}
        {format(getCurrentWeekDates().start, "dd.MM.yyyy")} -{" "}
        {format(getCurrentWeekDates().end, "dd.MM.yyyy")}
      </h2>

      {/* Мобильная версия */}
      <div className="block sm:hidden space-y-6">
        {daysWithDates.map((day) => {
          // Проверяем, есть ли занятия в этот день на текущей неделе
          const hasLessons = timeSlots.some((timeSlot) =>
            filteredData.some(
              (item) =>
                item.time === timeSlot &&
                item.dayOfWeek
                  .toLowerCase()
                  .includes(day.label.toLowerCase()) &&
                isWithinInterval(parse(item.date, "dd.MM.yyyy", new Date()), {
                  start: getCurrentWeekDates().start,
                  end: getCurrentWeekDates().end,
                })
            )
          );

          // Если нет занятий на текущей неделе, не рендерим заголовок дня
          if (!hasLessons) {
            return null; // Пропускаем рендеринг, если нет занятий
          }

          return (
            <div key={`${day.label}-${day.date}`} className="space-y-2">
              <div className="border  text-center p-4 rounded-lg font-semibold bg-slate-100 dark:bg-gray-900">
                {day.label} ({day.date})
              </div>
              {timeSlots.map((timeSlot) => {
                const lesson = filteredData.find(
                  (item) =>
                    item.time === timeSlot &&
                    item.dayOfWeek
                      .toLowerCase()
                      .includes(day.label.toLowerCase()) &&
                    isWithinInterval(
                      parse(item.date, "dd.MM.yyyy", new Date()),
                      {
                        start: getCurrentWeekDates().start,
                        end: getCurrentWeekDates().end,
                      }
                    )
                );

                return lesson ? (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <div
                        className="p-3 border rounded-lg flex flex-col justify-between cursor-pointer"
                        onClick={() => handleLessonClick(lesson)}
                      >
                        <div className="space-y-1 leading-relaxed">
                          <div className="font-semibold text-sm">
                            {lesson.subject}
                          </div>
                          <div className="text-xs">
                            {lesson.lessonType}
                          </div>
                        </div>
                        <div className="mt-4 space-y-1 flex-grow flex flex-col">
                          <div className="flex flex-row items-center justify-end space-x-2">
                            <span className="text-xs text-right">
                              {lesson.teacher}
                            </span>
                          </div>
                          <div className="flex items-center justify-between space-x-2 mt-auto">
                            <div className="flex items-center justify-start space-x-2">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs text-left">
                                {lesson.time}
                              </span>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-xs text-right">
                                {lesson.classroom}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DrawerTrigger>
                    <DrawerContent aria-describedby={`description-${lesson}`}>
                      <DrawerHeader className="pt-10">
                        <DrawerTitle className="text-center text-xl font-semibold mt-4">
                          {lesson.subject}
                        </DrawerTitle>
                      </DrawerHeader>
                      <div id={`description-${lesson}`} className="px-4 pb-4">
                        <div className="flex flex-col gap-0.5 divide-y divide-dashed">
                          {[
                            {
                              icon: (
                                <FileText className="w-5 h-5" />
                              ),
                              label: "Тип занятия",
                              value: lesson.lessonType,
                            },
                            {
                              icon: <User className="w-5 h-5" />,
                              label: "Преподаватель",
                              value: lesson.teacher,
                            },
                            {
                              icon: (
                                <Users className="w-5 h-5" />
                              ),
                              label: "Группа",
                              value: lesson.group,
                            },
                            {
                              icon: (
                                <MapPin className="w-5 h-5" />
                              ),
                              label: "Аудитория",
                              value: lesson.classroom,
                            },
                            {
                              icon: (
                                <CalendarDays className="w-5 h-5" />
                              ),
                              label: "Дата",
                              value: lesson.date,
                            },
                            {
                              icon: (
                                <Clock className="w-5 h-5" />
                              ),
                              label: "Время",
                              value: lesson.time,
                            },
                          ].map(({ icon, label, value }, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                            >
                              <div className="flex items-center gap-2">
                                {icon}
                                <span className="text-left">
                                  {value}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="px-3 py-1 rounded-lg"
                              >
                                {label}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                ) : null;
              })}
            </div>
          );
        })}
      </div>
      {/* Десктопная версия */}
      <div className="hidden sm:block space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[repeat(7,minmax(200px,1fr))] gap-4">
          <div className="flex flex-col items-center justify-center border bg-slate-100 dark:bg-gray-900 p-4 rounded-lg">
            <h2 className="text-sm sm:text-lg font-semibold">Время</h2>
          </div>
          {daysWithDates.map((day) => (
            <div
              key={day.id}
              className="flex flex-col items-center justify-center border bg-slate-100 dark:bg-gray-900 p-4 rounded-lg"
            >
              <h2 className="text-sm sm:text-lg font-semibold">{day.label}</h2>
              <h2 className="text-xs sm:text-sm">{day.date}</h2>
            </div>
          ))}
        </div>

        {timeSlots.map((timeSlot) => (
          <div
            key={timeSlot}
            className="grid grid-cols-1 md:grid-cols-[repeat(7,minmax(200px,1fr))] gap-4"
          >
            <div className="flex items-center justify-center border text-slate-500 dark:text-slate-50 bg-slate-100 dark:bg-gray-900 p-4 rounded-lg font-black text-sm sm:text-2xl">
              {timeSlot}
            </div>

            {daysOfWeek.map((day, index) => {
              const lesson = filteredData.find(
                (item) =>
                  item.time === timeSlot &&
                  item.dayOfWeek
                    .toLowerCase()
                    .includes(day.label.toLowerCase()) &&
                  isWithinInterval(parse(item.date, "dd.MM.yyyy", new Date()), {
                    start: getCurrentWeekDates().start,
                    end: getCurrentWeekDates().end,
                  })
              );

              return lesson ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <div
                      className="p-3 border rounded-lg flex flex-col justify-between h-full cursor-pointer"
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="space-y-1 leading-relaxed">
                        <div className="font-semibold text-sm">
                          {lesson.subject}
                        </div>
                        <div className="text-xs">
                          {lesson.lessonType}
                        </div>
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-xs text-right">
                            {lesson.teacher}
                          </span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs text-right">
                            ауд. {lesson.classroom}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="p-6 rounded-lg shadow-lg animate-fade-in">
                    <DialogHeader>
                      <DialogTitle className="text-center text-xl font-semibold mt-6">
                        {lesson.subject}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 items-center">
                      <div className="w-full max-w-lg rounded-md px-5 py-3 divide-y divide-dashed">
                        {[
                          {
                            icon: (
                              <FileText className="w-5 h-5" />
                            ),
                            label: "Тип занятия",
                            value: lesson.lessonType,
                          },
                          {
                            icon: <User className="w-5 h-5" />,
                            label: "Преподаватель",
                            value: lesson.teacher,
                          },
                          {
                            icon: <Users className="w-5 h-5" />,
                            label: "Группа",
                            value: lesson.group,
                          },
                          {
                            icon: <MapPin className="w-5 h-5" />,
                            label: "Аудитория",
                            value: lesson.classroom,
                          },
                          {
                            icon: (
                              <CalendarDays className="w-5 h-5" />
                            ),
                            label: "Дата",
                            value: lesson.date,
                          },
                          {
                            icon: <Clock className="w-5 h-5" />,
                            label: "Время",
                            value: lesson.time,
                          },
                        ].map(({ icon, label, value }, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center gap-2">
                              {icon}
                              <span className="text-left">
                                {value}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="px-3 py-1 rounded-full"
                            >
                              {label}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div
                  key={day.id}
                  className="flex items-center justify-center p-4 border text-inherit bg-slate-50 dark:bg-gray-950 rounded-lg border-dashed"
                >
                  Нет занятий
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
