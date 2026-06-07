import type { CharacterDetailProvider } from './CharacterDetailProvider'
import { RenderedDDBProvider } from './RenderedDDBProvider'
import { ProxyNativeProvider } from './ProxyNativeProvider'
import { IframeDDBProvider } from './IframeDDBProvider'
import { LinkOutProvider } from './LinkOutProvider'

// Registry of available character-detail providers.
//   - rendered (default): headless browser renders the sheet so DDB computes
//                         everything; we read the exact AC/HP/stats. Needs the
//                         headless shell locally (or BROWSER_CDP_URL to a host browser).
//   - proxy:   fetch the character JSON and compute the reliable subset ourselves
//              (fast, no browser, but AC/edge-cases aren't resolved).
//   - iframe:  embed the live DDB page (usually blocked by DDB).
//   - link:    just link out to DDB.
// To add a method, implement CharacterDetailProvider and add it here.
export const PROVIDERS: CharacterDetailProvider[] = [
  RenderedDDBProvider,
  ProxyNativeProvider,
  IframeDDBProvider,
  LinkOutProvider,
]

export function getProvider(id: string): CharacterDetailProvider {
  return PROVIDERS.find((p) => p.id === id) ?? RenderedDDBProvider
}
