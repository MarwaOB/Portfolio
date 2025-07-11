import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SeeProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [activeButton, setActiveButton] = useState("see");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/projects");
                setProjects(response.data);
            } catch (err) {
                setError("Failed to load projects");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await axios.post('http://localhost:5000/api/delete_project', { id });
            setProjects(projects.filter((project) => project.id !== id));
        } catch (err) {
            alert('Failed to delete project.');
            console.error(err);
        }
    };




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
                                    key={project.id}
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
                                            onClick={() => handleDelete(project.id)}
                                        >
                                            Delete
                                        </button>
                                        <Link to={`/admin/projects/${project.id}`}>
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