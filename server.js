const express =  require("express")
const app = express()
app.set('view engine','ejs')
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}))

const Document = require('./models/document')
const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost/pastebin")

app.get("/",(req,res)=>{
    const code = `welcome to watseBin!
     use to share file text`
res.render("code-display",{code,language:"plaintext"})
})

app.get('/new',(req,res)=>{
    res.render("new")
})

app.post('/save',async(req,res)=>{
const value = req.body.value
try {
    const document = await document.create({value})
    res.redirect(`/${document.id}`)
} catch(e){
    res.render("new",{value})
}
console.log(value)
})

app.get('/:id',async(req,res)=>{
    const id = req.params.id
    try{
        const document = await document.findById(id)
        red.render('code-display',{code: document.value,id})

    }
    catch(e){
        res.redirect("/")
    }
})

app.listen(3000)