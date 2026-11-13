import type { TrajWriteDeps } from './record.js';
/** 给返回对象裹一层记录：this 仍指向原对象（内部 this.xxx() 不会重复记账） */
export declare function createTrajectoryWrapper(deps: TrajWriteDeps): (obj: Record<string, unknown>) => Record<string, unknown>;
