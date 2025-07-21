const jwt=require('jsonwebtoken');
const auth=(req,res,next)=>{
    try{
        const token=req.header('Authorization');
        // console.log(token);
        if(!token) return res.status(400).json({msg:"Invalid Authentications"});
        
        jwt.verify(token,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
            if(err) return res.status(400).json({msg:"Invalid aAuthentication"});
            req.user=user;
            next();
        })

    }
    catch(err){
        res.status(500).json({msg:err.message});
    }
}
module.exports=auth;