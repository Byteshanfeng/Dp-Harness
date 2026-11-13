/**
 * Scene-URL version merging for the panel's liveness poll: a poll must be able
 * to advance a stale scene URL but must NEVER roll back a URL that the tool
 * result already versioned further (the poll can lag a just-finished op).
 */
import { describe, expect, it, vi } from 'vitest'
import { sceneVersion, setPollSession, withDocVersion } from '../client/doc-revision.js'

describe('scene URL versioning', () => {
  it('reads the version parameter', () => {
    expect(sceneVersion('/dsh-cad/bin/doc?v=42')).toBe(42)
    expect(sceneVersion('/dsh-cad/bin/doc?x=1&v=7')).toBe(7)
    expect(sceneVersion('/dsh-cad/bin/doc')).toBe(0)
    expect(sceneVersion(undefined)).toBe(0)
  })

  it('advances a stale URL to the polled version', () => {
    expect(withDocVersion('/dsh-cad/bin/doc?v=3', 5)).toBe('/dsh-cad/bin/doc?v=5')
  })

  it('never rolls a newer URL back to an older poll', () => {
    expect(withDocVersion('/dsh-cad/bin/doc?v=7', 5)).toBe('/dsh-cad/bin/doc?v=7')
  })

  it('adds the parameter when absent, before or after an existing query', () => {
    expect(withDocVersion('/dsh-cad/bin/doc', 5)).toBe('/dsh-cad/bin/doc?v=5')
    expect(withDocVersion('/dsh-cad/bin/doc?session=a', 5)).toBe('/dsh-cad/bin/doc?session=a&v=5')
  })

  it('leaves the URL alone until the first successful poll', () => {
    expect(withDocVersion('/dsh-cad/bin/doc?v=1', null)).toBe('/dsh-cad/bin/doc?v=1')
    expect(withDocVersion(undefined, 5)).toBeUndefined()
  })
})

describe('session document polling', () => {
  it('fetches the new session after an older request finishes', async () => {
    let resolveOld: ((response: Response) => void) | undefined
    const oldResponse = new Promise<Response>((resolve) => { resolveOld = resolve })
    const fetchMock = vi.fn()
      .mockReturnValueOnce(oldResponse)
      .mockResolvedValue(Response.json({ docs: [] }))
    vi.stubGlobal('fetch', fetchMock)
    try {
      setPollSession('old-session')
      setPollSession('new-session')
      expect(fetchMock).toHaveBeenCalledTimes(1)
      resolveOld?.(Response.json({ docs: [], active: { id: 'old-doc', name: 'Old', version: 1 } }))
      await vi.waitFor(() => { expect(fetchMock).toHaveBeenCalledWith('/dsh-cad/docs?session=new-session', { cache: 'no-store' }) })
    } finally {
      setPollSession(null)
      vi.unstubAllGlobals()
    }
  })
})
