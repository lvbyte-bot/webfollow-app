const version = 1;

export interface DbStore {
    id: number
}

export const IndexedDB = function (initDB: (idb: IDBDatabase) => void) {
    const dbName = 'WebFollowDatabase';

    let db: IDBDatabase | null = null;

    // 打开数据库
    function openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (db) {
                resolve(db);
                return;
            }

            const request: IDBOpenDBRequest = indexedDB.open(dbName, version);

            request.onupgradeneeded = function (event) {
                db = (event.target as IDBOpenDBRequest).result;
                initDB(db)
            };

            request.onsuccess = function (event) {
                db = (event.target as IDBOpenDBRequest).result;
                resolve(db);
            };

            request.onerror = function (event) {
                reject('Error opening database: ' + (event.target as IDBOpenDBRequest).error?.message);
            };
        });
    }

    // 创建（添加）数据
    function create<T extends DbStore>(storeName: string, data: T): Promise<string> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.add(data);

                request.onsuccess = function () {
                    resolve('Data added successfully');
                };

                request.onerror = function (event) {
                    reject('Error adding data: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    // 读取数据（通过 ID）
    function read<T extends DbStore>(storeName: string, id: number): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                const request = store.get(id);

                request.onsuccess = function (event) {
                    resolve((event.target as IDBRequest).result);
                };

                request.onerror = function (event) {
                    reject('Error fetching data: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    // 更新数据
    function update<T extends DbStore>(storeName: string, id: number, updatedData: T): Promise<string> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.put({ ...updatedData, id });

                request.onsuccess = function () {
                    resolve('Data updated successfully');
                };

                request.onerror = function (event) {
                    reject('Error updating data: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    // 删除数据
    function remove(storeName: string, id: number): Promise<string> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.delete(id);

                request.onsuccess = function () {
                    resolve('Data deleted successfully');
                };

                request.onerror = function (event) {
                    reject('Error deleting data: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    // 查询所有数据
    function getAll<T extends DbStore>(storeName: string): Promise<T[]> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                const request = store.getAll();

                request.onsuccess = function (event) {
                    resolve((event.target as IDBRequest).result);
                };

                request.onerror = function (event) {
                    reject('Error fetching all data: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    function listAll<T extends DbStore>(storeName: string, conditionFn: (item: T) => boolean): Promise<T[]> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const results: T[] = [];

                const request = store.openCursor();

                request.onsuccess = function (event) {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                    if (cursor) {
                        if (conditionFn(cursor.value)) {
                            results.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(results); // 返回符合条件的结果
                    }
                };

                request.onerror = function (event) {
                    reject('Error during cursor operation: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    function findAll<T extends DbStore>(storeName: string, conditionFn: (item: T) => boolean, pageSize: number, pageIndex: number, sortFn?: (a: T, b: T) => number): Promise<T[]> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const results: T[] = [];
                let request
                if (storeName == 'items') {
                    const index = store.index('pubDate');
                    request = index.openCursor(null, 'prev'); // 使用 'prev' 进行降序
                } else {
                    request = store.openCursor()
                }

                const startOffset = pageIndex * pageSize;
                let currentIndex = 0

                request.onsuccess = function (event) {
                    const cursor = (event.target as IDBRequest).result;
                    if (!cursor) {
                        resolve(results);
                        return;
                    }
                    if (conditionFn(cursor.value)) {
                        // 跳过前startIndex条记录
                        if (currentIndex < startOffset) {
                            currentIndex++;
                            cursor.continue();
                            return;
                        }
                        // 收集第startIndex到limit条记录
                        if (results.length < pageSize) {
                            results.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(results.sort(sortFn));
                        }
                    } else {
                        cursor.continue();
                    }
                };

                request.onerror = function (event) {
                    reject('Error during cursor operation: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    // 基于findAll 写一个listIds
    function listAllIds<T extends DbStore>(storeName: string, conditionFn: (item: T) => boolean): Promise<number[]> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const results: number[] = [];
                let request
                if (storeName == 'items') {
                    const index = store.index('pubDate');
                    request = index.openCursor(null, 'prev'); // 使用 'prev' 进行降序
                } else {
                    request = store.openCursor()
                }

                request.onsuccess = function (event) {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                    if (cursor) {
                        if (conditionFn(cursor.value)) {
                            results.push(cursor.value.id);
                        }
                        cursor.continue();
                    } else {
                        resolve(results); // 返回符合条件的结果
                    }
                };

                request.onerror = function (event) {
                    reject('Error during cursor operation: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }


    // 基于findall 写一个countAll
    function countAll<T extends DbStore>(storeName: string, conditionFn: (item: T) => boolean): Promise<number> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                let count = 0;

                const request = store.openCursor();

                request.onsuccess = function (event) {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                    if (cursor) {
                        if (conditionFn(cursor.value)) {
                            count++;
                        }
                        cursor.continue();
                    } else {
                        resolve(count); // 返回符合条件的结果
                    }
                };

                request.onerror = function (event) {
                    reject('Error during cursor operation: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }



    function whereOne<T extends DbStore>(storeName: string, applyFn: (item: T, y: T) => T): Promise<T> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                let result: T;

                const request = store.openCursor();

                request.onsuccess = function (event) {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                    if (cursor) {
                        result = applyFn(cursor.value, result)
                        cursor.continue();
                    } else {
                        resolve(result); // 返回符合条件的结果
                    }
                };

                request.onerror = function (event) {
                    reject('Error during cursor operation: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    async function count(storeName: string): Promise<number> {
        await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db!.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const countRequest = store.count();
            countRequest.onsuccess = () => {
                resolve(countRequest.result);
            };

            countRequest.onerror = () => {
                reject('Error counting records in ' + storeName);
            };
        });
    }

    // 检查ID是否存在
    function exists(storeName: string, id: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                const request = store.count(id);

                request.onsuccess = function () {
                    resolve(request.result > 0);
                };

                request.onerror = function (event) {
                    reject('Error checking existence: ' + (event.target as IDBRequest).error?.message);
                };
            });
        });
    }

    // 返回这段时间内所有id
    function getIdsInTimeRange(storeName: string, startTime: number, endTime: number, timefield: string = 'pubDate'): Promise<number[]> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                // 假设有一个基于时间的索引
                const index = store.index(timefield);

                // 定义时间范围
                const range = IDBKeyRange.bound(startTime, endTime);

                // 存储所有匹配的 ID
                const ids: number[] = [];

                // 使用游标遍历范围内的记录
                const request = index.openCursor(range);

                request.onsuccess = function (event) {
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor) {
                        // 假设每条记录的主键是 ID
                        ids.push(cursor.primaryKey as number);
                        cursor.continue(); // 继续到下一条记录
                    } else {
                        // 游标遍历完成，返回结果
                        resolve(ids);
                    }
                };

                request.onerror = function (event) {
                    reject('Error fetching IDs: ' + (event.target as IDBRequest).error?.message);
                };
            }).catch(error => {
                reject('Database open failed: ' + error);
            });
        });
    }

    // 返回这段时间内所有id
    function findTimeRange<T extends DbStore>(storeName: string, startTime: number, endTime: number, pageIndex: number, pageSize: number, conditionFn: (item: T) => boolean, timefield: string = 'pubDate'): Promise<T[]> {
        return new Promise((resolve, reject) => {
            openDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                // 假设有一个基于时间的索引
                const index = store.index(timefield);

                // 定义时间范围
                const range = IDBKeyRange.bound(startTime, endTime);

                // 存储所有匹配的 ID
                const results: T[] = [];

                // 使用游标遍历范围内的记录
                const request = index.openCursor(range, 'prev');
                const startOffset = pageIndex * pageSize;
                let currentIndex = 0
                request.onsuccess = function (event) {
                    const cursor = (event.target as IDBRequest).result;
                    if (!cursor) {
                        resolve(results);
                        return;
                    }
                    if (conditionFn(cursor.value)) {
                        // 跳过前startIndex条记录
                        if (currentIndex < startOffset) {
                            currentIndex++;
                            cursor.continue();
                            return;
                        }
                        // 收集第startIndex到limit条记录
                        if (results.length < pageSize) {
                            results.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(results);
                        }
                    } else {
                        cursor.continue();
                    }
                };

                request.onerror = function (event) {
                    reject('Error fetching IDs: ' + (event.target as IDBRequest).error?.message);
                };
            }).catch(error => {
                reject('Database open failed: ' + error);
            });
        });
    }

    async function openStore(storeName: string): Promise<IDBObjectStore> {
        const db = await openDatabase()
        const transaction = db.transaction([storeName], 'readonly');
        return transaction.objectStore(storeName);
    }


    return {
        create,
        read,
        update,
        remove,
        getAll,
        findAll,
        countAll,
        listAllIds,
        listAll,
        whereOne,
        getIdsInTimeRange,
        findTimeRange,
        count,
        exists,
        openStore,

    };
}

export function checkDBExists(dbName: string = 'WebFollowDatabase'): Promise<boolean> {
    return new Promise((resolve) => {
        const request = indexedDB.open(dbName);

        request.onsuccess = () => {
            // 数据库存在
            resolve(true);
            request.result.close(); // 关闭数据库连接
        };

        request.onerror = () => {
            // 数据库不存在
            resolve(false);
        };
    });
}


export function clearIndexedDB(dbName: string = 'WebFollowDatabase'): Promise<void> {
    return new Promise((resolve, reject) => {
        const request: IDBOpenDBRequest = indexedDB.open(dbName, version);

        request.onsuccess = (event: Event) => {
            const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

            // 获取所有对象存储的名称
            const objectStoreNames: DOMStringList = db.objectStoreNames;

            // console.log(objectStoreNames)

            // 开始一个事务
            const transaction: IDBTransaction = db.transaction(objectStoreNames, 'readwrite');

            // 清空每个对象存储
            const clearPromises: Promise<void>[] = [];
            for (let i = 0; i < objectStoreNames.length; i++) {
                const storeName: string | null = objectStoreNames.item(i)
                if (storeName) {
                    const objectStore: IDBObjectStore = transaction.objectStore(storeName);
                    const clearRequest: any = objectStore.clear();

                    const clearPromise = new Promise<void>((resolve, reject) => {
                        clearRequest.onsuccess = () => {
                            console.log(`对象存储 ${storeName} 已清空`);
                            resolve();
                        };

                        clearRequest.onerror = (error: Event) => {
                            console.error(`清空对象存储 ${storeName} 时出错:`, error);
                            reject(error);
                        };
                    });

                    clearPromises.push(clearPromise);
                }

            }

            transaction.oncomplete = () => {
                console.log('所有对象存储已清空');
                db.close();
                resolve(); // 事务完成，解析 Promise
            };

            transaction.onerror = (error: Event) => {
                console.error('事务出错:', error);
                reject(error); // 事务出错，拒绝 Promise
            };
        };

        request.onerror = (error: Event) => {
            console.error('打开数据库时出错:', error);
            reject(error); // 打开数据库出错，拒绝 Promise
        };
    });
}


export async function withCursor<T>(
    request: IDBRequest<IDBCursorWithValue | null>,
    processItem: (item: T, cursor: IDBCursorWithValue | null) => [T | null, boolean],
    sortFn?: (a: T, b: T) => number
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const result: T[] = [];
        request.onsuccess = function (event) {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                const [item, hasNext] = processItem(cursor.value, cursor);
                if (item) {
                    result.push(item)
                }
                if (hasNext) {
                    cursor.continue();
                }
            } else {
                if (sortFn) {
                    result.sort(sortFn);
                }
                resolve(result);
            }
        };
        request.onerror = () => {
            reject('Error processing cursor');
        };
    });
}

export async function getOne<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = function () {
            resolve(request.result)
        };
        request.onerror = () => {
            reject('Error processing cursor');
        };
    });
}