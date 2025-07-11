import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AddProjectPage() {
  const [values, setValues] = useState({
    title: "",
    description: "",
    toolsFront: "",
    toolsBack: "",
    toolsBd: "",
    demo_link: "",
    github_link: "",
    completed: false,
    startDate: "",
    Period: "",
  });

  const [activeButton, setActiveButton] = useState("new");
  const [selectedImages, setSelectedImages] = useState([]);
  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    const imagePreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...imagePreviews]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append all simple fields
    Object.keys(values).forEach(key => {
      formData.append(key, values[key]);
    });

    // Add selected image files
    selectedImages.forEach((image) => {
      formData.append("project_images", image);
    });

    axios
      .post("http://localhost:5000/api/add_project", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log("Project added:", res.data);
        navigate("/admin/projects/new");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">  
      {/* Navigation Buttons */}
      <div className="mb-8 flex-shrink-0 flex">
        <Link to="/admin/projects/new" className={`relative ${activeButton === "new" ? 'z-20' : 'z-10'}`}>
          <button 
            className={`border border-black px-4 py-1 rounded-l transition-all duration-150
              ${activeButton === "new"
                ? "bg-[#2D2A26] text-white -mr-2 shadow-lg rounded-r-lg z-20"
                : "bg-[#CED9E5] text-[#2D2A26] z-10"}
            `}
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
            onClick={() => setActiveButton("see")}
          >
            See Projects
          </button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <form onSubmit={handleSubmit}>
          {/* Title and Status */}
          <div className="flex items-start gap-20">
            <div className="w-80">
              <label className="block text-sm font-bold mb-2 text-gray-700">Project Title</label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2 text-gray-700">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="completed"
                    value="true"
                    checked={values.completed === true}
                    onChange={() => setValues({ ...values, completed: true })}
                  />
                  Completed
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="completed"
                    value="false"
                    checked={values.completed === false}
                    onChange={() => setValues({ ...values, completed: false })}
                  />
                  In Progress
                </label>
              </div>
            </div>
          </div>

          {/* Start Date & Period */}
          <div className="flex gap-8 mb-4">
            <div className="w-80">
              <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={values.startDate}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                required
              />
            </div>
            <div className="w-80">
              <label className="block text-sm font-medium mb-2 text-gray-700">Estimated Period (days)</label>
              <input
                type="number"
                name="Period"
                value={values.Period}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                min="1"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Project Description</label>
            <textarea
              rows={4}
              name="description"
              value={values.description}
              onChange={handleChange}
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <h3 className="text-lg text-sm text-gray-700 font-medium mb-2">Project Images</h3>
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
                  <img src={src} alt={`upload-${index}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Tools Used <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <input
                type="text"
                name="toolsFront"
                value={values.toolsFront}
                onChange={handleChange}
                placeholder="Front end: React, Angular, Vue"
                className="w-[97%] border-b border-gray-400 bg-[#CED9E5] px-2 py-1 text-sm text-gray-600"
                required
              />
              <input
                type="text"
                name="toolsBack"
                value={values.toolsBack}
                onChange={handleChange}
                placeholder="Back end: Node.js, Django"
                className="w-[97%] border-b border-gray-400 bg-[#CED9E5] px-2 py-1 text-sm text-gray-600"
                required
              />
              <input
                type="text"
                name="toolsBd"
                value={values.toolsBd}
                onChange={handleChange}
                placeholder="Database: MySQL, MongoDB"
                className="w-[97%] border-b border-gray-400 bg-[#CED9E5] px-2 py-1 text-sm text-gray-600"
                required
              />
            </div>
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Demo Link</label>
            <input
              type="text"
              name="demo_link"
              value={values.demo_link}
              onChange={handleChange}
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] mb-4"
            />
            <label className="block text-sm font-medium mb-2 text-gray-700">GitHub Repo</label>
            <input
              type="text"
              name="github_link"
              value={values.github_link}
              onChange={handleChange}
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
            />
          </div>

          {/* Submit Button */}
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

export default AddProjectPage;
