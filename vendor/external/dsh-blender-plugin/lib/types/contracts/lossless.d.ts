export declare function losslessSanitize(root: unknown): {
    value: unknown;
    fixes: string[];
};
/** 普通对象/数组判定（用于决定是否走 toJSON 分支） */
export declare function isPlainObjectLike(v: unknown): boolean;
