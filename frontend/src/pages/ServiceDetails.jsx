import React, { useState } from "react";
import { Link } from "react-router-dom";

function ServiceDetails() {
    const [activeButton, setActiveButton] = useState("see");

    // Dummy data for testing (multiple image URLs)
    const service = {
        id: 1,
        title: "Full-Stack Service",
        description: "A full-stack e-commerce platform with modern design and powerful features. Built with React and Node.js, featuring user authentication, product management, shopping cart functionality, and secure payment processing. The platform includes an admin dashboard for managing products, orders, and customer data.",
        demo_link: "https://demo-ecommerce.com",
        tools: "React.js, Tailwind CSS, Redux Toolkit, Node.js, Express.js, JWT Authentication ,MongoDB, Mongoose ODM",
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Navigation Buttons */}
            <div className="mb-8 flex">
                <Link to="/admin/services/new" className="relative z-10">
                    <button
                        className={`border border-black px-4 py-1 rounded-l transition-all duration-150
                            ${activeButton === "new"
                                ? "bg-[#2D2A26] text-white z-20 -mr-2 shadow-lg rounded-r-lg"
                                : "bg-[#CED9E5] text-[#2D2A26] z-10"}`}
                        style={{ position: 'relative' }}
                        onClick={() => setActiveButton("new")}
                    >
                        Add New Service
                    </button>
                </Link>
                <Link to="/admin/services/see" className="relative z-10">
                    <button
                        className={`border border-black px-4 py-1 rounded-r transition-all duration-150
                            ${activeButton === "see"
                                ? "bg-[#2D2A26] text-white z-20 -ml-2 shadow-lg rounded-l-lg"
                                : "bg-[#CED9E5] text-[#2D2A26] z-10"}`}
                        style={{ position: 'relative' }}
                        onClick={() => setActiveButton("see")}
                    >
                        See Services
                    </button>
                </Link>
            </div>

            {/* Service Details */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="rounded-lg p-6 space-y-6 bg-[#CED9E5]">
                    {/* Service Title  */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-x-8 flex-wrap">
                            <h2 className="text-3xl font-bold text-[#2D2A26]">
                                {service.title}
                            </h2>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <div className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">
                            <p className="text-gray-700 leading-relaxed">
                                {service.description || "No description available"}
                            </p>
                        </div>
                    </div>

                      {/* Tools Used */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Tools & Technologies</h3>
                        <div className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">
                            {service.tools && (
                                    <p className="text-gray-700 leading-relaxed">{service.tools}</p>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex gap-4">
                        {service.demo_link && (
                            <a 
                                href={service.demo_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                View Live Demo
                            </a>
                        )}
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

export default ServiceDetails;
