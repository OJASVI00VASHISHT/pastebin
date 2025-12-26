const express = require("express")
const app = express()
require('dotenv').config()
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

const Document = require("./models/Document")
const mongoose = require("mongoose")
const dbURI = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/wastebin";
mongoose.connect(dbURI)
  .then(() => console.log("Connected to Skrappy Cloud Database"))
  .catch(err => console.log("Connection error:", err))

app.get("/", (req, res) => {
  const code = `Welcome to Skrappy! 🤘

The fast, disposable code-sharing tool.
1. Paste your code.
2. Choose your deletion policy.
3. Share the custom URL.

Everything here is temporary.`

  res.render("code-display", { code, language: "plaintext" })
})

app.get("/new", (req, res) => {
  res.render("new")
})

app.post("/save", async (req, res) => {
  const {value,expiry,slug} = req.body;
  let expiresAt = null
  let isBurn = false;

  if(expiry ==="1h")
  {
    expiresAt = new Date(Date.now()+1000*60*60)
  } 
  else if (expiry ==="24h")
  {
    expiresAt = new Date(Date.now()+1000*60*60*24)
  }
  else if (expiry === "burn") 
  {
    isBurn = true; 
  }

  const documentData = { value, expiresAt,isBurn,slug, viewCount: 0 };
  if (slug && slug.trim()!== "") {
    documentData.slug = slug;
  }
  try 
  {
    const document = await Document.create(documentData)
    res.redirect(`/${document.slug}`)
  } 
  catch (e) {
    // Check for a duplicate key error (code 11000) on the 'slug' field
    if (e.code === 11000 && e.keyPattern && e.keyPattern.slug) {
        // Re-render the page with an error message and the user's input
        return res.render("new", { value, slug, errorMessage: "That URL is already taken. Please try another." })
    }
    // Handle other errors
    console.error(e)
    res.render("new", { value, slug, errorMessage: "An error occurred. Please try again." })
  }
})


app.get("/:slug", async (req, res) => {
  const slug = req.params.slug
  try {
    // Find the document by its slug instead of its ID
    const document = await Document.findOne({ slug })

    // If no document is found, redirect home
    if (!document) {
        return res.redirect("/")
    }

    // view counter increment
    document.viewCount +=1
    await document.save()

    // Pass the slug as the 'id' for the buttons
    res.render("code-display", { code: document.value, id: slug })

    if(document.isBurn && document.viewCount >=3){
      // Delete the document by its slug
      await Document.findOneAndDelete({ slug })
      console.log(`Document ${slug} deleted after 2nd view.`)
    }
  } catch (e) {
    res.redirect("/")
  }
})

app.listen(3000)