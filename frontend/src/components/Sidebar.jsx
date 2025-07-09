import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const links = [
    { name: "Profile", path: "/admin/profile" },
    { name: "Projects", path: "/admin/projects" },
    { name: "Blogs", path: "/admin/blogs" },
    { name: "Services", path: "/admin/services" },
    { name: "Client Commands", path: "/admin/commands" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4 space-y-4 fixed">
      {links.map(link => (
        <NavLink
          key={link.name}
          to={link.path}
          className="block py-2 px-4 rounded hover:bg-gray-700"
        >
          {link.name}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
