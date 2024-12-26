const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


exports.register = async(req,res) => {

    try{
        const {email,password} = req.body

        //Step 1 validate body
        if(!email){
            return res.status(400).json({ message: "Email is require!!!"})
        }
        if(!password){
            return res.status(400).json({messgae:"Password is require!!!"})
        }

        //step 2 check email in DB already??
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(user){
            return res.status(400).json({ message: "Email already exist!!"})
        }
        //step 3 hashPassword
        const hashPassword = await bcrypt.hash(password,10)
        

        //step4 register
        await prisma.user.create({
            data:{
                email : email,
                password : hashPassword
            }

        })

        res.send('Register Successful')
    }catch(err){

        console.log(err);
        res.status(500).json({ message:"Server Error"})
    }




    
}

exports.login = async(req,res) => {
    try{
        const { email , password} = req.body

        //step 1 Check email
        const user = await prisma.user.findFirst({
            where:{
                email:email
            }
        })
        if(!user || !user.enabled){
            return res.status(400).json({message:'User Not found or not enable'})
        }
        //step 2 Check password
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:'Password Invalid'})
        }
        //step 3 Check payload(data)
        const payload = {
            id:user.id,
            email:user.email,
            role:user.role
        }

        //step 4 Generate Token
        jwt.sign(payload,process.env.SECRET,{expiresIn:'1d'},
            (err,token)=>{
                if(err){
                    return res.status(500).json({
                        message:'Server error'})
                    }
                    res.json({ payload, token})

                })


    }catch(err){

        console.log(err);
        res.status(500).json({ message:"Server Error"})
    }
}

exports.currentUser = async(req,res) => {
    try{
        const user = await prisma.user.findFirst({
            where:{ email: req.user.email },
            select:{
                id:true,
                email:true,
                name:true,
                role:true
            }
        })
        res.json({ user })
    }catch(err){

        console.log(err)
        res.status(500).json({message:'Server Error'})
        
    }
}
