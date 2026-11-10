const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Category = require("../models/Category");

const categories = [
    {
        name: "Seeds",
        description: "Quality seeds for better crop growth",
        image: "/images/seeds.jpg"
    },
    {
        name: "Fertilizers",
        description: "Nutrients to improve soil and crop health",
        image: "/images/fertilizers.jpg"
    },
    {
        name: "Farming Equipment",
        description: "Essential tools and machinery for farming",
        image: "/images/equipment.jpg"
    },
    {
        name: "Irrigation Equipment",
        description: "Equipment for efficient water management",
        image: "/images/irrigation.jpg"
    },
    {
        name: "Crop Protection",
        description: "Products to protect crops from pests and diseases",
        image: "/images/crop-protection.jpg"
    }
];

const seedCategories = async () => {
    try {
        await connectDB();

        await Category.insertMany(categories);

        console.log("Categoties inserted successfully!");
    } catch (error){
        console.error("Error seeding categories:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedCategories();