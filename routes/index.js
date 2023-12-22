var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  const query = req.query
  const play = query.play
  console.log(req.session.user)

  if (!req.session.user && !play) {
    res.redirect("/login")
    return
  }

  console.log("rendering index")
  console.log("UUID ", req.session.user)
  res.render('index', { title: 'Notas de Voz', uuid: req.session.user })
})

router.get("/login", (req, res) => {
  res.render("login", { title: "Iniciar sesión" })
})

router.get("/register", (req, res) => {
  res.render("register", { title: "Register" })
})


module.exports = router
