const express=require('express');
const jwt=require('jsonwebtoken');
const JWT_SECRET='JWT_SECRET';
const { z }=require('zod');
const bcrypt=require('bcrypt')

const mongoose=require('mongoose');

const {UserModel,TodoModel} =require('./db');
const {auth}=require('./auth');

mongoose.connect('')

const app=express();
app.use(express.json());


app.post('/signup',async function(req,res){

    // Input validation using Zod lib

    const requiredBody=z.object({
        username:z.string().min(6).max(40).email(),
        name:z.string().min(6).max(40),
        password:z.string().min(6).max(40)
    })
    // const parsedData=requiredBody.parse(req.body);
    const parseddatawithsuccess=requiredBody.safeParse(req.body);

    if(parseddatawithsuccess.success){
        const username=req.body.username;
        const password=req.body.password;
        const name=req.body.name;
        try{
            const hashedPassword=await bcrypt.hash(password,5);
            await UserModel.create({
                username:username,
                password:hashedPassword,
                name:name
            });
        }catch(error){
            res.send('user signup failed')
            return; 
        }
    }else{
        res.status(403).json({
            message:'user signup failed',
            error:parseddatawithsuccess.error
        })
    }
 
    res.send('User sign-up successfully')
    
});

app.post('/signin',async function(req,res){
    const username=req.body.username;
    const password=req.body.password;

    const user=await UserModel.findOne({
        username:username
    });

    const passwordMatch=await bcrypt.compare(password,user.password);

    if(passwordMatch){
        const token=jwt.sign({id:user._id},JWT_SECRET);
        res.json({
            token:token
        });
    }else{
        res.status(403).json({
            message:"Invalid credentials  user doesn't exist  "
        });
    }
    
});

app.post('/todo',auth,async function(req,res){
    const userId=req.userId;
    const description=req.body.description;
    const done=req.body.done;

    await TodoModel.create({
        userId,
        description,
        done
    })

    res.status(200).json({
        message:"Todo has created to the database"
    })
    
});

app.get('/todos',auth,async function(req,res){
    const userId=req.userId;
    const todos=await TodoModel.find({
        userId:userId
    })
    res.json({
        todos:todos
    })
});

app.listen(3000);