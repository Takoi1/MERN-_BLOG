const express = require('express')
const bodyParser = require('body-parser')
const {MongoClient} =require ("mongodb")




// const articlesInfo ={
//     "learn-react":{
//         Comments:[],
//     },
//     "learn-node":{
//         Comments:[],
//     },
//     "learn-express":{
//         Comments:[],
//     },
// };

const app = express()

app.use(bodyParser.json());
const withDB = async (operations , res)=>{
    try{
        const client= await MongoClient.connect('mongodb://localhost:27017',{
          useNewUrlParser:true,
          useUnifiedTopology:true,
      });
      const db = client.db("myblog");
      await operations(db);
     
      client.close();

    } catch (error){
        res.status(500).json({message:'erroe connecting to db' , error});

    }
};

app.get('/api/articles/:name',async (req,res)=>{
    withDB(async(db) =>{
        const articleName=req.params.name;
        const articlesInfo= await db
        .collection('articles')
        .findOne({name:articleName})
        res.status(200).json(articlesInfo)
    }, res)  
});

app.post('/api/articles/:name/add-comments', (req, res) =>
{
    const {username , text}=req.body;
    const articleName=req.params.name;

    withDB(async(db)=>{
        const articlesInfo = await db
        .collection('articles')
        .findOne({ name: articleName});
        await db.collection('articles').updateOne(
            {name:articleName},
            {
            $set:{
                comments:articlesInfo.comments.concat({username, text}),
            },
            }
        );
                const updateArticleInfo = await db
                .collection('articles')
                .findOne({ name: articleName});
                res.status(200).json(updateArticleInfo);
        }, res); 
});

app.listen(5000, ()=> console.log('listening on port 5000'))