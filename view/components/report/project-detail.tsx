'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { Project } from '@/lib/types'
import { Clock, ExternalLink, Copy, FileText, Link2, Image as ImageIcon, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectDetailProps {
  project: Project
  onSelectAsset: (assetId: string) => void
}

const statusConfig = {
  'completed': { label: '완료', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'in-progress': { label: '진행중', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  'review': { label: '리뷰', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'planning': { label: '기획', className: 'bg-slate-50 text-slate-600 border-slate-200' }
}

const taskStatusConfig = {
  'completed': { label: '완료', icon: CheckCircle2, className: 'text-emerald-600' },
  'in-progress': { label: '진행중', icon: Clock, className: 'text-blue-600' },
  'review': { label: '리뷰', icon: AlertCircle, className: 'text-amber-600' }
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export function ProjectDetail({ project, onSelectAsset }: ProjectDetailProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const status = statusConfig[project.status]

  // Group hours by assignee for donut chart
  const hoursData = project.assignees.map((assignee) => {
    const assigneeTasks = project.weeklyTasks.filter(t => t.assignee.id === assignee.id)
    const totalHours = assigneeTasks.reduce((sum, t) => sum + t.hours, 0)
    return {
      name: assignee.name,
      hours: totalHours
    }
  }).filter(d => d.hours > 0)

  // Group tasks by week
  const tasksByWeek = project.weeklyTasks.reduce((acc, task) => {
    const week = task.weekLabel
    if (!acc[week]) acc[week] = []
    acc[week].push(task)
    return acc
  }, {} as Record<string, typeof project.weeklyTasks>)

  const handleCopy = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  const getAssetIcon = (type: 'image' | 'pdf' | 'link') => {
    switch (type) {
      case 'image': return ImageIcon
      case 'pdf': return FileText
      case 'link': return Link2
    }
  }

  return (
    <div className="space-y-6">
      {/* Content Header */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
          <Badge variant="outline" className={cn('text-sm px-3 py-1 border', status.className)}>
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-base text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="font-semibold text-foreground">{project.totalHours}h</span>
          <span>투입</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-11">
          <TabsTrigger value="overview" className="text-base">프로젝트 개요</TabsTrigger>
          <TabsTrigger value="assets" className="text-base">시안 목록</TabsTrigger>
        </TabsList>

        {/* 프로젝트 개요 탭 */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* 기본 정보 */}
          <Card className="border-border">
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">요청부서</p>
                  <p className="font-medium text-foreground">{project.requestDepartment}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">요청인</p>
                  <p className="font-medium text-foreground">{project.requester}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">요청일</p>
                  <p className="font-medium text-foreground">{formatDate(project.requestDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">목표일</p>
                  <p className="font-medium text-foreground">{formatDate(project.dueDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주차별 상세업무 & 투입시간 차트 */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* 주차별 상세업무 리스트 */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">주차별 상세 업무</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {Object.entries(tasksByWeek).map(([week, tasks]) => (
                  <div key={week}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">{week}</h4>
                    <div className="space-y-2">
                      {tasks.map((task) => {
                        const taskStatus = taskStatusConfig[task.status]
                        const StatusIcon = taskStatus.icon
                        return (
                          <div 
                            key={task.id} 
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/40"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <StatusIcon className={cn("h-4 w-4 shrink-0", taskStatus.className)} />
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">{task.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 text-sm">
                              <span className="text-muted-foreground">{task.assignee.name}</span>
                              <span className="font-medium text-foreground">{task.hours}h</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 담당자별 투입시간 도넛 그래프 */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">담당자별 투입시간</CardTitle>
              </CardHeader>
              <CardContent>
                {hoursData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={hoursData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="hours"
                          nameKey="name"
                          label={({ name, hours }) => `${name}: ${hours}h`}
                          labelLine={false}
                        >
                          {hoursData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value}h`, '투입시간']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    데이터가 없습니다
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI 분석 */}
          <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="h-5 w-5 text-primary" />
                AI 업무 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-foreground leading-relaxed">{project.aiAnalysis}</p>
            </CardContent>
          </Card>

          {/* 관련 링크/리소스 & 비고 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 관련 링크/리소스 */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">관련 링크/리소스</CardTitle>
              </CardHeader>
              <CardContent>
                {project.resources.length > 0 ? (
                  <div className="space-y-2">
                    {project.resources.map((resource) => (
                      <div 
                        key={resource.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/40"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {resource.type === 'link' ? (
                            <Link2 className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="font-medium text-foreground truncate">{resource.title}</span>
                        </div>
                        {resource.type === 'link' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="shrink-0"
                            onClick={() => window.open(resource.value, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="shrink-0"
                            onClick={() => handleCopy(resource.id, resource.value)}
                          >
                            {copiedId === resource.id ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">등록된 리소스가 없습니다.</p>
                )}
              </CardContent>
            </Card>

            {/* 비고 */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">비고</CardTitle>
              </CardHeader>
              <CardContent>
                {project.notes ? (
                  <p className="text-base text-foreground leading-relaxed">{project.notes}</p>
                ) : (
                  <p className="text-muted-foreground">등록된 비고가 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 시안 목록 탭 */}
        <TabsContent value="assets" className="mt-6">
          {project.designAssets.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {project.designAssets.map((asset) => {
                const AssetIcon = getAssetIcon(asset.type)
                return (
                  <Card 
                    key={asset.id} 
                    className="cursor-pointer border-border transition-all hover:border-primary/50 hover:shadow-lg"
                    onClick={() => asset.type === 'image' ? onSelectAsset(asset.id) : asset.type === 'link' ? window.open(asset.url, '_blank') : null}
                  >
                    <CardContent className="p-4">
                      {/* 썸네일 */}
                      <div className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                        {asset.type === 'image' ? (
                          <img 
                            src={asset.url} 
                            alt={asset.title}
                            className="h-full w-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <AssetIcon className="h-12 w-12" />
                            <span className="text-sm">{asset.type === 'pdf' ? 'PDF 파일' : '외부 링크'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 제목 & 내용 */}
                      <div className="mt-4">
                        <h4 className="font-semibold text-foreground line-clamp-1">{asset.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{asset.description}</p>
                      </div>

                      {/* 코멘트 수 */}
                      {asset.comments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <Badge variant="secondary" className="text-sm">
                            {asset.comments.length}개 코멘트
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground border border-dashed border-border rounded-lg">
              등록된 시안이 없습니다
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
