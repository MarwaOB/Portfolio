import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

const AdminPanel = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 w-full p-6 bg-gray-100 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;
