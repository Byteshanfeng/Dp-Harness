/** Image tool model selection inside the composer model menu. */
import { useEffect, useState } from 'react'
import { IconCheckOutlineRegular, IconChevronRightOutlineRegular, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import css from './ImageModelSelect.module.css'

/** Configured image models and the saved selection. */
export interface ImageModelConfig {
  readonly models: readonly string[]
  readonly defaultModel: string
  readonly revision: number
}

/** Remote operations provided by the plugin body. */
export interface ImageModelSelectInjected {
  load: () => Promise<ImageModelConfig | null>
  select: (model: string, revision: number) => Promise<ImageModelConfig>
}

/** Composer slot props and the image tool configuration operations. */
export type ImageModelSelectProps = PropsRuntime<'conversation.input.model.options'>
  & PropsLocale<'image-model'> & ImageModelSelectInjected

/** Show only the model name while retaining the complete provider route as its value. */
function modelLabel(id: string): string {
  return id.slice(id.lastIndexOf('/') + 1)
}

/** Render the image model choice when the image plugin is configured. */
export function ImageModelSelect({
  load, select, locked, visible, activeOption, openOption, dismiss, reportFailure, t,
}: ImageModelSelectProps) {
  const [config, setConfig] = useState<ImageModelConfig | null>(null)
  const [pendingModel, setPendingModel] = useState<string | null>(null)
  const pending = pendingModel !== null
  useEffect(() => {
    let active = true
    void load().then((value) => {
      if (active) setConfig(value)
    }, (error: unknown) => {
      if (active) reportFailure(t('failed', { message: error instanceof Error ? error.message : String(error) }))
    })
    return () => { active = false }
  }, [load, reportFailure, t])

  if (!visible || config === null || (activeOption !== null && activeOption !== 'image-model')) return null
  const choose = (model: string): void => {
    if (pending) return
    if (model === config.defaultModel) { dismiss(); return }
    setPendingModel(model)
    void select(model, config.revision).then((value) => {
      setConfig(value)
      dismiss()
    }, (error: unknown) => {
      reportFailure(t('failed', { message: error instanceof Error ? error.message : String(error) }))
    }).finally(() => { setPendingModel(null) })
  }
  if (activeOption === null) return <button type="button" role="menuitem" data-model-option-id="image-model"
    className={css.cell} disabled={locked}
    onClick={() => { openOption('image-model') }}>
    <span className={css.cellLabel}>{t('label')}</span>
    <span className={css.cellValue}>{modelLabel(config.defaultModel)}</span>
    <IconChevronRightOutlineRegular className={css.cellChevron} aria-hidden="true" />
  </button>
  return <div className={`${css.options} scrollable`} role="group" aria-label={t('label')} aria-busy={pending}>
    {config.models.map((model) => {
      const selected = model === config.defaultModel
      return <button type="button" role="menuitemradio" aria-checked={selected} key={model}
        className={css.option} title={modelLabel(model)} disabled={locked || pending}
        onClick={() => { choose(model) }}>
        <span className={css.optionName}>{modelLabel(model)}</span>
        <span className={css.check}>{pendingModel === model ? <StateDot state="ongoing" /> : selected ? <IconCheckOutlineRegular /> : null}</span>
      </button>
    })}
  </div>
}
