import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Layers, Clock, CalendarDays, ChevronRight, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCourses, fetchBatches, addCourse, updateCourse, deleteCourse, addBatch, updateBatch, deleteBatch } from '../api';
import CourseFormModal from '../components/CourseFormModal';
import BatchFormModal from '../components/BatchFormModal';
import { useNavigate } from 'react-router-dom';

export default function CoursesAndBatches() {
  const [activeTab, setActiveTab] = useState('courses');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  
  // Can manage if Admin or Teacher (Teacher might have limited edit perms on backend, but UI shows tools)
  const canManage = isAdmin || isTeacher;

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Modal States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesData, batchesData] = await Promise.all([
        fetchCourses(),
        fetchBatches()
      ]);
      setCourses(coursesData);
      setBatches(batchesData);
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

  // --- Batch Handlers ---
  const handleOpenAddBatch = () => {
    if (courses.length === 0) {
      alert("Please create a Course first before adding Batches.");
      return;
    }
    setEditingBatch(null);
    setIsBatchModalOpen(true);
  };

  const handleOpenEditBatch = (batch) => {
    setEditingBatch(batch);
    setIsBatchModalOpen(true);
  };

  const handleDeleteBatch = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await deleteBatch(id);
        loadData();
      } catch (err) {
        alert(err.message || "Failed to delete batch");
      }
    }
  };

  const handleBatchSubmit = async (formData) => {
    try {
      if (editingBatch) await updateBatch(editingBatch._id || editingBatch.id, formData);
      else await addBatch(formData);
      loadData();
      setIsBatchModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to save batch");
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-[var(--color-border)] pb-5 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {canManage ? 'Academics Management' : 'My Academics'}
        </h1>
        {isAdmin && ( // Only Admins can create new top-level entities usually
          <div className="mt-3 sm:ml-4 sm:mt-0">
            <button 
              onClick={activeTab === 'courses' ? handleOpenAddCourse : handleOpenAddBatch}
              type="button" 
              className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition-all"
            >
              Add New {activeTab === 'courses' ? 'Course' : 'Batch'}
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 flex space-x-4 border-b border-[var(--color-border)] overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-2 px-4 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'courses' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
        >
          {canManage ? 'All Courses' : 'My Enrolled Courses'}
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`py-2 px-4 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'batches' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
        >
          {canManage ? 'Active Batches' : 'My Active Batches'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
          <span className="mt-4 text-[var(--color-text-muted)] font-bold">Fetching academic records...</span>
        </div>
      ) : (
        <>
          {activeTab === 'courses' && (
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
                        {canManage ? (
                          <p className="text-[var(--color-text-muted)] font-medium">
                            <span className="text-[var(--color-text)] font-bold">{course.activeBatches || 0}</span> Active Batches
                          </p>
                        ) : (
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

          {activeTab === 'batches' && (
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-sm">
              <ul role="list" className="divide-y divide-[var(--color-border)]">
                {batches.length === 0 ? (
                  <li className="py-12 text-center">
                    <p className="text-[var(--color-text-muted)] italic">No active batch assignments found.</p>
                  </li>
                ) : (
                  batches.map((batch) => (
                    <li key={batch._id || batch.id} className="group relative flex items-center justify-between gap-x-6 px-6 py-5 hover:bg-[var(--color-bg)]/50 transition-all">
                      <div className="flex gap-x-4 items-center flex-1 min-w-0">
                        <div className="h-12 w-12 flex-none rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/10 transition-transform group-hover:rotate-3">
                           <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center text-[var(--color-primary)]">
                              <Layers className="w-6 h-6" />
                           </div>
                        </div>
                        <div className="min-w-0 flex-1 ml-2">
                          <p className="text-base font-bold leading-6 text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                            {batch.name || batch.batch_name}
                          </p>
                          <p className="mt-1 flex flex-wrap text-[11px] font-bold uppercase tracking-wider leading-5 text-[var(--color-text-muted)] items-center gap-3">
                            <span className="flex items-center gap-1.5 bg-[var(--color-bg)] px-2 py-0.5 rounded border border-[var(--color-border)]"><BookOpen className="w-3 h-3"/> {batch.course || 'Core Course'}</span>
                            <span className="flex items-center gap-1.5 bg-[var(--color-bg)] px-2 py-0.5 rounded border border-[var(--color-border)]"><CalendarDays className="w-3 h-3"/> {batch.start || 'TBA'}</span> 
                            <span className="flex items-center gap-1.5 bg-[var(--color-bg)] px-2 py-0.5 rounded border border-[var(--color-border)]"><Clock className="w-3 h-3"/> {batch.timing || batch.time || 'N/A'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <div className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-600 border border-indigo-500/20 uppercase tracking-widest">
                            {batch.days || 'Weekdays'}
                          </div>
                          {canManage ? (
                            <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-2 uppercase tracking-tighter bg-[var(--color-bg)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                              Strength: <span className="text-[var(--color-text)]">{batch.strength || 0}</span>
                            </p>
                          ) : (
                            <span className="mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active Enrollment
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-4 ml-2">
                            <button onClick={() => handleOpenEditBatch(batch)} className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-all" title="Edit Batch">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteBatch(batch._id || batch.id)} className="p-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-all" title="Delete Batch">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {isAdmin && (
        <>
          <CourseFormModal 
            isOpen={isCourseModalOpen} 
            onClose={() => setIsCourseModalOpen(false)} 
            courseData={editingCourse} 
            onSubmit={handleCourseSubmit} 
          />
          <BatchFormModal 
            isOpen={isBatchModalOpen} 
            onClose={() => setIsBatchModalOpen(false)} 
            batchData={editingBatch} 
            coursesList={courses} 
            onSubmit={handleBatchSubmit} 
          />
        </>
      )}
    </div>
  );
}

// Helper component for success icon
function CheckCircle2(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
