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
  const [activeMaterialType, setActiveMaterialType] = useState(null); // 'videos', 'notes', 'assignments'
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
              onClick={() => {
                setActiveSubject(subject);
                setActiveMaterialType(null); // Reset category view when subject changes
              }}
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
          {activeMaterialType === null ? (
            // The Three Boxes View
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Videos Box */}
              <button 
                onClick={() => setActiveMaterialType('videos')}
                className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all group"
              >
                <div className="p-4 bg-blue-50 text-blue-500 rounded-full mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <PlayCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Videos</h3>
                <p className="text-gray-500 mt-2 font-medium">
                  {currentSubjectMaterials.videos.length} {currentSubjectMaterials.videos.length === 1 ? 'Video' : 'Videos'}
                </p>
              </button>

              {/* Assignments Box */}
              <button 
                onClick={() => setActiveMaterialType('assignments')}
                className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-xl hover:border-green-400 hover:-translate-y-1 transition-all group"
              >
                <div className="p-4 bg-green-50 text-green-500 rounded-full mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <ClipboardList className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Assignments</h3>
                <p className="text-gray-500 mt-2 font-medium">
                  {currentSubjectMaterials.assignments.length} {currentSubjectMaterials.assignments.length === 1 ? 'Assignment' : 'Assignments'}
                </p>
              </button>

              {/* Notes Box */}
              <button 
                onClick={() => setActiveMaterialType('notes')}
                className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all group"
              >
                <div className="p-4 bg-amber-50 text-amber-500 rounded-full mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <FileText className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Study Notes</h3>
                <p className="text-gray-500 mt-2 font-medium">
                  {currentSubjectMaterials.notes.length} {currentSubjectMaterials.notes.length === 1 ? 'File' : 'Files'}
                </p>
              </button>
            </div>
          ) : (
            // Detailed View for a Selected Category
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={() => setActiveMaterialType(null)}
                className="flex items-center gap-2 text-[var(--color-primary)] hover:opacity-80 mb-6 font-medium transition-opacity bg-[var(--color-primary)]/10 px-4 py-2 rounded-lg w-max"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Categories
              </button>

              {/* VIDEOS Section */}
              {activeMaterialType === 'videos' && currentSubjectMaterials.videos.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <PlayCircle className="w-7 h-7 text-blue-500" />
                    Videos
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {currentSubjectMaterials.videos.map((v) => (
                      <div key={v.id} className="p-4 border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-3 items-start">
                          <h4 className="font-semibold text-lg leading-tight">{v.title}</h4>

                          {isAdmin && (
                            <div className="flex gap-1 shrink-0 ml-4">
                              <button onClick={() => handleEdit(v)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4 text-blue-500" />
                              </button>
                              <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>
                        {v.description && <p className="text-sm text-gray-600 mb-4">{v.description}</p>}
                        <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                          <iframe 
                            src={getEmbedUrl(v.file_url)} 
                            className="w-full aspect-video"
                            title={v.title}
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ASSIGNMENTS Section */}
              {activeMaterialType === 'assignments' && currentSubjectMaterials.assignments.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <ClipboardList className="w-7 h-7 text-green-500" />
                    Assignments
                  </h3>
                  <div className="space-y-3">
                    {currentSubjectMaterials.assignments.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-green-300 transition-all group">
                        <div className="flex-1 mb-4 sm:mb-0">
                          <a href={item.file_url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-[var(--color-primary)] hover:text-green-600 transition-colors flex items-start sm:items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors shrink-0">
                              <ClipboardList className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="mt-1 sm:mt-0">{item.title}</span>
                          </a>
                          {item.description && <p className="text-sm text-gray-500 mt-2 ml-12">{item.description}</p>}
                        </div>

                        {isAdmin && (
                          <div className="flex gap-2 sm:border-l sm:pl-4 sm:ml-4 border-gray-100 items-center justify-end mt-4 sm:mt-0">
                            <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTES Section */}
              {activeMaterialType === 'notes' && currentSubjectMaterials.notes.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FileText className="w-7 h-7 text-amber-500" />
                    Study Notes
                  </h3>
                  <div className="space-y-3">
                    {currentSubjectMaterials.notes.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all group">
                        <div className="flex-1 mb-4 sm:mb-0">
                          <a href={item.file_url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-[var(--color-primary)] hover:text-amber-600 transition-colors flex items-start sm:items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors shrink-0">
                              <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="mt-1 sm:mt-0">{item.title}</span>
                          </a>
                          {item.description && <p className="text-sm text-gray-500 mt-2 ml-12">{item.description}</p>}
                        </div>

                        {isAdmin && (
                          <div className="flex gap-2 sm:border-l sm:pl-4 sm:ml-4 border-gray-100 items-center justify-end mt-4 sm:mt-0">
                            <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State for the Selected Category */}
              {currentSubjectMaterials[activeMaterialType].length === 0 && (
                <div className="text-center py-20 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    {activeMaterialType === 'videos' && <PlayCircle className="w-8 h-8 text-blue-400" />}
                    {activeMaterialType === 'assignments' && <ClipboardList className="w-8 h-8 text-green-400" />}
                    {activeMaterialType === 'notes' && <FileText className="w-8 h-8 text-amber-400" />}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No {activeMaterialType} found</h4>
                  <p className="text-gray-500 max-w-sm mx-auto">There are currently no {activeMaterialType} available for this subject. Check back later.</p>
                </div>
              )}
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