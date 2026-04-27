import { useState } from 'react'
import { Layout, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useResumeStore } from '@/store/resumeStore'

const FONTS = [
  'Microsoft YaHei',
  'SimSun',
  'SimHei',
  'KaiTi',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
]

export function PageLayoutDropdown() {
  const pageLayout = useResumeStore((s) => s.pageLayout)
  const setPageLayout = useResumeStore((s) => s.setPageLayout)
  const resetToDefaults = useResumeStore((s) => s.resetToDefaults)
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium">
          <Layout className="size-3.5" />
          页面布局
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>页面布局设置</DialogTitle>
          <DialogDescription>调整简历页面的字体、行高、段落间距和页边距。</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => {
              resetToDefaults()
            }}
          >
            <RotateCcw className="size-3.5" />
            恢复默认设置
          </Button>

          <div className="h-px bg-border" />

          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-xs">字体</Label>
            <Select
              value={pageLayout.fontFamily}
              onValueChange={(v) => setPageLayout({ fontFamily: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="选择字体" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground" style={{ fontFamily: pageLayout.fontFamily }}>
              预览: {pageLayout.fontFamily} — 字体效果预览文字
            </p>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-xs">字号 ({pageLayout.fontSize}px)</Label>
            <Slider
              value={[pageLayout.fontSize]}
              min={9}
              max={18}
              step={1}
              onValueChange={([v]) => setPageLayout({ fontSize: v })}
            />
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">行高</Label>
              <span className="text-xs text-muted-foreground">{pageLayout.lineHeight}</span>
            </div>
            <Slider
              value={[pageLayout.lineHeight]}
              min={1}
              max={2.5}
              step={0.1}
              onValueChange={([v]) => setPageLayout({ lineHeight: v })}
            />
          </div>

          {/* Paragraph Spacing */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">段落间距</Label>
              <span className="text-xs text-muted-foreground">
                {pageLayout.paragraphSpacing}px
              </span>
            </div>
            <Slider
              value={[pageLayout.paragraphSpacing]}
              min={0}
              max={20}
              step={1}
              onValueChange={([v]) => setPageLayout({ paragraphSpacing: v })}
            />
          </div>

          {/* Margins */}
          <div className="space-y-2">
            <Label className="text-xs">页边距</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['marginTop', 'marginBottom', 'marginLeft', 'marginRight'] as const).map(
                (key) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      {key === 'marginTop'
                        ? '上边距'
                        : key === 'marginBottom'
                          ? '下边距'
                          : key === 'marginLeft'
                            ? '左边距'
                            : '右边距'}
                    </Label>
                    <Slider
                      value={[pageLayout[key]]}
                      min={10}
                      max={60}
                      step={1}
                      onValueChange={([v]) => setPageLayout({ [key]: v })}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {pageLayout[key]}px
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
