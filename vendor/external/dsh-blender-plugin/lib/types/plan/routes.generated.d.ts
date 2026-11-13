export type HeadlessTarget = {
    api: string;
    sub: string;
    preload: string;
};
/** Exact-op worker aliases; checked before every prefix row (old alias precedence). */
export declare const PLAN_HEADLESS_ALIAS: Readonly<Record<string, readonly [string, string, string]>>;
/** Worker prefix routes in precedence order; strip = leading characters removed first. */
export declare const PLAN_HEADLESS_MAP: ReadonlyArray<readonly [prefix: string, api: string, preload: string, strip: number]>;
