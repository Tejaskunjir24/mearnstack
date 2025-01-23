const express= require('express');
const mongoose=require ('mongoose');
require('./db/config');
const cors =require('cors')
const User=require('./db/User')
// const Product= require('./db/Product')
const Product =require('./db/Product');
const Jwt=require('jsonwebtoken');
const jwtKey='e-comm';

const app=express();
 
// connection setupd schema and models 
// const connectDB=async()=>{
   
//     const productSchema=new mongoose.Schema({});
//     const product=mongoose.model('products',productSchema);
//     const data=await product.find();
//     console.log(data)
// }

// connectDB();


app.use(express.json());
app.use(cors());
app.post("/register", async(req,res)=>{

    let user=new User(req.body);
     let result= await user.save();
     result =result.toObject();
     delete result.password
     Jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
      if(err){
        res.send({result:"something is wrong"})
      }
      res.send({result,auth:token})
    })
})

app.post("/login",async (req,res)=>{

  if(req.body.password && req.body.email){
  let user=await User.findOne(req.body).select("-password") ;
  if(user){
    Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
      if(err){
        res.send({result:"something is wrong"})
      }
      res.send({user,auth:token})
    })
 
  }else{
    res.send({result:'no user found'}) 
  }
  

  }else{
    res.send({ result:" no user found"})
  }
})


app.post("/addproduct", async(req,res)=>{
   let product =new Product(req.body);
   let result= await product.save();
   res.send(result);
});


app.get("/products", async (req,res)=>{
  let products= await Product.find();
  if(products.length>0){
    res.send(products);
  }else{
    res.send({result: "no products found"})
  }
   })

app.delete("/product/:id",async(req,res)=>{
  //  res.send(req.params.id)

  const result=await Product.deleteOne({_id:req.params.id})
  res.send(result); 
})


app.get("/product/:id",async(req,res)=>{
      let result=await Product.findOne({_id:req.params.id});
      if(result){
        res.send(result)
      }else{
        res.send({result:"Not found"})
      }
})

app.put("/product/:id",async(req,res)=>{
  let result=await Product.updateOne({_id:req.params.id},
    {
      $set:req.body
    }
  )
  res.send(result);
})


app.get("/search/:key", async (req,res) => {
   let result=await Product.find({
    "$or":[
      {name:{$regex:req.params.key}},
      {price:{$regex:req.params.key}},
      {category:{$regex:req.params.key}},
      {company:{$regex:req.params.key}}
    ]
   })
   res.send(result);
})

function verifyToken(req,res,next){
let token =req.headers('authentication')
if(token){
  token=token.split('')[1];
  console.log("middleware called if",token)
  jwt.verify(token,jwtKey,(err,valid)=>{
    if(err){
         res.send({result:'please provid valid token'})
    }else{
        next();
    }
  })
}else{
  res.send("please add token with header")
}


}

// app.listen(5000);

app.listen(process.env.PORT,()=>{
  console.log(`server started at port ${process.env.PORT}`)
});