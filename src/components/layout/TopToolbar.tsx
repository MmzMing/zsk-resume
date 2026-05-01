import { useRef, useState, useCallback, useMemo } from 'react'
import { Wand2, Layers, Upload, MoreHorizontal, GripVertical, Check, ArrowLeft, Github, BarChart3, FileJson, FileText, Undo2, Redo2, Eraser } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/Toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useResumeStore } from '@/store/resumeStore'
import { DownloadPDFButton } from '@/components/toolbar/DownloadPDFButton'
import { PageLayoutDropdown } from '@/components/toolbar/PageLayoutDropdown'
import { ThemeToggle } from '@/components/toolbar/ThemeToggle'
import { BlockManagerDropdown } from '@/components/toolbar/BlockManagerDropdown'
import { parseWordTemplate } from '@/lib/wordParser'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { generateId } from '@/lib/utils'
import type { BlockType, ResumeBlock } from '@/types/resume'
import { calculateATSScore } from '@/lib/ats/atsScoring'
import { downloadJSONResume } from '@/lib/export/jsonResumeExport'
import { downloadATSPDF } from '@/lib/pdf/downloadATS'

const TEMPLATES = [
  { id: 'classic', name: '经典单栏' },
  { id: 'modern', name: '现代双栏' },
  { id: 'minimal', name: '极简黑白' },
  { id: 'compact', name: '紧凑高效' },
  { id: 'timeline', name: '时间线风格' },
]

const ADDABLE_BLOCKS: { type: BlockType; label: string }[] = [
  { type: 'header', label: '个人信息' },
  { type: 'summary', label: '个人摘要' },
  { type: 'experience', label: '工作经历' },
  { type: 'education', label: '教育背景' },
  { type: 'skills', label: '技能特长' },
  { type: 'projects', label: '项目经历' },
  { type: 'languages', label: '语言能力' },
  { type: 'certifications', label: '证书资质' },
  { type: 'custom', label: '自定义模块' },
]

