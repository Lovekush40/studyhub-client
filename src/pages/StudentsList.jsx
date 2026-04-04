import { useState, useEffect } from 'react';
import { fetchStudentsList, deleteStudent } from '../api';
import { Search, Filter, Loader2, Edit2, Trash2, BookOpen } from 'lucide-react';
import StudentFormModal from '../components/StudentFormModal';
import BatchAllocationModal from '../components/BatchAllocationModal';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
    setSelectedStudent(null);
    setIsProfileModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const handleOpenAllocationModal = (student) => {
    setSelectedStudent(student);
    setIsAllocationModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student profile?")) {
      try {
        await deleteStudent(id);
        await loadStudents();
      } catch (err) {
        console.error("Deletion failed", err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Students Directory</h1>
          <p className="text-sm mt-1 text-[var(--color-text-muted)]">
            Manage student profiles and their batch enrollments.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button 
            type="button" 
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition-all">
            Register Student
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
             className="block w-full rounded-md border-0 py-2 pl-10 bg-[var(--color-bg-alt)] text-[var(--color-text)] ring-1 ring-inset ring-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] sm:text-sm sm:leading-6 outline-none"
             placeholder="Search by name, email or ID..."
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-[var(--color-bg-alt)] px-3 py-2 text-sm font-semibold text-[var(--color-text)] shadow-sm ring-1 ring-inset ring-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors">
          <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
          Filters
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-sm">
        {loading ? (
           <div className="flex flex-col justify-center items-center py-24">
             <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
             <span className="mt-4 text-[var(--color-text-muted)] font-bold">Synchronizing directory...</span>
           </div>
        ) : error ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <p className="text-red-500 font-bold">Connection Error</p>
              <p className="text-[var(--color-text-muted)] text-sm mt-2">{error}</p>
              <button
                onClick={loadStudents}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] transition-all"
              >
                Retry Request
              </button>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-24 text-center">
             <div className="h-16 w-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[var(--color-text-muted)]" />
             </div>
              <p className="text-[var(--color-text-muted)] font-bold">No students found</p>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">Start by registering your first student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-bg)]">
                <tr>
                  <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                    Student Details
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                    Current Batch
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] hidden lg:table-cell">
                    Attendance
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                    Status
                  </th>
                  <th scope="col" className="relative py-4 pl-3 pr-6 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-bg-alt)]">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-[var(--color-bg)]/50 transition-all group">
                    <td className="whitespace-nowrap py-5 pl-6 pr-3">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/10">
                           <img 
                            className="h-full w-full rounded-[10px] bg-white object-cover" 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}&backgroundColor=ffffff`} 
                            alt={student.name} 
                           />
                        </div>
                        <div className="ml-4">
                          <div className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{student.name}</div>
                          <div className="text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg)] px-1.5 py-0.5 rounded border border-[var(--color-border)] inline-block mt-1">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--color-text-muted)] font-medium">{student.email}</td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <div className="flex flex-col">
                        <span className={`font-bold ${student.batch_name === 'Unassigned' ? 'text-amber-500' : 'text-[var(--color-text)]'}`}>
                            {student.batch_name || student.batch}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{student.course_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm hidden lg:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                           <div className={`h-full ${student.attendance >= 80 ? 'bg-emerald-500' : student.attendance > 65 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${student.attendance}%` }}></div>
                        </div>
                        <span className={`font-bold tabular-nums ${student.attendance >= 80 ? 'text-emerald-500' : student.attendance > 65 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {student.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                        student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                        student.status === 'Warning' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                        'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenAllocationModal(student)}
                          className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white p-2 rounded-lg transition-all"
                          title="Manage Enrollment"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(student)}
                          className="bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white p-2 rounded-lg transition-all"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white p-2 rounded-lg transition-all"
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
      
      {/* Student Profile Modal */}
      <StudentFormModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        studentData={selectedStudent}
        onSubmit={loadStudents}
      />

      {/* Batch Allocation Modal */}
      <BatchAllocationModal
        isOpen={isAllocationModalOpen}
        onClose={() => {
            setIsAllocationModalOpen(false);
            setSelectedStudent(null);
        }}
        studentId={selectedStudent?.id || selectedStudent?._id}
        onUpdate={loadStudents}
      />
    </div>
  );
}
