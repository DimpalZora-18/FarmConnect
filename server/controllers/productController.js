const Product = require("../models/Product");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

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
    let uploadedImage = null;
    let databaseUpdated = false;

    try{
        //check the valid id
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

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
                message: "You are not authorized to update this product"
            });
        }

        const oldImagePublicId = product.image.public_id;

        //Allow only specific fields
        const allowedFields = [
            "name",
            "description",
            "price",
            "stock",
            "category"
        ];

        const updateData = {};

        if (req.file) {
            uploadedImage = await uploadToCloudinary(req.file.buffer);

            updateData.image = {
                url: uploadedImage.secure_url,
                public_id: uploadedImage.public_id
            };
        }

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if(Object.keys(updateData).length === 0){
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });
        }

        //update product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if(!updatedProduct) {
            throw new Error("Product update failed");
        }

        databaseUpdated = true;

        if(uploadedImage && databaseUpdated) {
            try{
                await cloudinary.uploader.destroy(oldImagePublicId);
            } catch(cleanupError) {
                console.error("Failed to delete old image:", cleanupError);
            }
        }
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        if(uploadedImage && !databaseUpdated){
            try{
                await cloudinary.uploader.destroy(uploadedImage.public_id);
            }catch (cleanupError){
                console.error("Failed to delete new image:",cleanupError);
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
}

const deleteProduct = async(req,res) => {

    try{
        //validating the product Id
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                success: false,
                message: "Invalid product Id"
            });
        }

        const product = await Product.findById(req.params.id);

        //checking whether the product exist or not
        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        //varifying the ownership
        if(product.seller.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: "you are not authorized to delete this product"
            });
        }

        const productImageId = product.image.public_id;

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if(!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if(deletedProduct){
            try{
                await cloudinary.uploader.destroy(productImageId);
            }catch(error){
                console.error("error during cloudinary upload",error);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch(error) {
        console.error("server error",error);
        return res.status(500).json({
            success: false,
            message: "server error"
        });
    }

}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
}