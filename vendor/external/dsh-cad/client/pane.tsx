/**
 * The host-rightbar-pane registration (the panel's only mounting mode,
 * dsh ≥0.2.x): the CAD panel is a first-class pane — the host's docking kit
 * owns width, collapse, float, fullscreen, and the per-session open state,
 * with zero self-measured positioning (the bug class behind issue #6 P0-1
 * retired for good).
 *
 * Registration mirrors the host's own pane plugins (@deepseek-ai/
 * dsh-client-ui-sidebar-files): one tab type through the `sidebarRightTabs`
 * service plus keyed entries on the `sidebar.right.pane.tab` body and
 * `sidebar.right.pane.tab.title` chip seats. The `guide` entry puts CAD in
 * the new-tab menu.
 *
 * Timing: this plugin declares only `slots`, so its client half activates
 * BEFORE the sidebar-right package provides `sidebarRightTabs` (itself
 * waiting on the frame's layout services) — a single apply-time lookup loses
 * that race (verified live: the type never reached the new-tab menu). So the
 * mount retries the lookup over the first ~1.6s; a partial registration
 * (type in, body out) is rolled back on any throw. Hosts without the pane
 * system (dsh < 0.2.x) mount no panel — the chat cards remain the CAD
 * surface there.
 */
import React from 'react'
import type { JSX } from 'react'
import { makeCadPaneBody } from './sidepanel.js'
import type { CurrentSessionLike, SessionsLike } from './sidepanel.js'

/** The tab type's registry identity AND the keyed seat key (the id is what the seat dispatches on). */
const CAD_TAB_ID = 'dsh-cad'
/** The kind recorded by the host's session layout. */
const CAD_TAB_KIND = 'cad'

/** Retry cadence for the sidebarRightTabs lookup: ~1.6s window, sub-second engagement on modern hosts. */
const SERVICE_RETRY_DELAYS_MS = [100, 300, 600, 1200]

/** The structural slice of the host's SidebarRightTabRegistry this plugin needs. */
export interface PaneTabRegistryLike {
  register(definition: {
    id: string
    kind: string
    priority?: string
    title: () => string
    guide?: Array<{
      order: number
      title: () => string
      description: () => string
      icon: (props: { size?: number; className?: string }) => JSX.Element
    }>
    patterns?: unknown[]
  }): () => void
}

/** The plugin context surface the mounting reads (timer/effect are optional for old hosts). */
export interface PaneClientContext {
  slots: {
    inject(slot: string, register: () => unknown): unknown
    register(options: { name: string; key: string }, component: (props: never) => JSX.Element): unknown
  }
  get?: (name: string) => unknown
  effect?: (fn: () => () => void, label?: string) => () => void
  setTimeout?: (fn: () => void, ms: number) => unknown
}

/** The `uiSession` service slice: an observable of the current session (what sidebar-right itself watches). */
interface UiSessionLike {
  adapter?: {
    current?: CurrentSessionLike
  }
}

interface PresetSessionsLike extends SessionsLike {
  list?: {
    getSnapshot(): { byId?: Record<string, { projectionValues?: { agentPreset?: string } }> }
    subscribe(fn: () => void): () => void
  }
}

