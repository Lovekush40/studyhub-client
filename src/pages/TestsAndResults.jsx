import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchTestsList, addTest, updateTest, fetchCourses, fetchBatches } from "../api";
import TestFormModal from "../components/TestFormModal";


import {
  PenTool,
  CheckCircle2,
  Clock,
  Calendar,
  BarChart3,
  ChevronRight,
  PlayCircle,
  Loader2,
} from "lucide-react";

export default function TestsAndResults() {
  const [activeTab, setActiveTab] = useState("tests");
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // Course State
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  //  Load Tests
  const loadTests = async () => {
  setLoading(true);
  try {
    const [testsData, coursesData, batchesData] = await Promise.all([
      fetchTestsList(),
      fetchCourses(),
      fetchBatches()
    ]);

    setTests(testsData);
    setCourses(coursesData);
    setBatches(batchesData);
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
            {isAdmin ? "Assessments & Results" : "My Assessments"}
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

            <button
              onClick={() => setIsResultModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[var(--color-primary-hover)] w-full sm:w-auto"
            >
              <BarChart3 className="w-4 h-4" />
              Upload Result
            </button>

          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-[var(--color-border)] pb-1">
        <button
          onClick={() => setActiveTab("tests")}
          className={`py-2 px-4 border-b-2 text-sm ${
            activeTab === "tests"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "text-[var(--color-text-muted)]"
          }`}
        >
          Tests
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`py-2 px-4 border-b-2 text-sm ${
            activeTab === "results"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "text-[var(--color-text-muted)]"
          }`}
        >
          Results
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <>
          {/* TESTS TAB */}
          {activeTab === "tests" && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]">
              <ul className="divide-y divide-[var(--color-border)]">

                {tests.map((test) => (
                  <li
                    key={test.id}
                    className="flex justify-between items-center p-5 hover:bg-[var(--color-bg)]"
                  >
                    {/* Left */}
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">
                        {test.test_name}
                      </p>

                      <div className="text-sm text-[var(--color-text-muted)] flex gap-3 mt-1">
                        <span>{test.subject}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> 
                            {new Date(test.date).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {test.duration} min
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4">

                      {/* Start Button (Student) */}
                      {!isAdmin && (
                        <button
                          onClick={() =>
                            window.open(test.form_url, "_blank")
                          }
                          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-md text-sm"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Start
                        </button>
                      )}

                      {/* Edit (Admin) */}
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEditTest(test)}
                          className="text-blue-500 text-sm"
                        >
                          Edit
                        </button>
                      )}

                      <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                    </div>
                  </li>
                ))}

              </ul>
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === "results" && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]">

            {loadingResults ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">

                {filteredResults.length === 0 && (
                  <p className="text-center py-10 text-[var(--color-text-muted)]">
                    No results found
                  </p>
                )}

                {filteredResults.map((res) => {
                  const test = tests.find(t => t.id === res.test_id);

                  return (
                    <li
                      key={res.id}
                      className="flex justify-between items-center p-5"
                    >
                      <div>
                        <p className="font-semibold">
                          {test?.test_name || "Test"}
                        </p>

                        <div className="text-sm text-[var(--color-text-muted)] mt-1">
                          Score: {res.score} / {res.max_score}
                        </div>

                        <div className="text-xs text-[var(--color-text-muted)] mt-1">
                          {new Date(res.submitted_at).toLocaleString()}
                        </div>
                      </div>

                      <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
        </>
      )}

      {/* Modal */}
      {isAdmin && (
        <TestFormModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          testData={editingTest}
          onSubmit={handleTestSubmit}
          coursesList={courses}
          batchesList={batches}
        />
      )}
    </div>
  );
}