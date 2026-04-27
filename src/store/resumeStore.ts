import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import type { PageLayout, ResumeBlock, Template, HeaderField } from '@/types/resume'

export type { HeaderField }

interface ResumeStore {
  pageLayout: PageLayout
  template: Template
  blocks: ResumeBlock[]
  photo: string | null
  smartOnePage: boolean

  setPageLayout: (layout: Partial<PageLayout>) => void
  setTemplate: (template: Template) => void
  setBlocks: (blocks: ResumeBlock[]) => void
  addBlock: (block: ResumeBlock) => void
  removeBlock: (id: string) => void
  updateBlock: (id: string, updates: Partial<ResumeBlock>) => void
  reorderBlocks: (fromIndex: number, toIndex: number) => void
  setPhoto: (photo: string | null) => void
  setSmartOnePage: (enabled: boolean) => void
  resetToDefaults: () => void
}

const defaultLayout: PageLayout = {
  fontFamily: 'Microsoft YaHei',
  fontSize: 16,
  lineHeight: 1.6,
  paragraphSpacing: 5,
  marginTop: 36,
  marginBottom: 36,
  marginLeft: 36,
  marginRight: 36,
}

const defaultHeaderFields: HeaderField[] = [
  { key: 'name', label: '姓名', value: '张三', type: 'text', icon: 'user', layer: 'top' },
  { key: 'title', label: '职位', value: '高级前端工程师', type: 'text', icon: 'briefcase', layer: 'top' },
  { key: 'phone', label: '电话', value: '138-0000-0000', type: 'tel', icon: 'phone', layer: 'bottom' },
  { key: 'email', label: '邮箱', value: 'zhangsan@example.com', type: 'email', icon: 'mail', layer: 'bottom' },
  { key: 'location', label: '地址', value: '北京市', type: 'text', icon: 'mapPin', layer: 'bottom' },
]

const defaultBlocks: ResumeBlock[] = [
  {
    id: 'header', type: 'header', title: '个人信息', order: 0, collapsed: false, lexicalJSON: null,
    headerFields: defaultHeaderFields,
  },
  {
    id: 'experience', type: 'experience', title: '工作经历', order: 1, collapsed: false, lexicalJSON: null,
    content: {
      items: [
        { id: 'exp-1', company: 'ABC 科技有限公司', title: '高级前端工程师', startDate: '2020/03', endDate: '至今', description: '负责公司核心产品前端架构设计与开发，主导组件库建设与性能优化项目' },
        { id: 'exp-2', company: 'XYZ 互联网公司', title: '前端工程师', startDate: '2017/07', endDate: '2020/02', description: '参与电商平台前端开发，负责用户端核心页面的开发与维护' },
      ],
    },
  },
  {
    id: 'education', type: 'education', title: '教育背景', order: 2, collapsed: false, lexicalJSON: null,
    content: {
      items: [
        { id: 'edu-1', company: '北京大学', title: '计算机科学 · 本科', startDate: '2013/09', endDate: '2017/06', description: '' },
      ],
    },
  },
  {
    id: 'skills', type: 'skills', title: '技能特长', order: 3, collapsed: false, lexicalJSON: null,
    content: {
      skills: ['React', 'TypeScript', 'Node.js', 'Vue.js', 'Tailwind CSS', 'GraphQL', 'Docker', 'Git'],
    },
  },
]

function getConsentStorage(): StateStorage {
  const memoryStore: Record<string, string> = {}
  return {
    getItem: (name) => {
      try {
        const raw = localStorage.getItem('zsk-resume-consent')
        if (raw) {
          const data = JSON.parse(raw)
          if (data.state?.status === 'granted') {
            return localStorage.getItem(name) ?? null
          }
        }
      } catch {
        // ignore
      }
      return memoryStore[name] ?? null
    },
    setItem: (name, value) => {
      try {
        const raw = localStorage.getItem('zsk-resume-consent')
        if (raw) {
          const data = JSON.parse(raw)
          if (data.state?.status === 'granted') {
            localStorage.setItem(name, value)
            return
          }
        }
      } catch {
        // ignore
      }
      memoryStore[name] = value
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name)
      } catch {
        // ignore
      }
      delete memoryStore[name]
    },
  }
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      pageLayout: defaultLayout,
      template: { id: 'classic', name: '经典单栏', source: 'preset' },
      blocks: defaultBlocks,
      photo: null,
      smartOnePage: false,

      setPageLayout: (layout) =>
        set((state) => ({ pageLayout: { ...state.pageLayout, ...layout } })),

      setTemplate: (template) => set({ template }),

      setBlocks: (blocks) => set({ blocks }),

      addBlock: (block) =>
        set((state) => ({ blocks: [...state.blocks, block] })),

      removeBlock: (id) =>
        set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) })),

      updateBlock: (id, updates) =>
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      reorderBlocks: (fromIndex, toIndex) =>
        set((state) => {
          const newBlocks = [...state.blocks]
          const [moved] = newBlocks.splice(fromIndex, 1)
          newBlocks.splice(toIndex, 0, moved)
          return {
            blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
          }
        }),

      setPhoto: (photo) => set({ photo }),

      setSmartOnePage: (enabled) => set({ smartOnePage: enabled }),

      resetToDefaults: () =>
        set({
          pageLayout: defaultLayout,
          template: { id: 'classic', name: '经典单栏', source: 'preset' },
          blocks: defaultBlocks,
          photo: null,
          smartOnePage: false,
        }),
    }),
    {
      name: 'zsk-resume-storage',
      storage: createJSONStorage(() => getConsentStorage()),
      partialize: (state) => ({
        pageLayout: state.pageLayout,
        template: state.template,
        blocks: state.blocks,
        photo: state.photo,
        smartOnePage: state.smartOnePage,
      }),
    }
  )
)
