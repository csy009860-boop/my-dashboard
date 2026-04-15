'use client'

import { useState, useEffect } from 'react'
import { HeaderSection } from '@/components/report/header-section'
import { ProjectCard } from '@/components/report/project-card'
import { ProjectDetail } from '@/components/report/project-detail'
import { DesignReviewer } from '@/components/report/design-reviewer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockFilteredData } from '@/lib/mock-data'
import type { FilteredData, DesignComment } from '@/lib/types'

export default function DesignReviewReport() {
  const [data, setData] = useState<FilteredData>(mockFilteredData)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(mockFilteredData.startDate)
  const [endDate, setEndDate] = useState(mockFilteredData.endDate)

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleSearch = () => {
    // In real implementation, this would fetch data based on date range
    console.log('[v0] Searching for date range:', startDate, 'to', endDate)
    // Update data with new date range
    setData(prev => ({
      ...prev,
      startDate,
      endDate
    }))
  }

  // Load data from localStorage or window.opener on mount
  useEffect(() => {
    const loadData = () => {
      // Try window.opener first
      if (typeof window !== 'undefined' && window.opener) {
        try {
          const openerData = window.opener.filteredData
          if (openerData) {
            setData(openerData)
            return
          }
        } catch {
          // Cross-origin error, try localStorage
        }
      }

      // Try localStorage
      if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem('filteredData')
        if (storedData) {
          try {
            setData(JSON.parse(storedData))
          } catch {
            // Invalid JSON, use mock data
          }
        }
      }
    }

    loadData()
    
    // Set first project as selected by default
    if (mockFilteredData.projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(mockFilteredData.projects[0].id)
    }
  }, [selectedProjectId])

  const selectedProject = data.projects.find(p => p.id === selectedProjectId)
  const selectedAsset = selectedProject?.designAssets.find(a => a.id === selectedAssetId)

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId)
  }

  const handleCloseReviewer = () => {
    setSelectedAssetId(null)
  }

  const handleAddComment = (newComment: Omit<DesignComment, 'id'>) => {
    if (!selectedProjectId || !selectedAssetId) return

    const comment: DesignComment = {
      ...newComment,
      id: `c-${Date.now()}`
    }

    setData(prev => ({
      ...prev,
      projects: prev.projects.map(project => {
        if (project.id !== selectedProjectId) return project
        return {
          ...project,
          designAssets: project.designAssets.map(asset => {
            if (asset.id !== selectedAssetId) return asset
            return {
              ...asset,
              comments: [...asset.comments, comment]
            }
          })
        }
      })
    }))
  }

  const handleToggleResolved = (commentId: string) => {
    if (!selectedProjectId || !selectedAssetId) return

    setData(prev => ({
      ...prev,
      projects: prev.projects.map(project => {
        if (project.id !== selectedProjectId) return project
        return {
          ...project,
          designAssets: project.designAssets.map(asset => {
            if (asset.id !== selectedAssetId) return asset
            return {
              ...asset,
              comments: asset.comments.map(comment => {
                if (comment.id !== commentId) return comment
                return { ...comment, resolved: !comment.resolved }
              })
            }
          })
        }
      })
    }))
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="px-8 py-4">
          <HeaderSection
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Project Sidebar */}
        <aside className="w-96 shrink-0 border-r border-border bg-background">
          <div className="sticky top-0 p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              프로젝트 목록
            </h2>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="space-y-3 pr-3">
                {data.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Project Detail */}
        <main className="flex-1 min-w-0 p-8">
          <div className="rounded-xl border border-border bg-background p-8 shadow-sm">
            {selectedProject ? (
              <ProjectDetail
                project={selectedProject}
                onSelectAsset={handleSelectAsset}
              />
            ) : (
              <div className="flex h-96 items-center justify-center text-lg text-muted-foreground">
                프로젝트를 선택하세요
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Design Reviewer Modal */}
      {selectedAsset && (
        <DesignReviewer
          asset={selectedAsset}
          onClose={handleCloseReviewer}
          onAddComment={handleAddComment}
          onToggleResolved={handleToggleResolved}
        />
      )}
    </div>
  )
}
