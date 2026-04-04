import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  PlayCircle,
  FileText,
  ClipboardList,
  ChevronLeft,
  Trash2,
  Edit2,
  Plus,
  Loader2
} from "lucide-react";

import MaterialFormModal from "../components/MaterialFormModal";
import { fetchMaterials, addMaterial, updateMaterial, deleteMaterial } from "../api";

export default function CourseMaterials() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState("videos");
  const [loading, setLoading] = useState(true);

  const [materials, setMaterials] = useState({
    videos: [],
    notes: [],
    assignments: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await fetchMaterials({ course_id: id });
      const grouped = { videos: [], notes: [], assignments: [] };
      
      data.forEach(item => {
        const type = item.type || "videos";
        if (grouped[type]) {
          grouped[type].push(item);
        }
      });
      
      setMaterials(grouped);
    } catch (err) {
      console.error("Failed to load materials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadMaterials();
    }
  }, [id]);

  // 🎥 YouTube embed
  const getEmbedUrl = (url) => {
    if (!url) return "";
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
    return match
      ? `https://www.youtube.com/embed/${match[1]}`
      : "";
  };

  // ➕ Add / Update
  const handleMaterialSubmit = async (formData) => {
    try {
      const payload = { 
        ...formData, 
        course_id: id,
        file_url: formData.url // map local url to backend file_url
      };

      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, payload);
      } else {
        await addMaterial(payload);
      }
      
      await loadMaterials();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save material", err);
    }
  };

  // ❌ Delete
  const handleDelete = async (type, materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    
    try {
      await deleteMaterial(materialId);
      await loadMaterials();
    } catch (err) {
      console.error("Failed to delete material", err);
    }
  };

  // ✏️ Edit
  const handleEdit = (item, type) => {
    // map backend file_url to local url for the form
    setEditingMaterial({ ...item, type, url: item.file_url });
    setIsModalOpen(true);
  };

  // ➕ Open Add
  const handleAdd = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft />
          </button>
          <h1 className="text-xl font-bold">Course Materials</h1>
        </div>

        {isAdmin && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-3 py-2 rounded-md"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {["videos", "notes", "assignments"].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 capitalize ${activeTab === tab ? "border-b-2 border-[var(--color-primary)] font-bold" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data states */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <>
          {materials[activeTab].length === 0 && (
            <div className="text-center py-10 text-[var(--color-text-muted)] border rounded border-dashed">
              No materials added yet.
            </div>
          )}

          {/* VIDEOS */}
          {activeTab === "videos" &&
            materials.videos.map((v) => (
              <div key={v.id} className="p-4 border rounded">
                <div className="flex justify-between mb-2">
                  <p className="font-bold">{v.title}</p>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(v, "videos")}>
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete("videos", v.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>

                <iframe src={getEmbedUrl(v.file_url)} className="w-full h-60 rounded border" />
              </div>
            ))}

          {/* NOTES & ASSIGNMENTS (Unified View) */}
          {["notes", "assignments"].includes(activeTab) &&
            materials[activeTab].map((item) => (
              <div key={item.id} className="flex justify-between items-center border p-4 rounded bg-[var(--color-bg-alt)] hover:shadow-sm transition-all">
                <a href={item.file_url} target="_blank" rel="noreferrer" className="font-medium text-[var(--color-primary)] hover:underline flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {item.title}
                </a>

                {isAdmin && (
                  <div className="flex gap-4 border-l pl-4">
                    <button onClick={() => handleEdit(item, activeTab)}>
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(activeTab, item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </>
      )}

      {/* Modal */}
      {isAdmin && (
        <MaterialFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          materialData={editingMaterial}
          onSubmit={handleMaterialSubmit}
        />
      )}
    </div>
  );
}