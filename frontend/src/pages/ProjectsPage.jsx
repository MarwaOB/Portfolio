import { Link } from "react-router-dom";

const ProjectsPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      <Link to="/admin/projects/new">

      <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        + Add Project
      </button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Later map through your projects here */}
        <div className="p-4 bg-white rounded shadow">Project card here</div>
      </div>
    </div>
  );
};

export default ProjectsPage;
