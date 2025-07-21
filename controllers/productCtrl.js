const Products=require('../models/productModel');
class APIfeatures{
    constructor(query,queryString){
        this.query=query;
        this.queryString=queryString;
    }
    filtering(){
        const queryObj={...this.queryString};
        console.log(queryObj);
        const excludedFields=['page','sort','limit'];
        excludedFields.forEach(i=>delete(queryObj[i]))
        console.log(queryObj);
        let queryStr=JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g,match=>'$'+match)

        console.log({queryObj,queryStr});
        this.query.find(JSON.parse(queryStr));
        return this;
    }
    sorting(){
        if(this.queryString.sort){
            const sortBy=this.queryString.sort.split(',').join('');
            this.query=this.query.sort(sortBy);
            // this.query=this.query.sort(`-${sortBy}`);
            console.log(sortBy);
        }
        else{
            this.query=this.query.sort('-createdAt')
        }
        return this;
    }

    pagination(){
        const page=this.queryString.page*1 || 1;
        const limit=this.queryString.limit*1 || 10;
        const skip=(page-1)*limit;
        this.query=this.query.skip(skip).limit(limit);
        return this;
    }
}
const productCtrl={
    getProducts:async(req,res)=>{
        try{
            // res.json("testing");
            // console.log(req.query);
            const features=new APIfeatures(Products.find(),req.query);
            features.filtering();
            features.sorting();
            features.pagination();
            const products=await features.query;
            // console.log("h")
            // console.log(features.queryString)
            // console.log("h")
            // console.log(products.length)
            res.json(products);
        }
        catch(err){
            return res.status(500).json({msg:err.message});
        }
    },
    createProducts:async(req,res)=>{
        try{
            const {product_id,product_title,price,description,content,images,category}=req.body;
            if(!images) return res.status(400).json({msg:"No Image Upload"})
            const product=await Products.findOne({product_id});
            if(product){
                return res.status(400).json({msg:"This product already Exists"});
            }
            // console.log(product_title);
            const newProduct=new Products({
                product_id,product_title:product_title.toLowerCase(),price,description,content,images,category
            })
            await newProduct.save();
            res.json({msg:"created a product"});
        }
        catch(err){
            return res.status(500).json({msg:err.message});
        }
    },
    deleteProducts: async (req, res) => {
        try {
            console.log('Product ID to delete:', req.params.id);  // Log the ID being received
            const product = await Products.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ msg: "Product not found" });
            }
            await Products.findByIdAndDelete(req.params.id);
            res.json({ msg: "Deleted a Product" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
    ,
    updateProducts:async(req,res)=>{
        try{
            const {product_id,product_title,price,description,content,images,category}=req.body;
            if(!images) return res.status(500).json({msg:"No Image Upload"});
            await Products.findOneAndUpdate({_id:req.params.id},{product_title:product_title.toLowerCase(),price,description,content,images,category})
            res.json({msg:"updated a product"});
        }
        catch(err){
            return res.status(500).json({msg:err.message});
        }
    }
}
module.exports=productCtrl