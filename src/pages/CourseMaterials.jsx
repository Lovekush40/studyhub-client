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
  Loader2,
  BookOpen
} from "lucide-react";

import MaterialFormModal from "../components/MaterialFormModal";
import { fetchMaterials, addMaterial, updateMaterial, deleteMaterial, getCourse } from "../api";

export default function CourseMaterials() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [courseName, setCourseName] = useState("");
  const [course, setCourse] = useState(null);
  const [activeSubject, setActiveSubject] = useState("");
  const [loading, setLoading] = useState(true);

  // Materials grouped by subject then by type
  const [materials, setMaterials] = useState({});
  const [subjects, setSubjects] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  const loadMaterials = async () => {
    setLoading(true);
    try {
      // Fetch course to get subjects
      const courseData = await getCourse(id);
      setCourse(courseData);
      setCourseName(courseData.name || courseData.course_name);
      const courseSubjects = courseData.subjects || [];
      setSubjects(courseSubjects);
      
      if (courseSubjects.length > 0) {
        setActiveSubject(courseSubjects[0]);
      }

      // Fetch materials for this course
      const data = await fetchMaterials({ course_id: id });
      
      // Group materials by subject then by type
      const grouped = {};
      courseSubjects.forEach(subject => {
        grouped[subject] = {
          videos: [],
          notes: [],
          assignments: []
        };
      });

      // If no subjects defined, create a default one
      if (courseSubjects.length === 0) {
        grouped["General"] = {
          videos: [],
          notes: [],
          assignments: []
        };
      }

      // Distribute materials into groups
      data.forEach(item => {
        const subjectName = item.subject_name || item.subject_id || (courseSubjects[0] || "General");
        const type = item.type || "videos";
        
        if (!grouped[subjectName]) {
          grouped[subjectName] = {
            videos: [],
            notes: [],
            assignments: []
          };
        }
        
        if (grouped[subjectName][type]) {
          grouped[subjectName][type].push(item);
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
        subject_name: selectedSubject,
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
  const handleDelete = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    
    try {
      await deleteMaterial(materialId);
      await loadMaterials();
    } catch (err) {
      console.error("Failed to delete material", err);
    }
  };

  // ✏️ Edit
  const handleEdit = (item) => {
    // map backend file_url to local url for the form
    setEditingMaterial({ ...item, type: item.type || "videos", url: item.file_url });
    setSelectedSubject(item.subject_name || item.subject_id || activeSubject);
    setIsModalOpen(true);
  };

  // ➕ Open Add
  const handleAdd = () => {
    setEditingMaterial(null);
    setSelectedSubject(activeSubject);
    setIsModalOpen(true);
  };

  const currentSubjectMaterials = materials[activeSubject] || { videos: [], notes: [], assignments: [] };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{courseName}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Course Materials</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-3 py-2 rounded-md hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        )}
      </div>

      {/* Subject Tabs */}
      {subjects.length > 0 && (
        <div className="flex gap-2 border-b overflow-x-auto">
          {subjects.map((subject) => (
            <button 
              key={subject} 
              onClick={() => setActiveSubject(subject)}
              className={`py-3 px-4 whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${
                activeSubject === subject 
                  ? "border-[var(--color-primary)] text-[var(--color-primary)] font-semibold" 
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {subject}
            </button>
          ))}
        </div>
      )}

      {/* Data states */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* VIDEOS Section */}
          {currentSubjectMaterials.videos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-500" />
                Videos
              </h3>
              <div className="grid gap-4">
                {currentSubjectMaterials.videos.map((v) => (
                  <div key={v.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-3">
                      <p className="font-semibold text-base">{v.title}</p>

                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(v)} className="p-1 hover:bg-blue-100 rounded">
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-1 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    {v.description && <p className="text-sm text-[var(--color-text-muted)] mb-2">{v.description}</p>}
                    <iframe 
                      src={getEmbedUrl(v.file_url)} 
                      className="w-full h-64 rounded-lg border"
                      title={v.title}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES Section */}
          {currentSubjectMaterials.notes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Study Notes
              </h3>
              <div className="space-y-2">
                {currentSubjectMaterials.notes.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border p-4 rounded-lg bg-[var(--color-bg-alt)] hover:shadow-sm transition-all">
                    <div className="flex-1">
                      <a href={item.file_url} target="_blank" rel="noreferrer" className="font-medium text-[var(--color-primary)] hover:underline flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {item.title}
                      </a>
                      {item.description && <p className="text-sm text-[var(--color-text-muted)] mt-1">{item.description}</p>}
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 border-l pl-4 ml-4">
                        <button onClick={() => handleEdit(item)} className="p-1 hover:bg-blue-100 rounded">
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSIGNMENTS Section */}
          {currentSubjectMaterials.assignments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-green-500" />
                Assignments
              </h3>
              <div className="space-y-2">
                {currentSubjectMaterials.assignments.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border p-4 rounded-lg bg-[var(--color-bg-alt)] hover:shadow-sm transition-all">
                    <div className="flex-1">
                      <a href={item.file_url} target="_blank" rel="noreferrer" className="font-medium text-[var(--color-primary)] hover:underline flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" /> {item.title}
                      </a>
                      {item.description && <p className="text-sm text-[var(--color-text-muted)] mt-1">{item.description}</p>}
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 border-l pl-4 ml-4">
                        <button onClick={() => handleEdit(item)} className="p-1 hover:bg-blue-100 rounded">
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {currentSubjectMaterials.videos.length === 0 && 
           currentSubjectMaterials.notes.length === 0 && 
           currentSubjectMaterials.assignments.length === 0 && (
            <div className="text-center py-12 text-[var(--color-text-muted)] border rounded-lg border-dashed">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No materials added yet for {activeSubject}</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isAdmin && (
        <MaterialFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          materialData={editingMaterial}
          onSubmit={handleMaterialSubmit}
          subjects={subjects}
          preSelectedSubject={selectedSubject}
        />
      )}
    </div>
  );
}
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