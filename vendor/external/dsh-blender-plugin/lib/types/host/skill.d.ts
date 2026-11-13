import type { HostContext } from './context.js';
export declare const BUNDLED_SKILL_PROVIDER = "dsh-blender-plugin";
export declare const BUNDLED_SKILL_RANK = 600;
export declare const BUNDLED_SKILL_DIR: string;
export interface BundledSkill {
    name: string;
    description: string;
    content: string;
}
export interface BundledSkillProvider {
    name: string;
    list: () => Promise<unknown[]>;
    get: () => Promise<unknown>;
}
/** 解析 SKILL.md 的 YAML frontmatter（只取本插件需要的 name/description；不引 yaml 依赖）。 */
export declare function parseSkillFrontmatter(raw: string): {
    meta: Record<string, string>;
    body: string;
};
export declare function readBundledSkill(): BundledSkill | null;
export declare function createBundledSkillProvider(): BundledSkillProvider | null;
/**
 * 把随包 skill 注册进宿主的 skills 注册表（可选能力，失败只告警）。
 * 用 ctx.inject(['skills'], cb) 延迟到服务可用时再注册：宿主若没有 skill 服务，
 * 这个子 fiber 一直待命即可，**不会**让插件本身起不来。
 */
export declare function registerBundledSkill(ctx: HostContext): void;
