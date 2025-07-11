import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SeeServicesPage() {
    const services = Array(15).fill("Service1: XXXX YYYYY"); // More blogs to show scroll
    
    const [activeButton, setActiveButton] = useState("see");

    return (
        <div className="h-full flex flex-col overflow-hidden">  
              <div className="mb-8 flex">
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
      
            {/* Blogs List with Scroll */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4 pr-2">
                    {services.map((title, idx) => (
                        <div
                            key={idx}
                            className="bg-[#BAC3CE] px-4 py-3 rounded flex justify-between items-center"
                        >
                            <span className="text-black font-medium">{title} #{idx + 1}</span>
                            <div className="flex gap-2">
                                <button className="bg-[#D62828] text-white px-3 py-1 rounded">
                                    Delete
                                </button>
                                <Link to={`/admin/services/${idx + 1}`}>
                                    <button className="bg-[#E4C900] text-black px-3 py-1 rounded">
                                        More
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SeeServicesPage;