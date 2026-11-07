import {
  Settings,
  Eye,
  EyeOff,
  Layers,
  MessageSquare,
  Target,
  X,
  ChevronDown,
  ChevronRight,
  CircleDashed,
} from "@lucide/svelte";
// Site marketing set (additive block, alphabetical by DS name). Lucide sources:
// canonical names only (TriangleAlert, CircleCheck, LockOpen) — the legacy
// aliases AlertTriangle / CheckCircle2 / Unlock are deprecated upstream. Github
// and Linkedin are lucide brand icons, deprecated upstream (removed in v1.0).
// MessageSquare is already imported above (`comment`).
import {
  TriangleAlert,
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Camera,
  Car,
  CircleCheck,
  Clock,
  Cloud,
  Code,
  Cog,
  Compass,
  DollarSign,
  ExternalLink,
  Factory,
  FileCheck,
  FileText,
  FileUser,
  FlaskConical,
  Github,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Landmark,
  LayoutGrid,
  Lightbulb,
  Linkedin,
  Mail,
  Map as MapIcon,
  MapPin,
  Menu,
  Network,
  Newspaper,
  Package,
  Palette,
  Phone,
  Receipt,
  Rocket,
  Scale,
  ScanSearch,
  Search,
  Shield,
  ShieldCheck,
  Ship,
  Siren,
  Sparkles,
  Terminal,
  TrendingUp,
  LockOpen,
  UserRound,
  Users,
  Workflow,
  Wrench,
  Zap,
} from "@lucide/svelte";
import type { Component } from "svelte";

/** Props a canonical glyph accepts. Kept minimal so the dynamic component type
 * stays simple (lucide's own prop unions are too large to index over). */
export interface IconGlyphProps {
  size?: number;
  strokeWidth?: number;
  color?: string | null;
  class?: string;
  [key: string]: unknown;
}

/**
 * Canonical Sentropic icon set (day-one).
 *
 * The DS PRESCRIBES one icon set and exposes it under DS-owned names via the
 * {@link Icon} component. The visual source is lucide (stroke-24), which is
 * already the de-facto internal standard across the DS, but consumers address
 * icons by these stable DS names — never by lucide component names — so the
 * source can evolve without breaking the public API.
 *
 * Names are ADDITIVE: new glyphs extend this map; existing names never change
 * meaning. The full set is frozen against the cross-consumer glyph inventory.
 */
const GLYPHS = {
  settings: Settings,
  eye: Eye,
  "eye-off": EyeOff,
  layers: Layers,
  target: Target,
  close: X,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  // CA-L1 fold-in (AS-1): the one CA table row AS-1 needs on day one. The
  // other seven CA names land with their own CA lots.
  comment: MessageSquare,
  "circle-dashed": CircleDashed,
  // Site marketing set (additive block, alphabetical by DS name).
  "alert-triangle": TriangleAlert,
  "arrow-left": ArrowLeft,
  "arrow-up-right": ArrowUpRight,
  award: Award,
  "book-open": BookOpen,
  "brain-circuit": BrainCircuit,
  briefcase: Briefcase,
  "building-2": Building2,
  calculator: Calculator,
  calendar: Calendar,
  camera: Camera,
  car: Car,
  "check-circle-2": CircleCheck,
  clock: Clock,
  cloud: Cloud,
  code: Code,
  cog: Cog,
  compass: Compass,
  "dollar-sign": DollarSign,
  "external-link": ExternalLink,
  factory: Factory,
  "file-check": FileCheck,
  "file-text": FileText,
  "file-user": FileUser,
  "flask-conical": FlaskConical,
  github: Github,
  globe: Globe,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  heart: Heart,
  landmark: Landmark,
  "layout-grid": LayoutGrid,
  lightbulb: Lightbulb,
  linkedin: Linkedin,
  mail: Mail,
  map: MapIcon,
  "map-pin": MapPin,
  menu: Menu,
  "message-square": MessageSquare,
  network: Network,
  newspaper: Newspaper,
  package: Package,
  palette: Palette,
  phone: Phone,
  receipt: Receipt,
  rocket: Rocket,
  scale: Scale,
  "scan-search": ScanSearch,
  search: Search,
  shield: Shield,
  "shield-check": ShieldCheck,
  ship: Ship,
  siren: Siren,
  sparkles: Sparkles,
  terminal: Terminal,
  "trending-up": TrendingUp,
  unlock: LockOpen,
  "user-round": UserRound,
  users: Users,
  workflow: Workflow,
  wrench: Wrench,
  zap: Zap,
};

/** A canonical DS icon name accepted by {@link Icon}. */
export type IconName = keyof typeof GLYPHS;

/** Canonical name → glyph component, addressed by DS-owned {@link IconName}. */
export const ICONS = GLYPHS as Record<IconName, Component<IconGlyphProps>>;

/** All canonical icon names, ordered — useful for docs/catalogs. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/**
 * An arbitrary lucide glyph component accepted by {@link Icon} via `glyph`.
 * The app imports the icon itself, so only icons actually used are bundled.
 */
export type IconGlyph = Component<IconGlyphProps>;
