import './App.css'
import "tailwindcss";
import {BrowserRouter, Routes,Route } from 'react-router-dom';
import AdminPanel from "./pages/AdminPanel";
import AddProjectPage from "./pages/AddProjectPage";
import SeeProjectsPage from "./pages/SeeProjectsPage";
import ProjectDetails from "./pages/ProjectDetails";

import AddBlogPage from "./pages/AddBlogPage";
import SeeBlogssPage from "./pages/SeeBlogsPage";
import BlogDetails from "./pages/BlogDetails";

import SeeOrdersPage from "./pages/SeeOrdersPage";
import OrderDetails from "./pages/OrderDetails";

import AddServicePage from "./pages/AddServicePage";
import SeeServicesPage from "./pages/SeeServicesPage";  
import ServiceDetails from "./pages/ServiceDetails";
import ServicesPage from './pages/servicePage';

//import ServicesPage from "./pages/ServicesPage";
//        <Route path="services" element={<ServicesPage />} />

function App() {

 return (
/*
    <BrowserRouter>
      <Routes>
      <Route path="/admin" element={<AdminPanel />}>   

      <Route path="projects/new" element={<AddProjectPage />} />
      <Route path="projects/see" element={<SeeProjectsPage />} />
      <Route path="projects/:id" element={<ProjectDetails />} />

        <Route path="blogs/new" element={<AddBlogPage />} />
      <Route path="blogs/see" element={<SeeBlogssPage />} />
      <Route path="blogs/:id" element={<BlogDetails />} />

           <Route path="orders/see" element={<SeeOrdersPage />} />
      <Route path="orders/:id" element={<OrderDetails />} />

 <Route path="services/new" element={<AddServicePage />} />
      <Route path="services/see" element={<SeeServicesPage />} />
      <Route path="services/:id" element={<ServiceDetails />} />

      </Route>
    </Routes>
    </BrowserRouter>  */
    <ServicesPage/>
  );
}

export default App
