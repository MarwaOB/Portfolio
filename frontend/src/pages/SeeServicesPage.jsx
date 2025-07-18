import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SeeServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeButton, setActiveButton] = useState("see");
    
    const navigate = useNavigate();

    // Fetch services from backend
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            // You'll need to add a GET endpoint to your backend to fetch services
            const response = await axios.get("http://localhost:3000/api/services");
            setServices(response.data);
        } catch (err) {
            console.error("Error fetching services:", err);
            setError("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (serviceId) => {
        if (window.confirm("Are you sure you want to delete this service? This will also delete all associated images.")) {
            try {
                // First, get all images associated with this service
                const imagesResponse = await axios.get(`http://localhost:3000/api/services/${serviceId}/images`);
                const serviceImages = imagesResponse.data;
                
                // Delete all images associated with this service
                for (const imageData of serviceImages) {
                    await axios.post("http://localhost:3000/api/services/remove_image", {
                        service_id: serviceId,
                        image: imageData.image
                    });
                }
                
                // Now delete the service itself
                await axios.post("http://localhost:3000/api/services/delete", {
                    service_id: serviceId
                });
                
                // Remove the deleted service from the state
                setServices(services.filter(service => service.service_id !== serviceId));
                
                console.log("Service and associated images deleted successfully");
            } catch (err) {
                console.error("Error deleting service:", err);
                alert("Failed to delete service");
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="mb-8 flex">
                    <Link to="/admin/projects/new" className={`relative ${activeButton === "new" ? 'z-20' : 'z-10'}`}>
                        <button 
                            className={`border border-black px-4 py-1 rounded-l transition-all duration-150
                                ${activeButton === "new"
                                    ? "bg-[#2D2A26] text-white -mr-2 shadow-lg rounded-r-lg z-20"
                                    : "bg-[#CED9E5] text-[#2D2A26] z-10"}
                            `}
                            style={{ position: 'relative' }}
                            onClick={() => setActiveButton("new")}
                        >
                            Add New Project
                        </button>
                    </Link>
                    
                    <Link to="/admin/projects/see" className={`relative ${activeButton === "see" ? 'z-20' : 'z-10'}`}>
                        <button 
                            className={`border border-black px-4 py-1 rounded-r transition-all duration-150
                                ${activeButton === "see"
                                    ? "bg-[#2D2A26] text-white -ml-2 shadow-lg rounded-l-lg z-20"
                                    : "bg-[#CED9E5] text-[#2D2A26] z-10"}
                            `}
                            style={{ position: 'relative' }}
                            onClick={() => setActiveButton("see")}
                        >
                            See Projects
                        </button>
                    </Link>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-600">Loading projects...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="mb-8 flex">
                    <Link to="/admin/services/new" className={`relative ${activeButton === "new" ? 'z-20' : 'z-10'}`}>
                        <button 
                            className={`border border-black px-4 py-1 rounded-l transition-all duration-150
                                ${activeButton === "new"
                                    ? "bg-[#2D2A26] text-white -mr-2 shadow-lg rounded-r-lg z-20"
                                    : "bg-[#CED9E5] text-[#2D2A26] z-10"}
                            `}
                            style={{ position: 'relative' }}
                            onClick={() => setActiveButton("new")}
                        >
                            Add New Service
                        </button>
                    </Link>
                    
                    <Link to="/admin/services/see" className={`relative ${activeButton === "see" ? 'z-20' : 'z-10'}`}>
                        <button 
                            className={`border border-black px-4 py-1 rounded-r transition-all duration-150
                                ${activeButton === "see"
                                    ? "bg-[#2D2A26] text-white -ml-2 shadow-lg rounded-l-lg z-20"
                                    : "bg-[#CED9E5] text-[#2D2A26] z-10"}
                            `}
                            style={{ position: 'relative' }}
                            onClick={() => setActiveButton("see")}
                        >
                            See Services
                        </button>
                    </Link>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-red-600">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">  
            <div className="mb-8 flex">
                <Link to="/admin/services/new" className={`relative ${activeButton === "new" ? 'z-20' : 'z-10'}`}>
                    <button 
                        className={`border border-black px-4 py-1 rounded-l transition-all duration-150
                            ${activeButton === "new"
                                ? "bg-[#2D2A26] text-white -mr-2 shadow-lg rounded-r-lg z-20"
                                : "bg-[#CED9E5] text-[#2D2A26] z-10"}
                        `}
                        style={{ position: 'relative' }}
                        onClick={() => setActiveButton("new")}
                    >
                        Add New Service
                    </button>
                </Link>
                
                <Link to="/admin/services/see" className={`relative ${activeButton === "see" ? 'z-20' : 'z-10'}`}>
                    <button 
                        className={`border border-black px-4 py-1 rounded-r transition-all duration-150
                            ${activeButton === "see"
                                ? "bg-[#2D2A26] text-white -ml-2 shadow-lg rounded-l-lg z-20"
                                : "bg-[#CED9E5] text-[#2D2A26] z-10"}
                        `}
                        style={{ position: 'relative' }}
                        onClick={() => setActiveButton("see")}
                    >
                        See Services
                    </button>
                </Link>
            </div>
            
            {/* Services List with Scroll */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {services.length === 0 ? (
                    <div className="text-center text-gray-600 mt-8">
                        No services found. <Link to="/admin/services/new" className="text-blue-600 hover:underline">Add your first service</Link>
                    </div>
                ) : (
                    <div className="space-y-4 pr-2">
                        {services.map((service) => (
                            <div
                                key={service.service_id}
                                className="bg-[#BAC3CE] px-4 py-3 rounded"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-black font-medium text-lg mb-1">
                                            {service.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <span>
                                                Status: 
                                                <span className={`ml-1 px-2 py-1 rounded ${
                                                    service.status 
                                                        ? 'bg-green-200 text-green-800' 
                                                        : 'bg-gray-200 text-gray-800'
                                                }`}>
                                                    {service.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </span>
                                            
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button 
                                            onClick={() => handleDelete(service.service_id)}
                                            className="bg-[#D62828] text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                        <Link to={`/admin/services/${service.service_id}`}>
                                            <button className="bg-[#E4C900] text-black px-3 py-1 rounded hover:bg-yellow-600 transition-colors">
                                                More
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SeeServicesPage;