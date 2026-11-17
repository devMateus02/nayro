import type { ServiceIcon as IconId } from "@/lib/services";
import {
  BagIcon,
  BoltIcon,
  ChatIcon,
  CodeIcon,
  GemIcon,
  HeadsetIcon,
  LayersIcon,
  MonitorIcon,
  PhoneIcon,
  RocketIcon,
  ShieldCheckIcon,
  TargetIcon,
  UsersIcon,
  WordpressIcon,
} from "./icons";

const ICONS = {
  code: CodeIcon,
  phone: PhoneIcon,
  bag: BagIcon,
  layers: LayersIcon,
  wordpress: WordpressIcon,
  headset: HeadsetIcon,
  bolt: BoltIcon,
  target: TargetIcon,
  rocket: RocketIcon,
  chat: ChatIcon,
  monitor: MonitorIcon,
  shield: ShieldCheckIcon,
  users: UsersIcon,
  gem: GemIcon,
} satisfies Record<IconId, unknown>;

/** Ícone de um serviço pela chave salva no banco */
export default function ServiceIcon({ icon, className }: { icon: IconId; className?: string }) {
  const Icon = ICONS[icon] ?? CodeIcon;
  return <Icon className={className} />;
}
