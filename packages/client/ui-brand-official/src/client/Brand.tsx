import { BrandWordmark, FishLogo } from '@deepseek-ai/dsh-client-ui-primitives'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'

/**
 * Render the official mark with the presentation requested by its host surface.
 * @param props - Host-supplied mark presentation.
 * @returns the official whale mark.
 */
export function OfficialBrandMark({ size }: SidebarBrandMarkOwnerProps) {
  return <FishLogo size={size} />
}

/**
 * Render the official name artwork without its independently slotted mark.
 * @returns the official name wordmark.
 */
export function OfficialBrandName() {
  return <BrandWordmark includeMark={false} />
}

/**
 * 渲染图灵 Harness 的本地构建标识。
 * @param props - 侧栏或首页请求的尺寸与样式。
 * @returns 可随主题继承颜色的 T 字标识。
 */
export function TuringBrandMark({ size, className }: HeroBrandMarkOwnerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 2h24c5.523 0 10 4.477 10 10v24c0 5.523-4.477 10-10 10H12C6.477 46 2 41.523 2 36V12C2 6.477 6.477 2 12 2Zm0 12v6h9v16h6V20h9v-6H12Z"
      />
    </svg>
  )
}
