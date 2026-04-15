export interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
}

export interface WeeklyTask {
  id: string
  weekNumber: number
  weekLabel: string
  title: string
  description: string
  assignee: TeamMember
  hours: number
  status: 'completed' | 'in-progress' | 'review'
}

export interface DesignComment {
  id: string
  pinX: number
  pinY: number
  author: TeamMember
  content: string
  createdAt: string
  resolved: boolean
}

export interface Resource {
  id: string
  title: string
  type: 'link' | 'text'
  value: string
}

export interface DesignAsset {
  id: string
  title: string
  description: string
  type: 'image' | 'pdf' | 'link'
  url: string
  comments: DesignComment[]
}

export interface Project {
  id: string
  name: string
  status: 'completed' | 'in-progress' | 'review' | 'planning'
  totalHours: number
  requestDepartment: string
  requester: string
  requestDate: string
  dueDate: string
  assignees: TeamMember[]
  weeklyTasks: WeeklyTask[]
  aiAnalysis: string
  resources: Resource[]
  notes: string
  designAssets: DesignAsset[]
}

export interface FilteredData {
  startDate: string
  endDate: string
  projects: Project[]
}
