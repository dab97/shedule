"use client";
import { useState, useMemo, useEffect } from "react";
import { isLessonActive, isToday } from "@/lib/time-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { showToast } from "@/components/ui/sonner";
import {
  format,
  startOfWeek,
  addDays,
  addMonths,
  parse,
  isWithinInterval,
}
  from "date-fns";
import { ru } from "date-fns/locale";
import {
  CalendarDays,
  CalendarIcon,
  MapPin,
  Clock,
  FileText,
  User,
  Users,
  Check,
  ChevronsUpDown,
  CalendarSync,
  Copy,
  Link,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, getDeclension } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScheduleItem } from "@/types/schedule";
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  DATE_FORMATS,
  STORAGE_KEYS,
  BREAKPOINTS,
  API_ENDPOINTS
} from "@/lib/constants";

type ScheduleViewProps = {
  scheduleData: ScheduleItem[];
  initialGroup?: string;
  initialTeacher?: string;
};

// В карточке занятия (как для мобильной, так и для десктопной версии)
const LessonCard = ({ lessons }: { lessons: ScheduleItem[] }) => {
  return (
    <div className="p-3 border rounded-lg flex flex-col justify-between h-full cursor-pointer">
      {lessons.map((lesson, index) => (
        <div
          key={index}
          className={cn("flex flex-col", index > 0 && "mt-2 pt-2 border-t")}
        >
          <div className="space-y-1 leading-relaxed">
            <div className="font-semibold text-sm">{lesson.subject}</div>
            <div className="text-xs">{lesson.lessonType}</div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-end space-x-2">
              <span className="text-xs text-right">{lesson.teacher}</span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="text-xs text-right">
                ауд. {lesson.classroom}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export function ScheduleView({ scheduleData, initialGroup, initialTeacher }: ScheduleViewProps) {
  // Инициализация состояния с приоритетом: Props (URL) -> LocalStorage -> Default
  const getInitialState = (key: string, propValue?: string) => {
    if (propValue && propValue !== "all") return propValue;
    if (typeof window !== "undefined") {
      return localStorage.getItem(key) || "all";
    }
    return "all";
  };

  const [date, setDate] = useState<Date>(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>(() => getInitialState(STORAGE_KEYS.SELECTED_GROUP, initialGroup));
  const [selectedTeacher, setSelectedTeacher] = useState<string>(() => getInitialState(STORAGE_KEYS.SELECTED_TEACHER, initialTeacher));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<ScheduleItem | null>(
    null
  );
  const [isDesktop, setIsDesktop] = useState(false);
  const [groupComboboxOpen, setGroupComboboxOpen] = useState(false);
  const [teacherComboboxOpen, setTeacherComboboxOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  const [isDesktopCalendarOpen, setIsDesktopCalendarOpen] = useState(false);

  // Синхронизация с URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      if (selectedGroup !== "all") {
        params.set("group", selectedGroup);
        params.delete("teacher"); // Взаимоисключающие фильтры в текущей логике
      } else {
        params.delete("group");
      }

      if (selectedTeacher !== "all") {
        params.set("teacher", selectedTeacher);
        params.delete("group");
      } else {
        params.delete("teacher");
      }

      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;

      // Используем replaceState чтобы не засорять историю
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [selectedGroup, selectedTeacher]);

  // Haptic feedback для PWA
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  };

  // Для обновления подсветки текущего времени
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Обработка свайпов для календаря
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      triggerHaptic();
      if (diff > 0) {
        // Свайп влево - следующий месяц
        setCalendarMonth(prev => addMonths(prev, 1));
      } else {
        // Свайп вправо - предыдущий месяц
        setCalendarMonth(prev => addMonths(prev, -1));
      }
    }
    setTouchStart(null);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.SM); // Tailwind's 'sm' breakpoint
    };
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSaveGroup = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP, selectedGroup);
      localStorage.setItem(STORAGE_KEYS.SELECTED_TEACHER, "all");
      setSelectedTeacher("all");
      showToast({
        title: `Группа "${selectedGroup}" сохранена!`,
        message: "Теперь это ваша группа по умолчанию",
        variant: 'success',
      });
    }
  };

  const handleSaveTeacher = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TEACHER, selectedTeacher);
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP, "all");
      setSelectedGroup("all");
      showToast({
        title: `Преподаватель "${selectedTeacher}" сохранён!`,
        message: "Теперь это ваш профиль по умолчанию",
        variant: 'success',
      });
    }
  };

  const getCurrentWeekDates = () => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = addDays(start, 6);
    return { start, end };
  };

  const daysWithDates = useMemo(() => {
    const { start } = getCurrentWeekDates();
    return DAYS_OF_WEEK.map((day, index) => {
      const currentDay = addDays(start, index);
      return {
        ...day,
        date: format(currentDay, DATE_FORMATS.SHORT),
        fullDate: format(currentDay, DATE_FORMATS.FULL),
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

  const uniqueGroups = useMemo(() => Array.from(
    new Set(scheduleData.map((item) => item.group))
  ), [scheduleData]);
  const uniqueTeachers = useMemo(() => Array.from(
    new Set(scheduleData.map((item) => item.teacher))
  ), [scheduleData]);

  // Этот эффект теперь не обязателен для инициализации, так как мы используем useState с функцией,
  // но он может быть полезен, если props изменятся извне (например при навигации)
  useEffect(() => {
    if (initialGroup && initialGroup !== "all") setSelectedGroup(initialGroup);
    if (initialTeacher && initialTeacher !== "all") setSelectedTeacher(initialTeacher);
  }, [initialGroup, initialTeacher]);

  return (
    <div className="container mx-auto p-4 space-y-6 overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-full sm:w-56 space-y-2">
          <label className="text-sm font-medium">Группа</label>
          <Popover open={groupComboboxOpen} onOpenChange={setGroupComboboxOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={groupComboboxOpen}
                className="w-full justify-between font-normal"
              >
                <span className="truncate">
                  {selectedGroup === "all" ? "Все группы" : selectedGroup}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-56 p-0">
              <Command>
                <CommandInput placeholder="Поиск группы..." />
                <CommandEmpty>Группа не найдена</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setSelectedGroup("all");
                      setGroupComboboxOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedGroup === "all" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Все группы
                  </CommandItem>
                  {uniqueGroups
                    .slice()
                    .sort((a, b) => a.localeCompare(b))
                    .map((group) => (
                      <CommandItem
                        key={group}
                        value={group}
                        onSelect={(currentValue) => {
                          setSelectedGroup(currentValue === selectedGroup ? "all" : currentValue);
                          setGroupComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedGroup === group ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {group}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedGroup !== "all" && selectedTeacher === "all" && (
            <Button onClick={handleSaveGroup} className="w-full mt-2">Моя группа</Button>
          )}
          {selectedGroup !== "all" && selectedTeacher === "all" && (
            <Popover modal={false}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full mt-2">
                  <CalendarSync className="h-4 w-4" />
                  Подписаться на календарь
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="start">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Ссылка для подписки:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-muted p-2 rounded truncate">
                      {typeof window !== 'undefined' ? `${window.location.origin}${API_ENDPOINTS.CALENDAR}${encodeURIComponent(selectedGroup)}` : ''}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}${API_ENDPOINTS.CALENDAR}${encodeURIComponent(selectedGroup)}`);
                        showToast({ title: "Готово!", message: "Ссылка скопирована в буфер обмена", variant: "success" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="font-medium">iPhone (iOS):</div>
                    <div>Настройки → Календарь → Учётные записи → Добавить → Другое → Подписка</div>
                    <div className="font-medium mt-2">Google Calendar:</div>
                    <div className="flex items-center gap-1 flex-wrap">Другие календари → <Badge variant="outline" className="h-4 w-4 p-0 inline-flex items-center justify-center rounded-full"><Plus className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={3} /></Badge> → По URL</div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="w-full sm:w-80 space-y-2">
          <label className="text-sm font-medium">Преподаватель</label>
          <Popover open={teacherComboboxOpen} onOpenChange={setTeacherComboboxOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={teacherComboboxOpen}
                className="w-full justify-between font-normal"
              >
                <span className="truncate">
                  {selectedTeacher === "all" ? "Все преподаватели" : selectedTeacher}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 p-0">
              <Command>
                <CommandInput placeholder="Поиск преподавателя..." />
                <CommandEmpty>Преподаватель не найден</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setSelectedTeacher("all");
                      setTeacherComboboxOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTeacher === "all" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Все преподаватели
                  </CommandItem>
                  {uniqueTeachers
                    .slice()
                    .sort((a, b) => a.localeCompare(b))
                    .map((teacher) => (
                      <CommandItem
                        key={teacher}
                        value={teacher}
                        onSelect={(currentValue) => {
                          setSelectedTeacher(currentValue === selectedTeacher ? "all" : currentValue);
                          setTeacherComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTeacher === teacher ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {teacher}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedTeacher !== "all" && selectedGroup === "all" && (
            <>
              <Button onClick={handleSaveTeacher} className="w-full mt-2">Это я</Button>
              <Popover modal={false}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-2">
                    <CalendarSync className="h-4 w-4" />
                    Подписаться на календарь
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="start">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Ссылка для подписки (преподаватель):</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted p-2 rounded truncate">
                        {typeof window !== 'undefined' ? `${window.location.origin}${API_ENDPOINTS.CALENDAR}${encodeURIComponent(selectedTeacher)}?type=teacher` : ''}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          const url = `${window.location.origin}${API_ENDPOINTS.CALENDAR}${encodeURIComponent(selectedTeacher)}?type=teacher`;
                          navigator.clipboard.writeText(url);
                          showToast({ title: "Готово!", message: "Ссылка скопирована в буфер обмена", variant: "success" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="font-medium">iPhone (iOS):</div>
                      <div>Настройки → Календарь → Учётные записи → Добавить → Другое → Подписка</div>
                      <div className="font-medium mt-2">Google Calendar:</div>
                      <div className="flex items-center gap-1 flex-wrap">Другие календари → <Badge variant="outline" className="h-4 w-4 p-0 inline-flex items-center justify-center rounded-full"><Plus className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={3} /></Badge> → По URL</div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>

        <div className="w-full sm:w-64 space-y-2">
          <label className="text-sm font-medium">Неделя</label>
          {/* Мобильная версия - Drawer */}
          <div className="block sm:hidden">
            <Drawer shouldScaleBackground={false} modal={false} open={isMobileCalendarOpen} onOpenChange={setIsMobileCalendarOpen}>
              <DrawerTrigger asChild>
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
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="text-center">Выберите дату</DrawerTitle>
                  <DrawerDescription className="sr-only">
                    Выберите дату в календаре для просмотра расписания на эту неделю
                  </DrawerDescription>
                </DrawerHeader>
                {/* Quick picks */}
                <div className="flex justify-center gap-2 px-4 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      triggerHaptic('medium');
                      setDate(new Date());
                      setIsMobileCalendarOpen(false);
                    }}
                    className="flex-1"
                  >
                    Сегодня
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      triggerHaptic('medium');
                      setDate(addDays(new Date(), 7));
                      setIsMobileCalendarOpen(false);
                    }}
                    className="flex-1"
                  >
                    След. неделя
                  </Button>
                </div>
                <div
                  className="flex justify-center pb-8"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onSelect={(newDate: Date | undefined) => {
                      if (newDate) {
                        triggerHaptic('medium');
                        setDate(newDate);
                        setIsMobileCalendarOpen(false);
                      }
                    }}
                    weekStartsOn={1}
                    locale={ru}
                    className="[--cell-size:3rem] text-base"
                    initialFocus
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          {/* Десктопная версия - Popover */}
          <div className="hidden sm:block">
            <Popover modal={false} open={isDesktopCalendarOpen} onOpenChange={setIsDesktopCalendarOpen}>
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
              <PopoverContent className="w-auto p-0.5" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate: Date | undefined) => {
                    if (newDate) {
                      triggerHaptic('light');
                      setDate(newDate);
                      setIsDesktopCalendarOpen(false);
                    }
                  }}
                  initialFocus
                  weekStartsOn={1}
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 px-2">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          <Button
            variant="outline"
            onClick={() => {
              triggerHaptic('medium');
              setDate(prev => addDays(prev, -7));
            }}
            className="h-9 px-3 rounded-full flex items-center gap-1 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">Пред. неделя</span>
            <span className="inline sm:hidden text-xs font-medium">Пред.</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              triggerHaptic('medium');
              setDate(new Date());
            }}
            className="h-9 px-4 rounded-full font-medium text-xs sm:text-sm shrink-0"
          >
            Сегодня
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              triggerHaptic('medium');
              setDate(prev => addDays(prev, 7));
            }}
            className="h-9 px-3 rounded-full flex items-center gap-1 shrink-0"
          >
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">След. неделя</span>
            <span className="inline sm:hidden text-xs font-medium">След.</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-lg md:text-xl font-bold tabular-nums tracking-tight">
          {format(getCurrentWeekDates().start, "dd.MM.yyyy")} -{" "}
          {format(getCurrentWeekDates().end, "dd.MM.yyyy")}
        </h2>
      </div>

      {/* Мобильная версия */}
      <div className="block sm:hidden space-y-6">
        {daysWithDates.map((day) => {
          // Проверяем, есть ли занятия в этот день на текущей неделе
          const hasLessons = TIME_SLOTS.some((timeSlot) =>
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
              <div className={cn(
                "border text-center p-4 rounded-lg font-semibold transition-colors",
                isToday(day.fullDate)
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-slate-100 dark:bg-gray-900"
              )}>
                {day.label} ({day.date})
              </div>
              {TIME_SLOTS.map((timeSlot) => {
                const lessons = filteredData.filter(
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

                const isActive = isLessonActive(timeSlot, day.fullDate);

                return lessons.length > 0 ? (
                  <Drawer key={`${day.label}-${day.date}-${timeSlot}`} shouldScaleBackground={false}>
                    <DrawerTrigger asChild>
                      <div
                        className={cn(
                          "p-3 border rounded-lg flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-300 relative overflow-hidden",
                          isActive && "border-green-500 ring-1 ring-green-500/10 shadow bg-green-50/50 dark:bg-green-900/10"
                        )}
                        onClick={() => handleLessonClick(lessons[0])}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleLessonClick(lessons[0]);
                          }
                        }}
                      >
                        <div className="space-y-1 leading-relaxed">
                          <div className="font-semibold text-sm pr-6">
                            <span>{lessons[0].subject}</span>
                            {lessons.length > 1 && (
                              <span className="absolute top-2 right-2 text-[10px] font-medium text-primary bg-background/90 px-1.5 py-0.5 rounded-lg border shadow-sm">
                                +{lessons.length - 1} {getDeclension(lessons.length - 1, ["занятие", "занятия", "занятий"])}
                              </span>
                            )}
                          </div>
                          <div className="text-xs">{lessons[0].lessonType}</div>
                        </div>
                        <div className="mt-4 space-y-1 flex-grow flex flex-col">
                          <div className="flex flex-row items-center justify-end space-x-2">
                            <span className="text-xs text-right font-bold text-muted-foreground">
                              {lessons[0].group}
                            </span>
                          </div>
                          <div className="flex flex-row items-center justify-end space-x-2">
                            <span className="text-xs text-right">
                              {lessons[0].teacher}
                            </span>
                          </div>
                          <div className="flex items-center justify-between space-x-2 mt-auto">
                            <div className="flex flex-col items-start gap-1">
                              {isActive && (
                                <Badge key="mobile-badge-bottom" variant="default" className="animate-pulse bg-green-600 hover:bg-green-700 text-white border-none px-1.5 py-0 text-[10px] h-5 shrink-0">Сейчас</Badge>
                              )}
                              <div className="flex items-center justify-start space-x-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs text-left font-bold">
                                  {lessons[0].time}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-xs text-right">
                                {lessons[0].classroom}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="overflow-y-auto max-h-[calc(95vh-5rem)] px-4 pb-4">
                        <DrawerHeader className="pt-10">
                          <DrawerTitle className="text-center font-semibold text-base mt-4">
                            {lessons[0].subject}
                          </DrawerTitle>
                          <DrawerDescription className="sr-only">
                            Детальная информация о занятии: время, аудитория и преподаватель
                          </DrawerDescription>
                        </DrawerHeader>
                        {lessons.map((lesson, lessonIndex) => (
                          <div
                            key={`${lesson.date}-${lesson.time}-${lesson.subject}-${lessonIndex}`}
                            className="flex flex-col gap-0.5 divide-y divide-dashed"
                          >
                            {lessonIndex > 0 && (
                              <div className="text-center font-semibold my-4">
                                {lesson.subject}
                              </div>
                            )}
                            {[
                              {
                                icon: <FileText className="w-5 h-5" />,
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
                                icon: <CalendarDays className="w-5 h-5" />,
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
                                  <span className="text-left">{value}</span>
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
                        ))}
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
              className={cn(
                "flex flex-col items-center justify-center border p-4 rounded-lg transition-colors",
                isToday(day.fullDate)
                  ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-[1.02]"
                  : "bg-slate-100 dark:bg-gray-900"
              )}
            >
              <h2 className="text-sm sm:text-lg font-semibold">{day.label}</h2>
              <h2 className="text-xs sm:text-sm">{day.date}</h2>
            </div>
          ))}
        </div>

        {TIME_SLOTS.map((timeSlot) => (
          <div
            key={timeSlot}
            className="grid grid-cols-1 md:grid-cols-[repeat(7,minmax(200px,1fr))] gap-4"
          >
            <div className="flex items-center justify-center border text-slate-500 dark:text-slate-50 bg-slate-100 dark:bg-gray-900 p-4 rounded-lg font-black text-sm sm:text-2xl">
              {timeSlot}
            </div>

            {daysWithDates.map((day, index) => {
              const lessons = filteredData.filter(
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

              const isActive = isLessonActive(timeSlot, day.fullDate);

              return lessons.length > 0 ? (
                <Dialog key={`${day.id}-${timeSlot}`}>
                  <DialogTrigger asChild>
                    <div
                      className={cn(
                        "p-3 border rounded-lg flex flex-col justify-between h-full cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all hover:bg-muted/50 relative overflow-hidden",
                        isActive && "border-green-500 ring-1 ring-green-500/10 shadow-sm bg-green-50/50 dark:bg-green-900/10 z-10 scale-[1.02]"
                      )}
                      onClick={() => handleLessonClick(lessons[0])}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleLessonClick(lessons[0]);
                        }
                      }}
                    >
                      <div className="space-y-1 leading-relaxed">
                        <div className="font-semibold text-sm pr-16 relative">
                          <span className="flex-1">{lessons[0].subject}</span>
                          {lessons.length > 1 && (
                            <span className="absolute -top-1 -right-1 text-[10px] font-medium text-primary bg-background/90 px-1.5 py-0.5 rounded-lg border shadow-sm pointer-events-none">
                              +{lessons.length - 1}{" "}
                              {getDeclension(lessons.length - 1, [
                                "занятие",
                                "занятия",
                                "занятий",
                              ])}
                            </span>
                          )}
                        </div>
                        <div className="text-xs">{lessons[0].lessonType}</div>
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-xs text-right font-bold text-muted-foreground">
                            {lessons[0].group}
                          </span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-xs text-right">
                            {lessons[0].teacher}
                          </span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs text-right">
                            ауд. {lessons[0].classroom}
                          </span>
                        </div>
                        {isActive && (
                          <div className="absolute bottom-2 left-2">
                            <Badge key="desktop-badge-bottom" variant="default" className="animate-pulse bg-green-600 hover:bg-green-700 text-white border-none px-1.5 py-0 text-[10px] h-5">Сейчас</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="p-6 rounded-lg shadow-lg animate-fade-in">
                    <div className="overflow-y-auto max-h-[calc(95vh-5rem)] flex flex-col gap-4 items-center">
                      <DialogHeader>
                        <DialogTitle className="text-center text-base font-semibold mt-6">
                          {lessons[0].subject}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Детальная информация о занятии
                        </DialogDescription>
                      </DialogHeader>
                      {lessons.map((lesson, lessonIndex) => (
                        <div
                          key={`${lesson.date}-${lesson.time}-${lesson.subject}-${lessonIndex}`}
                          className="w-full max-w-lg rounded-md px-5 py-3 divide-y divide-dashed"
                        >
                          {lessonIndex > 0 && (
                            <div className="text-center font-semibold my-4">
                              {lesson.subject}
                            </div>
                          )}
                          {[
                            {
                              icon: <FileText className="w-5 h-5" />,
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
                              icon: <CalendarDays className="w-5 h-5" />,
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
                                <span className="text-left">{value}</span>
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
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div
                  key={`${day.id}-${timeSlot}`}
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
