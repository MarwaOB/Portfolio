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
    const [deletedImages, setDeletedImages] = useState([]);
    
    // New state for tools and clients
    const [allTools, setAllTools] = useState([]);
    const [allClients, setAllClients] = useState([]);
    const [projectTools, setProjectTools] = useState([]);
    const [projectClients, setProjectClients] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [projectImages, setProjectImages] = useState([]);
    const [projectDemos, setProjectDemos] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch project details
                const projectResponse = await axios.get(`http://localhost:3000/api/projects/${id}`);
                setProject(projectResponse.data);
                setEditedProject(projectResponse.data);

                // Fetch project tools
                const toolsResponse = await axios.get(`http://localhost:3000/api/projects/${id}/tools`);
                setProjectTools(toolsResponse.data);
                setSelectedTools(toolsResponse.data.map(tool => tool.tool_id));

                // Fetch project clients
                const clientsResponse = await axios.get(`http://localhost:3000/api/projects/${id}/clients`);
                setProjectClients(clientsResponse.data);
                setSelectedClients(clientsResponse.data.map(client => client.client_id));

                // Fetch project images
                const imagesResponse = await axios.get(`http://localhost:3000/api/projects/${id}/images`);
                setProjectImages(imagesResponse.data);

                // Fetch project demos
                const demosResponse = await axios.get(`http://localhost:3000/api/projects/${id}/demos`);
                setProjectDemos(demosResponse.data);

                // Fetch all tools and clients for editing
                const allToolsResponse = await axios.get(`http://localhost:3000/api/projects/allTools`);
                setAllTools(allToolsResponse.data);

                const allClientsResponse = await axios.get(`http://localhost:3000/api/projects/allClients`);
                setAllClients(allClientsResponse.data);

            } catch (err) {
                setError("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset to original values
            setEditedProject(project);
            setSelectedImages([]);
            setNewImages([]);
            setDeletedImages([]);
            setSelectedTools(projectTools.map(tool => tool.tool_id));
            setSelectedClients(projectClients.map(client => client.client_id));
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
        
        // Remove from project images
        setProjectImages(prev => prev.filter((_, i) => i !== index));
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

    const handleToolToggle = (toolId) => {
        setSelectedTools(prev => 
            prev.includes(toolId) 
                ? prev.filter(id => id !== toolId)
                : [...prev, toolId]
        );
    };

    const handleClientToggle = (clientId) => {
        setSelectedClients(prev => 
            prev.includes(clientId) 
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleUpdate = async () => {
        try {
            // Update project basic info
            await axios.post(`http://localhost:3000/api/projects/modify`, {
                project_id: id,
                title: editedProject.title,
                description: editedProject.description,
                live_link: editedProject.live_link,
                git_link: editedProject.git_link,
                start_date: editedProject.start_date,
                end_date: editedProject.end_date
            });

            // Update tools
            const currentToolIds = projectTools.map(tool => tool.tool_id);
            
            // Remove tools that are no longer selected
            for (const toolId of currentToolIds) {
                if (!selectedTools.includes(toolId)) {
                    await axios.post(`http://localhost:3000/api/projects/remove_project_tool`, {
                        project_id: id,
                        tool_id: toolId
                    });
                }
            }
            
            // Add newly selected tools
            for (const toolId of selectedTools) {
                if (!currentToolIds.includes(toolId)) {
                    await axios.post(`http://localhost:3000/api/projects/add_project_tool`, {
                        project_id: id,
                        tool_id: toolId
                    });
                }
            }

            // Update clients
            const currentClientIds = projectClients.map(client => client.client_id);
            
            // Remove clients that are no longer selected
            for (const clientId of currentClientIds) {
                if (!selectedClients.includes(clientId)) {
                    await axios.post(`http://localhost:3000/api/projects/remove_project_client`, {
                        project_id: id,
                        client_id: clientId
                    });
                }
            }
            
            // Add newly selected clients
            for (const clientId of selectedClients) {
                if (!currentClientIds.includes(clientId)) {
                    await axios.post(`http://localhost:3000/api/projects/add_project_client`, {
                        project_id: id,
                        client_id: clientId
                    });
                }
            }

            // Handle deleted images
            for (const imageUrl of deletedImages) {
                await axios.post(`http://localhost:3000/api/projects/remove_image`, {
                    project_id: id,
                    image: imageUrl
                });
            }

            // Add new images
            for (const image of selectedImages) {
                const formData = new FormData();
                formData.append('image', image);
                // You'll need to implement image upload endpoint
                // For now, we'll use a placeholder URL
                await axios.post(`http://localhost:3000/api/projects/image`, {
                    project_id: id,
                    image: `uploads/${image.name}` // This should be the actual uploaded image path
                });
            }

            // Reset state
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
            
            // Refresh data
            window.location.reload();
            
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
                    {/* Project Title */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-y-2">
                            <div className="flex items-center gap-x-4">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="title"
                                        value={editedProject.title}
                                        onChange={handleInputChange}
                                        className="text-3xl font-bold text-[#2D2A26] bg-[#CED9E5] border border-gray-400 rounded px-3 py-2"
                                        required
                                    />
                                ) : (
                                    <h2 className="text-3xl font-bold text-[#2D2A26]">
                                        {project.title}
                                    </h2>
                                )}
                            </div>
                            <div className="flex gap-8 mt-2 text-gray-700 text-sm">
                                {project.start_date && (
                                    <span><strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}</span>
                                )}
                                {project.end_date && (
                                    <span><strong>End Date:</strong> {new Date(project.end_date).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Start Date & End Date (Edit Mode) */}
                    {isEditing && (
                        <div className="flex gap-8 mb-4">
                            <div className="w-80">
                                <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={editedProject.start_date ? editedProject.start_date.split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                />
                            </div>
                            <div className="w-80">
                                <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={editedProject.end_date ? editedProject.end_date.split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Project Images */}
                    <div className="mb-8">
                        <h3 className="text-lg text-sm text-gray-700 font-medium mb-2">Project Images</h3>
                        <div className="flex items-start gap-4 flex-wrap">
                            {/* Existing images */}
                            {projectImages.map((imageObj, index) => (
                                <div key={index} className="relative w-32 h-32 overflow-hidden rounded-md shadow-md group">
                                    <img src={imageObj.image} alt={`Project image ${index + 1}`} className="object-cover w-full h-full" />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(imageObj.image, index)}
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
                        <label className="block text-sm font-medium mb-2 text-gray-700">Tools Used</label>
                        {isEditing ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {allTools.map((tool) => (
                                        <label key={tool.tool_id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={selectedTools.includes(tool.tool_id)}
                                                onChange={() => handleToolToggle(tool.tool_id)}
                                                className="form-checkbox"
                                            />
                                            <span className="text-sm">{tool.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {projectTools.map((tool) => (
                                    <span key={tool.tool_id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {tool.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clients */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Clients</label>
                        {isEditing ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {allClients.map((client) => (
                                        <label key={client.client_id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.includes(client.client_id)}
                                                onChange={() => handleClientToggle(client.client_id)}
                                                className="form-checkbox"
                                            />
                                            <span className="text-sm">{client.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {projectClients.map((client) => (
                                    <span key={client.client_id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        {client.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-4 flex-wrap">
                        {isEditing ? (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Live Demo Link</label>
                                <input
                                    type="text"
                                    name="live_link"
                                    value={editedProject.live_link || ''}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] mb-4"
                                />
                                <label className="block text-sm font-medium mb-2 text-gray-700">GitHub Repository</label>
                                <input
                                    type="text"
                                    name="git_link"
                                    value={editedProject.git_link || ''}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                />
                            </div>
                        ) : (
                            <>
                                {project.live_link && (
                                    <button
                                        onClick={() => window.open(getAbsoluteUrl(project.live_link), '_blank', 'noopener,noreferrer')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                        type="button"
                                    >
                                        View Live Demo
                                    </button>
                                )}
                                {project.git_link && (
                                    <button
                                        onClick={() => window.open(getAbsoluteUrl(project.git_link), '_blank', 'noopener,noreferrer')}
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