export function TopToolbar() {
  const isMobile = useIsMobile()
  const wordInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()
  const blocks = useResumeStore((s) => s.blocks)
  const template = useResumeStore((s) => s.template)
  const smartOnePage = useResumeStore((s) => s.smartOnePage)
  const setTemplate = useResumeStore((s) => s.setTemplate)
  const addBlock = useResumeStore((s) => s.addBlock)
  const setSmartOnePage = useResumeStore((s) => s.setSmartOnePage)
  const reorderBlocks = useResumeStore((s) => s.reorderBlocks)
  const undo = useResumeStore((s) => s.undo)
  const redo = useResumeStore((s) => s.redo)
  const canUndo = useResumeStore((s) => s.canUndo)
  const canRedo = useResumeStore((s) => s.canRedo)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [atsDialogOpen, setAtsDialogOpen] = useState(false)
  const [atsScore, setAtsScore] = useState<ReturnType<typeof calculateATSScore> | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const sortedBlocks = useMemo(() => [...blocks].sort((a, b) => a.order - b.order), [blocks])

  const handleUndo = useCallback(() => {
    undo()
    addToast('info', '已撤销')
  }, [undo, addToast])

  const handleRedo = useCallback(() => {
    redo()
    addToast('info', '已重做')
  }, [redo, addToast])

  const handleReset = useCallback(() => {
    useResumeStore.getState().resetToDefaults()
    setResetDialogOpen(false)
    addToast('success', '已清除缓存并初始化页面')
  }, [addToast])

  const handleAddBlock = useCallback(
    (type: BlockType, label: string) => {
      const id = generateId()
      addBlock({
        id,
        type,
        title: label,
        order: blocks.length,
        collapsed: false,
        lexicalJSON: null,
      })
      addToast('success', `已添加「${label}」模块`)
    },
    [blocks.length, addBlock, addToast]
  )

  const handleATSAnalysis = useCallback(() => {
    const score = calculateATSScore(blocks)
    setAtsScore(score)
    setAtsDialogOpen(true)
  }, [blocks])

  const handleExportJSON = useCallback(() => {
    const store = useResumeStore.getState()
    downloadJSONResume(store.blocks)
    addToast('success', 'JSON Resume 导出成功')
  }, [addToast])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const fromIndex = sortedBlocks.findIndex((b) => b.id === active.id)
      const toIndex = sortedBlocks.findIndex((b) => b.id === over.id)
      if (fromIndex === -1 || toIndex === -1) return

      reorderBlocks(fromIndex, toIndex)
    },
    [sortedBlocks, reorderBlocks]
  )

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex h-full items-center gap-1 px-3 lg:px-4">
          <span className="mr-2 lg:mr-3 text-sm font-semibold tracking-tight shrink-0">
            Resume Editor
          </span>

          <div className="h-5 w-px bg-border shrink-0 hidden sm:block" />

          {!isMobile && (
            <>
              <Button
                variant={smartOnePage ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-1.5 text-xs font-medium hidden sm:inline-flex"
                onClick={() => setSmartOnePage(!smartOnePage)}
              >
                <Wand2 className="size-3.5" />
                <span className="hidden md:inline">智能一页</span>
              </Button>

              <div className="h-5 w-px bg-border shrink-0 hidden sm:block" />

              <button
                className="size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={handleUndo}
                disabled={!canUndo}
                title="撤销 (Ctrl+Z)"
                aria-label="撤销"
              >
                <Undo2 className="size-4" />
              </button>
              <button
                className="size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={handleRedo}
                disabled={!canRedo}
                title="重做 (Ctrl+Shift+Z)"
                aria-label="重做"
              >
                <Redo2 className="size-4" />
              </button>

              <div className="h-5 w-px bg-border shrink-0 hidden sm:block" />

              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hidden sm:inline-flex"
                onClick={() => setResetDialogOpen(true)}
                title="清除缓存并初始化"
                aria-label="清除缓存并初始化"
              >
                <Eraser className="size-4" />
              </Button>

              <div className="h-5 w-px bg-border hidden sm:block" />

              <div className="hidden md:block">
                <PageLayoutDropdown />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium hidden md:inline-flex">
                    <Layers className="size-3.5" />
                    模板样式
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>选择模板</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {TEMPLATES.map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      className={template.id === t.id ? 'bg-accent' : ''}
                      onClick={() => setTemplate({ id: t.id, name: t.name, source: 'preset' })}
                    >
                      {t.name}
                      {template.id === t.id && ' ✓'}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => wordInputRef.current?.click()}>
                    <Upload className="size-3.5 mr-2" />
                    导入 Word 模板...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <BlockManagerDropdown blocks={blocks} addBlock={addBlock} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium hidden lg:inline-flex">
                    <BarChart3 className="size-3.5" />
                    ATS 工具
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>企业投递优化</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleATSAnalysis}>
                    <BarChart3 className="size-3.5 mr-2" />
                    运行 ATS 评分
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileJson className="size-3.5 mr-2" />
                    导出 JSON Resume
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const store = useResumeStore.getState()
                    downloadATSPDF(store.blocks, store.photo, store.pageLayout, store.template)
                  }}>
                    <FileText className="size-3.5 mr-2" />
                    导出 ATS PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <div className="flex-1" />

          {isMobile && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
                <div className="flex items-center gap-3 px-4 h-14 border-b shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 -ml-1"
                    onClick={() => setSheetOpen(false)}
                  >
                    <ArrowLeft className="size-5" />
                  </Button>
                  <span className="text-base font-semibold">工具</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">ATS 工具</h3>
                    <button
                      onClick={() => {
                        handleATSAnalysis()
                        setSheetOpen(false)
                      }}
                      className="w-full flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-accent"
                    >
                      <BarChart3 className="size-4 shrink-0 text-primary" />
                      <span className="text-sm">运行 ATS 评分</span>
                    </button>
                    <button
                      onClick={() => {
                        handleExportJSON()
                        setSheetOpen(false)
                      }}
                      className="w-full flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-accent"
                    >
                      <FileJson className="size-4 shrink-0 text-primary" />
                      <span className="text-sm">导出 JSON Resume</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">工具</h3>
                    <button
                      onClick={() => setSmartOnePage(!smartOnePage)}
                      className="w-full flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-accent"
                    >
                      <Wand2 className="size-4 shrink-0 text-primary" />
                      <span className="text-sm flex-1">{smartOnePage ? '关闭智能一页' : '开启智能一页'}</span>
                      {smartOnePage && <Check className="size-4 text-primary" />}
                    </button>
                    <button
                      onClick={() => {
                        wordInputRef.current?.click()
                        setSheetOpen(false)
                      }}
                      className="w-full flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-accent"
                    >
                      <Upload className="size-4 shrink-0 text-primary" />
                      <span className="text-sm">导入 Word 模板</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">模板样式</h3>
                    <div className="space-y-1">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTemplate({ id: t.id, name: t.name, source: 'preset' })
                            setSheetOpen(false)
                          }}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            template.id === t.id
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <Layers className="size-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1">{t.name}</span>
                          {template.id === t.id && <Check className="size-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">模块管理</h3>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={sortedBlocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1">
                          {sortedBlocks.map((block) => (
                            <SortableBlockItem key={block.id} block={block} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    <div className="pt-2">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">添加模块</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {ADDABLE_BLOCKS.map((b) => (
                          <button
                            key={b.type}
                            onClick={() => handleAddBlock(b.type, b.label)}
                            className="flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs transition-colors hover:bg-accent"
                          >
                            <span className="text-muted-foreground">+</span>
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium border-pink-400 text-pink-500 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-950/30 hidden sm:inline-flex"
            asChild
          >
            <a href="https://space.bilibili.com/15446538" target="_blank" rel="noopener noreferrer">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
              </svg>
              关注明月崽27Mmz
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-pink-500 sm:hidden"
            asChild
            title="关注明月崽27Mmz"
          >
            <a href="https://space.bilibili.com/15446538" target="_blank" rel="noopener noreferrer">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
              </svg>
            </a>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium hidden sm:inline-flex"
            asChild
          >
            <a href="https://github.com/MmzMing/zsk-resume" target="_blank" rel="noopener noreferrer">
              <Github className="size-3.5" />
              GitHub
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 sm:hidden"
            asChild
            title="GitHub"
          >
            <a href="https://github.com/MmzMing/zsk-resume" target="_blank" rel="noopener noreferrer">
              <Github className="size-4" />
            </a>
          </Button>

          <ThemeToggle />

          <DownloadPDFButton />

          <input
            ref={wordInputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const result = await parseWordTemplate(file)
                if (result.errors.length > 0) {
                  alert(result.errors.join('\n'))
                }
                if (result.blocks.length > 0) {
                  useResumeStore.getState().setBlocks(result.blocks)
                }
              } catch (err) {
                alert('Word 解析失败: ' + (err as Error).message)
              }
              e.target.value = ''
            }}
          />
        </div>
      </header>

      <Dialog open={atsDialogOpen} onOpenChange={setAtsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ATS 兼容性评分报告</DialogTitle>
            <DialogDescription>
              分析您的简历对 ATS（Applicant Tracking System）系统的兼容程度
            </DialogDescription>
          </DialogHeader>

          {atsScore && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-6 p-6 bg-muted/30 rounded-lg">
                <div className={`text-5xl font-bold ${getScoreColor(atsScore.total)}`}>
                  {atsScore.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">综合评分</div>
                  <div>满分 {atsScore.maxScore} 分</div>
                </div>
              </div>

              {atsScore.sections.map((section) => (
                <div key={section.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{section.name}</h3>
                    <span className={`text-sm font-medium ${getScoreColor(section.score)}`}>
                      {section.score}/{section.maxScore}
                    </span>
                  </div>
                  
                  {section.issues.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {section.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className={`p-3 rounded-lg border ${
                            issue.severity === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900' :
                            issue.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900' :
                            'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              issue.severity === 'error' ? 'bg-red-500' :
                              issue.severity === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{issue.message}</p>
                              <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清除缓存并初始化</DialogTitle>
            <DialogDescription>
              确定要清除所有缓存数据并重置页面到初始状态吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
            >
              确定清除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SortableBlockItem({ block }: { block: ResumeBlock }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
    >
      <button
        className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab active:cursor-grabbing touch-none"
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="text-sm flex-1">{block.title}</span>
    </div>
  )
}
