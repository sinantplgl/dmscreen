import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppData, Party, Player, Tab } from '../types'
import { makeDefaultData } from './defaultData'
import { createCampaignSlice, type CampaignActions } from './slices/campaigns'
import { createLayoutSlice, type LayoutActions } from './slices/layout'
import { createCombatSlice, type CombatActions } from './slices/combat'
import { createPartySlice, type PartyActions } from './slices/parties'
import { createPlayerSlice, type PlayerActions } from './slices/players'
import { createBestiarySlice, type BestiaryActions } from './slices/bestiary'
import { createReferenceSlice, type ReferenceActions } from './slices/reference'
import { createSessionSlice, type SessionActions } from './slices/session'
import { createDiceSlice, type DiceActions } from './slices/dice'
import { createMetaSlice, type MetaActions } from './slices/meta'

const STORAGE_KEY = 'dm-screen-v1'

type _Keys<T extends object[]> = T extends [infer H, ...infer R extends object[]]
  ? keyof H | _Keys<R> : never

type _Dupes<T extends object[]> = T extends [infer H extends object, ...infer R extends object[]]
  ? (keyof H & _Keys<R>) | _Dupes<R> : never

type AssertNoDuplicates<T extends never> = T

export type _CheckActionKeys = AssertNoDuplicates<_Dupes<[
  CampaignActions, LayoutActions, CombatActions, PartyActions, PlayerActions,
  BestiaryActions, ReferenceActions, SessionActions, DiceActions, MetaActions
]>>

export type Actions = CampaignActions &
  LayoutActions &
  CombatActions &
  PartyActions &
  PlayerActions &
  BestiaryActions &
  ReferenceActions &
  SessionActions &
  DiceActions &
  MetaActions

export type Store = AppData & Actions

export const useStore = create<Store>()(
  persist(
    (...a) => ({
      ...makeDefaultData(),
      ...createCampaignSlice(...a),
      ...createLayoutSlice(...a),
      ...createCombatSlice(...a),
      ...createPartySlice(...a),
      ...createPlayerSlice(...a),
      ...createBestiarySlice(...a),
      ...createReferenceSlice(...a),
      ...createSessionSlice(...a),
      ...createDiceSlice(...a),
      ...createMetaSlice(...a),
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      partialize: (s) => ({
        campaigns: s.campaigns,
        activeCampaignId: s.activeCampaignId,
        inactiveCampaigns: s.inactiveCampaigns,
        tabs: s.tabs,
        activeTabId: s.activeTabId,
        combatants: s.combatants,
        round: s.round,
        activeTurn: s.activeTurn,
        parties: s.parties,
        activePartyId: s.activePartyId,
        players: s.players,
        sessionNodes: s.sessionNodes,
        diceHistory: s.diceHistory,
        bestiary: s.bestiary,
        tables: s.tables,
        ddbCobalt: s.ddbCobalt,
      }),
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as Record<string, unknown>
        if (version < 2 || !Array.isArray(state.parties) || state.parties.length === 0) {
          const party: Party = { id: 'party_1', name: 'Main Party' }
          state.parties = [party]
          state.activePartyId = party.id
          state.players = ((state.players as Player[]) ?? []).map((p) => ({
            ...p,
            partyId: p.partyId || party.id,
          }))
        }
        if (version < 3 || !Array.isArray(state.campaigns)) {
          const sessionInfo = state.sessionInfo as { campaign?: string } | undefined
          const name = sessionInfo?.campaign?.trim() || 'My Campaign'
          state.campaigns = [{ id: 'camp_1', name }]
          state.activeCampaignId = 'camp_1'
          state.inactiveCampaigns = {}
          delete state.notes
          delete state.sessionInfo
          const removed = new Set(['notes', 'sessionInfo'])
          state.tabs = ((state.tabs as Tab[]) ?? []).map((t) => ({
            ...t,
            columns: (t.columns ?? []).map((c) => ({
              ...c,
              panels: (c.panels ?? []).filter((p) => !removed.has(p.type)),
            })),
          }))
        }
        return state as unknown as AppData
      },
    },
  ),
)