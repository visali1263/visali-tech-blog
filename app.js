require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors=require("cors");
const lo = require("lodash");
const ejs=require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(cors(
  {
    origin: [""],
    methods: ["POST","GET"],
    credentials: true
  }
));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("DB Connected"));

//mongo schema
const postSchema=new mongoose.Schema({
  title: String,
  post: String,
  detail: String,
  detail2: String,
  detail3:String,
  date: String
})

//model based on schema
const Post=mongoose.model("Post",postSchema);

// app.get("/", function(req, res){
//   // console.log(getApi());
//   Post.find().then((err, result) => {
//     if(err) console.log(err);
//     else {
//       let day = getDate();
//       // console.log(post);
//       result.reverse();
//       res.render("home", {content: result, date: day});
//     }
//   })
//   // let posts = readData();

// });
app.get("/", async function(req, res) {
  try {
    
    const result = await Post.find().exec();
    
    if (!result) {
      throw new Error("No results found");
    }
    
    let day = getDate();
    result.reverse();
    
    res.render("home", { content: result, date: day });
  } catch (err) {
    console.log(err);
    // Handle the error appropriately
    res.status(500).send("Internal Server Error");
  }
});




app.get("/about",function(req,res){
    res.render("about");
  })

  app.get("/contact", function(req, res){
    res.render("contact");
});

  // app.get("/post_1",function(req,res){
  //   res.render("post_1");
  // })

  // app.get("/post_2",function(req,res){
  //   res.render("post_2");
  // })

  // app.get("/post_3",function(req,res){
  //   res.render("post_3");
  // })

  app.get("/update",function(req,res){
    res.render("login");
  })

  app.get("/post", async function(req, res){
    await Post.find(function(err, result) {
      if(err) console.log(err);
      else {
        console.log(result[0].title);
        res.redirect("/posts/" + result[0].title);
      }
    })
  
  });
  
  app.post("/login", function(req,res){
    console.log(req.body.password);
    if(req.body.password == "updatepost"){
        res.render("update");
    } else{
        res.render("wrongpwd");
    }
});

app.get("/posts/:postTitle", async function(req, res){
  try {
    const data = await Post.find();
    let request = req.params.postTitle;
    for(let i=0; i<data.length; i++){
      let stored = data[i].title;
      console.log(stored +" " + request);
      if(request === stored){
        res.render("posttemplate", {post: data[i]});
        return; // Added return statement to exit the loop after finding a match
      }
    }
    // Handle case when no matching post is found
    res.send("No matching post found");
  } catch(err) {
    console.log(err);
    // Handle error
    res.status(500).send("Internal Server Error");
  }
});

app.post("/update", async function (req, res) {
  try {
    let post = new Post({
      title: req.body.titleContent,
      post: req.body.postContent,
      detail: req.body.detailedContent,
      detail2: req.body.detailedContent2,
      detail3: req.body.detailedContent3,
      date: getDate(),
    });
    await post.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.get("/delete", async function(req, res) {
  try {
    const result = await Post.find();
    let day = getDate();

    result.reverse();
    res.render("deletePosts", { content: result, date: day });
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async function(req, res) {
  try {
    console.log(req.body.id);
    await Post.deleteOne({ title: req.body.id });
    console.log("Successfully Deleted");
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});



app.get("/older-posts", async function(req, res) {
  try {
    const result = await Post.find();
    res.render("older-posts", { content: result });
  } catch (err) {
    console.log(err);
  }
});

  app.post("/contact", function(req, res){
    const output = `<h2>You have a new contact request</h2>
    <h3>Contact Details</h3>
    <ul>
      <li>Name: ${req.body.Name}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
    `;

    var api_key = process.env.API_KEY;
    var domain = 'sandbox107d1f6e5f4c4d58b1843e02dc0bd1a1.mailgun.org';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

    var data = {
      from: 'visalivallu@gmail.com',
      to: 'visali.it20@bitsathy.ac.in',
      subject: 'New Contact Details',
      html: output,
    };

    mailgun.messages().send(data, function (error, body) {
        if (error){
            console.log(error);
        }
      console.log(body);
      res.render("contact", {msg: "Email has been sent"});
    });
});

function getDate(post){
  let to = new Date();
  let day = [to.toLocaleDateString('en-IN', {month:'long'}), to.toLocaleDateString('en-IN', {day:'2-digit'}), to.toLocaleDateString('en-IN', {year:'numeric'})];
  clean_day = day[0] + ' ' + day[1] + ', ' + day[2];
  return clean_day;
}

function getApi(){
  let api = fs.readFileSync("../api.txt");
  return api.toString().slice(0, -1);
}
  app.listen(3000,function(){
    console.log("server 3000 started");
  });
