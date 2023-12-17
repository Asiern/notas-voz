const express = require('express')
const router = express.Router()
const mongojs = require('mongojs')
const ObjectId = mongojs.ObjectId
const MONGO_URL = 'mongodb://localhost:27017/'
const db = mongojs(MONGO_URL, ['NotasDeVoz'])

router.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' })
})

// desde la base de datos obtener los últimos 5 audios del presente usuario (
// id), las grabaciones ordenadas por fecha (primero las más actuales)
//3
// crea el objeto json solicitado
// (o [] si el usuario no tiene grabaciones asociadas
// y devuelve
async function handleList(id) {
  return new Promise((resolve, reject) => {
    const list = []
    db.users.find({ uuid: id }).sort({ date: -1 }).limit(5, (err, docs) => {
      if (err) {
        reject(err)
        return
      }
      resolve(docs)
    })
  })
}

router.get("/list/:id",  (req, res) => {
    const id = req.params.id
    if(!id) {
        res.sendStatus(400)
        return
    }
    
    handleList(id).then((docs)=>{res.json(docs)},(err)=>{res.sendStatus(500)})
})

router.get('/play/:play', (req, res) => {
  const play = req.params.play
  db.users.find({ _id: ObjectId(play) }, (err, docs) => {
    if (err) {
      res.json({ success: false })
      return
    }
    if (docs.length === 0) {
      res.json({ success: false })
      return
    }
    res.json({ success: true, audio: docs[0] })
  })
})


const upload = multer({}).single("recording")

router.post("/upload/:name", (req, res) => {
    upload(req, res, async (err) => {
        // Comprobar si hay errores
        if(err) {
            res.sendStatus(400)
            return
        }

        // Guarda los metadatos del audio en la base de datos
        const metadata = {
            uuid: req.params.name,
            date: new Date(),
            mimetype: req.file.mimetype,
            size: req.file.size,
            originalname: req.file.originalname
        }
        

        // Llama a la función handleList para obtener la lista de las ultimas 5 grabaciones
        const recordings = await handleList(req.params.name)
    })
})

module.exports = router
