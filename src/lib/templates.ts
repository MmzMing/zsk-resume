import type { PageLayout } from '@/types/resume'

export interface TemplateConfig {
  id: string
  name: string
  description: string
  pageLayout: Partial<PageLayout>
  colors: {
    primary: string
    secondary: string
    text: string
    muted: string
    background: string
    border: string
  }
  headerAlign: 'left' | 'center'
  sectionTitleStyle: 'underline' | 'bar' | 'plain'
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  classic: {
    id: 'classic',
    name: '经典单栏',
    description: '传统单栏布局，适合传统行业与应届生',
    pageLayout: {
      fontFamily: 'SimSun',
      fontSize: 12,
      lineHeight: 1.6,
      paragraphSpacing: 8,
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 30,
      marginRight: 30,
    },
    colors: {
      primary: '#1a1a1a',
      secondary: '#333333',
      text: '#444444',
      muted: '#666666',
      background: '#ffffff',
      border: '#000000',
    },
    headerAlign: 'center',
    sectionTitleStyle: 'underline',
  },

  modern: {
    id: 'modern',
    name: '现代双栏',
    description: '左侧窄栏放技能联系，右侧主内容区',
    pageLayout: {
      fontFamily: 'Microsoft YaHei',
      fontSize: 11,
      lineHeight: 1.5,
      paragraphSpacing: 6,
      marginTop: 25,
      marginBottom: 25,
      marginLeft: 25,
      marginRight: 25,
    },
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      text: '#1f2937',
      muted: '#6b7280',
      background: '#ffffff',
      border: '#e5e7eb',
    },
    headerAlign: 'left',
    sectionTitleStyle: 'bar',
  },

  minimal: {
    id: 'minimal',
    name: '极简黑白',
    description: '大量留白，线条分隔，适合设计与创意行业',
    pageLayout: {
      fontFamily: 'Helvetica',
      fontSize: 11,
      lineHeight: 1.7,
      paragraphSpacing: 10,
      marginTop: 40,
      marginBottom: 40,
      marginLeft: 40,
      marginRight: 40,
    },
    colors: {
      primary: '#000000',
      secondary: '#333333',
      text: '#1a1a1a',
      muted: '#999999',
      background: '#ffffff',
      border: '#d4d4d4',
    },
    headerAlign: 'left',
    sectionTitleStyle: 'plain',
  },

  compact: {
    id: 'compact',
    name: '紧凑高效',
    description: '1 页内信息密度最大，适合经验丰富者',
    pageLayout: {
      fontFamily: 'Arial',
      fontSize: 10,
      lineHeight: 1.3,
      paragraphSpacing: 3,
      marginTop: 15,
      marginBottom: 15,
      marginLeft: 15,
      marginRight: 15,
    },
    colors: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      text: '#1a1a1a',
      muted: '#555555',
      background: '#ffffff',
      border: '#cccccc',
    },
    headerAlign: 'center',
    sectionTitleStyle: 'underline',
  },

  timeline: {
    id: 'timeline',
    name: '时间线风格',
    description: '经历区带时间轴竖线，适合连续职业路径',
    pageLayout: {
      fontFamily: 'Georgia',
      fontSize: 11,
      lineHeight: 1.6,
      paragraphSpacing: 8,
      marginTop: 25,
      marginBottom: 25,
      marginLeft: 25,
      marginRight: 25,
    },
    colors: {
      primary: '#0f766e',
      secondary: '#0d9488',
      text: '#292524',
      muted: '#78716c',
      background: '#ffffff',
      border: '#a8a29e',
    },
    headerAlign: 'center',
    sectionTitleStyle: 'bar',
  },
}

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES[id] || TEMPLATES.classic
}
