import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchTestsList, addTest, updateTest, fetchCourses } from "../api";
import TestFormModal from "../components/TestFormModal";

import {
  PenTool,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronRight,
  PlayCircle,
  Loader2
} from "lucide-react";

export default function TestsAndResults() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // Data State
  const [courses, setCourses] = useState([]);

  //  Load Initial Data
  const loadTests = async () => {
    setLoading(true);
    try {
      const res = await Promise.all([fetchTestsList(), fetchCourses()]);
      setTests(res[0]);
      setCourses(res[1]);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Handlers
  const handleOpenAddTest = () => {
    setEditingTest(null);
    setIsTestModalOpen(true);
  };

  const handleOpenEditTest = (test) => {
    setEditingTest(test);
    setIsTestModalOpen(true);
  };

  const handleTestSubmit = async (formData) => {
    try {
      if (editingTest) {
        await updateTest(editingTest.id, formData);
      } else {
        await addTest(formData);
      }

      await loadTests();
      setIsTestModalOpen(false);
    } catch (err) {
      console.error("Test save failed", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {isAdmin ? "Assessments" : "My Assessments"}
          </h1>
          <p className="text-sm mt-1 text-[var(--color-text-muted)]">
            {isAdmin
              ? "Create and manage tests"
              : "Take tests and track performance"}
          </p>
        </div>

        {isAdmin && (
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
            
            <button
              onClick={handleOpenAddTest}
              className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[var(--color-primary-hover)] w-full sm:w-auto"
            >
              <PenTool className="w-4 h-4" />
              Create Test
            </button>

          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <>
          {/* TESTS TAB */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]">
            {tests.length === 0 ? (
               <p className="text-center py-10 text-[var(--color-text-muted)]">
                 No assessments scheduled
               </p>
            ) : (
            <ul className="divide-y divide-[var(--color-border)]">

                {tests.map((test) => (
                  <li
                    key={test.id}
                    className="flex justify-between items-center p-5 hover:bg-[var(--color-bg)] transition-colors"
                  >
                    {/* Left */}
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">
                        {test.test_name}
                      </p>

                      <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-3 mt-1">
                        <span>{test.subject}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {test.duration} min
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] mt-1">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {new Date(test.date).toLocaleString('en-IN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        
                        {/* Status Badge */}
                        {test.status === 'Ongoing' ? (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 ml-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             Active
                          </span>
                        ) : test.status === 'Upcoming' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 ml-2">
                             Upcoming
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 ml-2">
                             Ended
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4">

                      {/* Start Button (Student) */}
                      {!isAdmin && (
                        <button
                          onClick={() => {
                            if (test.status === 'Ongoing' && test.form_url) {
                              window.open(test.form_url, "_blank");
                            }
                          }}
                          disabled={test.status !== 'Ongoing'}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            test.status === 'Ongoing' 
                              ? "bg-[var(--color-primary)] text-white hover:shadow-lg shadow-[var(--color-primary)]/20 shadow-md" 
                              : "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-70"
                          }`}
                        >
                          <PlayCircle className="w-4 h-4" />
                          {test.status === 'Ongoing' ? 'Start Exam' : test.status === 'Upcoming' ? 'Waiting' : 'Ended'}
                        </button>
                      )}

                      {/* Edit (Admin) */}
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEditTest(test)}
                          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] text-sm font-semibold px-2 py-1"
                        >
                          Edit
                        </button>
                      )}

                      <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                    </div>
                  </li>
                ))}

              </ul>
              )}
            </div>
        </>
      )}

      {/* Modals */}
      {isAdmin && (
        <>
        <TestFormModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          testData={editingTest}
          onSubmit={handleTestSubmit}
          coursesList={courses}
        />
        </>
      )}
    </div>
  );
}