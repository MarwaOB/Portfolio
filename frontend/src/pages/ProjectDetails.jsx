import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function ProjectDetails() {
    const { id } = useParams();
    const [activeButton, setActiveButton] = useState("see");
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]); // Track deleted images

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/project/${id}`);
                setProject(response.data);
                setEditedProject(response.data);
            } catch (err) {
                setError("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset to original values
            setEditedProject(project);
            setSelectedImages([]);
            setNewImages([]);
            setDeletedImages([]);
            // Clean up preview URLs
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
        setEditedProject(prev => ({
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
        // Add to deleted images list
        setDeletedImages(prev => [...prev, imageUrl]);
        
        // Remove from current project images
        setEditedProject(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleDeleteNewImage = (index) => {
        // Remove from new images preview
        const urlToRevoke = newImages[index];
        if (urlToRevoke.startsWith('blob:')) {
            URL.revokeObjectURL(urlToRevoke);
        }
        
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            
            // Append all project fields
            Object.keys(editedProject).forEach(key => {
                if (key !== 'images' && key !== 'id') {
                    formData.append(key, editedProject[key]);
                }
            });

            // Add selected image files
            selectedImages.forEach((image) => {
                formData.append("project_images", image);
            });

            // Add deleted images list
            if (deletedImages.length > 0) {
                formData.append("deleted_images", JSON.stringify(deletedImages));
            }

            const response = await axios.put(`http://localhost:5000/api/update_project/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Update the project state with new data
            setProject(editedProject);
            setIsEditing(false);
            setSelectedImages([]);
            setNewImages([]);
            setDeletedImages([]);
            
            // Clean up preview URLs
            newImages.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            
            // Refresh project data to get updated image URLs
            const updatedResponse = await axios.get(`http://localhost:5000/api/project/${id}`);
            setProject(updatedResponse.data);
            setEditedProject(updatedResponse.data);
            
        } catch (err) {
            console.error("Failed to update project:", err);
            setError("Failed to update project");
        }
    };

    // Cleanup function for component unmount
    useEffect(() => {
        return () => {
            // Clean up any remaining blob URLs
            newImages.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    if (loading) {
        return <div className="h-full flex items-center justify-center"><div className="text-lg">Loading project details...</div></div>;
    }
    if (error || !project) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="text-lg text-red-600 mb-4">{error || "Project not found"}</div>
                <Link to="/admin/projects/see" className="bg-[#2D2A26] text-white px-4 py-2 rounded hover:bg-[#1a1816]">Back to Projects</Link>
            </div>
        );
    }

    // Helper to ensure links are absolute
    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        return `https://${url}`;
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Navigation Buttons */}
            <div className="mb-8 flex">
                <Link to="/admin/projects/new" className="relative z-10">
                    <button
                        className={`border border-black px-4 py-1 rounded-l transition-all duration-150
                            ${activeButton === "new"
                                ? "bg-[#2D2A26] text-white z-20 -mr-2 shadow-lg rounded-r-lg"
                                : "bg-[#CED9E5] text-[#2D2A26] z-10"}
                        `}
                        style={{ position: 'relative' }}
                        onClick={() => setActiveButton("new")}
                    >
                        Add New Project
                    </button>
                </Link>
                <Link to="/admin/projects/see" className="relative z-10">
                    <button
                        className={`border border-black px-4 py-1 rounded-r transition-all duration-150
                            ${activeButton === "see"
                                ? "bg-[#2D2A26] text-white z-20 -ml-2 shadow-lg rounded-l-lg"
                                : "bg-[#CED9E5] text-[#2D2A26] z-10"}
                        `}
                        style={{ position: 'relative' }}
                        onClick={() => setActiveButton("see")}
                    >
                        See Projects
                    </button>
                </Link>
            </div>
            
            {/* Project Details */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="rounded-lg shadow-md p-6 space-y-6 bg-[#CED9E5]">
                    {/* Project Title and Status */}
                    {isEditing ? (
                        <div className="flex items-start gap-20">
                            <div className="w-80">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Project Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editedProject.title}
                                    onChange={handleInputChange}
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
                                            checked={editedProject.completed === true || editedProject.completed === 1}
                                            onChange={() => setEditedProject(prev => ({...prev, completed: true}))}
                                        />
                                        Completed
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="completed"
                                            value="false"
                                            checked={editedProject.completed === false || editedProject.completed === 0}
                                            onChange={() => setEditedProject(prev => ({...prev, completed: false}))}
                                        />
                                        In Progress
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-y-2">
                                <div className="flex items-center gap-x-4">
                                    <h2 className="text-3xl font-bold text-[#2D2A26]">
                                        {project.title}
                                    </h2>
                                    {project.completed !== undefined && (
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            project.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {project.completed ? 'Completed' : 'In Progress'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-8 mt-2 text-gray-700 text-sm">
                                    {project.startDate && (
                                        <span><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</span>
                                    )}
                                    {project.Period && (
                                        <span><strong>Estimated Period:</strong> {project.Period} days</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Start Date & Period (Edit Mode) */}
                    {isEditing && (
                        <div className="flex gap-8 mb-4">
                            <div className="w-80">
                                <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={editedProject.startDate ? editedProject.startDate.split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                    required
                                />
                            </div>
                            <div className="w-80">
                                <label className="block text-sm font-medium mb-2 text-gray-700">Estimated Period (days)</label>
                                <input
                                    type="number"
                                    name="Period"
                                    value={editedProject.Period}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Project Images */}
                    <div className="mb-8">
                        <h3 className="text-lg text-sm text-gray-700 font-medium mb-2">Project Images</h3>
                        <div className="flex items-start gap-4 flex-wrap">
                            {/* Existing images */}
                            {editedProject.images && editedProject.images.map((url, index) => (
                                <div key={index} className="relative w-32 h-32 overflow-hidden rounded-md shadow-md group">
                                    <img src={url} alt={`Project image ${index + 1}`} className="object-cover w-full h-full" />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(url, index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete image"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            {/* New images preview */}
                            {newImages.map((src, index) => (
                                <div key={`new-${index}`} className="relative w-32 h-32 overflow-hidden rounded-md shadow-md group">
                                    <img src={src} alt={`new-upload-${index}`} className="object-cover w-full h-full" />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteNewImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove new image"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            {/* Add new images button (only in edit mode) */}
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

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Project Description</label>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={editedProject.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] resize-none"
                                required
                            />
                        ) : (
                            <div className="w-full border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">
                                <p className="text-gray-700 leading-relaxed">
                                    {project.description || "No description available"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tools Used */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            Tools Used 
                        </label>
                        {isEditing ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    name="toolsFront"
                                    value={editedProject.toolsFront}
                                    onChange={handleInputChange}
                                    placeholder="Front end: React, Angular, Vue"
                                    className="w-[97%] border-b border-gray-400 bg-[#CED9E5] px-2 py-1 text-sm text-gray-600"
                                    required
                                />
                                <input
                                    type="text"
                                    name="toolsBack"
                                    value={editedProject.toolsBack}
                                    onChange={handleInputChange}
                                    placeholder="Back end: Node.js, Django"
                                    className="w-[97%] border-b border-gray-400 bg-[#CED9E5] px-2 py-1 text-sm text-gray-600"
                                    required
                                />
                                <input
                                    type="text"
                                    name="toolsBd"
                                    value={editedProject.toolsBd}
                                    onChange={handleInputChange}
                                    placeholder="Database: MySQL, MongoDB"
                                    className="w-[97%] border-b border-gray-400 bg-[#CED9E5] px-2 py-1 text-sm text-gray-600"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#CED9E5] rounded p-2 border border-gray-400">
                                    <h4 className="font-medium text-gray-600 mb-1">Frontend</h4>
                                    <p className="text-sm">{project.toolsFront || "Not specified"}</p>
                                </div>
                                <div className="bg-[#CED9E5] rounded p-2 border border-gray-400">
                                    <h4 className="font-medium text-gray-600 mb-1">Backend</h4>
                                    <p className="text-sm">{project.toolsBack || "Not specified"}</p>
                                </div>
                                <div className="bg-[#CED9E5] rounded p-2 border border-gray-400">
                                    <h4 className="font-medium text-gray-600 mb-1">Database</h4>
                                    <p className="text-sm">{project.toolsBd || "Not specified"}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-4 flex-wrap">
                        {isEditing ? (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Demo Link</label>
                                <input
                                    type="text"
                                    name="demo_link"
                                    value={editedProject.demo_link}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] mb-4"
                                />
                                <label className="block text-sm font-medium mb-2 text-gray-700">GitHub Repo</label>
                                <input
                                    type="text"
                                    name="github_link"
                                    value={editedProject.github_link}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                />
                            </div>
                        ) : (
                            <>
                                {project.demo_link && (
                                    <button
                                        onClick={() => window.open(getAbsoluteUrl(project.demo_link), '_blank', 'noopener,noreferrer')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                        type="button"
                                    >
                                        View Live Demo
                                    </button>
                                )}
                                {project.github_link && (
                                    <button
                                        onClick={() => window.open(getAbsoluteUrl(project.github_link), '_blank', 'noopener,noreferrer')}
                                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors"
                                        type="button"
                                    >
                                        View on GitHub
                                    </button>
                                )}
                            </>
                        )}
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
                        >
                            {isEditing ? "Update" : "Edit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetails;