import { NextRequest, NextResponse } from "next/server";
import { loadSchedule } from "@/utils/loadSchedule";
import { parse, format, isValid } from "date-fns";

// Кеширование на 5 минут
export const revalidate = 300;

// Конвертация времени "08.30 - 10.00" в { start: "083000", end: "100000" }
function parseTimeSlot(timeSlot: string): { start: string; end: string } | null {
    const match = timeSlot.match(/(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})/);
    if (!match) return null;

    return {
        start: `${match[1]}${match[2]}00`,
        end: `${match[3]}${match[4]}00`,
    };
}

// Форматирование даты для ICS (YYYYMMDD)
function formatDateForIcs(dateStr: string): string | null {
    const parsed = parse(dateStr, "dd.MM.yyyy", new Date());
    if (!isValid(parsed)) return null;
    return format(parsed, "yyyyMMdd");
}

// Генерация уникального UID
function generateUID(item: { date: string; time: string; group: string; subject: string }): string {
    const hash = `${item.date}-${item.time}-${item.group}-${item.subject}`.replace(/\s/g, "-");
    return `${hash}@rgsu-schedule`;
}

// Экранирование текста для ICS
function escapeIcsText(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
}

export async function GET(
    request: NextRequest,
    { params }: { params: { group: string } }
) {
    try {
        const groupName = decodeURIComponent(params.group);

        // Загрузка данных расписания
        const schedule = await loadSchedule();

        // Фильтрация по группе
        const groupEvents = schedule.filter(
            (item) => item.group.toLowerCase() === groupName.toLowerCase()
        );

        if (groupEvents.length === 0) {
            return new NextResponse("Расписание для группы не найдено", {
                status: 404,
                headers: { "Content-Type": "text/plain; charset=utf-8" }
            });
        }

        // Генерация ICS
        const icsLines: string[] = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//RGSU Schedule//Minsk Branch//RU",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            `X-WR-CALNAME:Расписание ${groupName}`,
            "X-WR-TIMEZONE:Europe/Minsk",
        ];

        for (const item of groupEvents) {
            const dateIcs = formatDateForIcs(item.date);
            const timeSlot = parseTimeSlot(item.time);

            if (!dateIcs || !timeSlot) continue;

            const uid = generateUID(item);
            const summary = escapeIcsText(item.subject);
            const location = item.classroom ? `Ауд. ${escapeIcsText(item.classroom)}` : "";
            const description = escapeIcsText(
                `Преподаватель: ${item.teacher}${item.lessonType ? `\\nТип: ${item.lessonType}` : ""}`
            );

            icsLines.push(
                "BEGIN:VEVENT",
                `UID:${uid}`,
                `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}Z`,
                `DTSTART:${dateIcs}T${timeSlot.start}`,
                `DTEND:${dateIcs}T${timeSlot.end}`,
                `SUMMARY:${summary}`,
                location ? `LOCATION:${location}` : "",
                `DESCRIPTION:${description}`,
                "END:VEVENT"
            );
        }

        icsLines.push("END:VCALENDAR");

        // Фильтруем пустые строки и соединяем
        const icsContent = icsLines.filter(Boolean).join("\r\n");

        // Создаём ASCII-совместимое имя файла
        const safeFilename = "schedule.ics";
        const encodedFilename = encodeURIComponent(groupName + ".ics");

        return new NextResponse(icsContent, {
            status: 200,
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
                "Cache-Control": "public, max-age=300",
            },
        });
    } catch (error) {
        console.error("Ошибка генерации iCal:", error);
        return new NextResponse("Ошибка генерации календаря", {
            status: 500,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
    }
}
