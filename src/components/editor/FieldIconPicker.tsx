import { useState, useRef, useEffect } from 'react'
import {
  User, Briefcase, Phone, Mail, MapPin, Globe, Linkedin, Github, MessageCircle,
  Hash, Calendar, GraduationCap, Award, Star, Heart, Bookmark, Flag, Home,
  Building, CreditCard, Smartphone, Video, Music, Camera, ShoppingCart, Car,
  Plane, Coffee, BookOpen, Code,
} from 'lucide-react'

const FIELD_ICONS: { name: string; component: React.ElementType }[] = [
  { name: 'user', component: User },
  { name: 'briefcase', component: Briefcase },
  { name: 'phone', component: Phone },
  { name: 'mail', component: Mail },
  { name: 'mapPin', component: MapPin },
  { name: 'globe', component: Globe },
  { name: 'linkedin', component: Linkedin },
  { name: 'github', component: Github },
  { name: 'messageCircle', component: MessageCircle },
  { name: 'hash', component: Hash },
  { name: 'calendar', component: Calendar },
  { name: 'graduationCap', component: GraduationCap },
  { name: 'award', component: Award },
  { name: 'star', component: Star },
  { name: 'heart', component: Heart },
  { name: 'bookmark', component: Bookmark },
  { name: 'flag', component: Flag },
  { name: 'home', component: Home },
  { name: 'building', component: Building },
  { name: 'creditCard', component: CreditCard },
  { name: 'smartphone', component: Smartphone },
  { name: 'video', component: Video },
  { name: 'music', component: Music },
  { name: 'camera', component: Camera },
  { name: 'shoppingCart', component: ShoppingCart },
  { name: 'car', component: Car },
  { name: 'plane', component: Plane },
  { name: 'coffee', component: Coffee },
  { name: 'bookOpen', component: BookOpen },
  { name: 'code', component: Code },
]

function IconRenderer({ name, className }: { name: string; className?: string }) {
  const iconMap: Record<string, React.ElementType> = {}
  for (const icon of FIELD_ICONS) {
    iconMap[icon.name] = icon.component
  }
  const Icon = iconMap[name] || User
  return <Icon className={className} />
}

interface FieldIconPickerProps {
  value: string | undefined
  onChange: (name: string) => void
}

export function FieldIconPicker({ value, onChange }: FieldIconPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedIconName = value || 'user'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-7 h-7 rounded-md border hover:border-primary hover:text-primary transition-colors text-muted-foreground bg-background shrink-0"
        title="选择图标"
      >
        <IconRenderer name={selectedIconName} className="size-3.5" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 w-[240px] bg-popover border rounded-lg shadow-lg p-2">
          <div className="grid grid-cols-6 gap-1">
            {FIELD_ICONS.map((icon) => {
              const isActive = value === icon.name
              return (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => {
                    onChange(icon.name)
                    setOpen(false)
                  }}
                  className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                  title={icon.name}
                >
                  <IconRenderer name={icon.name} className="size-4" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
