import { Link } from "react-router-dom"
import farmerImage from "../assets/farmer.png"
import { useEffect, useState } from "react";

function Home(){

    const [categories, setCategories] = useState([]);

    useEffect(() =>{
        const fetchCategories = async () => {
            try{
                const response = await fetch("http://localhost:5000/api/categories");

                if(!response.ok){
                    throw new Error("Failed to fetch categories");
                }
                const data = await response.json();

                setCategories(data.categories);
            }catch (error) {
                console.error("error:",error);
            }
        };
        fetchCategories();

    }, []);

    return (
        <main>
            <section className="flex flex-col md:flex-row items-center justify-between gap-10 px-6 md:px-12 py-16 bg-green-50">
                <div className="flex-1 space-y-5">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-800">
                        Your One-Stop Shop for Farming Needs
                    </h1>

                    <p className="text-gray-600 text-lg">
                        Discover quality seeds, fertilizers, farming equipments, and everything 
                        you need to grow better and farm smarter.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link to="/products" className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition">
                            Shop Now
                        </Link>

                        <Link to="/products" className="border border-green-700 text-green-700 px-6 py-3 rounded-lg hover:bg-green-50 transition">
                            Explore Products
                        </Link>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    <img
                        src={farmerImage}
                        alt="Indian farmer standing in a green field"
                        className="w-full max-w-xl h-auto object-contain rounded-2xl"
                    />
                </div>
            </section>

            {/* products categories */}
            <section className="px-6 md:px-12 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-green-800">
                        Explore Our Categories
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Everything you need for better and smarter farming.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {categories.map((category) => {
                        return (
                            <div
                                key={category._id}
                                className="group bg-white rounded-2xl overflow-hidden
                                border border-gray-100 shadow-sm
                                hover:shadow-xl hover:-translate-y-1
                                transition-all duration-300"
                            >
                            {/* Category Image */}
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover
                                    group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>

                            {/* Category Details */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {category.name}
                                </h3>

                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                    {category.description}
                                </p>

                                <Link
                                    to="/products"
                                    className="inline-flex items-center gap-2
                                    mt-5 text-green-700 font-semibold text-sm
                                    group-hover:gap-3 transition-all"
                                >
                                    Explore
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}

export default Home;