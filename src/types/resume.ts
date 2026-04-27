export type BlockType =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'languages'
  | 'certifications'
  | 'custom'

export interface PageLayout {
  fontFamily: string
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
}

export interface Template {
  id: string
  name: string
  source: 'preset' | 'word-import'
}

export interface HeaderField {
  key: string
  label: string
  value: string
  type: 'text' | 'email' | 'tel' | 'url'
  icon?: string
  layer?: 'top' | 'bottom'
}

export interface ExperienceItem {
  id: string
  company: string
  title: string
  startDate: string
  endDate: string
  description: string
}

export type BlockContent = {
  // experience / education
  items?: ExperienceItem[]
  // skills
  skills?: string[]
  // summary / projects / custom / languages / certifications
  text?: string
  // extra fields for any type
  [key: string]: unknown
}

export interface ResumeBlock {
  id: string
  type: BlockType
  title: string
  order: number
  collapsed: boolean
  lexicalJSON: string | null
  headerFields?: HeaderField[]
  content?: BlockContent
}

export interface ResumeState {
  pageLayout: PageLayout
  template: Template
  blocks: ResumeBlock[]
  photo: string | null
  smartOnePage: boolean
  zoom: number
}
