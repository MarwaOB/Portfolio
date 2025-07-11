import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AddBlogPage() {
  const [values, setValues] = useState({
    title: "",
    description: "",
    tools_front: "",
    tools_back: "",
    tools_db: "",
    demo_link: "",
    github_repo: "",
    status: "",
  });
  const [activeButton, setActiveButton] = useState("new"); // "new" or "see"
  const [selectedImages, setSelectedImages] = useState([]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

   const [images, setImages] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imagePreviews = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...imagePreviews]);
    };


  const handleSubmit = (e) => {
    e.preventDefault();

    // Create FormData to handle file uploads
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.keys(values).forEach(key => {
      formData.append(key, values[key]);
    });
    
    // Combine tools into one string if backend expects that
    formData.append('tools_used', `${values.tools_front}, ${values.tools_back}, ${values.tools_db}`);
    
    // Add images to FormData
    selectedImages.forEach((image, index) => {
      formData.append(`project_images`, image);
    });

    axios
      .post("http://localhost:5000/api/add_project", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        console.log("Project added:", res.data);
        navigate("/admin/projects");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">  
      {/* Navigation Buttons */}
      <div className="mb-8 flex-shrink-0 flex">
        <Link to="/admin/blogs/new" className={`relative ${activeButton === "new" ? 'z-20' : 'z-10'}`}>
          <button 
            className={`border border-black px-4 py-1 rounded-l transition-all duration-150
              ${activeButton === "new"
                ? "bg-[#2D2A26] text-white -mr-2 shadow-lg rounded-r-lg z-20"
                : "bg-[#CED9E5] text-[#2D2A26] z-10"}
            `}
            style={{ position: 'relative' }}
            onClick={() => setActiveButton("new")}
          >
            Add New Blog
          </button>
        </Link>
        
        <Link to="/admin/blogs/see" className={`relative ${activeButton === "see" ? 'z-20' : 'z-10'}`}>
          <button 
            className={`border border-black px-4 py-1 rounded-r transition-all duration-150
              ${activeButton === "see"
                ? "bg-[#2D2A26] text-white -ml-2 shadow-lg rounded-l-lg z-20"
                : "bg-[#CED9E5] text-[#2D2A26] z-10"}
            `}
            style={{ position: 'relative' }}
            onClick={() => setActiveButton("see")}
          >
            See Blogs
          </button>
        </Link>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <form onSubmit={handleSubmit} >
          {/* Title and Status */}
          <div className="flex  items-start gap-100">
            <div className="w-80">
              <label className="block text-sm font-medium mb-2 text-gray-700">Blog Title</label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
                required
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Blog Description</label>
            <textarea
              rows={4}
              name="description"
              value={values.description}
              onChange={handleChange}
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500 resize-none"
              required
            />
          </div>

        {/* Project Images Upload */}
              <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Blog Images</h3>
                  <div className="flex items-start gap-4 flex-wrap">
                      <label className="w-32 h-32 border-2 border-dashed flex items-center justify-center text-gray-500 cursor-pointer">
                          <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              className="hidden"
                          />
                          <span className="text-sm text-center">Upload an image</span>
                      </label>

                      {images.map((src, index) => (
                          <div key={index} className="w-32 h-32 overflow-hidden rounded-md shadow-md">
                              <img
                                  src={src}
                                  alt={`upload-${index}`}
                                  className="object-cover w-full h-full"
                              />
                          </div>
                      ))}
                  </div>
              </div>

     
          {/* Add Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-1 rounded font-medium hover:bg-green-700 transition-colors mr-4"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBlogPage;