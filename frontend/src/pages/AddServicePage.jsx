import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AddServicePage() {
  const [values, setValues] = useState({
    title: "",
    description: "",
    status: false,
    pricing: "",
  });
  const [activeButton, setActiveButton] = useState("new"); // "new" or "see"
  const [selectedImages, setSelectedImages] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({ 
      ...values, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create previews
    const imagePreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...imagePreviews]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First, add the service
      const serviceData = {
        title: values.title,
        description: values.description,
        status: values.status,
        created_at: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        pricing: values.pricing ? parseInt(values.pricing) : null
      };

      const serviceResponse = await axios.post("http://localhost:3000/api/services", serviceData);
      const serviceId = serviceResponse.data.service_id;
      
      // Upload images to /api/services/upload_image
      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append('service_id', serviceId);
        formData.append('image', image);
        await axios.post("http://localhost:3000/api/services/upload_image", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      console.log("Service added:", serviceResponse.data);
      navigate("/admin/services/see");
    } catch (err) {
      console.error("Error adding service:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">  
      {/* Navigation Buttons */}
      <div className="mb-8 flex-shrink-0 flex">
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

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <form onSubmit={handleSubmit}>
          {/* Title and Status */}
          <div className="flex items-start gap-8 mb-6">
            <div className="w-80">
              <label className="block text-sm font-medium font-bold mb-2 text-gray-700">Service Title</label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium font-bold mb-2 text-gray-700">Status</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="status"
                  checked={values.status}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Active</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium font-bold mb-2 text-gray-700">Service Description</label>
            <textarea
              rows={4}
              name="description"
              value={values.description}
              onChange={handleChange}
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500 resize-none"
              required
            />
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <label className="block text-sm font-medium font-bold mb-2 text-gray-700">Pricing</label>
            <input
              type="number"
              name="pricing"
              value={values.pricing}
              onChange={handleChange}
              placeholder="Enter price (optional)"
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium font-bold mb-2 text-gray-700">Service Images</label>
            <div className="flex items-start gap-4 flex-wrap">
              <label className="w-32 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 cursor-pointer hover:border-gray-400">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-sm text-center">Upload Images</span>
              </label>
              {images.map((src, index) => (
                <div key={index} className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                  <img src={src} alt={`upload-${index}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-2 rounded font-medium hover:bg-green-700 transition-colors mr-4"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddServicePage;