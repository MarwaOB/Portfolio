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
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [newClient, setNewClient] = useState({ name: "", tel: "", e_mail: "", image: "" });
    const [allTools, setAllTools] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const [showNewToolForm, setShowNewToolForm] = useState(false);
    const [newTool, setNewTool] = useState({ name: "", type: "", image: "" });
    const [projectImages, setProjectImages] = useState([]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const [projectRes, imagesRes, clientRes, toolsRes, allClientsRes, allToolsRes] = await Promise.all([
                    axios.get(`http://localhost:3000/api/projects/${id}`),
                    axios.get(`http://localhost:3000/api/projects/${id}/images`),
                    axios.get(`http://localhost:3000/api/projects/${id}/clients`),
                    axios.get(`http://localhost:3000/api/projects/${id}/tools`),
                    axios.get("http://localhost:3000/api/projects/allClients"),
                    axios.get("http://localhost:3000/api/projects/allTools")
                ]);
                setProject(projectRes.data);
                setEditedProject(projectRes.data);
                setProjectImages(imagesRes.data.map(img => img.image));
                setSelectedClient(clientRes.data[0]?.client_id || "");
                setSelectedTools(toolsRes.data.map(t => t.tool_id));
                setClients(allClientsRes.data);
                setAllTools(allToolsRes.data);
            } catch (err) {
                setError("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    // Fetch all clients and tools, and the project's current client and tools, when entering edit mode
    useEffect(() => {
        if (isEditing) {
            const fetchClientsAndTools = async () => {
                try {
                    const [clientsRes, toolsRes, projectClientsRes, projectToolsRes] = await Promise.all([
                        axios.get("http://localhost:3000/api/projects/allClients"),
                        axios.get("http://localhost:3000/api/projects/allTools"),
                        axios.get(`http://localhost:3000/api/projects/${id}/clients`),
                        axios.get(`http://localhost:3000/api/projects/${id}/tools`)
                    ]);
                    setClients(clientsRes.data);
                    setAllTools(toolsRes.data);
                    setSelectedClient(projectClientsRes.data[0]?.client_id || "");
                    setSelectedTools(projectToolsRes.data.map(t => t.tool_id));
                } catch (err) {
                    // handle error
                }
            };
            fetchClientsAndTools();
        }
    }, [isEditing, id]);

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

 const handleUpdate = async () => {
  setLoading(true);
  try {
    console.log('Starting update process...');
    console.log('Edited project data:', editedProject);
    
    // Helper function to format date properly
    const formatDate = (dateString) => {
      if (!dateString) return null;
      // If it's already in YYYY-MM-DD format, return as is
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      // If it's an ISO string or date object, extract just the date part
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    };
    
    // Prepare the update payload with properly formatted dates
    const updatePayload = {
      project_id: id,
      title: editedProject.title,
      description: editedProject.description,
      live_link: editedProject.live_link,
      git_link: editedProject.git_link,
      start_date: formatDate(editedProject.start_date),
      end_date: formatDate(editedProject.end_date)
    };
    
    console.log('Update payload:', updatePayload);

    // 1. Update main project fields
    const updateResponse = await axios.post("http://localhost:3000/api/projects/modify", updatePayload);
    console.log('Main project update response:', updateResponse.data);

    // 2. Update client link if changed
    try {
      // Get current project clients
      const currentClientsRes = await axios.get(`http://localhost:3000/api/projects/${id}/clients`);
      const currentClientId = currentClientsRes.data[0]?.client_id;
      
      // Only update if client has changed
      if (currentClientId !== selectedClient) {
        // Remove current client if exists
        if (currentClientId) {
          await axios.post("http://localhost:3000/api/projects/remove_project_client", { 
            project_id: id, 
            client_id: currentClientId 
          });
        }
        
        // Add new client if selected
        if (selectedClient) {
          await axios.post("http://localhost:3000/api/projects/add_project_client", { 
            project_id: id, 
            client_id: selectedClient 
          });
        }
      }
    } catch (clientError) {
      console.error('Error updating client:', clientError);
      // Continue with other updates even if client update fails
    }

    // 3. Update tools
    try {
      const oldToolsRes = await axios.get(`http://localhost:3000/api/projects/${id}/tools`);
      const oldToolIds = oldToolsRes.data.map(t => t.tool_id);
      
      // Remove tools that are no longer selected
      const toolsToRemove = oldToolIds.filter(toolId => !selectedTools.includes(toolId));
      for (const tool_id of toolsToRemove) {
        await axios.post("http://localhost:3000/api/projects/remove_project_tool", { 
          project_id: id, 
          tool_id 
        });
      }
      
      // Add newly selected tools
      const toolsToAdd = selectedTools.filter(toolId => !oldToolIds.includes(toolId));
      for (const tool_id of toolsToAdd) {
        await axios.post("http://localhost:3000/api/projects/add_project_tool", { 
          project_id: id, 
          tool_id 
        });
      }
    } catch (toolError) {
      console.error('Error updating tools:', toolError);
      // Continue with other updates even if tool update fails
    }

    // 4. Handle image updates
    try {
      // Remove deleted images
      for (const imageUrl of deletedImages) {
        await axios.post("http://localhost:3000/api/projects/remove_image", { 
          project_id: id, 
          image: imageUrl 
        });
      }

      // Add new images
      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append('project_id', id);
        formData.append('image', image);
        await axios.post("http://localhost:3000/api/projects/upload_image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
    } catch (imageError) {
      console.error('Error updating images:', imageError);
      // Continue even if image update fails
    }

    // 5. Update demo if needed
    if (editedProject.live_link && editedProject.live_link !== project.live_link) {
      try {
        await axios.post("http://localhost:3000/api/projects/demo", { 
          project_id: id, 
          demo: editedProject.live_link 
        });
      } catch (demoError) {
        console.error('Error updating demo:', demoError);
        // Continue even if demo update fails
      }
    }

    // 6. Refresh project data
    const updatedResponse = await axios.get(`http://localhost:3000/api/projects/${id}`);
    const updatedImagesResponse = await axios.get(`http://localhost:3000/api/projects/${id}/images`);
    
    setProject(updatedResponse.data);
    setEditedProject(updatedResponse.data);
    setProjectImages(updatedImagesResponse.data.map(img => img.image));
    setIsEditing(false);
    setSelectedImages([]);
    setNewImages([]);
    setDeletedImages([]);
    
    // Clean up blob URLs
    newImages.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    alert("Project updated successfully!");
    
  } catch (err) {
    console.error("Failed to update project:", err);
    console.error("Error details:", err.response?.data || err.message);
    
    // Show more specific error message
    const errorMessage = err.response?.data?.details || err.response?.data?.error || err.message;
    alert(`Failed to update project: ${errorMessage}`);
    
    setError("Failed to update project");
  } finally {
    setLoading(false);
  }
};
    // Add new client
    const handleAddNewClient = async () => {
        if (!newClient.name) {
            alert("Please fill in client name");
            return;
        }
        try {
            await axios.post("http://localhost:3000/api/projects/clients", newClient);
            const clientsRes = await axios.get("http://localhost:3000/api/projects/allClients");
            setClients(clientsRes.data);
            // Select the newly added client
            const added = clientsRes.data.find(c => c.name === newClient.name && c.e_mail === newClient.e_mail);
            setSelectedClient(added ? added.client_id : "");
            setNewClient({ name: "", tel: "", e_mail: "", image: "" });
            setShowNewClientForm(false);
            alert("Client added successfully!");
        } catch (error) {
            alert("Failed to add client");
        }
    };
    // Add new tool
    const handleAddNewTool = async () => {
        if (!newTool.name || !newTool.type) {
            alert("Please fill in tool name and type");
            return;
        }
        try {
            await axios.post("http://localhost:3000/api/projects/tools/add", newTool);
            const toolsRes = await axios.get("http://localhost:3000/api/projects/allTools");
            setAllTools(toolsRes.data);
            // Select the newly added tool
            const added = toolsRes.data.find(t => t.name === newTool.name && t.type === newTool.type);
            if (added) setSelectedTools(prev => [...prev, added.tool_id]);
            setNewTool({ name: "", type: "", image: "" });
            setShowNewToolForm(false);
            alert("Tool added successfully!");
        } catch (error) {
            alert("Failed to add tool");
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
                    <div className="flex items-start gap-20">
                        <div className="w-80">
                            <label className="block text-sm font-bold mb-2 text-gray-700">Project Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="title"
                                    value={editedProject.title}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                    required
                                />
                            ) : (
                                <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">{project.title}</div>
                            )}
                        </div>
                    </div>

                    {/* Start Date & End Date */}
                    <div className="flex gap-8 mb-4">
                        <div className="w-80">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="start_date"
                                    value={editedProject.start_date ? editedProject.start_date.split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                    required
                                />
                            ) : (
                                <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">{project.start_date ? new Date(project.start_date).toLocaleDateString() : ''}</div>
                            )}
                        </div>
                        <div className="w-80">
                            <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="end_date"
                                    value={editedProject.end_date ? editedProject.end_date.split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                    required
                                />
                            ) : (
                                <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">{project.end_date ? new Date(project.end_date).toLocaleDateString() : ''}</div>
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
                            <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {project.description || "No description available"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Client Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Client</label>
                        {isEditing ? (
                            <>
                                <div className="mb-4">
                                    <h4 className="text-sm font-normal mb-2">Select from existing clients:</h4>
                                    <select
                                        value={selectedClient}
                                        onChange={e => setSelectedClient(e.target.value)}
                                        className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                        required
                                    >
                                        <option value="">Select a client</option>
                                        {clients.length > 0 ? (
                                            clients.map(client => (
                                                <option key={client.client_id} value={client.client_id}>
                                                    {client.name} {client.e_mail ? `(${client.e_mail})` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No clients available</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewClientForm(!showNewClientForm)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                                    >
                                        {showNewClientForm ? 'Cancel' : 'Add New Client'}
                                    </button>
                                    {showNewClientForm && (
                                        <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                                            <h4 className="font-medium mb-3">Add New Client</h4>
                                            <div className="space-y-3">
                                                <input type="text" name="name" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="Client Name" className="w-full border border-gray-400 rounded px-3 py-2 bg-white" required />
                                                <input type="tel" name="tel" value={newClient.tel} onChange={e => setNewClient({ ...newClient, tel: e.target.value })} placeholder="Phone Number (optional)" className="w-full border border-gray-400 rounded px-3 py-2 bg-white" />
                                                <input type="email" name="e_mail" value={newClient.e_mail} onChange={e => setNewClient({ ...newClient, e_mail: e.target.value })} placeholder="Email (optional)" className="w-full border border-gray-400 rounded px-3 py-2 bg-white" />
                                                <input type="text" name="image" value={newClient.image} onChange={e => setNewClient({ ...newClient, image: e.target.value })} placeholder="Client Image URL (optional)" className="w-full border border-gray-400 rounded px-3 py-2 bg-white" />
                                                <button type="button" onClick={handleAddNewClient} className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600">Add Client</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">
                                {clients.find(c => c.client_id === selectedClient)?.name || 'No client assigned'}
                            </div>
                        )}
                    </div>

                    {/* Tools Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Tools Used</label>
                        {isEditing ? (
                            <>
                                <div className="mb-4">
                                    <h4 className="text-sm font-normal mb-2">Select from existing tools:</h4>
                                    <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] max-h-48 overflow-y-auto">
                                        {allTools.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                {allTools.map(tool => (
                                                    <div key={tool.tool_id} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`tool-${tool.tool_id}`}
                                                            checked={selectedTools.includes(tool.tool_id)}
                                                            onChange={() => setSelectedTools(prev => prev.includes(tool.tool_id) ? prev.filter(id => id !== tool.tool_id) : [...prev, tool.tool_id])}
                                                            className="mr-2"
                                                        />
                                                        <label htmlFor={`tool-${tool.tool_id}`} className="text-sm">
                                                            {tool.name} ({tool.type})
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-gray-500">No tools available. Add some tools first.</div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewToolForm(!showNewToolForm)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                                    >
                                        {showNewToolForm ? 'Cancel' : 'Add New Tool'}
                                    </button>
                                    {showNewToolForm && (
                                        <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                                            <h4 className="font-medium mb-3">Add New Tool</h4>
                                            <div className="space-y-3">
                                                <input type="text" name="name" value={newTool.name} onChange={e => setNewTool({ ...newTool, name: e.target.value })} placeholder="Tool Name" className="w-full border border-gray-400 rounded px-3 py-2 bg-white" required />
                                                <input type="text" name="type" value={newTool.type} onChange={e => setNewTool({ ...newTool, type: e.target.value })} placeholder="Tool Type (e.g., Frontend, Backend, Database)" className="w-full border border-gray-400 rounded px-3 py-2 bg-white" required />
                                                <input type="text" name="image" value={newTool.image} onChange={e => setNewTool({ ...newTool, image: e.target.value })} placeholder="Tool Image URL (optional)" className="w-full border border-gray-400 rounded px-3 py-2 bg-white" />
                                                <button type="button" onClick={handleAddNewTool} className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600">Add Tool</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]">
                                {allTools.filter(t => selectedTools.includes(t.tool_id)).map(t => `${t.name} (${t.type})`).join(', ') || 'No tools assigned'}
                            </div>
                        )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-4 flex-wrap mb-2">
                        {isEditing ? (
                            <>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Live Demo Link</label>
                                <input
                                    type="text"
                                    name="live_link"
                                    value={editedProject.live_link}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] mb-4"
                                />
                                <label className="block text-sm font-medium mb-2 text-gray-700">GitHub Repo</label>
                                <input
                                    type="text"
                                    name="git_link"
                                    value={editedProject.git_link}
                                    onChange={handleInputChange}
                                    className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                                />
                            </>
                        ) : (
                            <>
                                {project.live_link && (
                                    <a href={project.live_link.startsWith('http') ? project.live_link : `https://${project.live_link}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Live Demo</a>
                                )}
                                {project.git_link && (
                                    <a href={project.git_link.startsWith('http') ? project.git_link : `https://${project.git_link}`} target="_blank" rel="noopener noreferrer" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors">GitHub Repo</a>
                                )}
                            </>
                        )}
                    </div>

                    {/* Project Images */}
                    <div className="mb-8">
                        <h3 className="text-lg text-sm text-gray-700 font-medium mb-2">Project Images</h3>
                        <div className="flex items-start gap-4 flex-wrap">
                            {/* Existing project images */}
                            {projectImages && projectImages.length > 0
                                ? projectImages.map((url, index) => (
                                    <div key={`existing-${index}`} className="relative w-32 h-32 overflow-hidden rounded-md shadow-md group">
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
                                ))
                                : null
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
                            
                            {/* Show "No images" message only if no existing or new images */}
                            {(!projectImages || projectImages.length === 0) && (!isEditing || !newImages || newImages.length === 0) && (
                                <span className="text-gray-500">No images available</span>
                            )}
                            
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

export default ProjectDetails;