import './App.css'
import "tailwindcss";
import {BrowserRouter, Routes,Route } from 'react-router-dom';
import AdminPanel from "./pages/AdminPanel";
import ProjectsPage from "./pages/ProjectsPage";
import AddProjectPage from "./pages/AddProjectPage";
  
//import BlogsPage from "./pages/BlogsPage";
//import ServicesPage from "./pages/ServicesPage";
//import CommandsPage from "./pages/CommandsPage";
//import ProfilePage from "./pages/ProfilePage";
//<Route path="blogs" element={<BlogsPage />} />
//        <Route path="services" element={<ServicesPage />} />
//        <Route path="commands" element={<CommandsPage />} />

//<Route path="profile" element={<ProfilePage />} />
function App() {

 return (
    <BrowserRouter>
      <Routes>
      <Route path="/admin" element={<AdminPanel />}>
        
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<AddProjectPage />} />

        
      </Route>
    </Routes>
    </BrowserRouter>  
  );
}

export default App
