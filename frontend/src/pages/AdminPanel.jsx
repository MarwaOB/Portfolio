import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

const AdminPanel = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-66 w-[calc(82%-24px)] p-6 bg-[#CED9E5]  rounded-[35px] h-[calc(100vh-54px)] fixed top-[27px] right-[24px]" >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;
