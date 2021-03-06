const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
const PORT = process.env.PORT || 8000
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log(`Connected to ${dbName} database`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

app.get('/search', async (req, res) => {
    try{
        let result = await collection.aggregate([
            {
                '$search': {
                    'autocomplete': {
                        'query': `${req.query.query}`,
                        'path': 'title',
                        'fuzzy': {
                            'maxEdits': 2,
                            'prefixLength': 3
                        }
                    }
                }
            }
        ]).toArray()
        res.send(result)
    }catch(err){
        console.log(err)
        res.status(500).send({message: err.message})
    }
})

app.get('/get/:id', async (req, res) => {
    try{
        let result = await collection.findOne({
            '_id': ObjectId(req.params.id)
        })
        res.send(result)
    }catch(err){
        console.log(err)
        res.status(500).send({message: err.message})
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})