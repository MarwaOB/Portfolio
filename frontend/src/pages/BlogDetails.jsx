import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";

function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    title: "",
    description: "",
    status: false,
  });
  const [images, setImages] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  const editorRef = useRef(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/posts/${id}`);
        const blog = res.data;
        
        console.log('Loaded blog data:', blog); // Debug log
        
        setValues({
          title: blog.title || "",
          description: blog.abstract || "",
          status: blog.status || false,
        });
        setImages(blog.head_image ? [blog.head_image] : []);
        setKeywords(blog.keywords || []);

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
                          resolve({ success: 1, file: { url: base64 } });
                        };
                        reader.onerror = () => reject(new Error("Erreur lecture fichier"));
                        reader.readAsDataURL(file);
                      });
                    },
                  },
                },
              },
            },
            data: blog.content || { blocks: [] },
            onReady: () => {
              console.log("✏️ EditorJS prêt pour l'édition");
            },
          });
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement :", err);
        console.error("Error response:", err.response?.data);
        // You might want to show a user-friendly error message here
      }
    };

    loadPost();

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [id]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImages([base64]);
    };
    reader.readAsDataURL(file);
  };

  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter(kw => kw !== keywordToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const editorData = await editorRef.current.save();

      const dataToSend = {
        title: values.title,
        abstract: values.description,
        head_image: images[0] || null,
        status: values.status === "true" || values.status === true,
        content: editorData,
        date: new Date().toISOString().split("T")[0],
      };

      await axios.put(`http://localhost:3000/api/posts/${id}`, dataToSend);

      await axios.post("http://localhost:3000/api/posts/update_keywords", {
        post_id: id,
        keywords,
      });

      navigate("/admin/blogs/see");
    } catch (err) {
      console.error("❌ Échec de la modification :", err);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-8 flex-shrink-0 flex">
        <Link to="/admin/blogs/new">
          <button className="border border-black px-4 py-1 rounded-l bg-[#CED9E5] text-[#2D2A26]">Add New Blog</button>
        </Link>
        <Link to="/admin/blogs/see">
          <button className="border border-black px-4 py-1 rounded-r bg-[#2D2A26] text-white -ml-2 shadow-lg rounded-l-lg">See Blogs</button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <form onSubmit={handleSubmit}>
          <div className="w-80 mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Blog Title</label>
            <input
              type="text"
              name="title"
              value={values.title}
              onChange={handleChange}
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Blog Description</label>
            <textarea
              rows={4}
              name="description"
              value={values.description}
              onChange={handleChange}
              className="w-[97%] border border-gray-400 rounded px-3 py-2 bg-[#CED9E5] resize-none"
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Head Image</h3>
            <div className="flex gap-4 flex-wrap">
             

              {images.length > 0 && (
                <div className="relative w-32 h-32">
                  <img
                    src={images[0]}
                    alt="Head image"
                    className="w-full h-full object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setImages([])}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
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
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {keywords.map((kw, idx) => (
                <span key={idx} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Content</label>
            <div id="editorjs" className="border border-gray-400 rounded bg-white px-3 py-2 min-h-[300px]"></div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-1 rounded font-medium hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BlogDetails;