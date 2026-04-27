import {
  User, Briefcase, Phone, Mail, MapPin, Globe, Linkedin, Github, MessageCircle,
  Hash, Calendar, GraduationCap, Award, Star, Heart, Bookmark, Flag, Home,
  Building, CreditCard, Smartphone, Video, Music, Camera, ShoppingCart, Car,
  Plane, Coffee, BookOpen, Code,
} from 'lucide-react'

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  user: User,
  briefcase: Briefcase,
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  globe: Globe,
  linkedin: Linkedin,
  github: Github,
  messageCircle: MessageCircle,
  hash: Hash,
  calendar: Calendar,
  graduationCap: GraduationCap,
  award: Award,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  flag: Flag,
  home: Home,
  building: Building,
  creditCard: CreditCard,
  smartphone: Smartphone,
  video: Video,
  music: Music,
  camera: Camera,
  shoppingCart: ShoppingCart,
  car: Car,
  plane: Plane,
  coffee: Coffee,
  bookOpen: BookOpen,
  code: Code,
}

interface IconRendererProps {
  name: string | undefined
  size?: number
  color?: string
}

export function IconRenderer({ name, size = 12, color = 'currentColor' }: IconRendererProps) {
  const Comp = name ? ICON_COMPONENTS[name] : null
  if (!Comp) return null

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color }}>
      <Comp size={size} />
    </span>
  )
}
