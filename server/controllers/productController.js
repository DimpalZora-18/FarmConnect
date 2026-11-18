const Product = require("../models/Product");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

const createProduct = async (req,res) => {
    let uploadedImage = null;

    try{

    const { name, price, description, stock, category} = req.body;

    const image = req.file;

    if(!image){
        return res.status(400).json({
            message: "image missing"
        });
    }

    const seller = req.user._id;

    uploadedImage = await uploadToCloudinary(image.buffer);

    const imageUrl = uploadedImage.secure_url;

    const imagePublicId  = uploadedImage.public_id;

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

        if (uploadedImage) {
            try{
                await cloudinary.uploader.destroy(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Failed to clean up uploaded image:",cleanupError);
            }
        }
        return res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
}

const getAllProducts = async(req,res) => {

    try {

        const page = req.query.page === undefined
            ? 1
            : Number(req.query.page);

        const limit = req.query.limit === undefined
            ? 10
            : Number(req.query.limit);

        if(!Number.isInteger(page) || page <= 0 ||
           !Number.isInteger(limit) || limit <= 0 ||
           limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit"
            });
        }

        const skip = (page - 1) * limit;

        const filter = {};
        const search = req.query.search?.trim();

        if(search && search.length > 100){
            return res.status(400).json({
                success: false,
                message: "Search term cannot exceed 100 characters"
            });
        }
        
        if(search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.name = {
                $regex: escapedSearch,
                $options: "i"
            };
        }

        const category = req.query.category;

        if (category) {

            if(!mongoose.Types.ObjectId.isValid(category)){
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            filter.category = category;

        }

        if (
            (req.query.minPrice !== undefined && req.query.minPrice.trim() === "") ||
            (req.query.maxPrice !== undefined && req.query.maxPrice.trim() === "")
        ) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be empty"
            });
        }

        const minPrice = req.query.minPrice !== undefined
            ? Number(req.query.minPrice)
            :undefined;

        const maxPrice = req.query.maxPrice !== undefined
            ? Number(req.query.maxPrice)
            : undefined;

        if (
            (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) || 
            (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
            (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
        ){
            return res.status(400).json({
                success: false,
                message: "Invalid price range"
            });
        }
        
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = minPrice;
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = maxPrice;
            }
        }

        const sort = req.query.sort;

        let sortOptions = { createdAt: -1 };

        const allowedSortOptions = [
            "price_asc",
            "price_desc",
            "newest",
            "oldest"
        ];

        if(sort && !allowedSortOptions.includes(sort)){
            return res.status(400).json({
                success: false,
                message: "Invalid sorting options"
            });
        }

        if (sort === "price_asc") {
            sortOptions = { price: 1 };
        } else if (sort === "price_desc") {
            sortOptions = { price: -1 };
        } else if (sort === "newest") {
            sortOptions = { createdAt: -1 };
        } else if (sort === "oldest") {
            sortOptions = { createdAt: 1 };
        }

        const sellerId = req.query.sellerId;

        if(sellerId) {
            if(!mongoose.Types.ObjectId.isValid(sellerId)){
                return res.status(400).json({
                    success: false,
                    message: "Invalid seller Id"
                });
            }

            filter.seller = sellerId;
        }

        const availability = req.query.availability;

        const allowedAvailability = ["in_stock", "out_of_stock"];

        if (availability && !allowedAvailability.includes(availability)) {
            return res.status(400).json({
                success: false,
                message: "Invalid availability option"
            });
        }

        if (availability === "in_stock") {
            filter.stock = { $gt: 0 };
        } else if (availability === "out_of_stock") {
            filter.stock = { $eq: 0 };
        }

        const products = await Product.find(filter)
        .populate("category","name")
        .populate("seller","name")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts/limit);

        return res.status(200).json({
            success : true,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: page,
                limit
            },
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

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }
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

    
            try{
                await cloudinary.uploader.destroy(productImageId);
            }catch(error){
                console.error("error during cloudinary upload",error);
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