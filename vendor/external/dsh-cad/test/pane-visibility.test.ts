import { describe, expect, it } from 'vitest'
import { mountCadPanel, type PaneClientContext } from '../client/pane.js'

describe('CAD pane visibility', () => {
  it('registers only for the selected architecture session and releases on switch', () => {
    let current = 'standard-session'
    let preset = 'standard'
    const listeners = new Set<() => void>()
    const registered = new Set<string>()
    const cleanups: Array<() => void> = []
    const observable = {
      subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } },
    }
    const context: PaneClientContext = {
      slots: {
        inject(_slot, register) { return register() },
        register() { return () => {} },
      },
      get(name) {
        if (name === 'sidebarRightTabs') return {
          register(definition: { id: string }) {
            registered.add(definition.id)
            return () => { registered.delete(definition.id) }
          },
        }
        if (name === 'uiSession') return { adapter: { current: { ...observable, getSnapshot: () => ({ key: current }) } } }
        if (name === 'sessions') return { list: {
          ...observable,
          getSnapshot: () => ({ byId: { [current]: { projectionValues: { agentPreset: preset } } } }),
        } }
        return undefined
      },
      effect(fn) {
        const dispose = fn()
        cleanups.push(dispose)
        return dispose
      },
    }

    mountCadPanel(context, undefined)
    expect(registered.size).toBe(0)
    current = 'architecture-session'
    preset = 'architecture'
    for (const listener of listeners) listener()
    expect(registered.has('dsh-cad')).toBe(true)
    current = 'standard-session'
    preset = 'standard'
    for (const listener of listeners) listener()
    expect(registered.size).toBe(0)
    for (const dispose of cleanups.reverse()) dispose()
    expect(listeners.size).toBe(0)
  })
})