/** Isometric cube outline — the tab chip and the new-tab-guide glyph. */
function CubeGlyph({ size = 16, className }: { size?: number; className?: string }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 1.5 14 5v6L8 14.5 2 11V5L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M2 5l6 3.2L14 5M8 8.2v6.3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

/** The tab chip: cube glyph + the tab's captured title (「CAD」 when none). */
function CadPaneTitle(props: { useTabInfo?: () => { tab?: { title?: string } } }): JSX.Element {
  const tab = props.useTabInfo?.().tab
  return (
    <>
      <CubeGlyph size={16} />
      {tab?.title ?? 'CAD'}
    </>
  )
}

/**
 * One registration attempt. Returns false (registering nothing, rolling back
 * anything partial) when the sidebar-right tab system is absent or rejects
 * the registration — the caller then retries or falls back to the overlay.
 */
function tryRegisterCadPane(ctx: PaneClientContext, sessions: SessionsLike | undefined): (() => void) | undefined {
  const tabs = ctx.get?.('sidebarRightTabs') as PaneTabRegistryLike | undefined
  if (tabs == null || typeof tabs.register !== 'function') return undefined
  const liveSessions = (ctx.get?.('sessions') as SessionsLike | undefined) ?? sessions
  const currentSession = (ctx.get?.('uiSession') as UiSessionLike | undefined)?.adapter?.current
  const effect = ctx.effect ?? ((fn: () => () => void) => fn())
  const disposers: Array<() => void> = []
  const track = (dispose: unknown): void => {
    if (typeof dispose === 'function') disposers.push(dispose)
  }
  try {
    track(tabs.register({
      id: CAD_TAB_ID,
      kind: CAD_TAB_KIND,
      title: () => 'CAD',
      guide: [{
        order: 20,
        title: () => 'CAD 视图',
        description: () => '三维模型 · 装配体 · 工程图，实时跟踪本会话的建模结果',
        icon: CubeGlyph,
      }],
    }))
    track(effect(() => ctx.slots.inject('sidebar.right.pane.tab', () =>
      ctx.slots.register(
        { name: 'sidebar.right.pane.tab', key: CAD_TAB_ID },
        makeCadPaneBody(liveSessions, currentSession) as unknown as (props: never) => JSX.Element,
      )), 'dsh-cad: rightbar pane body'))
    track(effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () =>
      ctx.slots.register(
        { name: 'sidebar.right.pane.tab.title', key: CAD_TAB_ID },
        CadPaneTitle as unknown as (props: never) => JSX.Element,
      )), 'dsh-cad: rightbar pane title'))
    return () => { for (const dispose of disposers.reverse()) dispose() }
  } catch {
    for (const dispose of disposers.reverse()) {
      try { dispose() } catch { /* best-effort rollback */ }
    }
    return undefined
  }
}

/**
 * Register the CAD tab while the current session uses the Architecture preset.
 * Retry briefly while the host provides the sidebar and session services.
 */
export function mountCadPanel(ctx: PaneClientContext, sessions: SessionsLike | undefined): void {
  let disposed = false
  let registered: (() => void) | undefined
  let observing = false
  let stopCurrent: (() => void) | undefined
  let stopList: (() => void) | undefined

  const sync = (): void => {
    const current = (ctx.get?.('uiSession') as UiSessionLike | undefined)?.adapter?.current
    const liveSessions = (ctx.get?.('sessions') as PresetSessionsLike | undefined) ?? sessions as PresetSessionsLike | undefined
    const list = liveSessions?.list
    const key = current?.getSnapshot().key
    const preset = typeof key === 'string' ? list?.getSnapshot().byId?.[key]?.projectionValues?.agentPreset : undefined
    if (preset === 'architecture') {
      registered ??= tryRegisterCadPane(ctx, sessions)
    } else {
      registered?.()
      registered = undefined
    }
  }

  const attempt = (index: number): void => {
    if (disposed) return
    const current = (ctx.get?.('uiSession') as UiSessionLike | undefined)?.adapter?.current
    const liveSessions = (ctx.get?.('sessions') as PresetSessionsLike | undefined) ?? sessions as PresetSessionsLike | undefined
    const list = liveSessions?.list
    const tabs = ctx.get?.('sidebarRightTabs') as PaneTabRegistryLike | undefined
    if (current !== undefined && list !== undefined && tabs !== undefined) {
      if (!observing) {
        stopCurrent = current.subscribe(sync)
        stopList = list.subscribe(sync)
        observing = true
      }
      sync()
      return
    }
    if (index >= SERVICE_RETRY_DELAYS_MS.length) return
    const retry = (): void => { attempt(index + 1) }
    if (typeof ctx.setTimeout === 'function') ctx.setTimeout(retry, SERVICE_RETRY_DELAYS_MS[index])
    else setTimeout(retry, SERVICE_RETRY_DELAYS_MS[index])
  }
  attempt(0)
  ctx.effect?.(() => () => {
    disposed = true
    stopCurrent?.()
    stopList?.()
    registered?.()
  }, 'dsh-cad: architecture pane visibility')
}
