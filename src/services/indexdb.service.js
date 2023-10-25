import { useEffect, useState } from "react";

var pb = null, currentImg = 1;
export var pafDB = null;

export default class {

    constructor(idbName, version = 1, objectStores = []){
        this.version = version;
        this.objectStores = objectStores;
        this.idbName = idbName;
    }

    set objectStore(objStore) {
        this.objectStores.push(objStore);
    }

    set storageName(name) {
        this.idbName = name;
    }

    get DB() {

        const self = this;

        return new Promise((resolve, reject) => {
            var connectionRequest = indexedDB.open(this.idbName, self.version);

            connectionRequest.onupgradeneeded = function (e) {
                var theDB = e.target.result, index = 0;

                self.objectStores.map(store => {
                    if (theDB.objectStoreNames.contains(store.name)) theDB.deleteObjectStore(store.name);
                    let objstr = theDB.createObjectStore(store.name, store.params ? store.params : {});
                    if (store.indexes) {
                        store.indexes.map(index => {
                            objstr.createIndex(index.name, index.keyPath, index.options);
                        });
                    }
                });

            }

            connectionRequest.onsuccess = function (e) {
                resolve(e.target.result);
            }

            connectionRequest.onerror = function (e) {
                reject(e);
            }

        });
    }

    getData(storeName) {
        return this.DB.then((db) => {
            return new Promise((rs, rj) => {
                const tx = db.transaction([storeName], "readwrite"),
                    objstr = tx.objectStore(storeName),
                    req = objstr.openCursor();

                let data = [];

                req.onsuccess = (evt) => {
                    const c = evt.target.result;

                    if (c) {
                        data.push(c.value);
                        c.continue();
                    }
                    else rs(data);
                }
                req.onerror = rj;
            });
        });
    }

    saveData(store, data) {
        // const storeName = this.objectStores[0].name;
        return this.DB.then(db => {
            return new Promise((res, rej) => {
                const objstr = db.transaction([store], "readwrite").objectStore(store);
                const req = objstr.put(data);
                req.onsuccess = res;
                req.onerror = rej;
            })
        })
    }

    saveManyData(storeName, data) {
        // const storeName = this.objectStores[0].name;
        return this.DB.then(function (db) {
            let putRequests = [];
            const objStr = db.transaction([storeName], "readwrite").objectStore(storeName);
            data.forEach(function (d) {
                putRequests.push(new Promise((rs, rj) => {
                    const req = objStr.put(d);
                    req.onsuccess = rs;
                    req.onerror = rj;
                }));
            });
            return Promise.all(putRequests);
        });
    }

    getAll(from, where = null) {
        // const keyRange = arguments[1] || null;
        return this.DB.then((db) => {
            return new Promise((res, rej) => {
                const objStr = db.transaction([from], "readonly").objectStore(from),
                    // keyRange: IDBKeyRange = null,
                    req = where ? objStr.index(where.index).getAll(where.keyRange) : objStr.getAll();

                req.onsuccess = (evt) => { res(req.result); }
                req.onerror = rej;
            });
        });
    }

    get(storeName, index, keyRange) {
        // console.log(keyRange);
        // const storeName = this.objectStores[0].name;
        return this.DB.then((db) => {
            return new Promise((res, rej) => {
                try {
                    const objStr = db.transaction([storeName], "readonly").objectStore(storeName),
                        req = objStr.index(index).get(keyRange);

                    req.onsuccess = (evt) => res(req.result);
                    req.onerror = rej;
                }
                catch (e) {
                    console.log(e);
                    rej(e);
                }
            });
        });
    }

    getById(storeName, id){
        return this.DB.then((db) => {
            return new Promise((res, rej) => {
                try {
                    const objStr = db.transaction([storeName], "readonly").objectStore(storeName),
                        req = objStr.get(id);
                    req.onsuccess = (evt) => res(req.result);
                    req.onerror = rej;
                }
                catch (e) {
                    console.log(e);
                    rej(e);
                }
            });
        });
    }

    delete(storeName, keyRange, index) {
        return this.DB.then((db) => {
            const objStr = db.transaction([storeName], "readwrite").objectStore(storeName);
            objStr.delete(keyRange);
        });
    }
}

export function useIDBGetData(idb, storeName){
    const [data, setData] = useState([]);

    useEffect(()=>{
        idb.getData(storeName).then(setData)
    }, []);

    return [data]
}

export function useIDBGetAllData(idb, storeName){
    const [data, setData] = useState([]);

    useEffect(()=>{
        idb.getAll(storeName).then(setData)
    }, []);

    return [data]
}

/* export function useIDBSaveData(idb, storeName, data){
    const [data, setData] = useState([]);

    useEffect(()=>{
        idb.getData(storeName).then(setData)
    }, []);

    return [data]
} */