import type { ResumePlugin, PluginContext } from '../plugins/types'
import type { ResumeBlock, ExperienceItem, HeaderField } from '@/types/resume'

interface JSONResumeSchema {
  basics: {
    name: string
    label: string
    email: string
    phone: string
    url: string
    summary: string
    location: {
      city: string
    }
    profiles: {
      network: string
      username: string
      url: string
    }[]
  }
  work: {
    name: string
    position: string
    startDate: string
    endDate: string
    summary: string
  }[]
  education: {
    institution: string
    area: string
    startDate: string
    endDate: string
  }[]
  skills: {
    name: string
    level: string
    keywords: string[]
  }[]
  projects: {
    name: string
    description: string
    startDate: string
    endDate: string
  }[]
  languages: {
    language: string
    fluency: string
  }[]
  certifications: {
    name: string
    issuer: string
    date: string
  }[]
}

function stripHTML(html: string): string {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

function extractHeaderFields(blocks: ResumeBlock[]): Record<string, string> {
  const headerBlock = blocks.find(b => b.type === 'header')
  if (!headerBlock?.headerFields) return {}

  return headerBlock.headerFields.reduce((acc, field: HeaderField) => {
    acc[field.key] = field.value
    return acc
  }, {} as Record<string, string>)
}

function extractItems(blocks: ResumeBlock[], type: string): ExperienceItem[] {
  const block = blocks.find(b => b.type === type)
  return (block?.content?.items as ExperienceItem[]) || []
}

export function convertToJSONResume(blocks: ResumeBlock[]): JSONResumeSchema {
  const fields = extractHeaderFields(blocks)

  const profiles = []
  if (fields.linkedin) profiles.push({ network: 'LinkedIn', username: fields.linkedin, url: fields.linkedin })
  if (fields.github) profiles.push({ network: 'GitHub', username: fields.github, url: `https://github.com/${fields.github}` })
  if (fields.website) profiles.push({ network: 'Website', username: '', url: fields.website })

  return {
    basics: {
      name: fields.name || '',
      label: fields.title || '',
      email: fields.email || '',
      phone: fields.phone || '',
      url: fields.website || '',
      summary: stripHTML((blocks.find(b => b.type === 'summary')?.content?.text as string) || ''),
      location: {
        city: fields.location || ''
      },
      profiles
    },
    work: extractItems(blocks, 'experience').map(item => ({
      name: item.company,
      position: item.title,
      startDate: item.startDate,
      endDate: item.endDate,
      summary: stripHTML(item.description)
    })),
    education: extractItems(blocks, 'education').map(item => ({
      institution: item.company,
      area: item.title,
      startDate: item.startDate,
      endDate: item.endDate
    })),
    skills: (blocks.find(b => b.type === 'skills')?.content?.skills as string[] || []).map(skill => ({
      name: skill,
      level: '',
      keywords: []
    })),
    projects: extractItems(blocks, 'projects').map(item => ({
      name: item.company,
      description: stripHTML(item.description),
      startDate: item.startDate,
      endDate: item.endDate
    })),
    languages: [],
    certifications: []
  }
}

export function downloadJSONResume(blocks: ResumeBlock[]): void {
  const jsonResume = convertToJSONResume(blocks)
  const json = JSON.stringify(jsonResume, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `resume-json-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const jsonResumeExportPlugin: ResumePlugin = {
  id: 'json-resume-export',
  name: 'JSON Resume 导出',
  version: '1.0.0',
  description: '导出符合 JSON Resume Schema v1.0 标准格式的简历文件',
  install: (context: PluginContext) => {
    context.registerAction({
      id: 'export-json-resume',
      name: '导出 JSON Resume',
      icon: 'download',
      execute: async () => {
        const blocks = context.store.getState().blocks as ResumeBlock[]
        downloadJSONResume(blocks)
      }
    })
  }
}
