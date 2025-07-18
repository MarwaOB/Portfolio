import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";

function AddBlogPage() {
  const [values, setValues] = useState({
    title: "",
    description: "",
    status: "",
  });
  const [activeButton, setActiveButton] = useState("new");
  const [images, setImages] = useState([]);
  const [contentImages, setContentImages] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  const editorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: "editorjs",
        tools: {
          header: Header,
          list: List,
          image: {
            class: ImageTool,
            inlineToolbar: true,
            config: {
              uploader: {
                uploadByFile(file) {
                  return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const base64 = reader.result;
                      setContentImages((prev) => [...prev, base64]);
                      resolve({
                        success: 1,
                        file: {
                          url: base64,
                        },
                      });
                    };
                    reader.onerror = () => reject(new Error("File reading failed"));
                    reader.readAsDataURL(file);
                  });
                },
              },
            },
          },
        },
        data: {},
        onReady: () => {
          console.log("Editor.js is ready");
        },
      });
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }

      images.forEach((src) => URL.revokeObjectURL(src));
    };
  }, []);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...imagePreviews]);
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const editorData = await editorRef.current.save();
console.log("🧾 Editor Data:", editorData);


      const dataToSend = {
        title: values.title,
        abstract: values.description,
        head_image: images[0] || null,
        status: values.status === "true" || values.status === true,
        content: editorData || {},
        date: new Date().toISOString().split("T")[0],
      };

      console.log("📦 Données envoyées :", dataToSend);

      const res = await axios.post("http://localhost:3000/api/posts", dataToSend);
      const postId = res.data.post_id;

      for (const keyword of keywords) {
        await axios.post("http://localhost:3000/api/posts/add_keyword", {
          post_id: postId,
          keyword,
        });
      }

      navigate("/admin/blogs/see");
    } catch (err) {
      console.error("❌ Erreur lors de l'envoi :", err);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-8 flex-shrink-0 flex">
        <Link to="/admin/blogs/new">
          <button
            className={`border border-black px-4 py-1 rounded-l transition-all duration-150 ${
              activeButton === "new"
                ? "bg-[#2D2A26] text-white -mr-2 shadow-lg rounded-r-lg"
                : "bg-[#CED9E5] text-[#2D2A26]"
            }`}
            onClick={() => setActiveButton("new")}
          >
            Add New Blog
          </button>
        </Link>
        <Link to="/admin/blogs/see">
          <button
            className={`border border-black px-4 py-1 rounded-r transition-all duration-150 ${
              activeButton === "see"
                ? "bg-[#2D2A26] text-white -ml-2 shadow-lg rounded-l-lg"
                : "bg-[#CED9E5] text-[#2D2A26]"
            }`}
            onClick={() => setActiveButton("see")}
          >
            See Blogs
          </button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-100">
            <div className="w-80">
              <label className="block text-sm font-medium mb-2 text-gray-700">Blog Title</label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Blog Description</label>
            <textarea
              rows={4}
              name="description"
              value={values.description}
              onChange={handleChange}
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] focus:outline-none focus:border-blue-500 resize-none"
              required
            />
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Blog Images</h3>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="relative w-32 h-32 border-2 border-dashed flex items-center justify-center text-gray-500 cursor-pointer bg-white">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-sm text-center z-10">Upload an image</span>
              </div>

              {images.map((src, index) => (
                <div key={index} className="w-32 h-32 overflow-hidden rounded-md shadow-md">
                  <img src={src} alt={`upload-${index}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (Tags)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                className="border border-gray-400 rounded px-3 py-1 bg-white w-[250px]"
                placeholder="Add a keyword and press Enter"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {keywords.map((kw, idx) => (
                <span key={idx} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Content</label>
            <div id="editorjs" className="border border-gray-400 rounded bg-white px-3 py-2 min-h-[300px]"></div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-1 rounded font-medium hover:bg-green-700 transition-colors mr-4"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBlogPage;