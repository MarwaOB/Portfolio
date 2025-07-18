import './App.css'
import "tailwindcss";
import {BrowserRouter, Routes,Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TokenVerificationPage from './pages/TokenVerificationPage';

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

function App() {
 return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/verify" element={<TokenVerificationPage />} />
          
          {/* Protected admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }>   
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
          
          {/* Redirect root to login */}
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
