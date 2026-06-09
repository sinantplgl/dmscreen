import { useStore } from './store/store'
import { Header } from './layout/Header'
import { TabBar } from './layout/TabBar'
import { ColumnGrid } from './layout/ColumnGrid'
import { DialogHost } from './lib/dialog'

export default function App() {
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]

  return (
    <>
      {/* Reusable shield clip-path. objectBoundingBox => 0..1 coords scale to any element,
          so both the gold layer and the inset fill layer share one definition. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <clipPath id="shieldClip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 L0.175,0.08 C0.13,0.18 0.06,0.32 0,0.35 L0,0.5 C0,0.62 0.18,0.84 0.5,1 C0.82,0.84 1,0.62 1,0.5 L1,0.35 C0.94,0.32 0.87,0.18 0.825,0.08 L0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>
      <Header />
      <TabBar />
      {activeTab && <ColumnGrid tab={activeTab} />}
      <DialogHost />
    </>
  )
}
