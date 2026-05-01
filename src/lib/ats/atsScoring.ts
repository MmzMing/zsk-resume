import type { ResumePlugin, PluginContext } from '../plugins/types'
import type { ResumeBlock, ExperienceItem } from '@/types/resume'

interface ATSIssue {
  id: string
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
  suggestion: string
}

interface ATSScore {
  total: number
  maxScore: number
  sections: {
    name: string
    score: number
    maxScore: number
    issues: ATSIssue[]
  }[]
}

const ATS_KEYWORDS = [
  'React', 'TypeScript', 'JavaScript', 'Vue', 'Angular', 'Node.js', 'Python',
  'Java', 'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'CI/CD', 'Git', 'REST', 'GraphQL', 'Microservices',
  'Agile', 'Scrum', 'TDD', 'BDD', '性能优化', '架构设计', '前端', '后端',
  '全栈', '移动端', '微信小程序', '响应式设计', 'SEO', '用户体验'
]

function validateContactInfo(blocks: ResumeBlock[]): ATSIssue[] {
  const issues: ATSIssue[] = []
  const headerBlock = blocks.find(b => b.type === 'header')
  
  if (!headerBlock?.headerFields) {
    issues.push({
      id: 'missing-header',
      severity: 'error',
      category: '联系信息',
      message: '缺少个人信息区块',
      suggestion: '请添加包含姓名、电话、邮箱的基本信息区块'
    })
    return issues
  }

  const fields = headerBlock.headerFields
  const emailField = fields.find(f => f.type === 'email')
  const phoneField = fields.find(f => f.type === 'tel')

  if (!emailField?.value) {
    issues.push({
      id: 'missing-email',
      severity: 'error',
      category: '联系信息',
      message: '缺少邮箱地址',
      suggestion: 'ATS系统需要通过邮箱联系候选人，请添加有效的邮箱地址'
    })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
    issues.push({
      id: 'invalid-email',
      severity: 'warning',
      category: '联系信息',
      message: '邮箱格式可能不正确',
      suggestion: '请检查邮箱格式是否符合标准（例如：user@example.com）'
    })
  }

  if (!phoneField?.value) {
    issues.push({
      id: 'missing-phone',
      severity: 'warning',
      category: '联系信息',
      message: '缺少电话号码',
      suggestion: '建议添加电话号码以便招聘方联系'
    })
  }

  return issues
}

function validateExperience(blocks: ResumeBlock[]): { score: number; issues: ATSIssue[] } {
  const expBlock = blocks.find(b => b.type === 'experience')
  const issues: ATSIssue[] = []

  if (!expBlock?.content?.items || (expBlock.content.items as ExperienceItem[]).length === 0) {
    issues.push({
      id: 'no-experience',
      severity: 'warning',
      category: '工作经历',
      message: '未添加工作经历',
      suggestion: '工作经历是ATS系统最重要的部分，请至少添加一段工作经历'
    })
    return { score: 0, issues }
  }

  const items = expBlock.content.items as ExperienceItem[]
  const score = Math.min(100, items.length * 25)

  items.forEach((item, index) => {
    if (!item.company) {
      issues.push({
        id: `exp-${index}-no-company`,
        severity: 'error',
        category: '工作经历',
        message: `第 ${index + 1} 段经历缺少公司名称`,
        suggestion: '请填写公司或组织名称'
      })
    }

    if (!item.title) {
      issues.push({
        id: `exp-${index}-no-title`,
        severity: 'error',
        category: '工作经历',
        message: `第 ${index + 1} 段经历缺少职位名称`,
        suggestion: '请填写您的职位或角色'
      })
    }

    if (!item.startDate || !item.endDate) {
      issues.push({
        id: `exp-${index}-no-dates`,
        severity: 'warning',
        category: '工作经历',
        message: `第 ${index + 1} 段经历缺少时间范围`,
        suggestion: '请填写工作的开始和结束时间（例如：2020/03 - 2022/05）'
      })
    }

    if (!item.description || item.description.length < 50) {
      issues.push({
        id: `exp-${index}-short-desc`,
        severity: 'warning',
        category: '工作经历',
        message: `第 ${index + 1} 段经历描述过短`,
        suggestion: '建议用 50-200 字详细描述您的职责和成就，使用动词开头'
      })
    }

    if (item.description && !containsActionVerbs(item.description)) {
      issues.push({
        id: `exp-${index}-no-action-verbs`,
        severity: 'info',
        category: '工作经历',
        message: `第 ${index + 1} 段经历缺少动作动词`,
        suggestion: '使用"负责"、"主导"、"开发"、"优化"等动词开头，增强表现力'
      })
    }
  })

  return { score, issues }
}

