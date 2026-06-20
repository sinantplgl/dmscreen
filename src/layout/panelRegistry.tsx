import type { ReactNode } from 'react'
import type { PanelInstance, PanelType } from '../types'
import { CombatTracker } from '../panels/CombatTracker'
import { DiceRoller } from '../panels/DiceRoller'
import { PlayerRoster } from '../panels/PlayerRoster'
import { Bestiary } from '../panels/Bestiary'
import { Items } from '../panels/Items'
import { ReferenceTables } from '../panels/ReferenceTables'
import { SessionTracker } from '../panels/SessionTracker'
import { WebFrame } from '../panels/WebFrame'
import {
  SwordsIcon,
  DiceIcon,
  DragonIcon,
  ShieldIcon,
  BookIcon,
  CompassIcon,
  GlobeIcon,
  GemIcon,
} from '../components/icons'

export interface PanelMeta {
  type: PanelType
  label: string
  icon: ReactNode
  render: (instance: PanelInstance, onConfig: (c: Record<string, unknown>) => void) => ReactNode
}

export const PANEL_REGISTRY: PanelMeta[] = [
  { type: 'combat', label: 'Combat Tracker', icon: <SwordsIcon />, render: () => <CombatTracker /> },
  { type: 'dice', label: 'Dice Roller', icon: <DiceIcon />, render: () => <DiceRoller /> },
  { type: 'bestiary', label: 'Bestiary', icon: <DragonIcon />, render: () => <Bestiary /> },
  { type: 'items', label: 'Items', icon: <GemIcon />, render: () => <Items /> },
  {
    type: 'players',
    label: 'Player Roster',
    icon: <ShieldIcon />,
    render: (inst, onConfig) => <PlayerRoster config={inst.config} onConfig={onConfig} />,
  },
  {
    type: 'reference',
    label: 'Reference Tables',
    icon: <BookIcon />,
    render: (inst, onConfig) => <ReferenceTables config={inst.config} onConfig={onConfig} />,
  },
  {
    type: 'session',
    label: 'Session Tracker',
    icon: <CompassIcon />,
    render: (inst, onConfig) => <SessionTracker panelId={inst.id} config={inst.config} onConfig={onConfig} />,
  },
  {
    type: 'webframe',
    label: 'Web Frame',
    icon: <GlobeIcon />,
    render: (inst, onConfig) => <WebFrame config={inst.config} onConfig={onConfig} />,
  },
]

export function getPanelMeta(type: PanelType): PanelMeta {
  return PANEL_REGISTRY.find((p) => p.type === type) ?? PANEL_REGISTRY[0]
}
