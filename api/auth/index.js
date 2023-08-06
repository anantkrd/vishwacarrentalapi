const jwt=require('jsonwebtoken');
authenticate=(req,res,next)=>{
    console.log('check authenticate');
   
    let result;
    //console.log("in Auth==="+JSON.stringify(req.headers));
    const authorizationHeaader = req.headers.authorization;
    //console.log("authorizationHeaader***"+authorizationHeaader);
    if(authorizationHeaader){
        let token=authorizationHeaader.split(' ')[1];
        const options = {
            expiresIn: '2d'
          };
          try{
              result=jwt.verify(token,process.env.secrete);
              //console.log("verify Result="+result);
              req.decoded = result;
              next();
          }catch(err){
            result = { 
                error: `Authentication error. Invalid token.`,
                status: 401
              };
            res.status(401).send(result);
          }
    }else{
        result = { 
            error: `Authentication error. Token required.`,
            status: 401
          };
        res.status(401).send(result);
    }
}
module.exports=authenticate;