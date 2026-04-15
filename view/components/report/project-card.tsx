'use client'

import { Badge } from '@/components/ui/badge'
import type { Project } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  isSelected: boolean
  onClick: () => void
}

const statusConfig = {
  'completed': { label: '완료', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'in-progress': { label: '진행중', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  'review': { label: '리뷰', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'planning': { label: '기획', className: 'bg-slate-50 text-slate-600 border-slate-200' }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function ProjectCard({ project, isSelected, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status]
  // 담당자 이름들을 콤마로 연결 (최대 2명까지 표시)
  const assigneeNames = project.assignees.slice(0, 2).map(a => a.name).join(', ')
  const hasMoreAssignees = project.assignees.length > 2

  return (
    <div
      className={cn(
        'cursor-pointer rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/50 hover:bg-muted/30',
        isSelected && 'border-primary ring-2 ring-primary/20 bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* 프로젝트명 - 가장 중요, 충분한 너비 확보 */}
      <h3 className="text-base font-bold text-foreground mb-3 whitespace-nowrap">
        {project.name}
      </h3>
      
      {/* 상세 정보 그리드 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {/* 담당자 */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground shrink-0">담당자</span>
          <span className="text-foreground truncate">
            {assigneeNames}{hasMoreAssignees && ` 외 ${project.assignees.length - 2}명`}
          </span>
        </div>

        {/* 목표일 */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground shrink-0">목표일</span>
          <span className="text-foreground font-medium">{formatDate(project.dueDate)}</span>
        </div>

        {/* 진행상태 */}
        <div className="flex items-center">
          <Badge variant="outline" className={cn('text-xs px-2 py-0.5 border', status.className)}>
            {status.label}
          </Badge>
        </div>

        {/* 투입시간 */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground shrink-0">투입</span>
          <span className="text-foreground font-medium">{project.totalHours}h</span>
        </div>
      </div>
    </div>
  )
}
