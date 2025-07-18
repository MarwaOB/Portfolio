import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function ServiceDetails() {
    const { id } = useParams();
    const [activeButton, setActiveButton] = useState("see");
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedService, setEditedService] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [serviceImages, setServiceImages] = useState([]);

    useEffect(() => {
        const fetchService = async () => {
            try {
                setLoading(true);
                const [serviceRes, imagesRes] = await Promise.all([
                    axios.get(`http://localhost:3000/api/services/${id}`),
                    axios.get(`http://localhost:3000/api/services/${id}/images`)
                ]);
                setService(serviceRes.data);
                setEditedService(serviceRes.data);
                setServiceImages(imagesRes.data.map(img => img.image));
            } catch (err) {
                setError("Failed to load service details");
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedService(service);
            setSelectedImages([]);
            setNewImages([]);
            setDeletedImages([]);
            newImages.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedService(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
        const imagePreviews = files.map(file => URL.createObjectURL(file));
        setNewImages(prev => [...prev, ...imagePreviews]);
    };

    const handleDeleteImage = (imageUrl, index) => {
        setDeletedImages(prev => [...prev, imageUrl]);
        setServiceImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteNewImage = (index) => {
        const urlToRevoke = newImages[index];
        if (urlToRevoke.startsWith('blob:')) {
            URL.revokeObjectURL(urlToRevoke);
        }
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            // Update main service fields
            await axios.post("http://localhost:3000/api/services/modify", {
                service_id: id,
                title: editedService.title,
                description: editedService.description,
                status: editedService.status,
                pricing: editedService.pricing
            });

            // Remove deleted images
            for (const imageUrl of deletedImages) {
                await axios.post("http://localhost:3000/api/services/remove_image", {
                    service_id: id,
                    image: imageUrl
                });
            }

            // Add new images
            for (const image of selectedImages) {
                const formData = new FormData();
                formData.append('service_id', id);
                formData.append('image', image);
                await axios.post("http://localhost:3000/api/services/upload_image", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            // Refresh data
            const updatedService = await axios.get(`http://localhost:3000/api/services/${id}`);
            const updatedImages = await axios.get(`http://localhost:3000/api/services/${id}/images`);
            setService(updatedService.data);
            setEditedService(updatedService.data);
            setServiceImages(updatedImages.data.map(img => img.image));
            setIsEditing(false);
            setSelectedImages([]);
            setNewImages([]);
            setDeletedImages([]);
            newImages.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            alert("Service updated successfully!");
        } catch (err) {
            console.error("Failed to update service:", err);
            setError("Failed to update service");
            alert("Failed to update service");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            newImages.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    if (loading) {
        return <div className="h-full flex items-center justify-center"><div className="text-lg">Loading service details...</div></div>;
    }
    if (error || !service) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="text-lg text-red-600 mb-4">{error || "Service not found"}</div>
                <Link to="/admin/services/see" className="bg-[#2D2A26] text-white px-4 py-2 rounded hover:bg-[#1a1816]">Back to Services</Link>
            </div>
        );
    }

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
                    {/* Service Title and Status */}
                    <div className="flex items-start gap-[24rem] mb-4">
                        {/* Title */}
                        <div className="w-80 flex-shrink-0">
                            <label className="block text-sm font-bold mb-2 text-gray-700">Service Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="title"
                                    value={editedService.title}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                    required
                                />
                            ) : (
                                <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] text-base font-normal flex items-center min-h-[48px]">
                                    {service.title}
                                </div>
                            )}
                        </div>
                        {/* Status */}
                        <div className="w-48 flex-shrink-0">
                            <label className="block text-sm font-bold mb-2 text-gray-700">Status:</label>
                            <div className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] flex items-center justify-center min-h-[48px]">
                                {isEditing ? (
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="status"
                                            checked={!!editedService.status}
                                            onChange={handleInputChange}
                                            className="form-checkbox h-5 w-5 text-green-600"
                                        />
                                        <span className="text-lg font-semibold text-gray-700">Active</span>
                                    </label>
                                ) : (
                                    <span className={`text-base font-normal ${service.status ? 'text-green-800' : 'text-gray-700'}`}>
                                        {service.status ? 'Active' : 'Inactive'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex gap-8 mb-4">
                        <div className="w-80">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Pricing</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="pricing"
                                    value={editedService.pricing || ''}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                />
                            ) : (
                                <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">{service.pricing}</div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Service Description</label>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={editedService.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] resize-none"
                                required
                            />
                        ) : (
                            <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {service.description || "No description available"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Service Images */}
                    <div className="mb-8">
                        <h3 className="text-lg text-sm text-gray-700 font-medium mb-2">Service Images</h3>
                        <div className="flex items-start gap-4 flex-wrap">
                            {/* Existing images */}
                            {isEditing
                                ? serviceImages && serviceImages.map((url, index) => (
                                    <div key={index} className="relative w-32 h-32 overflow-hidden rounded-md shadow-md group">
                                        <img src={url} alt={`Service image ${index + 1}`} className="object-cover w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(url, index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                                : serviceImages && serviceImages.length > 0
                                    ? serviceImages.map((url, idx) => (
                                        <img key={idx} src={url} alt={`Service image ${idx + 1}`} className="object-cover w-32 h-32 rounded-md shadow-md" />
                                    ))
                                    : <span className="text-gray-500">No images available</span>
                            }
                            {/* New images preview (only in edit mode) */}
                            {isEditing && newImages && newImages.length > 0
                                ? newImages.map((url, index) => (
                                    <div key={`new-${index}`} className="relative w-32 h-32 overflow-hidden rounded-md shadow-md group">
                                        <img src={url} alt={`New image ${index + 1}`} className="object-cover w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteNewImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove new image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                                : null
                            }
                            {isEditing && (
                                <label className="w-32 h-32 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 cursor-pointer hover:border-gray-600 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <span className="text-sm text-center">Upload an image</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Edit/Update Button */}
                    <div className="flex justify-end gap-2 pt-4">
                        {isEditing && (
                            <button
                                onClick={handleEditToggle}
                                className="bg-gray-500 text-white px-8 py-1 rounded font-medium hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={isEditing ? handleUpdate : handleEditToggle}
                            className={`px-8 py-1 rounded font-medium transition-colors ${
                                isEditing 
                                    ? "bg-green-600 text-white hover:bg-green-700" 
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                            disabled={loading}
                        >
                            {isEditing ? (loading ? "Updating..." : "Update") : "Edit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServiceDetails;
