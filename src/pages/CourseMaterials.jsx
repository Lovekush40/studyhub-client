import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  PlayCircle,
  FileText,
  ClipboardList,
  ChevronLeft,
  Trash2,
  Edit2,
  Plus
} from "lucide-react";

import MaterialFormModal from "../components/MaterialFormModal";

export default function CourseMaterials() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState("videos");

  const [materials, setMaterials] = useState({
    videos: [],
    notes: [],
    assignments: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  // 🎥 YouTube embed
  const getEmbedUrl = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
    return match
      ? `https://www.youtube.com/embed/${match[1]}`
      : "";
  };

  // ➕ Add / Update
  const handleMaterialSubmit = (formData) => {
    if (editingMaterial) {
      setMaterials((prev) => ({
        ...prev,
        [formData.type]: prev[formData.type].map((item) =>
          item.id === editingMaterial.id ? { ...item, ...formData } : item
        )
      }));
    } else {
      const newItem = {
        id: Date.now(),
        ...formData
      };

      setMaterials((prev) => ({
        ...prev,
        [formData.type]: [...prev[formData.type], newItem]
      }));
    }

    setIsModalOpen(false);
  };

  // ❌ Delete
  const handleDelete = (type, id) => {
    setMaterials((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.id !== id)
    }));
  };

  // ✏️ Edit
  const handleEdit = (item, type) => {
    setEditingMaterial({ ...item, type });
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
          <button key={tab} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* VIDEOS */}
      {activeTab === "videos" &&
        materials.videos.map((v) => (
          <div key={v.id} className="p-4 border rounded">
            <div className="flex justify-between">
              <p>{v.title}</p>

              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(v, "videos")}>
                    <Edit2 />
                  </button>
                  <button onClick={() => handleDelete("videos", v.id)}>
                    <Trash2 />
                  </button>
                </div>
              )}
            </div>

            <iframe src={getEmbedUrl(v.url)} className="w-full h-60" />
          </div>
        ))}

      {/* NOTES */}
      {activeTab === "notes" &&
        materials.notes.map((n) => (
          <div key={n.id} className="flex justify-between border p-3 rounded">
            <a href={n.url}>{n.title}</a>

            {isAdmin && (
              <div className="flex gap-2">
                <button onClick={() => handleEdit(n, "notes")}>
                  <Edit2 />
                </button>
                <button onClick={() => handleDelete("notes", n.id)}>
                  <Trash2 />
                </button>
              </div>
            )}
          </div>
        ))}

      {/* ASSIGNMENTS */}
      {activeTab === "assignments" &&
        materials.assignments.map((a) => (
          <div key={a.id} className="flex justify-between border p-3 rounded">
            <a href={a.url}>{a.title}</a>

            {isAdmin && (
              <div className="flex gap-2">
                <button onClick={() => handleEdit(a, "assignments")}>
                  <Edit2 />
                </button>
                <button onClick={() => handleDelete("assignments", a.id)}>
                  <Trash2 />
                </button>
              </div>
            )}
          </div>
        ))}

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