const MongoClient = require('mongodb').MongoClient

let dbClient = null

function connect() {
  return new Promise((resolve, reject) => {
    const uri = process.env.MONGO_URL
    const dbName = process.env.DB_NAME

    const getDatabase = (client) => {
      return client.db(dbName);
    }

    if (dbClient && dbClient.isConnected()) {
      // console.log('=> using cached database instance')
      return resolve(getDatabase(dbClient))
    }

    if (!uri) {
      const error = new Error('Missing MONGO_URL environment variable')
      console.error('Connector Error:', error)
      return reject(error)
    }

    MongoClient.connect(uri)
      .then(client => {
        dbClient = client
        return resolve(getDatabase(dbClient))
      })
      .catch(err => {
        console.error('MongoClient.connect Error:', err)
        reject(err)
      })
  })
}

function getCollection (collectionName) {
  return new Promise((resolve, reject) => {
    connect(dbClient)
      .then(dbClient => {
        const collection = dbClient.collection(collectionName)
        resolve(collection)
      })
      .catch(error => {
        console.error(`getCollection[${collectionName}] connect Error`, error)
        reject(error)
      })
  })
}

export default getCollection
