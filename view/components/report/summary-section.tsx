'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, TrendingUp } from 'lucide-react'

interface SummarySectionProps {
  overallProgress: number
  keyIssues: string[]
  projectCount: number
  completedCount: number
}

export function SummarySection({ 
  overallProgress, 
  keyIssues, 
  projectCount,
  completedCount 
}: SummarySectionProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Overall Progress */}
      <Card className="border-border bg-background shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            전체 진행 현황
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-base text-muted-foreground">전체 프로젝트 진행률</span>
              <span className="text-lg font-bold text-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-4" />
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="rounded-xl bg-muted/50 p-5 text-center">
              <p className="text-4xl font-bold text-foreground">{projectCount}</p>
              <p className="text-sm text-muted-foreground mt-1">전체 프로젝트</p>
            </div>
            <div className="rounded-xl bg-chart-4/10 p-5 text-center">
              <p className="text-4xl font-bold text-chart-4">{completedCount}</p>
              <p className="text-sm text-muted-foreground mt-1">완료됨</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Issues */}
      <Card className="border-border bg-background shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="rounded-lg bg-chart-5/10 p-2">
              <AlertTriangle className="h-6 w-6 text-chart-5" />
            </div>
            주요 이슈
          </CardTitle>
        </CardHeader>
        <CardContent>
          {keyIssues.length > 0 ? (
            <ul className="space-y-4">
              {keyIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chart-5/10 text-sm font-bold text-chart-5">
                    {index + 1}
                  </span>
                  <span className="text-base text-foreground leading-relaxed pt-1">{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-muted-foreground">현재 보고된 이슈가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
