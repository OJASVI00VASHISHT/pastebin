const express = require("express")
const app = express()
require('dotenv').config()
const helmet = require('helmet')
const compression = require('compression')

app.set("view engine", "ejs")
app.use(helmet())
app.use(compression())
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
  const canonical = req.protocol + '://' + req.get('host') + req.originalUrl;

  res.render("code-display", {
    code,
    language: "plaintext",
    title: 'Skrappy – share code fast',
    description: 'A lightweight, temporary pastebin for sharing code snippets quickly.',
    canonical,
    request: req
  })
})

app.get("/new", (req, res) => {
  const canonical = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.render("new", {
    title: 'Create a new paste',
    description: 'Type or paste your code and get a shareable link instantly.',
    canonical,
    request: req
  })
})

app.post("/save", async (req, res) => {
  const { value, expiry, slug } = req.body;
  let expiresAt = null;
  let isBurn = false;

  if (expiry === "1h") {
    expiresAt = new Date(Date.now() + 1000 * 60 * 60);
  } else if (expiry === "24h") {
    expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  } else if (expiry === "burn") {
    isBurn = true;
    // always give a short fallback lifetime so forgotten burn pastes
    // don't stay in the database forever; actual deletion on view is still
    // handled in the GET route below.
    expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2); // 2 days
  }

  // build the document data without blindly including `slug`
  const documentData = { value, expiresAt, isBurn, viewCount: 0 };
  if (slug && slug.trim() !== "") {
    documentData.slug = slug;
  }

  try {
    // if no custom slug is provided, the schema default will generate one.
    // collisions on randomly generated ids are extremely unlikely, but we
    // handle them by retrying the insert instead of surfacing an error to
    // the user.  The unique index on `slug` ensures we don't store duplicates.
    let document;
    while (true) {
      try {
        document = await Document.create(documentData);
        break; // success
      } catch (err) {
        // if the error is a duplicate slug and we didn't specify one,
        // it means the auto-generated id collided -- try again
        if (
          err.code === 11000 &&
          err.keyPattern &&
          err.keyPattern.slug &&
          !documentData.slug
        ) {
          // simply repeat the loop; mongoose will generate a new default
          continue;
        }
        // otherwise rethrow so outer catch can handle it
        throw err;
      }
    }

    res.redirect(`/${document.slug}`);
  } catch (e) {
    // duplicate key on user-supplied slug
    if (e.code === 11000 && e.keyPattern && e.keyPattern.slug) {
      return res.render("new", {
        value,
        slug,
        errorMessage: "That URL is already taken. Please try another.",
      });
    }
    console.error(e);
    res.render("new", { value, slug, errorMessage: "An error occurred. Please try again." });
  }
});


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
    document.viewCount += 1;
    await document.save();

    // build meta values
    const canonical = req.protocol + '://' + req.get('host') + req.originalUrl;
    const snippet = document.value.replace(/\s+/g, ' ').trim().slice(0, 150);
    const title = `Paste ${slug}`;
    const description = snippet.length < document.value.length ? snippet + '…' : snippet;

    // Pass the slug as the 'id' for the buttons
    res.render("code-display", {
      code: document.value,
      id: slug,
      title,
      description,
      canonical,
      request: req
    });

    // if this paste is a "burn" paste, remove it as soon as it has been
    // viewed twice (i.e. viewCount reaches 2) – the TTL index will also
    // clear it after the two‑day fallback.
    if (document.isBurn && document.viewCount >= 2) {
      await Document.findOneAndDelete({ slug });
      console.log(`Document ${slug} deleted after second view.`);
    }
  } catch (e) {
    res.redirect("/")
  }
})

// sitemap route (make sure file exists)
const sitemapRouter = require('./routes/sitemap');
app.use(sitemapRouter);

app.listen(3000)