/**
 * Bncr1.X版本默认数据库，现开源该中间件，可以自行优化以及参考该中间件开发其他数据库
 * Nedb数据库中间件 BncrDB的数据库支撑中间件，所有new BncrDB的后续操作均要经过此源码和数据库交互
 * Nedb文档 https://www.npmjs.com/package/nedb
 * @author Aming
 * @version 1.0.0
 * @create_at 2022-05-01 01:39:45
 * @Copyright ©2023 Aming and Anmours. All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

import NeDB from 'nedb';
import path from 'path';
/* userdb实例，默认数据库 */
let userDB = null;
/* 防止多次加载同一个数据库 */
const getDefaultDB = (): NeDB<any> => {
    if (!userDB) {
        userDB = new NeDB({
            autoload: true,
            timestampData: true,
            onload: (e: Error | null) => {
                e && console.log(e);
            },
            filename: path.join(process.cwd(), `BncrData/db/user.db`),
        });

        /* 设定30分钟压缩一次数据库 */
        userDB.persistence.setAutocompactionInterval(30 * 1000 * 60);
    }
    return userDB;
};
/**
 * Bncr系统默认数据库构造方法，new BncrDB 最终会调用此中间件
 */
export class systemDB {
    /** 数据库实例 */
    DB: NeDB<any>;
    name: string;
    /**
     * BncrDB的数据库支撑中间件，所有new BncrDB的后续操作均要经过此构造函数和数据库交互
     * @param name 每次new BncrDB(x)的值，
     * @param diyDB 可选值，new BncrDB(x，{registerName:x, useMiddlewarePath: 'Level.ts', db:的参数会由diyDB传入})
     */
    constructor(name: string, diyDB?: NeDB<any>) {
        if (!name || typeof name !== 'string') {
            throw new Error('错误,传递的数据库表名必须为有效字符串');
        }
        if (diyDB && (!diyDB?.find || !diyDB?.remove)) {
            throw new Error('new BncrDB时第二个参数如果存在，其db字段必须是一个Nedb实例');
        }
        /* 默认用userdb，如果用户传递数据库，则使用用户的 */
        this.DB = diyDB || getDefaultDB();
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
            let nowDb = await this._finds(key);
            if (nowDb.length === 0) {
                let setdb = await new Promise((resolve, reject) => {
                    this.DB.insert({ name: this.name, key: key, value: value }, (err, docs) => {
                        if (err) {
                            console.log(err);
                            resolve('');
                        }
                        resolve(docs);
                    });
                });
                if (setdb) return true;
                else return false;
            } else {
                let id = nowDb[0]._id;
                let update = await new Promise<boolean>((resolve, reject) => {
                    this.DB.update({ _id: id }, { $set: { key: key, value: value } }, {}, (err: any, n: number) => {
                        if (err) {
                            console.log(err);
                            resolve(false);
                        }
                        if (n > 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                });
                return update;
            }
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
            let nowDb = await this._finds(key);
            if (nowDb.length === 0) {
                return undefined;
            } else {
                let del = await new Promise((resolve, reject) => {
                    this.DB.remove({ _id: nowDb[0]._id }, (err: any, n: any) => {
                        if (err) {
                            console.log(err);
                            resolve(false);
                        }
                        if (n > 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                });
                return (del && true) || false;
            }
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
        let nowDb = await this._finds(key);
        if (nowDb?.length === 0) return undefined;
        else return bool ? nowDb[0] : nowDb[0].value;
    }
    async _finds(key?: string): Promise<any> {
        try {
            return new Promise((resolve, reject) => {
                let obj: any = { name: this.name };
                key && (obj.key = key);
                this.DB.find(obj, (err: any, docs: any) => {
                    if (err) {
                        // console.log(err);
                        resolve([]);
                    }
                    resolve(docs);
                });
            });
        } catch (error) {
            return [];
        }
    }

    /**
     * 查所有表名 BncrDB.getAllForm()最终会调用此函数
     * @returns string[]
     */
    async _findAllFrom(): Promise<string[]> {
        const nowDb = await new Promise<any[]>((resolve, reject) => {
            this.DB.find({}, (err: any, docs: any) => {
                if (err) {
                    console.log(err);
                    resolve([]);
                }
                resolve(docs);
            });
        });
        let formArr: string[] = [];
        for (const e of nowDb) !formArr.includes(e.name) && formArr.push(e.name);
        return formArr;
    }
    /**
     * 查当前this.name表下所有key值
     * @returns string[]
     */
    async _keys() {
        let nowDb = await this._finds();
        let keysArr: string[] = [];
        for (const e of nowDb) keysArr.push(e.key);
        return keysArr;
    }
}
