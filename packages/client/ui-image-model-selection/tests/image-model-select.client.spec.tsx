// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import { ImageModelSelect } from '../src/client/ImageModelSelect.tsx'
import { en } from '../src/client/locales.ts'

it('shows an image model choice pane and saves the complete model ID', async () => {
  const config = {
    models: ['codex/gpt-image-2', 'antigravity/gemini-3.1-flash-image'],
    defaultModel: 'codex/gpt-image-2',
    revision: 3,
  }
  const load = vi.fn(async () => config)
  const select = vi.fn(async (model: string) => ({ ...config, defaultModel: model, revision: 4 }))
  const openOption = vi.fn()
  const dismiss = vi.fn()
  const reportFailure = vi.fn()
  const props = {
    load, select, openOption, dismiss, reportFailure,
    locked: false, visible: true, activeOption: null,
    t: (key: keyof typeof en, params?: { message?: string }) => en[key].replace('{message}', params?.message ?? ''),
  }
  const componentProps = props as Partial<ComponentProps<typeof ImageModelSelect>> as ComponentProps<typeof ImageModelSelect>
  const view = render(<ImageModelSelect {...componentProps} />)
  const row = await screen.findByRole('menuitem', { name: /Image model/ })
  expect(row.textContent).toContain('gpt-image-2')
  expect(row.textContent).not.toContain('codex/')
  fireEvent.click(row)
  expect(openOption).toHaveBeenCalledWith('image-model')
  view.rerender(<ImageModelSelect {...componentProps} activeOption="image-model" />)
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'gemini-3.1-flash-image' }))
  await waitFor(() => { expect(select).toHaveBeenCalledWith('antigravity/gemini-3.1-flash-image', 3) })
  await waitFor(() => { expect(dismiss).toHaveBeenCalledOnce() })
  expect(reportFailure).not.toHaveBeenCalled()
})

it('does not show a loading row when the image tool is unavailable', async () => {
  let resolveLoad: (value: null) => void = () => {}
  const load = vi.fn(() => new Promise<null>((resolve) => { resolveLoad = resolve }))
  const props = {
    load, select: vi.fn(), openOption: vi.fn(), dismiss: vi.fn(), reportFailure: vi.fn(),
    locked: false, visible: true, activeOption: null,
    t: (key: keyof typeof en, params?: { message?: string }) => en[key].replace('{message}', params?.message ?? ''),
  } as Partial<ComponentProps<typeof ImageModelSelect>> as ComponentProps<typeof ImageModelSelect>
  render(<ImageModelSelect {...props} />)
  expect(screen.queryByRole('menuitem', { name: /Image model/ })).toBeNull()
  resolveLoad(null)
  await waitFor(() => { expect(load).toHaveBeenCalledOnce() })
  expect(screen.queryByRole('menuitem', { name: /Image model/ })).toBeNull()
})
