'use client'

import { useState, useMemo } from 'react';
import { ScheduleItem } from '../types/schedule';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleTableProps {
  scheduleData: ScheduleItem[];
}

export default function ScheduleTable({ scheduleData }: ScheduleTableProps) {
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('group');

  const filteredData = useMemo(() => {
  return scheduleData.filter(item =>
    item[filterType as keyof ScheduleItem].toLowerCase().includes(filter.toLowerCase())
  );
}, [scheduleData, filter, filterType]);

  return (
    <div className="p-2">
      <div className="flex gap-4 mb-4">
        <Input
          type="text"
          placeholder="Фильтр..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Выберите тип фильтра" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="group">Группа</SelectItem>
            <SelectItem value="dayOfWeek">День недели</SelectItem>
            <SelectItem value="subject">Дисциплина</SelectItem>
            <SelectItem value="teacher">Преподаватель</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table className='border text-xs sm:text-sm'>
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
              <TableCell className='border'>{item.date}</TableCell>
              <TableCell className='border w-28'>{item.time}</TableCell>
              <TableCell className='border'>{item.subject}</TableCell>
              <TableCell className='border'>{item.lessonType}</TableCell>
              <TableCell className='border'>{item.teacher}</TableCell>
              <TableCell className='border'>{item.classroom}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

