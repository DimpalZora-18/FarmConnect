const Category = require("../models/Category");
const mongoose = require("mongoose");

const getCategories = async (req,res) =>{
    try{
        const categories = await Category.find({ isActive: true });

        res.json({
            success: true,
            categories
        });
    }catch(error){
        console.error("Error fetching categories:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    getCategories
}