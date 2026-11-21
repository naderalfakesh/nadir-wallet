import { ActivityGlyph } from "./ActivityGlyph";
import { AlertGlyph } from "./AlertGlyph";
import { ArrowDownLeftGlyph } from "./ArrowDownLeftGlyph";
import { ArrowUpRightGlyph } from "./ArrowUpRightGlyph";
import { BackupGlyph } from "./BackupGlyph";
import { BellGlyph } from "./BellGlyph";
import { CheckCircleGlyph } from "./CheckCircleGlyph";
import { CheckGlyph } from "./CheckGlyph";
import { ChevronDGlyph } from "./ChevronDGlyph";
import { ChevronLGlyph } from "./ChevronLGlyph";
import { ChevronRGlyph } from "./ChevronRGlyph";
import { ClockGlyph } from "./ClockGlyph";
import { CloseGlyph } from "./CloseGlyph";
import { CopyGlyph } from "./CopyGlyph";
import { DeviceGlyph } from "./DeviceGlyph";
import { ExternalGlyph } from "./ExternalGlyph";
import { EyeGlyph } from "./EyeGlyph";
import { EyeOffGlyph } from "./EyeOffGlyph";
import { FaceidGlyph } from "./FaceidGlyph";
import { FingerprintGlyph } from "./FingerprintGlyph";
import { GlobeGlyph } from "./GlobeGlyph";
import { HomeGlyph } from "./HomeGlyph";
import { InfoGlyph } from "./InfoGlyph";
import { KeyGlyph } from "./KeyGlyph";
import { LinkGlyph } from "./LinkGlyph";
import { LockGlyph } from "./LockGlyph";
import { MoreGlyph } from "./MoreGlyph";
import { PasteGlyph } from "./PasteGlyph";
import { PlusGlyph } from "./PlusGlyph";
import { PowerGlyph } from "./PowerGlyph";
import { QrGlyph } from "./QrGlyph";
import { RadarGlyph } from "./RadarGlyph";
import { ReceiveGlyph } from "./ReceiveGlyph";
import { RefreshGlyph } from "./RefreshGlyph";
import { ScanGlyph } from "./ScanGlyph";
import { SearchGlyph } from "./SearchGlyph";
import { SendGlyph } from "./SendGlyph";
import { SettingsGlyph } from "./SettingsGlyph";
import { ShieldGlyph } from "./ShieldGlyph";
import { SwapGlyph } from "./SwapGlyph";
import { TrendGlyph } from "./TrendGlyph";
import { UserGlyph } from "./UserGlyph";
import { WifiOffGlyph } from "./WifiOffGlyph";

/**
 * 24x24 line glyphs, single stroke, one file each. They draw inside the
 * `<Svg>` of `Icon` and inherit its stroke; render them through `Icon`.
 * To add an icon: create `<Name>Glyph.tsx` here and register it below.
 */
export const iconGlyphs = {
  home: HomeGlyph,
  activity: ActivityGlyph,
  shield: ShieldGlyph,
  settings: SettingsGlyph,
  send: SendGlyph,
  receive: ReceiveGlyph,
  swap: SwapGlyph,
  scan: ScanGlyph,
  qr: QrGlyph,
  copy: CopyGlyph,
  check: CheckGlyph,
  checkCircle: CheckCircleGlyph,
  chevronR: ChevronRGlyph,
  chevronL: ChevronLGlyph,
  chevronD: ChevronDGlyph,
  close: CloseGlyph,
  plus: PlusGlyph,
  eye: EyeGlyph,
  eyeOff: EyeOffGlyph,
  lock: LockGlyph,
  faceid: FaceidGlyph,
  key: KeyGlyph,
  alert: AlertGlyph,
  info: InfoGlyph,
  link: LinkGlyph,
  external: ExternalGlyph,
  arrowDownLeft: ArrowDownLeftGlyph,
  arrowUpRight: ArrowUpRightGlyph,
  search: SearchGlyph,
  more: MoreGlyph,
  trend: TrendGlyph,
  bell: BellGlyph,
  refresh: RefreshGlyph,
  globe: GlobeGlyph,
  clock: ClockGlyph,
  user: UserGlyph,
  fingerprint: FingerprintGlyph,
  backup: BackupGlyph,
  paste: PasteGlyph,
  power: PowerGlyph,
  wifiOff: WifiOffGlyph,
  device: DeviceGlyph,
  radar: RadarGlyph,
} as const;

export type IconName = keyof typeof iconGlyphs;
