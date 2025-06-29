import express from "express";
import ShortUniqueId from "short-unique-id";

const app = express();
const port = 80;

let posts = [];

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

function findPost(req, res, next) {
    const post = posts.find((p)=>{
        return p.postid === req.params.postid;
    });
    
    if (!post){
        return res.sendStatus(404);
    }
    
    req.post = post;
    next();
}

function authPost(req, res, next) {
    if (req.body.key !== req.post.key){
        return res.sendStatus(401);
    }

    next();
}

app.get("/", (req, res) => {
    return res.render("index.ejs",{
        posts:posts
    });
});


app.get("/post", (req,res) => {
    return res.render("post.ejs",{
        key:crypto.randomUUID()
    });
});


app.post("/post",(req,res) =>{
    const uid = new ShortUniqueId({length:7});

    posts.push({
        postid:uid.rnd(),
        title:req.body.title,
        content:req.body.content,
        key:req.body.key
    });

    return res.redirect("/");
});


app.get("/articles/:postid", findPost, (req,res) =>{
    res.render("article.ejs",{ 
        post: req.post 
    });
});


app.post("/articles/:postid/edit", findPost, authPost, (req,res) =>{
    res.render("edit.ejs",{ 
        post: req.post 
    });
});


app.post("/articles/:postid/edit/update", findPost, authPost, (req,res)=>{
    req.post.title = req.body.title;
    req.post.content = req.body.content;

    res.redirect("/articles/" + req.post.postid);
});

app.post("/articles/:postid/edit/delete", findPost, authPost, (req,res)=>{
    posts = posts.filter(p => p.postid !== req.post.postid);

    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
