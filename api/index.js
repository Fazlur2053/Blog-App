const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require("mongoose");
const Users = require('./models/Users')
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const secret = 'acofonvdohfohg3030480odfh223hg2';
const Post = require('./models/Posts');
const cookieParser = require('cookie-parser');
 const multer = require('multer');
 const uploadMiddleware = multer({ dest: 'Uploads/' });
const fs = require('fs');

const app = express();

app.use(cookieParser());
const corsOptions = {
   origin: 'http://localhost:3000', 
   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
   credentials: true,
   optionsSuccessStatus: 204,
 };
app.use(cors(corsOptions));
// app.use(cors());
 app.use('/uploads' ,express.static(__dirname + '/uploads'));
app.use(express.json());
mongoose.connect('mongodb+srv://ateequerahman219:L6drQ1S8uzASm9Ps@cluster0.kda9c8w.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log('Connected to database')).catch(err => console.log(err))

app.post('/register' ,async(req,res)=>{
   const {username,password} = req.body;
   // console.log(username,password);
   if (username.length < 3) res.status(400).json({message : "username length is too short"})
   else{
   try{
   const userDoc = await Users.create({
      username, 
       password:bcrypt.hashSync(password,salt),
       });
   res.json(userDoc);
   }
   catch(e){
      res.status(400).json(e);
   }
  }
// res.json('testok1');
});
app.post('/login', async (req,res) => {
   const {username,password} = req.body;
   const userDoc = await Users.findOne({username});
   if(!userDoc)return res.status(404).json({msg : "user doesn't exists"})
   const passOk = bcrypt.compareSync(password, userDoc.password);
   if (passOk) {
     // logged in
     jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
       if (err) throw err;
       res.cookie('token', token).json({
         id:userDoc._id,
         username,
       });
     });
   } else {
     res.status(400).json('wrong credentials');
   }
 });

app.get("/profile" ,(req,res)=>{
   //console.log('acnfl')
   const {token} = req.cookies;
   if(!token) return res.status(404).json({msg:'token not found!'})
   jwt.verify(token,secret,{},(err,info)=>{
      if(err)throw err;
      res.json(info);
   });
   //res.json(req.cookies);
});


app.post("/logout",(req,res)=>{
   res.cookie('token','').json('ok');
});


// app.post('/post' , uploadMiddleware.single('files') ,  async(req,res)=>{
//    const {originalname , path} = req.file;
//    const text = originalname.split('.');
//    const message = text[text.length-1];
//    const newPath = path+'.'+message;
//    fs.renameSync(path , newPath);
//    const {title,summary,content} = req.body;
//    Postdoc = await Post.create({
//      title,
//      summary,
//      content,
//      cover:newPath
     
//    });
//  res.json(Postdoc);
// });
app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
   const {originalname,path} = req.file;
   const parts = originalname.split('.');
   const ext = parts[parts.length - 1];
   const newPath = path+'.'+ext;
   fs.renameSync(path, newPath);
 
   const {token} = req.cookies;
   jwt.verify(token, secret, {}, async (err,info) => {
     if (err) throw err;
     const {title,summary,content} = req.body;
     const postDoc = await Post.create({
       title,
       summary,
       content,
       cover:newPath,
       author:info.id,
     });
    // console.log(info);
     res.json(postDoc);
   });
 
 });



 app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
   let newPath = null;
   if (req.file) {
     const {originalname,path} = req.file;
     const parts = originalname.split('.');
     const ext = parts[parts.length - 1];
     newPath = path+'.'+ext;
     fs.renameSync(path, newPath);
   }
 
   const {token} = req.cookies;
   jwt.verify(token, secret, {}, async (err,info) => {
     if (err) throw err;
     const {id,title,summary,content} = req.body;
     const postDoc = await Post.findById(id);
     const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
     if (!isAuthor) {
       return res.status(400).json('you are not the author');
     }
     try{
      postDoc.title=title;
      postDoc.summary=summary;
      postDoc.content=content;
      postDoc.cover=newPath ? newPath : postDoc.cover;

      await postDoc.save();

      res.json(postDoc);
     }catch(e){
         console.log(e);
     }
 
   });
 
 });



app.get('/post', async(req,res)=>{
   try{
      const posts = (await Post.find().populate('author',['username']).sort({createdAt:-1}).limit(20));
    res.json(posts)
   }
   catch(err){
      console.log(err);
   }
});

app.get('/post/:id', async (req, res) => {
   try{
   const {id} = req.params;
   const postDoc = await Post.findById(id).populate('author', ['username']);
   res.json(postDoc);
   }
   catch(err){ console.log(err)};
 });


 app.delete('/delete-post/:id', async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await Post.findByIdAndDelete(postId);

    if (!result) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(4000,()=>console.log('Server is running at port 4000'));


// L6drQ1S8uzASm9Ps
// 