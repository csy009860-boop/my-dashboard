'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface HeaderSectionProps {
  startDate: string
  endDate: string
  onDateChange: (start: string, end: string) => void
  onSearch: () => void
}

export function HeaderSection({
  startDate,
  endDate,
  onDateChange,
  onSearch
}: HeaderSectionProps) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-foreground">
        디자인기획팀 업무 보고
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            className="w-40 h-9 text-sm"
          />
          <span className="text-muted-foreground">~</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            className="w-40 h-9 text-sm"
          />
        </div>
        <Button onClick={onSearch} size="sm" className="h-9 gap-2">
          <Search className="h-4 w-4" />
          조회
        </Button>
      </div>
    </header>
  )
}
