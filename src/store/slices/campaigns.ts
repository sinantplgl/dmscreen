import type { StateCreator } from 'zustand'
import type { CampaignState } from '../../types'
import { makeFreshCampaign } from '../defaultData'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export function snapshotCampaign(s: CampaignState): CampaignState {
  return {
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
  }
}

export interface CampaignActions {
  addCampaign: (name?: string) => string
  renameCampaign: (id: string, name: string) => void
  deleteCampaign: (id: string) => void
  switchCampaign: (id: string) => void
}

export const createCampaignSlice: Slice<CampaignActions> = (set, get) => ({
  addCampaign: (name) => {
    const id = uid('camp')
    const s = get()
    set({
      ...makeFreshCampaign(),
      campaigns: [...s.campaigns, { id, name: name?.trim() || `Campaign ${s.campaigns.length + 1}` }],
      activeCampaignId: id,
      inactiveCampaigns: { ...s.inactiveCampaigns, [s.activeCampaignId]: snapshotCampaign(s) },
    })
    return id
  },

  renameCampaign: (id, name) =>
    set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, name } : c)) })),

  deleteCampaign: (id) =>
    set((s) => {
      if (s.campaigns.length <= 1) return s
      const campaigns = s.campaigns.filter((c) => c.id !== id)
      const inactiveCampaigns = { ...s.inactiveCampaigns }
      delete inactiveCampaigns[id]
      if (id !== s.activeCampaignId) return { campaigns, inactiveCampaigns }
      const nextId = campaigns[0].id
      const target = inactiveCampaigns[nextId] ?? makeFreshCampaign()
      delete inactiveCampaigns[nextId]
      return { ...target, campaigns, activeCampaignId: nextId, inactiveCampaigns }
    }),

  switchCampaign: (id) =>
    set((s) => {
      if (id === s.activeCampaignId) return s
      const target = s.inactiveCampaigns[id]
      if (!target) return s
      const inactiveCampaigns = { ...s.inactiveCampaigns, [s.activeCampaignId]: snapshotCampaign(s) }
      delete inactiveCampaigns[id]
      return { ...target, activeCampaignId: id, inactiveCampaigns }
    }),
})
