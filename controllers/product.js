const { query } = require('express');
const prisma = require('../config/prisma');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});





exports.create = async(req,res)=> {
    try{
        const { title,description,price,quantity,categoryId,images } = req.body
        const product = await prisma.product.create({
            data:{
                title:title,
                description:description,
                price:parseFloat(price),
                quantity:parseInt(quantity),
                categoryId:parseInt(categoryId),
                images:{
                    create: images.map((item)=> ({
                        asset_id:item.asset_id,
                        public_id:item.public_id,
                        url:item.url,
                        secure_url:item.secure_url
                    }))
                }
            }
        })
        
        res.send(product)
    }catch(err){
        console.log((err));
        res.status(500).json ({message:"Server error"})
    }
}

exports.list = async(req,res)=> {
    try{
        const { count } = req.params
        const products = await prisma.product.findMany({
            take:parseInt(count),
            orderBy:{ createdAT : "desc" }, 
            include:{
                category:true,
                images:true
            }
        })
        res.send(products)
    }catch(err){
        console.log((err));
        res.status(500).json ({message:"Server error"})
    }
}

exports.read = async(req,res)=> {
    try{
        const { id } = req.params
        const products = await prisma.product.findFirst({
            where:{
                id:Number(id)
            },
            include:{
                category:true,
                images:true
            }
        })
        res.send(products)
    }catch(err){
        console.log((err));
        res.status(500).json ({message:"Server error"})
    }
}

exports.update = async(req,res)=> {
    try{
        const { title,description,price,quantity,categoryId,images } = req.body
        
        //clear image
        await prisma.image.deleteMany({
            where:{
                productId:Number(req.params.id)
            }
        })
        
        
        const product = await prisma.product.update({
            where:{
                id:Number(req.params.id)
            },
            data:{
                title:title,
                description:description,
                price:parseFloat(price),
                quantity:parseInt(quantity),
                categoryId:parseInt(categoryId),
                images:{
                    create: images.map((item)=> ({
                        asset_id:item.asset_id,
                        public_id:item.public_id,
                        url:item.url,
                        secure_url:item.secure_url
                    }))
                }
            }
        })
        res.send(product)
    }catch(err){
        console.log((err));
        res.status(500).json ({message:"Server error"})
    }
}

exports.remove = async(req,res)=> {
    try{
        const { id } = req.params
        // movie life
        // Step 1 ค้นหาสินค้า Include images

        const product = await prisma.product.findFirst({
            where:{ id: Number(id) },
            include: { images:true }
        })
        if(!product){
            return res.status(400).json({message: 'Product Not Found!!!'})
        }
        // console.log(product);
        
        // Step 2 Promise ลบแบบรอ In cloud
        const deleteedImage = product.images.map((image)=>
        new Promise((resolve,reject)=>{
            cloudinary.uploader.destroy(image.public_id,(error,result)=>{
                if(error) reject(error)
                    else resolve(result)
            })
        })
        )
        await Promise.all(deleteedImage)

        // Step 3 d
        await prisma.product.delete({
            where:{
                id: Number(id)
            }
        })
        res.send('Delete Successful')
    }catch(err){
        console.log((err));
        res.status(500).json ({message:"Server error"})
    }
}

exports.listby = async(req,res)=> {
    try{
        const { sort,order,limit } = req.body
        const products = await prisma.product.findMany({
            take: limit,
            orderBy:{ [sort]:order },
            include:{ 
                category: true,
                images: true
            }
        })


        res.send(products)
    }catch(err){
        console.log((err));
        res.status(500).json ({message:"Server error"})
    }
}



const handleQuery = async(req,res,query) =>{
    try{

        const products = await  prisma.product.findMany({
            where: {
                title:{
                    contains:query,
                }
            },
            include:{
                category:true,
                images:true
            }
        })
        res.send(products)
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Search Error'})
        
    }
}
const handlePrice = async(req,res,priceRange) => {
    try{
        const products = await prisma.product.findMany({
            where:{
                price:{
                    gte:priceRange[0],
                    lte:priceRange[1]
                }
            },
            include:{
                category: true,
                images:true
            }
        })
        res.send(products)
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
const handleCategory = async(req,res,categoryId) => {
    try{
        const products = await prisma.product.findMany({
            where:{
                categoryId:{
                    in: categoryId.map((id)=>Number(id))
                }
            },
            include:{
                category: true,
                images:true
            }
        })
        res.send(products)
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}


exports.searchFilter = async(req,res)=> {
    try{
        const { query, category, price } = req.body

        if(query){
            console.log('query-->',query)
            await handleQuery(req,res,query)
        }
        if(category){
            await handleCategory(req,res,category)
            console.log('category-->',category)
        }
        if(price){
            console.log('price-->',price)
            await handlePrice(req,res,price)

        }



        // res.send('Hello searchFilter Product')
    }catch(err){
        console.log((err));
        res.status(500).json ({message:"Server error"})
    }
}





exports.createImages = async(req,res) =>{
    try {
        const result = await cloudinary.uploader.upload(req.body.image,{
            public_id: `Aroi -${Date.now()}`,
            resource_type: 'auto',
            folder:'LongEcom'
        })
        res.send(result)
    } catch (err) {
        console.log(err);
        res.status(500).json({message:"Server Error"})
    }
}
exports.removeImage = async(req,res) =>{
    try {
        console.log(req.body.public_id);
        const{ public_id } = req.body
        // console.log(public_id);
        cloudinary.uploader.destroy(public_id,(result)=>{
            res.send('Remove Image Success')
        })
        
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message:"Server Error"})
    }
}