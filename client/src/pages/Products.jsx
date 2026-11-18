import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../utils/api";

function Products() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const requestId = useRef(0);

    // useEffect for product search feature + implemented Debouncing + Preventin race condition
    useEffect(() => {
        const currentRequestId = ++requestId.current;

        const timer = setTimeout( async () => {

            try {

                const params = new URLSearchParams();

                if(search.trim()) {
                    params.append("search",search.trim());
                }

                if(category) {
                    params.append("category", category);
                }

                if(minPrice) {
                    params.append("minPrice",minPrice);
                }

                if(maxPrice) {
                    params.append("maxPrice",maxPrice);
                }

                setLoading(true);
                setError("");

                const url = params.toString()
                    ? `/api/products?${params.toString()}`
                    : "/api/products";

                const response = await apiFetch(url);

                const data = await response.json();

                if(!response.ok) {
                    throw new Error(data.message || "Failed to fetch products");
                }

                if(currentRequestId === requestId.current){
                    setProducts(data.products);
                }
            
            } catch(error) {
                if (currentRequestId === requestId.current) {
                    setError(error.message);
                }
            } finally {
                if (currentRequestId === requestId.current) {
                    setLoading(false);
                }
            }
        },500);

        return () => {
            clearTimeout(timer);
        }
    },[search, category, minPrice, maxPrice]);

    //useEffect for categories fetch and setting categories

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiFetch("/api/categories");

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch categories");
                }

                setCategories(data.categories);
            } catch (error) {
                console.log(error.message);
            }
        };

        fetchCategories();
    },[]);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">

            {/* Filter Sidebar */}
            <aside className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">Filters</h2>
                <p className="mb-2 mt-5 text-sm font-semibold text-gray-700">Search products</p>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 sm:max-w-md"
                />
                
                <p className="mb-2 mt-5 text-sm font-semibold text-gray-700">
                    Category
                </p>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mb-6 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:max-w-md"
                >
                    <option value="">All Categories</option>

                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <div className="mt-6 ">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                        Price Range
                    </p>

                    <div className="mb-4 flex justify-between text-sm font-semibold text-green-700">
                        <span>₹{minPrice.toLocaleString("en-IN")}</span>
                        <span>₹{maxPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="relative mt-4 h-6">

                        {/* Background track */}
                        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200" />

                            {/* Selected range */}
                            <div
                                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-green-600"
                                style={{
                                    left: `${(minPrice / 10000) * 100}%`,
                                    right: `${100 - (maxPrice / 10000) * 100}%`
                                }}
                            />

                            {/* Minimum slider */}
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={minPrice}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value <= maxPrice) setMinPrice(value);
                                }}
                                className="pointer-events-none absolute z-30 h-6 w-full cursor-pointer appearance-none bg-transparent
                                [&::-webkit-slider-thumb]:pointer-events-auto
                                [&::-webkit-slider-thumb]:h-4
                                [&::-webkit-slider-thumb]:w-4
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:border-2
                                [&::-webkit-slider-thumb]:border-white
                                [&::-webkit-slider-thumb]:bg-green-600
                                [&::-moz-range-thumb]:pointer-events-auto
                                [&::-moz-range-thumb]:h-4
                                [&::-moz-range-thumb]:w-4
                                [&::-moz-range-thumb]:rounded-full
                                [&::-moz-range-thumb]:border-2
                                [&::-moz-range-thumb]:border-white
                                [&::-moz-range-thumb]:bg-green-600"
                            />

                            {/* Maximum slider */}
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value >= minPrice) setMaxPrice(value);
                                }}
                                className="pointer-events-none absolute z-20 h-6 w-full cursor-pointer appearance-none bg-transparent
                                [&::-webkit-slider-thumb]:pointer-events-auto
                                [&::-webkit-slider-thumb]:h-4
                                [&::-webkit-slider-thumb]:w-4
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:border-2
                                [&::-webkit-slider-thumb]:border-white
                                [&::-webkit-slider-thumb]:bg-green-600
                                [&::-moz-range-thumb]:pointer-events-auto
                                [&::-moz-range-thumb]:h-4
                                [&::-moz-range-thumb]:w-4
                                [&::-moz-range-thumb]:rounded-full
                                [&::-moz-range-thumb]:border-2
                                [&::-moz-range-thumb]:border-white
                                [&::-moz-range-thumb]:bg-green-600"
                            />
                        </div>
                </div>
            </aside>

            {/* Products Section */}
            <section>
                {/* Your existing product loading, error and grid UI */}

                {loading && (
                    <p className="text-gray-500">Loading products...</p>
                )}

                {error && (
                    <p className="text-red-600">{error}</p>
                )}

                {!loading && !error && products.length === 0 && (
                    <p className="text-gray-500">No products found.</p>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-lg"
                            >
                                {/*Product Image */}
                                <img 
                                    src={product.image?.url}
                                    alt={product.name}
                                    className="h-48 w-full rounded-lg object-cover"
                                />
                                <div className="p-4" >
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {product.name}
                                    </h3>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Category: {product.category?.name || "Unknown"}
                                    </p>

                                    <p className="mt-2 font-bold text-green-700">
                                        ₹{product.price}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Seller: {product.seller?.name || "Unknown"}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Stock: {product.stock}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Products;

