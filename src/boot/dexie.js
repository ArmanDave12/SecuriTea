import Dexie from 'dexie'

export const db = new Dexie('SecuriTea') // your app name
db.version(1).stores({
  users: '++id,nickname,pin,createdAt,synced', // primary key ++id, indexed fields
  credentials: '++id,userId,email,password,createdAt,synced',
})
