import { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronRight, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCourses, addCourse, updateCourse, deleteCourse } from '../api';
import CourseFormModal from '../components/CourseFormModal';
import { useNavigate } from 'react-router-dom';

export default function CoursesAndBatches() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  
  // Can manage if Admin or Teacher (Teacher might have limited edit perms on backend, but UI shows tools)
  const canManage = isAdmin || isTeacher;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Modal States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const coursesData = await fetchCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to load Academics data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // --- Course Handlers ---
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(id);
        loadData();
      } catch (err) {
        alert(err.message || "Failed to delete course");
      }
    }
  };

  const handleCourseSubmit = async (formData) => {
    try {
      if (editingCourse) await updateCourse(editingCourse._id || editingCourse.id, formData);
      else await addCourse(formData);
      loadData();
      setIsCourseModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to save course");
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-[var(--color-border)] pb-5 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {canManage ? 'Course Management' : 'My Courses'}
        </h1>
        {isAdmin && ( 
          <div className="mt-3 sm:ml-4 sm:mt-0">
            <button 
              onClick={handleOpenAddCourse}
              type="button" 
              className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition-all"
            >
              Add New Course
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
          <span className="mt-4 text-[var(--color-text-muted)] font-bold">Fetching academic records...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl">
              <p className="text-[var(--color-text-muted)] italic">No courses found matching your enrollment.</p>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course._id || course.id} className="relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-sm hover:shadow-md transition-all group">
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-1 z-10">
                    <button onClick={() => handleOpenEditCourse(course)} className="p-1.5 rounded-md bg-[var(--color-bg)]/80 text-blue-500 hover:bg-blue-500 hover:text-white border border-[var(--color-border)] shadow-sm backdrop-blur-sm transition-all" title="Edit Course">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteCourse(course._id || course.id)} className="p-1.5 rounded-md bg-[var(--color-bg)]/80 text-rose-500 hover:bg-rose-500 hover:text-white border border-[var(--color-border)] shadow-sm backdrop-blur-sm transition-all" title="Delete Course">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="px-6 py-5 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-lg bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                      <BookOpen className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors pr-12">{course.name || course.course_name}</h3>
                  </div>
                  <p className="mt-3 block text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(course.subjects || []).map(sub => (
                      <span key={sub} className="inline-flex items-center rounded-md bg-[var(--color-bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border border-[var(--color-border)]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 px-6 py-4 flex justify-between items-center">
                  <div className="text-sm font-medium">
                    {!canManage && (
                      <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs uppercase tracking-widest border border-emerald-500/20">Enrolled</span>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/course/${course._id || course.id}`)} 
                    className="text-[var(--color-primary)] hover:text-white hover:bg-[var(--color-primary)] px-3 py-1 rounded-md text-xs font-bold flex items-center transition-all border border-[var(--color-primary)]/20"
                  >
                    {canManage ? 'MANAGE' : 'GO TO CLASS'} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {isAdmin && (
        <CourseFormModal 
          isOpen={isCourseModalOpen} 
          onClose={() => setIsCourseModalOpen(false)} 
          courseData={editingCourse} 
          onSubmit={handleCourseSubmit} 
        />
      )}
    </div>
  );
}
