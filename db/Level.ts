/**Level数据库中间件 BncrDB的数据库支撑中间件，所有new BncrDB的后续操作均要经过此源码和数据库交互
 * Level为谷歌开发的可嵌入高性能k-v数据库，每秒高达40w次读写，比原先的Nedb性能提高几百倍。
 * 在一般情况下，这个数据库已经足够使用，如果觉得还想要更好的，可以自己根据此文件改造自己的数据库链接。
 * @author Aming
 * @version 1.0.0
 * @create_at 2023-12-01 03:37:57
 * @Copyright ©2023 Aming and Anmours. All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

import { Level } from 'level';
import path from 'path';
/* userdb实例，默认数据库 */
const userdb = new Level<string, any>(path.join(process.cwd(), `BncrData/db/user`), { valueEncoding: 'json' });
// sysMethod.startOutLogs('数据库user.db载入完成~');

/**
 * Bncr系统默认数据库构造方法，new BncrDB 最终会调用此中间件
 */
export class systemDB {
    /** 数据库实例 */
    DB = userdb;
    name: string;
    /**
     * BncrDB的数据库支撑中间件，所有new BncrDB的后续操作均要经过此构造函数和数据库交互
     * @param name 每次new BncrDB(x)的值，
     * @param diyDB 可选值，new BncrDB(x，{registerName:user, useMiddlewarePath: 'Level.ts', db:的参数会由diyDB传入})
     */
    constructor(name: string, diyDB?: Level<string, any>) {
        if (!name || typeof name !== 'string') {
            throw new Error('错误,传递的数据库表名必须为有效字符串');
        }
        if (diyDB && (!diyDB?.put || !diyDB?.del)) {
            throw new Error('new BncrDB时第二个参数如果存在，其db字段必须是一个Level实例');
        }
        /* 默认用userdb，如果用户传递数据库，则使用用户的 */
        this.DB = diyDB || userdb;
        this.name = name;
    }
    /**
     * 增、改数据库，
     * diy时注意，该方法只能返回布尔值，其他类型值一律按false算
     * @param key 要设置的key
     * @param value 要设置的value
     * @returns boolean
     */
    async _update(key: string, value: string): Promise<boolean> {
        try {
            await this.DB.put(`${this.name}&&${key}`, value);
            return true;
        } catch (error) {
            console.log(`设置'${key}'失败:`, error);
            return false;
        }
    }
    /**
     * 删出数据库中数据
     * @param key 要删除的key值
     * @returns boolean
     */
    async _delDb(key: string) {
        try {
            /* 如果数据库中没有该值 */
            if ((await this._find(key, false)) === undefined) {
                /* 返回undefined */
                return undefined;
            }
            /* 否则执行删除操作 */
            await this.DB.del(`${this.name}&&${key}`);
            /* 成功返回true */
            return true;
        } catch (error) {
            /* 失败返回false */
            return false;
        }
    }
    /**
     * 查数据库，
     * 如果数据库没有值，请返回undefined
     * bool值是控制是否返回该条数据详细信息，如果该值为true,
     * 则需要请求数据更改详细信息。（在Nedb中起效，在Level中无效），
     * 目前考虑后期给删了，如果diy可以不设计该功能
     * @param key 要读取的key
     * @param bool 如果该值为true,则需要请求数据更改详细信息。
     * @returns any
     */
    async _find(key: string, bool?: boolean): Promise<any> {
        try {
            return await this.DB.get(`${this.name}&&${key}`);
        } catch (error) {
            return undefined;
        }
    }

    /**
     * 查所有表名
     * @returns string[]
     */
    async _findAllFrom(): Promise<string[]> {
        const formArr: string[] = [];
        for (const e of await this.DB.keys().all()) {
            let a = e.split('&&');
            if (a && a.length === 2) {
                !formArr.includes(a[0]) && formArr.push(a[0]);
            }
        }
        return formArr;
    }
    /**
     * 查当前this.name表下所有key值
     * @returns string[]
     */
    async _keys() {
        const keysArr: string[] = [];
        for (const e of await this.DB.keys().all()) {
            let a = e.split('&&');
            if (a && a.length === 2) {
                a[0] === this.name && keysArr.push(a[1]);
            }
        }
        return keysArr;
    }
}
