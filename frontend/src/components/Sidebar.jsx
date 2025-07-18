import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { logout, user } = useAuth();
  
  const links = [
    { name: "Projects", path: "/admin/projects/new", imgSrc: "/icons/Idea.svg" },
    { name: "Blogs", path: "/admin/blogs/new", imgSrc: "/icons/blogs.svg" },
    { name: "Services", path: "/admin/services/new", imgSrc: "/icons/Service.svg" },
    { name: "Orders", path: "/admin/orders/see", imgSrc: "/icons/orders.svg" },
  ];

  const handleLogout = () => {
    logout();
    // The ProtectedRoute will automatically redirect to login
  };

  return ( 
    <aside className="w-[15%] h-[calc(100vh-54px)] bg-[#2D2A26] text-white p-4 flex flex-col justify-between fixed rounded-[35px] ml-[24px] top-[27px]">
      <div>
        <h2 className="font-[orbitron] text-[24px] font-bold text-center mb-25 mt-18">DEV TEAM</h2>
        
        {/* User info */}
        
        {/* Top Links */}
        <div className="space-y-1 mx-auto">
          {links.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className="flex items-center gap-3 py-2 px-4 rounded hover:bg-gray-700 mx-auto font-[regular] text-[20px]"
            >
              <img src={link.imgSrc} alt={link.name} className="w-8 h-8" />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Logout at bottom */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-[178px] h-[34px] mx-auto mb-5 flex items-center justify-center gap-3 rounded-[4px] bg-[#CED9E5] text-black hover:bg-[#b8c9d9] transition-colors font-[Space Grotesk] text-[18px]"
        >
          <img src="/icons/Arrow.svg" alt="Logout" className="w-8 h-8" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;