// src/core/components/Icon.jsx
// Componente centralizado de iconografía con Lucide React y compatibilidad total con el dominio Pulso360

import {
  LayoutDashboard,
  HeartPulse,
  BookOpen,
  NotebookPen,
  TrendingUp,
  LineChart,
  Headphones,
  HeartHandshake,
  LifeBuoy,
  ShieldAlert,
  Users,
  BellDot,
  Bell,
  BellOff,
  Sliders,
  Settings2,
  Network,
  Building2,
  ShieldCheck,
  Shield,
  BarChart3,
  FileText,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  Inbox,
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Upload,
  Search,
  Activity,
  Phone,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
  Download,
  Play,
  Pause,
  Plus,
  Save,
  Mail,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

// Diccionario de iconos de Lucide (soporta nombres PascalCase canónicos y alias clásicos en camelCase/snake_case)
const lucideComponents = {
  // Nombres canónicos de Lucide
  LayoutDashboard,
  HeartPulse,
  BookOpen,
  NotebookPen,
  TrendingUp,
  LineChart,
  Headphones,
  HeartHandshake,
  LifeBuoy,
  ShieldAlert,
  Users,
  BellDot,
  Bell,
  BellOff,
  Sliders,
  Settings2,
  Network,
  Building2,
  ShieldCheck,
  Shield,
  BarChart3,
  FileText,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  Inbox,
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Upload,
  Search,
  Activity,
  Phone,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
  Download,
  Play,
  Pause,
  Plus,
  Save,
  Mail,
  Volume2,
  VolumeX,
  X,

  // Alias clásicos del sistema Pulso360 mapeados a componentes profesionales de Lucide
  dashboard: LayoutDashboard,
  favorite: HeartPulse,
  edit_note: BookOpen,
  edit: NotebookPen,
  insights: TrendingUp,
  monitoring: Headphones,
  support_agent: HeartHandshake,
  group: Users,
  task_alt: CheckCircle2,
  summarize: BarChart3,
  analytics: Activity,
  notifications_active: BellDot,
  notifications: Bell,
  bell: Bell,
  bell_off: BellOff,
  bellOff: BellOff,
  tune: Sliders,
  healing: HeartHandshake,
  self_improvement: Sparkles,
  mark_email_unread: Inbox,
  policy: ShieldCheck,
  audit: FileText,
  shieldCheck: ShieldCheck,
  shield_check: ShieldCheck,
  shield: Shield,
  hierarchy: Network,
  users: Users,
  domain: Building2,
  apartment: Building2,
  building: Building2,
  manage_accounts: Users,
  userPlus: Users,
  upload_file: Upload,
  upload: Upload,
  logout: LogOut,
  support: LifeBuoy,
  phone: Phone,
  refresh: RefreshCw,
  download: Download,
  fileText: FileText,
  fileShield: ShieldCheck,
  clock: Clock,
  zap: Zap,
  trash: Trash2,
  delete: Trash2,
  plus: Plus,
  add: Plus,
  save: Save,
  mail: Mail,
  volumeOn: Volume2,
  volume_on: Volume2,
  volumeOff: VolumeX,
  volume_off: VolumeX,
  lock: Lock,
  eye: Eye,
  eyeOff: EyeOff,
  eye_off: EyeOff,
  arrowRight: ArrowRight,
  arrow_right: ArrowRight,
  arrow_forward: ArrowRight,
  arrowLeft: ArrowLeft,
  arrow_left: ArrowLeft,
  arrow_back: ArrowLeft,
  arrowUp: ArrowUp,
  arrow_up: ArrowUp,
  chevronDown: ChevronDown,
  chevron_down: ChevronDown,
  chevronUp: ChevronUp,
  chevron_up: ChevronUp,
  check: Check,
  checkCircle: CheckCircle2,
  check_circle: CheckCircle2,
  alertTriangle: AlertTriangle,
  info: Info,
  play: Play,
  pause: Pause,
  copy: Copy,
  x: X,
  close: X,
  spa: Sparkles,
  sync: RefreshCw,
  verified_user: ShieldCheck
};

// SVGs personalizados exclusivos de Pulso360 (ejercicios somáticos, pausas guiadas, k-anonimato y escalas psicométricas)
const customPulsoSvgs = {
  // Ejercicios de respiración guiada (el icono enseña la dinámica de movimiento)
  breathIn: (
    <>
      <path d="M12 21v-8" />
      <polyline points="8.5 16.5 12 13 15.5 16.5" />
      <path d="M5 8c1.5-2 4-3 7-3s5.5 1 7 3" />
      <circle cx="12" cy="12" r="10" opacity="0.35" />
    </>
  ),
  breathHold: (
    <>
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="10" opacity="0.35" />
    </>
  ),
  breathOut: (
    <>
      <path d="M12 3v8" />
      <polyline points="8.5 7.5 12 11 15.5 7.5" />
      <path d="M5 16c1.5 2 4 3 7 3s5.5-1 7-3" />
      <circle cx="12" cy="12" r="10" opacity="0.35" />
    </>
  ),
  touchApp: (
    <>
      <path d="M12 11h1a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v2a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-7a2 2 0 0 1 4 0v-4a2 2 0 0 1 4 0v1" />
      <path d="M12 7V4" />
      <path d="M8.5 5.5l-2.1-2.1" />
      <path d="M15.5 5.5l2.1-2.1" />
    </>
  ),
  touch_app: (
    <>
      <path d="M12 11h1a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v2a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-7a2 2 0 0 1 4 0v-4a2 2 0 0 1 4 0v1" />
      <path d="M12 7V4" />
      <path d="M8.5 5.5l-2.1-2.1" />
      <path d="M15.5 5.5l2.1-2.1" />
    </>
  ),
  headsetBpo: (
    <>
      <path d="M3 13v-3a9 9 0 0 1 18 0v3" />
      <rect x="2" y="12" width="3" height="6" rx="1.5" />
      <rect x="19" y="12" width="3" height="6" rx="1.5" />
      <path d="M20 18v1a3 3 0 0 1-3 3h-4" />
      <circle cx="11.5" cy="22" r="1.5" />
    </>
  ),
  timerAht: (
    <>
      <circle cx="12" cy="13" r="8" />
      <polyline points="12 9 12 13 15 14" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="10" y1="2" x2="14" y2="2" />
      <line x1="18.5" y1="6.5" x2="16.5" y2="8.5" />
    </>
  ),
  callQueue: (
    <>
      <path d="M3 11v-2a4 4 0 0 1 8 0v2" />
      <circle cx="7" cy="6" r="2" />
      <path d="M14 6h7" />
      <path d="M14 10h7" />
      <path d="M14 14h5" />
      <path d="M2 18v-1a4 4 0 0 1 8 0v1" />
      <circle cx="6" cy="13" r="2" />
      <polyline points="18 17 21 20 18 23" />
      <line x1="13" y1="20" x2="21" y2="20" />
    </>
  ),
  kAnonymityShield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="11" width="6" height="5" rx="1" />
      <path d="M10 11V9a2 2 0 1 1 4 0v2" />
      <circle cx="12" cy="13.5" r="0.8" />
    </>
  ),
  k_anonymity_shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="11" width="6" height="5" rx="1" />
      <path d="M10 11V9a2 2 0 1 1 4 0v2" />
      <circle cx="12" cy="13.5" r="0.8" />
    </>
  ),
  moodOptimal: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 13.5a4 4 0 0 0 8 0" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </>
  ),
  moodBalanced: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 14.5c1.5 1.2 5.5 1.2 7 0" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </>
  ),
  moodDemanding: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="15" x2="16" y2="15" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </>
  ),
  moodSaturated: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16a4 4 0 0 0-8 0" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </>
  ),
  moodCritical: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 17c-1.5-1.8-6.5-1.8-8 0" />
      <path d="m8 8 2.5 1.5" />
      <path d="m16 8-2.5 1.5" />
      <line x1="9" y1="11" x2="9.01" y2="11" />
      <line x1="15" y1="11" x2="15.01" y2="11" />
    </>
  ),
  psychology: (
    <>
      <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 1.25.5 2.38 1.32 3.2A4.5 4.5 0 0 0 6 12.5a4.5 4.5 0 0 0 2 3.73V19a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-1.5" />
      <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 1.25-.5 2.38-1.32 3.2A4.5 4.5 0 0 1 18 12.5a4.5 4.5 0 0 1-2 3.73V19a2 2 0 0 1-2 2" />
      <circle cx="12" cy="10" r="1.5" />
    </>
  )
};

export function Icon({ name, className = '', size = 20, strokeWidth = 1.8, ...props }) {
  // 0. Si se suministra un componente o función directamente
  if (typeof name === 'function') {
    const CustomComp = name;
    return (
      <CustomComp
        size={size}
        strokeWidth={strokeWidth}
        className={`ui-svg-icon ${className}`.trim()}
        aria-hidden="true"
        {...props}
      />
    );
  }

  // 1. Si existe un componente Lucide coincidente (nombres estándar o mapeados)
  const LucideComp = lucideComponents[name];
  if (LucideComp) {
    return (
      <LucideComp
        size={size}
        strokeWidth={strokeWidth}
        className={`ui-svg-icon ${className}`.trim()}
        aria-hidden="true"
        {...props}
      />
    );
  }

  // 2. Si existe un SVG especializado de Pulso360 (ejercicios somáticos, k-anonimato)
  const customSvg = customPulsoSvgs[name];
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ui-svg-icon ${className}`.trim()}
      style={style}
      aria-hidden="true"
      {...props}
    >
      {customSvg || <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}
