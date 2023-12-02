const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

const sessionOptions = {
    secret:"harshTripathi",
    resave:false,
    saveUninitialized:true
}

app.use(session(sessionOptions));
app.use(flash());
app.get('/register',(req,res)=>{
    let {name="anonymous"}=req.query;
    req.session.name=name;
    console.log(req.session);
    req.flash('success',"Registered Successfully ✅");
    res.redirect('/welcome');
});

app.get('/welcome',(req,res)=>{
    res.render('page.ejs',{name:req.session.name,message:req.flash("success")});
});

app.listen(3000,(error)=>{
    if(!error)
    {
        console.log("Server Established✅");
    }
});

app.use(cookieParser());

app.get('/setCookie',(req,res)=>{
    res.cookie("greetings","Hello How are Yoy?");
    res.send("We Just sent you a Cookie.");
});

app.get('/',(req,res)=>{
    let {name = "anonymous"} = req.cookies;
    res.send(`${req.cookies.greetings}, ${name}?`);
    // console.log(req.cookies);
});