var express=require("express");
var app=express();

require('dotenv').config();

app.use(express.static("public"));
var bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

var methodOverride=require("method-override");
app.use(methodOverride("_method"));

var expressSanitizer=require("express-sanitizer");
app.use(expressSanitizer());

var mongoose=require("mongoose");
mongoose.connect(process.env.DB_URL || "mongodb://localhost:27017/xmeme",{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.set("view engine","ejs");

var memeSchema=new mongoose.Schema({
    username:String,
    meme_url:String,
    comment:String,
    created: {type:Date, default:Date.now}
});

var Meme=mongoose.model("Meme",memeSchema);

app.get("/",function(req,res){
    res.redirect('/memes');
});

//INDEX ROUTE

app.get("/memes",function(req,res){
    Meme.find({},function(err,memes){
        if(err){
            console.log(err);
        }
        else{
            res.render("index",{memes:memes});
        }
    });
});

//NEW ROUTE

// app.get("/memes/new",function(req,res){
//     res.render("new");
// });

//CREATE ROUTE

app.post("/memes",function(req,res){

    req.body.meme.comment=req.sanitize(req.body.meme.comment);

    Meme.create(req.body.meme,function(err,newMeme){
        if(err){
            res.render("index");
        }
        else{
            res.redirect("/memes");
        }
    });
});

//SHOW ROUTE

app.get("/memes/:id",function(req,res){
    Meme.findById(req.params.id,function(err,foundMeme){
        if(err){
            res.redirect("/memes");
        }
        else{
            res.render("show",{meme:foundMeme});
        }
    });
});

// EDIT ROUTE

app.get("/memes/:id/edit",function(req,res){
    Meme.findById(req.params.id,function(err,foundMeme){
        if(err){
            res.redirect("/memes");
        }
        else{
            res.render("edit",{meme:foundMeme});
        }
    });
});

// UPDATE ROUTE

app.put("/memes/:id",function(req,res){

    req.body.meme.comment=req.sanitize(req.body.meme.comment);

    Meme.findByIdAndUpdate(req.params.id,req.body.meme,function(err,updatedMeme){
        if(err){
            res.redirect("/memes");
        }
        else{
            res.redirect("/memes/"+req.params.id);
        }
    });
});

// DELETE ROUTE

app.delete("/memes/:id",function(req,res){
    Meme.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/memes");
        }
        else{
            res.redirect("/memes");
        }
    });
});

app.listen(process.env.PORT || 3000,function(){
    console.log("Server Started..!!");
});
