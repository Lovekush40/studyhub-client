import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Layers, Clock, CalendarDays, ChevronRight, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCourses, fetchBatches, addCourse, updateCourse, deleteCourse, addBatch, updateBatch, deleteBatch } from '../api';
import CourseFormModal from '../components/CourseFormModal';
import BatchFormModal from '../components/BatchFormModal';
import {useNavigate } from 'react-router-dom';

export default function CoursesAndBatches() {
  const [activeTab, setActiveTab] = useState('courses');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

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
      await deleteCourse(id);
      loadData();
    }
  };

  const handleCourseSubmit = async (formData) => {
    if (editingCourse) await updateCourse(editingCourse.id, formData);
    else await addCourse(formData);
    loadData();
    setIsCourseModalOpen(false);
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
      await deleteBatch(id);
      loadData();
    }
  };

  const handleBatchSubmit = async (formData) => {
    if (editingBatch) await updateBatch(editingBatch.id, formData);
    else await addBatch(formData);
    loadData();
    setIsBatchModalOpen(false);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-[var(--color-border)] pb-5 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {isAdmin ? 'Academics Management' : 'My Academics'}
        </h1>
        {isAdmin && (
          <div className="mt-3 sm:ml-4 sm:mt-0">
            <button 
              onClick={activeTab === 'courses' ? handleOpenAddCourse : handleOpenAddBatch}
              type="button" 
              className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Add New {activeTab === 'courses' ? 'Course' : 'Batch'}
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 flex space-x-4 border-b border-[var(--color-border)] overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-2 px-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'courses' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
        >
          {isAdmin ? 'All Courses' : 'My Courses'}
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`py-2 px-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'batches' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
        >
          {isAdmin ? 'Active Batches' : 'My Batches'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-sm hover:shadow-md transition-shadow">
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-1 z-10">
                      <button onClick={() => handleOpenEditCourse(course)} className="p-1.5 rounded-md bg-[var(--color-bg)]/80 text-blue-500 hover:bg-blue-500/10 border border-[var(--color-border)] shadow-sm backdrop-blur-sm">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="p-1.5 rounded-md bg-[var(--color-bg)]/80 text-red-500 hover:bg-red-500/10 border border-[var(--color-border)] shadow-sm backdrop-blur-sm">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="px-6 py-5 mt-2">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-lg bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
                        <BookOpen className="h-6 w-6" />
                      </span>
                      <h3 className="text-lg font-semibold text-[var(--color-text)] pr-12">{course.name}</h3>
                    </div>
                    <p className="mt-3 block text-sm text-[var(--color-text-muted)] line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {course.subjects.map(sub => (
                        <span key={sub} className="inline-flex items-center rounded-md bg-[var(--color-bg)] px-2 py-1 text-xs font-medium text-[var(--color-text)] border border-[var(--color-border)]">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-3 flex justify-between items-center">
                    <div className="text-sm font-medium text-[var(--color-text-muted)]">
                       {isAdmin ? (
                         <><span className="text-[var(--color-text)] font-semibold">{course.activeBatches}</span> Active Batches</>
                       ) : (
                         <span className="text-emerald-500 font-semibold">Enrolled</span>
                       )}
                    </div>
                    <button onClick={() => navigate(`/course/${course.id}`)} className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] text-sm font-medium flex items-center">
                      View {isAdmin ? 'Details' : 'Materials'} <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-sm">
              <ul role="list" className="divide-y divide-[var(--color-border)]">
                {batches.map((batch) => (
                  <li key={batch.id} className="group relative flex items-center justify-between gap-x-6 px-6 py-5 hover:bg-[var(--color-bg)] transition-colors">
                    <div className="flex gap-x-4 items-center flex-1 min-w-0">
                      <div className="h-10 w-10 flex-none rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                         <Layers className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-6 text-[var(--color-text)]">
                          {batch.name}
                        </p>
                        <p className="mt-1 flex flex-wrap text-xs leading-5 text-[var(--color-text-muted)] items-center gap-2">
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3"/> {batch.course}</span> &bull; 
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3"/> Starts {batch.start}</span> &bull; 
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {batch.time}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col items-end">
                         <div className="inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                           {batch.days}
                         </div>
                         {isAdmin ? (
                           <p className="text-xs text-[var(--color-text-muted)] mt-2 font-medium bg-[var(--color-bg)] px-2 py-1 rounded-md border border-[var(--color-border)]">
                             Strength: {batch.strength}
                           </p>
                         ) : (
                           <button className="mt-2 text-xs font-medium text-[var(--color-primary)] hover:underline">View Announcements</button>
                         )}
                       </div>

                       {isAdmin && (
                         <div className="flex flex-col gap-1 border-l border-[var(--color-border)] pl-4 ml-2">
                           <button onClick={() => handleOpenEditBatch(batch)} className="text-blue-500 hover:text-blue-600 p-1.5 rounded transition-colors" title="Edit Batch">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDeleteBatch(batch.id)} className="text-red-500 hover:text-red-600 p-1.5 rounded transition-colors" title="Delete Batch">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       )}
                    </div>
                  </li>
                ))}
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
