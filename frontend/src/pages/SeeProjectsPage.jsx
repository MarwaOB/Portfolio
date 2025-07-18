import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SeeProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeButton, setActiveButton] = useState("see");
    
    const navigate = useNavigate();

    // Fetch projects from backend
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:3000/api/projects");
            setProjects(response.data);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project? This will also delete all associated images, demos, clients, and tools.")) {
            try {
                // 1. Get all images
                const imagesResponse = await axios.get(`http://localhost:3000/api/projects/${projectId}/images`);
                const projectImages = imagesResponse.data;
                for (const imageData of projectImages) {
                    await axios.post("http://localhost:3000/api/projects/remove_image", {
                        project_id: projectId,
                        image: imageData.image
                    });
                }

                // 2. Get all demos
                const demosResponse = await axios.get(`http://localhost:3000/api/projects/${projectId}/demos`);
                const projectDemos = demosResponse.data;
                for (const demoData of projectDemos) {
                    await axios.post("http://localhost:3000/api/projects/remove_demo", {
                        project_id: projectId,
                        demo: demoData.demo
                    });
                }

                // 3. Get all clients
                const clientsResponse = await axios.get(`http://localhost:3000/api/projects/${projectId}/clients`);
                const projectClients = clientsResponse.data;
                for (const clientData of projectClients) {
                    await axios.post("http://localhost:3000/api/projects/remove_project_client", {
                        project_id: projectId,
                        client_id: clientData.client_id
                    });
                }

                // 4. Get all tools
                const toolsResponse = await axios.get(`http://localhost:3000/api/projects/${projectId}/tools`);
                const projectTools = toolsResponse.data;
                for (const toolData of projectTools) {
                    await axios.post("http://localhost:3000/api/projects/remove_project_tool", {
                        project_id: projectId,
                        tool_id: toolData.tool_id
                    });
                }

                // 5. Delete the project itself
                await axios.post("http://localhost:3000/api/projects/delete", {
                    project_id: projectId
                });

                // Remove the deleted project from the state
                setProjects(projects.filter(project => project.project_id !== projectId));
                
                console.log("Project and all associated data deleted successfully");
            } catch (err) {
                console.error("Error deleting project:", err);
                alert("Failed to delete project");
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
                    <div className="text-red-600">{error}</div>
                </div>
            </div>
        );
    }

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
            {/* Projects List with Scroll */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                    <div className="text-center py-8">Loading projects...</div>
                ) : error ? (
                    <div className="text-center text-red-600 py-8">{error}</div>
                ) : (
                    <div className="space-y-4 pr-2">
                        {projects.length === 0 ? (
                            <div className="text-center py-8">No projects found.</div>
                        ) : (
                            projects.map((project) => (
                                <div
                                    key={project.project_id}
                                    className="bg-[#BAC3CE] px-4 py-3 rounded flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-4">
                                        {project.thumbnail && (
                                            <img src={project.thumbnail} alt={project.title} className="w-12 h-12 object-cover rounded shadow" />
                                        )}
                                        <span className="text-black font-medium">{project.title}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="bg-[#D62828] text-white px-3 py-1 rounded"
                                            onClick={() => handleDelete(project.project_id)}
                                        >
                                            Delete
                                        </button>
                                        <Link to={`/admin/projects/${project.project_id}`}>
                                            <button className="bg-[#E4C900] text-black px-3 py-1 rounded">
                                                More
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SeeProjectsPage;