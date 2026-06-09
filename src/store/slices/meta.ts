import type { StateCreator } from 'zustand'
import type { AppData } from '../../types'
import { makeDefaultData } from '../defaultData'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export interface MetaActions {
  setDdbCobalt: (cobalt: string) => void
  exportData: () => string
  importData: (data: AppData) => void
  resetData: () => void
}

export const createMetaSlice: Slice<MetaActions> = (set, get) => ({
  setDdbCobalt: (cobalt) => set({ ddbCobalt: cobalt }),

  exportData: () => {
    const s = get()
    const data: AppData = {
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
      items: s.items,
      tables: s.tables,
      ddbCobalt: '',
    }
    return JSON.stringify(data, null, 2)
  },

  importData: (data) =>
    set((s) => {
      const campaigns =
        Array.isArray(data.campaigns) && data.campaigns.length > 0
          ? data.campaigns
          : [{ id: 'camp_1', name: 'Imported Campaign' }]
      const activeCampaignId = campaigns.some((c) => c.id === data.activeCampaignId)
        ? data.activeCampaignId
        : campaigns[0].id
      return {
        ...data,
        campaigns,
        activeCampaignId,
        inactiveCampaigns: data.inactiveCampaigns ?? {},
        ddbCobalt: s.ddbCobalt,
      }
    }),

  resetData: () => set((s) => ({ ...makeDefaultData(), ddbCobalt: s.ddbCobalt })),
})
