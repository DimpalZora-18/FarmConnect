const Product = require("../models/Product");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

const createProduct = async (req,res) => {

    try{
    const { name, price, description, stock, category} = req.body;

    const image = req.file;

    if(!image){
        return res.status(400).json({
            message: "image missing"
        });
    }

    const seller = req.user._id;

    const result = await uploadToCloudinary(image.buffer);

    const imageUrl = result.secure_url;

    const imagePublicId  = result.public_id;

    const product = await Product.create({
        name,
        price,
        description,
        stock,
        category,
        seller,
        image:{
            url: imageUrl,
            public_id: imagePublicId
        }
    });

    return res.status(201).json({
        product,
        message: "product created successfully"
    });

    }catch (error) {
        return res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
}

const getAllProducts = async(req,res) => {

    try {
        const products = await Product.find()
        .populate("category")
        .populate("seller","name")
        .sort({createdAt: -1});

        return res.status(200).json({
            success : true,
            counts: products.length,
            products
        });
    } catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to fetch products"
        });
    }
};

const getSingleProduct = async(req,res) =>{
    try{
        const product = await Product.findById(req.params.id)
            .populate("category","name")
            .populate("seller","name");

        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "okk",
            product
        });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
}

const updateProduct = async(req,res) =>{
    try{
        //Find product
        const product = await Product.findById(req.params.id);

        //check product existence
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        //Check ownership
        if(product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Ypu are not authorized to update this product"
            });
        }

        //Allo only specific fields
        const allowedFields = [
            "name",
            "description",
            "price",
            "stock",
            "category"
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        //update product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidator: true
            }
        );
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct
}