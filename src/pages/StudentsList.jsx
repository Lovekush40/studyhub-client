import { useState, useEffect } from 'react';
import { fetchStudentsList, addStudent, updateStudent, deleteStudent } from '../api';
import { Search, Filter, MoreVertical, Loader2, Edit2, Trash2 } from 'lucide-react';
import StudentFormModal from '../components/StudentFormModal';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Action Menu State
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentsList();
      console.log('✅ Students loaded:', data);
      setStudents(data);
    } catch (error) {
      console.error("❌ Failed to load students", error);
      setError(error.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
        await loadStudents();
      } catch (err) {
        console.error("Deletion failed", err);
      }
    }
    setOpenMenuId(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
      } else {
        await addStudent(formData);
      }
      await loadStudents();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving student", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Students Directory</h1>
          <p className="text-sm mt-1 text-[var(--color-text-muted)]">
            A list of all students enrolled in the institute across all batches.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button 
            type="button" 
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            Add Student
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden="true" />
          </div>
          <input
             type="text"
             className="block w-full rounded-md border-0 py-2 pl-10 bg-[var(--color-bg-alt)] text-[var(--color-text)] ring-1 ring-inset ring-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] sm:text-sm sm:leading-6"
             placeholder="Search students by name or ID..."
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-[var(--color-bg-alt)] px-3 py-2 text-sm font-semibold text-[var(--color-text)] shadow-sm ring-1 ring-inset ring-[var(--color-border)] hover:bg-[var(--color-bg)]">
          <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
          More Filters
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-sm">
        {loading ? (
           <div className="flex justify-center items-center py-24">
             <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
             <span className="ml-3 text-[var(--color-text-muted)] font-medium">Fetching directory...</span>
           </div>
        ) : error ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <p className="text-red-500 font-semibold">Error Loading Students</p>
              <p className="text-[var(--color-text-muted)] text-sm mt-2">{error}</p>
              <button
                onClick={loadStudents}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
              >
                Retry
              </button>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <p className="text-[var(--color-text-muted)] font-semibold">No students found</p>
              <p className="text-[var(--color-text-muted)] text-sm mt-2">Add a new student to get started</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-bg)]">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] sm:pl-6">
                    Student Information
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Enrolled Batch
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Course
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Attendance
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] hidden sm:table-cell">
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-bg-alt)]">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-blue-500 overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-[var(--color-text)]">{student.name}</div>
                          <div className="mt-1 text-xs text-[var(--color-text-muted)]">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--color-text-muted)]">{student.email}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--color-text-muted)]">
                      {student.batch_name || student.batch}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--color-text-muted)]">
                      {student.course_name || 'Not assigned'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                           <div className={`h-full ${student.attendance >= 80 ? 'bg-emerald-500' : student.attendance > 65 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${student.attendance}%` }}></div>
                        </div>
                        <span className={`font-semibold ${student.attendance >= 80 ? 'text-emerald-500' : student.attendance > 65 ? 'text-amber-500' : 'text-red-500'}`}>
                          {student.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm hidden sm:table-cell">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${
                        student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                        student.status === 'Warning' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                        'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(student)}
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 p-1.5 rounded transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <StudentFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentData={editingStudent}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
