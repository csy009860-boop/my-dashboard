'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, MessageCircle, Check, ArrowLeft } from 'lucide-react'
import type { DesignAsset, DesignComment } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DesignReviewerProps {
  asset: DesignAsset
  onClose: () => void
  onAddComment: (comment: Omit<DesignComment, 'id'>) => void
  onToggleResolved: (commentId: string) => void
}

interface NewPinPosition {
  x: number
  y: number
}

export function DesignReviewer({ asset, onClose, onAddComment, onToggleResolved }: DesignReviewerProps) {
  const [selectedPin, setSelectedPin] = useState<string | null>(null)
  const [newPin, setNewPin] = useState<NewPinPosition | null>(null)
  const [newComment, setNewComment] = useState('')
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setNewPin({ x, y })
    setSelectedPin(null)
  }

  const handleAddComment = () => {
    if (!newPin || !newComment.trim()) return
    
    onAddComment({
      pinX: newPin.x,
      pinY: newPin.y,
      author: {
        id: 'current',
        name: '나',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
        role: 'Reviewer'
      },
      content: newComment,
      createdAt: new Date().toLocaleString('ko-KR'),
      resolved: false
    })
    
    setNewPin(null)
    setNewComment('')
  }

  const cancelNewPin = () => {
    setNewPin(null)
    setNewComment('')
  }

  const unresolvedComments = asset.comments.filter(c => !c.resolved)
  const resolvedComments = asset.comments.filter(c => c.resolved)

  return (
    <div className="fixed inset-0 z-50 flex bg-background/95 backdrop-blur-sm">
      {/* Main Image Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">{asset.title}</h2>
          </div>
          <Badge variant="outline" className="text-sm">
            <MessageCircle className="mr-1 h-3 w-3" />
            {asset.comments.length} 코멘트
          </Badge>
        </div>

        {/* Image container */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-8">
          <div 
            ref={imageRef}
            className="relative cursor-crosshair max-w-full max-h-full"
            onClick={handleImageClick}
          >
            <img 
              src={asset.url}
              alt={asset.title}
              className="max-h-[calc(100vh-200px)] w-auto rounded-lg shadow-lg"
              crossOrigin="anonymous"
              draggable={false}
            />
            
            {/* Existing pins */}
            {asset.comments.map((comment) => (
              <button
                key={comment.id}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-xs font-bold shadow-md transition-transform hover:scale-110",
                  comment.resolved 
                    ? "bg-chart-4 text-foreground" 
                    : "bg-primary text-primary-foreground",
                  (selectedPin === comment.id || hoveredPin === comment.id) && "scale-125 ring-2 ring-ring"
                )}
                style={{ left: `${comment.pinX}%`, top: `${comment.pinY}%` }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPin(selectedPin === comment.id ? null : comment.id)
                  setNewPin(null)
                }}
                onMouseEnter={() => setHoveredPin(comment.id)}
                onMouseLeave={() => setHoveredPin(null)}
              >
                {comment.resolved ? <Check className="h-4 w-4" /> : asset.comments.indexOf(comment) + 1}
              </button>
            ))}

            {/* New pin being placed */}
            {newPin && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground border-2 border-background shadow-lg animate-pulse"
                style={{ left: `${newPin.x}%`, top: `${newPin.y}%` }}
              >
                +
              </div>
            )}
          </div>
        </div>

        {/* New comment input */}
        {newPin && (
          <div className="border-t border-border p-4">
            <div className="mx-auto max-w-2xl flex gap-3">
              <Textarea
                placeholder="수정 요청 사항을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none"
                autoFocus
              />
              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                  추가
                </Button>
                <Button size="sm" variant="outline" onClick={cancelNewPin}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments Sidebar */}
      <div className="w-80 border-l border-border bg-card flex flex-col">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold text-foreground">수정 요청 사항</h3>
          <p className="text-xs text-muted-foreground mt-1">
            이미지 위를 클릭하여 코멘트를 추가하세요
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Unresolved comments */}
            {unresolvedComments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  미해결 ({unresolvedComments.length})
                </h4>
                {unresolvedComments.map((comment, index) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    index={asset.comments.indexOf(comment) + 1}
                    isSelected={selectedPin === comment.id}
                    onSelect={() => setSelectedPin(comment.id)}
                    onToggleResolved={() => onToggleResolved(comment.id)}
                  />
                ))}
              </div>
            )}

            {/* Resolved comments */}
            {resolvedComments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  해결됨 ({resolvedComments.length})
                </h4>
                {resolvedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    index={asset.comments.indexOf(comment) + 1}
                    isSelected={selectedPin === comment.id}
                    onSelect={() => setSelectedPin(comment.id)}
                    onToggleResolved={() => onToggleResolved(comment.id)}
                  />
                ))}
              </div>
            )}

            {asset.comments.length === 0 && (
              <div className="py-12 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  아직 코멘트가 없습니다
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

interface CommentCardProps {
  comment: DesignComment
  index: number
  isSelected: boolean
  onSelect: () => void
  onToggleResolved: () => void
}

function CommentCard({ comment, index, isSelected, onSelect, onToggleResolved }: CommentCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all border-border/50",
        isSelected && "border-primary ring-1 ring-primary/20",
        comment.resolved && "opacity-60"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            comment.resolved 
              ? "bg-chart-4/20 text-chart-4" 
              : "bg-primary/10 text-primary"
          )}>
            {comment.resolved ? <Check className="h-3 w-3" /> : index}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback className="text-[8px]">{comment.author.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground">{comment.author.name}</span>
              <span className="text-[10px] text-muted-foreground">{comment.createdAt}</span>
            </div>
            <p className="mt-1 text-sm text-foreground leading-relaxed">{comment.content}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onToggleResolved()
              }}
            >
              {comment.resolved ? '미해결로 변경' : '해결됨으로 표시'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
