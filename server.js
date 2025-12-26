const express = require("express")
const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

const Document = require("./models/Document")
const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/wastebin")

app.get("/", (req, res) => {
  const code = `Welcome to WasteBin!

Use the commands in the top right corner
to create a new file to share with others.`

  res.render("code-display", { code, language: "plaintext" })
})

app.get("/new", (req, res) => {
  res.render("new")
})

app.post("/save", async (req, res) => {
  const {value,expiry} = req.body
  let expiresAt = null

  if(expiry ==="1h")
  {
    expiresAt = new Date(Date.now()+1000*60*60)
  } 
  else if (expiry ==="24h")
  {
    expiresAt = new Date(Date.now()+1000*60*60*24)
  }

  try 
  {
    const document = await Document.create({ value , expiresAt, viewCount: 0 })
    res.redirect(`/${document.id}`)
  } 
  catch (e) 
  {
    res.render("new", { value })
  }
})

/*app.get("/:id/duplicate", async (req, res) => {
  const id = req.params.id
  try {
    const document = await Document.findById(id)
    res.render("new", { value: document.value })
  } catch (e) {
    res.redirect(`/${id}`)
  }
})*/

app.get("/:id", async (req, res) => {
  const id = req.params.id
  try {
    const document = await Document.findById(id)

    //view counter incremet 
    document.viewCount +=1
    await document.save()

    res.render("code-display", { code: document.value, id })

    if(document.viewCount >=2){
    await Document.findByIdAndDelete(id)
    console.log(`Document ${id} deleted after 2nd view.`)
    }
  } catch (e) {
    res.redirect("/")
  }
})

app.listen(3000)