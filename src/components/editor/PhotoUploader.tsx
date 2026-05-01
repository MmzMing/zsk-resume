import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Check } from 'lucide-react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { useResumeStore } from '@/store/resumeStore'

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = new Image()
  image.src = imageSrc

  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      const ctx = canvas.getContext('2d')!

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )

      // Compress to reasonable size
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
  })
}

export function PhotoUploader() {
  const photo = useResumeStore((s) => s.photo)
  const setPhoto = useResumeStore((s) => s.setPhoto)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
    // Reset input
    e.target.value = ''
  }

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    const cropped = await getCroppedImg(imageSrc, croppedAreaPixels)
    setPhoto(cropped)
    setCropOpen(false)
    setImageSrc(null)
  }

  const handleRemove = () => {
    setPhoto(null)
  }

  return (
    <>
      {photo ? (
        <div className="relative group">
          <img
            src={photo}
            alt="职业照"
            className="w-[100px] h-[133px] object-cover rounded-lg border border-black dark:border-white"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5">
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-white hover:bg-white/20"
              onClick={() => {
                setImageSrc(photo)
                setCropOpen(true)
              }}
            >
              <Upload className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-white hover:bg-white/20"
              onClick={handleRemove}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          className="flex flex-col items-center justify-center gap-1.5 w-[100px] h-[133px] border-2 border-dashed border-black dark:border-white rounded-lg text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="size-5" />
          <span>上传照片</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Crop Dialog */}
      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>裁剪职业照</DialogTitle>
            <DialogDescription>拖动并缩放图片以裁剪出合适的职业照。</DialogDescription>
          </DialogHeader>

          <div className="relative w-full h-80 bg-gray-900 rounded-md overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-8">缩放</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([v]) => setZoom(v)}
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCropOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={handleSaveCrop}>
              <Check className="size-3.5 mr-1" />
              确认裁剪
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
