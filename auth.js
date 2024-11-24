const jwt=require('jsonwebtoken');
const JWT_SECRET='JWT_SECRET';

function auth(req,res,next) {
    const token=req.headers.authorization;
    const user=jwt.verify(token,JWT_SECRET);
    if(user){
        req.userId=user.id;
        next();
    }else{
        res.status(403).json({
            "message":"Invalid credentials"
        })
    }
    
}

module.exports={
    auth
}

