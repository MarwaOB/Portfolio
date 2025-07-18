import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AddServicePage() {
  const [values, setValues] = useState({
    title: "",
    description: "",
    tools: "",
    demo_link: "",
    pricing: "",
    status: "0", // Default to inactive
  });
  const [activeButton, setActiveButton] = useState("new"); // "new" or "see"
  const [selectedImages, setSelectedImages] = useState([]);
  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Store the actual file objects for FormData
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs for display
    const imagePreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...imagePreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create FormData to handle file uploads
    const formData = new FormData();
    
    // Add all form fields to FormData
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('tools', values.tools);
    formData.append('demo_link', values.demo_link);
    formData.append('pricing', values.pricing);
    formData.append('status', values.status);
    formData.append('created_at', new Date().toISOString().split('T')[0]); // Current date in YYYY-MM-DD format
    
    // Add images to FormData
    selectedImages.forEach((image, index) => {
      formData.append(`service_images`, image);
    });

    // Adjust API endpoint to match your services backend
    axios
      .post("http://localhost:5000/api/services", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        console.log("Service added:", res.data);
        navigate("/admin/services");
      })
      .catch((err) => {
        console.error("Error adding service:", err);
        alert("Error adding service. Please try again.");
      });
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
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium font-bold mb-2 text-gray-700">Service Title</label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            <div className="w-40">
              <label className="block text-sm font-medium font-bold mb-2 text-gray-700">Status</label>
              <select
                name="status"
                value={values.status}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
              >
                <option value="0">Inactive</option>
                <option value="1">Active</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Service Description</label>
            <textarea
              rows={4}
              name="description"
              value={values.description}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500 resize-none"
              required
            />
          </div>

          {/* Tools */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Tools Used</label>
            <input
              type="text"
              name="tools"
              value={values.tools}
              onChange={handleChange}
              placeholder="HTML5, Angular, Figma, Canva, ..."
              className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Demo Link and Pricing */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-700">Demo Link</label>
              <input
                type="url"
                name="demo_link"
                value={values.demo_link}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="w-40">
              <label className="block text-sm font-medium mb-2 text-gray-700">Pricing ($)</label>
              <input
                type="number"
                name="pricing"
                value={values.pricing}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Service Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
            />
            
            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-2 rounded font-medium hover:bg-green-700 transition-colors"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddServicePage;