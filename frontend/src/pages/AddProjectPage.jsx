import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AddProjectPage() {
  const [values, setValues] = useState({
    title: "",
    description: "",
    live_link: "",
    git_link: "",
    start_date: "",
    end_date: "",
    demo: "", // Add demo field
  });

  const [activeButton, setActiveButton] = useState("new");
  const [selectedImages, setSelectedImages] = useState([]);
  const [images, setImages] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [newTool, setNewTool] = useState({
    name: "",
    type: "",
    image: ""
  });
  const [newClient, setNewClient] = useState({
    name: "",
    tel: "",
    e_mail: "",
    image: ""
  });
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showNewToolForm, setShowNewToolForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch all tools and clients on component mount
  useEffect(() => {
    fetchTools();
    fetchClients();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/projects/allTools");
      setAllTools(response.data);
    } catch (error) {
      console.error("Error fetching tools:", error.response?.data || error.message);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/projects/allClients");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error.response?.data || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({ 
      ...values, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleNewToolChange = (e) => {
    setNewTool({ ...newTool, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    const imagePreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...imagePreviews]);
  };

  const handleToolSelection = (toolId) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleNewClientChange = (e) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const handleAddNewClient = async () => {
    if (!newClient.name) {
      alert("Please fill in client name");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/projects/clients", newClient);
      // Refresh clients list
      fetchClients();
      // Reset form
      setNewClient({ name: "", tel: "", e_mail: "", image: "" });
      setShowNewClientForm(false);
      alert("Client added successfully!");
    } catch (error) {
      console.error("Error adding client:", error);
      alert("Failed to add client");
    }
  };

  const handleAddNewTool = async () => {
    if (!newTool.name || !newTool.type) {
      alert("Please fill in tool name and type");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/projects/tools/add", newTool);
      // Refresh tools list
      fetchTools();
      // Reset form
      setNewTool({ name: "", type: "", image: "" });
      setShowNewToolForm(false);
      alert("Tool added successfully!");
    } catch (error) {
      console.error("Error adding tool:", error);
      alert("Failed to add tool");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!values.title || !values.description || !values.start_date || !values.end_date ) {
      alert("Please fill in all required fields");
      setLoading(false);
      return;
    }

    
  // Check if end date is greater than start date
  if (new Date(values.end_date) <= new Date(values.start_date)) {
    alert("End date must be greater than start date");
    setLoading(false);
    return;
  }

    if (selectedTools.length === 0) {
      alert("Please select at least one tool");
      setLoading(false);
      return;
    }

    if (!selectedClient) {
      alert("Please select a client");
      setLoading(false);
      return;
    }

    try {
      // 1. Add the project first
      const projectResponse = await axios.post("http://localhost:3000/api/projects", values);
      console.log("Project created:", projectResponse.data);

      // 2. Get the project ID from the response
      let projectId;
      
      if (projectResponse.data.project_id) {
        projectId = projectResponse.data.project_id;
      } else {
        // Fallback: Get all projects and find the one we just created
        const allProjectsResponse = await axios.get("http://localhost:3000/api/projects");
        const projects = allProjectsResponse.data;
        const newProject = projects.find(p => p.title === values.title) || projects[projects.length - 1];
        projectId = newProject.project_id;
      }

      console.log("Project ID:", projectId);

      // 3. Add the demo to project_demos table
      if (values.live_link) {
        try {
          await axios.post("http://localhost:3000/api/projects/demo", {
            project_id: projectId,
            demo: values.live_link
          });
          console.log("Demo added successfully");
        } catch (demoError) {
          console.error("Error adding demo to project:", demoError);
        }
      }

      // 4. Add selected tools to the project
      for (const toolId of selectedTools) {
        try {
          console.log("Adding tool", toolId, "to project", projectId);
          await axios.post("http://localhost:3000/api/projects/add_project_tool", {
            project_id: projectId,
            tool_id: toolId
          });
          console.log("Tool added successfully");
        } catch (toolError) {
          console.error("Error adding tool to project:", toolError);
        }
      }

      // 5. Add client to project
      if (selectedClient) {
        try {
          await axios.post("http://localhost:3000/api/projects/add_project_client", {
            project_id: projectId,
            client_id: selectedClient
          });
        } catch (clientError) {
          console.error("Error adding client to project:", clientError);
        }
      }

      // 6. Add images to project
      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append('project_id', projectId);
        formData.append('image', image);
        try {
          await axios.post("http://localhost:3000/api/projects/upload_image", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        } catch (imageError) {
          console.error("Error adding image to project:", imageError);
        }
      }

      console.log("Project added successfully!");
      alert("Project added successfully!");
      navigate("/admin/projects/see");
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          {/* Start Date & End Date */}
          <div className="flex gap-8">
            <div className="w-80">
              <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={values.start_date}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                required
              />
            </div>
            <div className="w-80">
              <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={values.end_date}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
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

        

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Client
            </label>
            
            {/* Existing Clients Dropdown */}
            <div className="mb-4">
              <h4 className="text-sm font-normal mb-2">Select from existing clients:</h4>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
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

            {/* Add New Client */}
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
                    <input
                      type="text"
                      name="name"
                      value={newClient.name}
                      onChange={handleNewClientChange}
                      placeholder="Client Name"
                      className="w-full border border-gray-400 rounded px-3 py-2 bg-white"
                      required
                    />
                    <input
                      type="tel"
                      name="tel"
                      value={newClient.tel}
                      onChange={handleNewClientChange}
                      placeholder="Phone Number (optional)"
                      className="w-full border border-gray-400 rounded px-3 py-2 bg-white"
                    />
                    <input
                      type="email"
                      name="e_mail"
                      value={newClient.e_mail}
                      onChange={handleNewClientChange}
                      placeholder="Email (optional)"
                      className="w-full border border-gray-400 rounded px-3 py-2 bg-white"
                    />
                    <input
                      type="text"
                      name="image"
                      value={newClient.image}
                      onChange={handleNewClientChange}
                      placeholder="Client Image URL (optional)"
                      className="w-full border border-gray-400 rounded px-3 py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewClient}
                      className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                    >
                      Add Client
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tools Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Tools Used
            </label>
            
            {/* Existing Tools */}
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
                          onChange={() => handleToolSelection(tool.tool_id)}
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

            {/* Add New Tool */}
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
                    <input
                      type="text"
                      name="name"
                      value={newTool.name}
                      onChange={handleNewToolChange}
                      placeholder="Tool Name"
                      className="w-full border border-gray-400 rounded px-3 py-2 bg-white"
                      required
                    />
                    <input
                      type="text"
                      name="type"
                      value={newTool.type}
                      onChange={handleNewToolChange}
                      placeholder="Tool Type (e.g., Frontend, Backend, Database)"
                      className="w-full border border-gray-400 rounded px-3 py-2 bg-white"
                      required
                    />
                    <input
                      type="text"
                      name="image"
                      value={newTool.image}
                      onChange={handleNewToolChange}
                      placeholder="Tool Image URL (optional)"
                      className="w-full border border-gray-400 rounded px-3 py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewTool}
                      className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                    >
                      Add Tool
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className="text-sm text-gray-700 font-medium mb-2">Project Images</h3>
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

          {/* Links */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Live Demo Link</label>
              <input
                type="text"
                name="live_link"
                value={values.live_link}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                placeholder="www.example.com or https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">GitHub Repository</label>
              <input
                type="text"
                name="git_link"
                value={values.git_link}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
                placeholder="github.com/username/repo or https://github.com/username/repo"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-2 rounded font-medium hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProjectPage;