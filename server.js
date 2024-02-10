const express=require("express");
const app=express();
const fs=require("fs");
const path=require("path");
const cookieparser=require("cookie-parser");
const session=require("express-session");
const user = require("./router/user")
const order = require("./router/order");
const ObjectId = require("mongodb").ObjectId
app.use(cookieparser());
const oneday=1000*60*60*24;

// databse
const mongodb = require("mongodb");
const client = mongodb.MongoClient;

let database;

const connectTomongo = async ()=>{
    database = await client.connect("mongodb://127.0.0.1:27017",{})
    .then((data)=>{
        console.log("connected")
        return data.db("Assignment")
    }).catch((err)=>{
        console.log(err)
    })
}

connectTomongo()

app.set("view engine","ejs")

app.use(session({
    saveUninitialized:true,
    resave:false,
    secret:'askjh34asdf345#@#43',
    cookie:{maxAge:oneday}
}));

app.use(express.urlencoded())


const auth = (req,res,next)=>{
    if(req.session.name) next()
    else res.redirect("/")
}


app.get("/",(req,res)=>{
    req.session.qn = -1
    req.session.attempt = 0;
    if(req.session.name != undefined) {
        res.redirect("/user/question")
    }
    else {
        res.render("public/index",{"message":""})
    }
})

app.post("/login",(req,res)=>{
    database.collection("user")
    .findOne({"name":req.body.name,"pass":req.body.pass})
    .then((data)=>{
        if(data == null) res.render("public/index",{"message":"invalid Username/Password"})
        else {
            req.session.name = req.body.name
            res.redirect("/user/question")
        }
    }).catch((err)=>{
        res.render("public/index",{"message":"invalid Username/Password"})
    })
})


app.get("/newuser",(req,res)=>{
    res.render("public/signup",{"message":""})
})

app.post("/signup",(req,res)=>{

    let obj = {
        "name": req.body.name,
        "pass": req.body.pass
    }

    database.collection("user")
    .findOne({"name":req.body.name,"pass":req.body.pass})
    .then((data)=>{
        if(data != null) res.render("public/signup",{"message":"User Already Exist"})
        else {
            database.collection("user").insertOne(obj)
            res.render("public/index",{"message":"User Successfully Signed Up"})
        }
    }).catch((err)=>{
        res.render("public/index",{"message":"User Successfully Signed Up"})
    })

})

app.use("/user",auth,user)

app.listen(5000,()=>{
    console.log("listen on localhost:5000")
})