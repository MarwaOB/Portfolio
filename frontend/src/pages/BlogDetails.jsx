import React, { useState } from "react";
import { Link } from "react-router-dom";

function BlogDetails() {
    const [activeButton, setActiveButton] = useState("see");

    // Dummy data for testing (multiple image URLs)
    const blog = {
        id: 1,
        title: "E-Commerce Platform",
        description: "A full-stack e-commerce platform with modern design and powerful features. Built with React and Node.js, featuring user authentication, product management, shopping cart functionality, and secure payment processing. The platform includes an admin dashboard for managing products, orders, and customer data.",
        image_urls: [
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1350&q=80",
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1350&q=80"
        ],
        date: "2023-10-01",
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Navigation Buttons */}
            <div className="mb-8 flex">
                <Link to="/admin/blogs/new" className="relative z-10">
                    <button
                        className={`border border-black px-4 py-1 rounded-l transition-all duration-150
                            ${activeButton === "new"
                                ? "bg-[#2D2A26] text-white z-20 -mr-2 shadow-lg rounded-r-lg"
                                : "bg-[#CED9E5] text-[#2D2A26] z-10"}`}
                        style={{ position: 'relative' }}
                        onClick={() => setActiveButton("new")}
                    >
                        Add New Blog
                    </button>
                </Link>
                <Link to="/admin/blogs/see" className="relative z-10">
                    <button
                        className={`border border-black px-4 py-1 rounded-r transition-all duration-150
                            ${activeButton === "see"
                                ? "bg-[#2D2A26] text-white z-20 -ml-2 shadow-lg rounded-l-lg"
                                : "bg-[#CED9E5] text-[#2D2A26] z-10"}`}
                        style={{ position: 'relative' }}
                        onClick={() => setActiveButton("see")}
                    >
                        See Blogs
                    </button>
                </Link>
            </div>

            {/* Blog Details */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="rounded-lg p-6 space-y-6 bg-[#CED9E5]">
                    {/* Blog Title and Date */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-x-8 flex-wrap">
                            <h2 className="text-3xl font-bold text-[#2D2A26]">
                                {blog.title}
                            </h2>
                            <span className="px-3 py-1 text-lg font-bold text-[#2D2A26] bg-white rounded-full shadow">
                                {blog.date}
                            </span>
                        </div>
                    </div>

                    {/* Blog Images */}
                    {blog.image_urls && blog.image_urls.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Blog Images</h3>
                            <div className="flex flex-wrap gap-4">
                                {blog.image_urls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Blog image ${index + 1}`}
                                        className="w-32 h-32 object-cover rounded-md shadow-md bg-white"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <div className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">
                            <p className="text-gray-700 leading-relaxed">
                                {blog.description || "No description available"}
                            </p>
                        </div>
                    </div>

                    {/* Update Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-8 py-1 rounded font-medium hover:bg-green-700 transition-colors mr-4"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogDetails;