function containsActionVerbs(text: string): boolean {
  const actionVerbs = ['负责', '主导', '开发', '优化', '实现', '设计', '构建', '管理', '协调', '推动']
  return actionVerbs.some(verb => text.includes(verb))
}

function analyzeKeywords(blocks: ResumeBlock[]): { score: number; issues: ATSIssue[] } {
  const allText = blocks
    .map(block => {
      if (block.type === 'header') {
        return block.headerFields?.map(f => f.value).join(' ') || ''
      }
      if (block.content?.text) {
        return block.content.text
      }
      if (block.content?.skills) {
        return (block.content.skills as string[]).join(' ')
      }
      if (block.content?.items) {
        return (block.content.items as ExperienceItem[])
          .map(item => `${item.company} ${item.title} ${item.description}`)
          .join(' ')
      }
      return ''
    })
    .join(' ')

  const foundKeywords = ATS_KEYWORDS.filter(kw => 
    allText.toLowerCase().includes(kw.toLowerCase())
  )

  const score = Math.min(100, Math.round((foundKeywords.length / 10) * 100))
  const issues: ATSIssue[] = []

  if (foundKeywords.length < 5) {
    issues.push({
      id: 'few-keywords',
      severity: 'warning',
      category: '关键词优化',
      message: `仅找到 ${foundKeywords.length} 个常见ATS关键词`,
      suggestion: `建议添加更多行业关键词，如：${ATS_KEYWORDS.slice(0, 5).join('、')}`
    })
  }

  return { score, issues }
}

function validateSkills(blocks: ResumeBlock[]): { score: number; issues: ATSIssue[] } {
  const skillsBlock = blocks.find(b => b.type === 'skills')
  const issues: ATSIssue[] = []

  if (!skillsBlock?.content?.skills || (skillsBlock.content.skills as string[]).length === 0) {
    issues.push({
      id: 'no-skills',
      severity: 'warning',
      category: '技能清单',
      message: '未添加技能清单',
      suggestion: '技能清单帮助ATS系统快速匹配关键词，请添加您的专业技能'
    })
    return { score: 0, issues }
  }

  const skills = skillsBlock.content.skills as string[]
  const score = Math.min(100, skills.length * 10)

  if (skills.length < 5) {
    issues.push({
      id: 'few-skills',
      severity: 'info',
      category: '技能清单',
      message: `仅添加 ${skills.length} 个技能`,
      suggestion: '建议至少添加 5-10 个与目标职位相关的专业技能'
    })
  }

  return { score, issues }
}

export function calculateATSScore(blocks: ResumeBlock[]): ATSScore {
  const contactIssues = validateContactInfo(blocks)
  const { score: expScore, issues: expIssues } = validateExperience(blocks)
  const { score: keywordScore, issues: keywordIssues } = analyzeKeywords(blocks)
  const { score: skillsScore, issues: skillsIssues } = validateSkills(blocks)

  const total = Math.round(
    expScore * 0.4 +
    keywordScore * 0.3 +
    skillsScore * 0.15 +
    (contactIssues.length === 0 ? 100 : Math.max(0, 100 - contactIssues.length * 20)) * 0.15
  )

  return {
    total,
    maxScore: 100,
    sections: [
      { name: '联系信息', score: contactIssues.length === 0 ? 100 : Math.max(0, 100 - contactIssues.length * 25), maxScore: 100, issues: contactIssues },
      { name: '工作经历', score: expScore, maxScore: 100, issues: expIssues },
      { name: '关键词优化', score: keywordScore, maxScore: 100, issues: keywordIssues },
      { name: '技能清单', score: skillsScore, maxScore: 100, issues: skillsIssues }
    ]
  }
}

export const atsScoringPlugin: ResumePlugin = {
  id: 'ats-scoring',
  name: 'ATS 评分系统',
  version: '1.0.0',
  description: '分析简历的ATS兼容性并给出评分和优化建议',
  install: (context: PluginContext) => {
    context.registerAction({
      id: 'run-ats-scan',
      name: '运行ATS评分',
      icon: 'scan',
      execute: async () => {
        const blocks = context.store.getState().blocks as ResumeBlock[]
        const score = calculateATSScore(blocks)
        console.log('ATS评分结果:', score)
      }
    })
  }
}
