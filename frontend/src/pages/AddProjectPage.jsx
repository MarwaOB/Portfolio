import React, { useState } from 'react'
import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom'

function AddProjectPage() {
    const [values, setValues] = useState({
       title: "",
    description: "",
    image_url: "",
    tools_used: "",
    demo_link: "",
    })

    const navigate = useNavigate()

    function handleSubmit(e){
        e.preventDefault()

        axios.post('//localhost:5000/api/add_project', values)
        .then((res)=>{
            
            navigate('/admin/projects')
            console.log(res)
        })
        .catch((err)=>console.log(err))
    }

    const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
       <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Title" className="w-full border p-2" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" className="w-full border p-2" onChange={handleChange} required />
        <input name="image_url" placeholder="Image URL" className="w-full border p-2" onChange={handleChange} />
        <input name="tools_used" placeholder="Tools Used" className="w-full border p-2" onChange={handleChange} />
        <input name="demo_link" placeholder="Demo Link" className="w-full border p-2" onChange={handleChange} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Project
        </button>
      </form>
    </div>

  )
}

export default AddProjectPage