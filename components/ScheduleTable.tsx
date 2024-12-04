'use client'

import { useState, useMemo, useEffect } from 'react';
import { ScheduleItem } from '@/types/schedule';
import { FileDown } from 'lucide-react';

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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ScheduleTableProps {
  scheduleData: ScheduleItem[];
}

export default function ScheduleTable({ scheduleData }: ScheduleTableProps) {
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('teacher');
  //const [filterOptions, setFilterOptions] = useState<{ value: string; label: string }[]>([]);

  //useEffect(() => {
  //  if (scheduleData && scheduleData.length > 0) {
  //    const options = Array.from(new Set(scheduleData.map(item => item[filterType as keyof ScheduleItem]))).filter(Boolean);
  //    setFilterOptions(options.map(option => ({ value: String(option), label: String(option) })));
  //  } else {
  //    setFilterOptions([]);
  //  }
  //}, [scheduleData, filterType]);

  const filteredData = useMemo(() => {
    if (!filter || !scheduleData) return scheduleData || [];
    return scheduleData.filter(item => {
      const value = item[filterType as keyof ScheduleItem];
      return value && String(value).toLowerCase().includes(filter.toLowerCase());
    });
  }, [scheduleData, filter, filterType]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    // @ts-ignore
    doc.autoTable({
      head: [['Группа', 'День недели', 'Дата', 'Время', 'Дисциплина', 'Вид занятия', 'Преподаватель', 'Аудитория']],
      body: filteredData.map(item => [
        item.group,
        item.dayOfWeek,
        item.date,
        item.time,
        item.subject,
        item.lessonType,
        item.teacher,
        item.classroom
      ]),
      styles: { font: 'Roboto', fontSize: 10 },
      headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold', valign: 'middle', halign: 'center' },
    });

    doc.save("Расписание занятий.pdf");
  };

  return (
    <div className="p-2">
      <div className="flex flex-wrap gap-4 mb-4">
        <Select value={filterType} onValueChange={(value) => { setFilterType(value); setFilter(''); }}>
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
        <Input
          type="text"
          placeholder={`Поиск по ${
            filterType === 'teacher'
              ? 'Преподавателю'
              : filterType === 'dayOfWeek'
              ? 'Дню недели'
              : filterType === 'group'
              ? 'Группе'
              : filterType === 'subject'
              ? 'Дисциплине'
              : filterType === 'classroom'
              ? 'Аудитории'
              : 'Выбранному фильтру'
          }...`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-1/4 order-last xs:order-2 text-sm"
        />
        <Button variant="outline" onClick={downloadPDF} className="order-2 sm:order-last ml-auto">
          <FileDown/>Скачать PDF
        </Button>
      </div>
      <Table className='border'>
        <TableHeader className='border text-center bg-slate-100 dark:bg-gray-900'>
          <TableRow className='border text-center'>
            <TableHead className='border text-center'>Группа</TableHead>
            <TableHead className='border text-center'>День недели</TableHead>
            <TableHead className='border text-center'>Дата</TableHead>
            <TableHead className='border text-center'>Время</TableHead>
            <TableHead className='border text-center'>Дисциплина</TableHead>
            <TableHead className='border text-center'>Вид занятия</TableHead>
            <TableHead className='border text-center'>Преподаватель</TableHead>
            <TableHead className='border text-center'>Аудитория</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='border'>
          {filteredData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className='border w-40'>{item.group}</TableCell>
              <TableCell className='border text-center'>{item.dayOfWeek}</TableCell>
              <TableCell className='border text-center'>{item.date}</TableCell>
              <TableCell className='border text-center w-28'>{item.time}</TableCell>
              <TableCell className='border'>{item.subject}</TableCell>
              <TableCell className='border'>{item.lessonType}</TableCell>
              <TableCell className='border'>{item.teacher}</TableCell>
              <TableCell className='border text-center'>{item.classroom}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}