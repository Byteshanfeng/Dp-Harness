/** Register the image tool selection in the conversation model menu. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { SettingsNamespaceView } from '@deepseek-ai/dsh-api-remotes/client'
import { ImageModelSelect, type ImageModelConfig } from './ImageModelSelect.tsx'
import { zh, en, ja, es, fr, de, ru, pt, type ImageModelKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Image tool model selector. */
    'image-model': ImageModelKey
  }
}

/** Services required for localized selection and configuration writes. */
export const inject = ['slots', 'locale', 'remote', 'remote.settings']

/** Read image choices from the installed tool's redacted settings descriptor. */
function imageConfig(view: SettingsNamespaceView | undefined): ImageModelConfig | null {
  if (view === undefined || typeof view.value !== 'object' || view.value === null || Array.isArray(view.value)) return null
  const { models, defaultModel } = view.value
  if (!Array.isArray(models) || !models.every(model => typeof model === 'string') || models.length === 0 || typeof defaultModel !== 'string') return null
  return { models, defaultModel, revision: view.revision }
}

/** Mount the selector beside the chat model and reasoning controls. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register('image-model', { zh, en, ja, es, fr, de, ru, pt }), 'ui-image-model-selection: dictionaries')
  const load = async (): Promise<ImageModelConfig | null> => {
    const response = await ctx.remote.settings.describe()
    if (!response.ok) throw new Error(response.error.message)
    return imageConfig(response.value.namespaces.find(view => view.ns === 'openai-image-tool'))
  }
  const select = async (model: string, revision: number): Promise<ImageModelConfig> => {
    const response = await ctx.remote.settings.mutate('openai-image-tool', [{ op: 'set', path: ['defaultModel'], value: model }], revision)
    if (!response.ok) throw new Error(response.error.message)
    const config = imageConfig(response.value)
    if (config === null) throw new Error('image tool settings are unavailable after saving')
    return config
  }
  ctx.slots.inject('conversation.input.model.options', () => ctx.slots.register({
    name: 'conversation.input.model.options', id: 'image-model', locale: 'image-model',
    inject: () => ({ load, select }),
  }, ImageModelSelect))
}
