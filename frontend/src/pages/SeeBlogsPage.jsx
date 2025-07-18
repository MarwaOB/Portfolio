import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SeeBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [activeButton, setActiveButton] = useState("see");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3000/api/posts")
      .then(res => {
        // Sort blogs by date (newest first), then by ID (greater first) for same dates
        const sortedBlogs = res.data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          // Primary sort: by date (newest first)
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA;
          }
          
          // Secondary sort: by ID (greater first) when dates are the same
          return b.post_id - a.post_id;
        });
        setBlogs(sortedBlogs);
      })
      .catch(err => {
        console.error("❌ Erreur lors de la récupération des blogs :", err);
      });
  }, []);

  const handleDelete = (post_id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    axios.post("http://localhost:3000/api/posts/delete", { post_id })
      .then(() => {
        // Remove the blog locally after deletion in the database
        setBlogs(prev => prev.filter(blog => blog.post_id !== post_id));
        console.log("✅ Blog supprimé avec succès");
      })
      .catch(err => {
        console.error("❌ Erreur lors de la suppression du blog :", err);
        alert("Erreur lors de la suppression du blog");
      });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-8 flex">
        <Link to="/admin/blogs/new" className={`relative ${activeButton === "new" ? 'z-20' : 'z-10'}`}>
          <button
            className={`border border-black px-4 py-1 rounded-l transition-all duration-150 ${
              activeButton === "new"
                ? "bg-[#2D2A26] text-white -mr-2 shadow-lg rounded-r-lg z-20"
                : "bg-[#CED9E5] text-[#2D2A26] z-10"
            }`}
            style={{ position: 'relative' }}
            onClick={() => setActiveButton("new")}
          >
            Add New Blog
          </button>
        </Link>

        <Link to="/admin/blogs/see" className={`relative ${activeButton === "see" ? 'z-20' : 'z-10'}`}>
          <button
            className={`border border-black px-4 py-1 rounded-r transition-all duration-150 ${
              activeButton === "see"
                ? "bg-[#2D2A26] text-white -ml-2 shadow-lg rounded-l-lg z-20"
                : "bg-[#CED9E5] text-[#2D2A26] z-10"
            }`}
            style={{ position: 'relative' }}
            onClick={() => setActiveButton("see")}
          >
            See Blogs
          </button>
        </Link>
      </div>

      {/* Blogs List with Scroll */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {blogs.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No blogs found. Create your first blog!</p>
          </div>
        ) : (
          <div className="space-y-4 pr-2">
            {blogs.map((blog) => (
              <div
                key={blog.post_id}
                className="bg-[#BAC3CE] px-4 py-3 rounded flex justify-between items-center"
              >
                <div className="flex-1">
                  <span className="text-black font-medium">{blog.title}</span>
                  {blog.abstract && (
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                      {blog.abstract}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <span>ID: {blog.post_id}</span>
                    <span>Status: {blog.status ? "Published" : "Draft"}</span>
                    {blog.date && (
                      <span>Date: {new Date(blog.date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    className="bg-[#D62828] text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                    onClick={() => handleDelete(blog.post_id)}
                  >
                    Delete
                  </button>
                  
                  <Link to={`/admin/blogs/${blog.post_id}`}>
                    <button className="bg-[#E4C900] text-black px-3 py-1 rounded hover:bg-yellow-600 transition-colors">
                      More
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeeBlogsPage;