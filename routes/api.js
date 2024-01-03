const express = require('express')
const router = express.Router()
const mongojs = require('mongojs')
const MONGO_URL = 'mongodb://localhost:27017/'
const db = mongojs(MONGO_URL, ['NotasDeVoz'])
const multer = require("multer")
const crypto = require("crypto")
const { unlink } = require("node:fs")
const path = require("path")
const fs = require("fs")

/**
 * TODO: Get the last 5 recordings of a user
 * @param {string} id user id 
 * @returns {Promise} Promise object represents the list of recordings
 */
async function handleList(id) {
  return new Promise((resolve, reject) => {
    db.recordings.find({ uuid: id }).sort({ date: -1 }).limit(5, (err, docs) => {
      if (err) return reject(err)
      console.log(docs)
      resolve(docs)
    })
  })
}

router.get("/list/:id", (req, res) => {
  const id = req.params.id
  if (!id) {
    res.sendStatus(400)
    return
  }

  handleList(id)
    .then(
      (docs) => { res.json(docs) },
      (err) => {
        console.log(err); res.sendStatus(500)
      }
    )
})

/**
 * Get the audio file from the server
 */
router.get('/play/:play', (req, res) => {
  const play = req.params.play
  db.recordings.find({ file: play }, (err, docs) => {

    // Check if there is an error
    if (err) {
      console.error(err)
      res.sendStatus(500) // Internal server error
      return
    }

    // Check if there are no docs
    if (docs.length === 0) {
      console.error('No docs')
      res.sendStatus(404) // Not found
      return
    }

    // Get file path
    const filePath = path.join(__dirname, '../uploads/', docs[0].file)

    // Get audio data from local folder
    const data = fs.readFileSync(filePath)

    // Send the audio data
    res.send(data)
  })
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, raw) => {
      if (err) return cb(err);

      // Calculate MD5 hash of the file buffer
      const md5sum = crypto.createHash('md5');
      md5sum.update(raw);
      const md5hash = md5sum.digest('hex');

      // Set the filename using the MD5 hash and the original extension
      const filename = `${md5hash}`;

      cb(null, filename);
    });
  }
})

const upload = multer({ storage }).single("recording")

router.post("/upload/:name", (req, res) => {
  upload(req, res, async (err) => {

    // Comprobar si hay errores
    if (err) {
      console.log(err)
      res.sendStatus(400)
      return
    }

    const recording = req.body.recording
    console.log(recording)

    console.log(req.file)

    // Guardar el audio en la base de datos
    await db.recordings.insert({
      uuid: req.params.name,
      date: Date.now(),
      file: req.file.filename
    })

    // Llama a la función handleList para obtener la lista de las ultimas 5 grabaciones
    const recordings = await handleList(req.params.name)
    res.json({ success: true, files: recordings })
  })
})

router.post("/delete/:uuid/:file", (req, res) => {
  try {

    const uuid = req.params.uuid
    const file = req.params.file

    console.log(uuid)
    console.log(file)

    // Check if the uuid and file are defined
    if (!uuid || !file) {
      res.sendStatus(400) // Bad request
      return
    }

    // Check if the file exists
    if (!fs.existsSync(path.join(__dirname, '../uploads/', file))) {
      res.sendStatus(404) // Not found
      return
    }

    // Get recording from db
    db.recordings.findOne({ uuid, file }, async (err, rec) => {
      if (err) {
        res.sendStatus(500)
        return
      }

      // Check if the recording exists
      if (!rec) {
        res.sendStatus(404) // Not found
        return
      }

      // Check if the file belongs to the user
      if (rec.uuid !== uuid) {
        res.sendStatus(403) // Forbidden
        return
      }

      // Delete the file from fs
      unlink(path.join(__dirname, '../uploads/', file), (err) => {
        if (err) {
          res.sendStatus(500)
          return
        }
      })

      db.recordings.remove({ uuid, file }, async (err) => {
        if (err) {
          res.sendStatus(500)
          return
        }
        res.json({ success: true, files: await handleList(uuid) })
      })
    })
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
})

router.post("/cleanup", (req, res) => {
  db.recordings.remove({ date: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) } }, (err) => {
    if (err) {
      res.sendStatus(500)
      return
    }
    handleList(req.session.user).then((docs) => {
      res.json(docs)
    })
  })
})

module.exports = router
