"use client";

import { useState, useMemo, useEffect } from "react";
import { ScheduleItem } from "@/types/schedule";
import { FileDown, Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ScheduleTableProps {
  scheduleData: ScheduleItem[];
}

export default function ScheduleTable({ scheduleData }: ScheduleTableProps) {
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("teacher");

  const filteredData = useMemo(() => {
    if (!filter || !scheduleData) return scheduleData || [];
    return scheduleData.filter((item) => {
      const value = item[filterType as keyof ScheduleItem];
      return (
        value && String(value).toLowerCase().includes(filter.toLowerCase())
      );
    });
  }, [scheduleData, filter, filterType]);

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.addFont(
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
      "Roboto",
      "normal"
    );
    doc.setFont("Roboto");

    // @ts-ignore
    doc.autoTable({
      margin: 10,      
      head: [
        [
          "Группа",
          "День недели",
          "Дата",
          "Время",
          "Дисциплина",
          "Вид занятия",
          "Преподаватель",
          "Аудитория",
        ],
      ],      
      body: filteredData.map((item) => [
        item.group,
        item.dayOfWeek,
        item.date,
        item.time,
        item.subject,
        item.lessonType,
        item.teacher,
        item.classroom,
      ]),
      rowPageBreak: 'auto',
      styles: { font: "Roboto", fontSize: 9,},
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 0,        
        fontStyle: "bold",
        valign: "middle",
        halign: "center",
      },
      bodyStyles: {
        valign: 'top',
        halign: "auto",
      },
    });

    doc.save("Расписание занятий.pdf");
  };

  return (
    <div className="p-2">
      <div className="flex flex-wrap gap-4 mb-4">
        <Select
          value={filterType}
          onValueChange={(value) => {
            setFilterType(value);
            setFilter("");
          }}
        >
          <SelectTrigger className="max-w-40 order-first">
            <SelectValue placeholder="Выберите тип фильтра" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">Преподаватель</SelectItem>
            <SelectItem value="dayOfWeek">День недели</SelectItem>
            <SelectItem value="group">Группа</SelectItem>
            <SelectItem value="subject">Дисциплина</SelectItem>
            <SelectItem value="classroom">Аудитория</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative w-full sm:w-1/4 order-last xs:order-2 text-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Поиск по ${
              filterType === "teacher"
                ? "Преподавателю"
                : filterType === "dayOfWeek"
                ? "Дню недели"
                : filterType === "group"
                ? "Группе"
                : filterType === "subject"
                ? "Дисциплине"
                : filterType === "classroom"
                ? "Аудитории"
                : "Выбранному фильтру"
            }...`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm pl-8 py-2"
          />
        </div>
        <Button
          variant="outline"
          onClick={downloadPDF}
          className="order-2 sm:order-last ml-auto"
        >
          <FileDown />
          Скачать PDF
        </Button>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <Table className="">
          <TableHeader className="text-center bg-muted dark:bg-neutral-900">
            <TableRow className="text-center">
              <TableHead className="border-r text-center">Группа</TableHead>
              <TableHead className="border-r text-center">
                День недели
              </TableHead>
              <TableHead className="border-r text-center">Дата</TableHead>
              <TableHead className="border-r text-center">Время</TableHead>
              <TableHead className="border-r text-center">Дисциплина</TableHead>
              <TableHead className="border-r text-center">
                Вид занятия
              </TableHead>
              <TableHead className="border-r text-center">
                Преподаватель
              </TableHead>
              <TableHead className=" text-center">Аудитория</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {filteredData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="border-r w-40">{item.group}</TableCell>
                <TableCell className="border-r text-center">
                  {item.dayOfWeek}
                </TableCell>
                <TableCell className="border-r text-center">
                  {item.date}
                </TableCell>
                <TableCell className="border-r text-center w-28">
                  {item.time}
                </TableCell>
                <TableCell className="border-r">{item.subject}</TableCell>
                <TableCell className="border-r">{item.lessonType}</TableCell>
                <TableCell className="border-r">{item.teacher}</TableCell>
                <TableCell className="text-center">{item.classroom}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
