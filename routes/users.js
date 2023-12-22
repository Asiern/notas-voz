var express = require('express')
var router = express.Router()
const mongojs = require("mongojs")
const db = mongojs("mongodb://localhost:27017", ["users"])

router.post("/logout", (req, res) => {
  req.session.destroy()
  res.status(200).send("ok")
})

router.post("/register", (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password

    if (!username) {
      res.status(400).send("Username is required")
      return;
    }

    if (!password) {
      res.status(400).send("Password is required")
      return;
    }

    // Check if username already exists
    db.users.find({ username }, (err, docs) => {
      // Check if there was an error
      if (err)
        throw new Error(err)

      if (docs.length != 0) {
        // Username already exists
        res.status(400).send("Username already exists")
        return;
      }

      // Username doesn't exist, create it
      db.users.insert({
        username: username,
        password: password
      }, (err, docs) => {
        if (err)
          throw new Error(err)
        console.log("User created")
        console.log(docs)
        res.status(200).send("ok")
      })
    })
  }
  catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

router.post("/login", (req, res) => {
  try {

    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      res.status(400).send("bad request")
      return;
    }

    db.users.find({
      username: username,
      password: password
    }, (err, docs) => {
      if (docs.length > 0) {
        if (err)
          throw new Error(err)
        // Set session id
        req.session.user = docs[0]._id

        res.send("ok")
        return;
      } else {
        res.status(401).send("Unauthorized")
        return;
      }
    })
  } catch (e) {
    res.sendStatus(500)
  }
})

module.exports = router
