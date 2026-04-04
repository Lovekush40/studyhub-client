import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Loader2 } from 'lucide-react';
import { fetchCourses, fetchBatches } from '../api';

export default function StudentFormModal({ isOpen, onClose, studentData, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course_id: '',
    batch_id: '',
    batch: '',
    attendance: 100,
    lastTest: 0,
    status: 'Active',
    enrollmentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  });
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [courseData, batchData] = await Promise.all([fetchCourses(), fetchBatches()]);
        setCourses(courseData);
        setBatches(batchData);

        if (studentData?.course_id) {
          setFilteredBatches(batchData.filter((b) => b.courseId === studentData.course_id || b.course_id === studentData.course_id));
        }
      } catch (e) {
        console.error('Failed to load courses/batches', e);
      }
    };

    loadOptions();

    if (studentData) {
      setFormData({
        ...studentData,
        course_id: studentData.course_id || studentData.courseId || '',
        batch_id: studentData.batch_id || studentData.batchId || '',
        batch: studentData.batch || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        course_id: '',
        batch_id: '',
        batch: '',
        attendance: 100,
        lastTest: 0,
        status: 'Active',
        enrollmentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      });
      setFilteredBatches([]);
    }
  }, [studentData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'course_id') {
      const selectedCourse = value;
      const nextBatches = batches.filter((b) => String(b.courseId || b.course_id) === String(selectedCourse));
      setFilteredBatches(nextBatches);
      setFormData((prev) => ({
        ...prev,
        course_id: selectedCourse,
        batch_id: '',
        batch: ''
      }));
      return;
    }

    if (name === 'batch_id') {
      const batchObj = batches.find((b) => String(b._id || b.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        batch_id: value,
        batch: batchObj ? (batchObj.name || batchObj.batch_name || '') : ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendance' || name === 'lastTest' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course_id || !formData.batch_id) {
      alert('Please select both course and batch.');
      return;
    }

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={studentData ? "Edit Student" : "Add New Student"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Full Name</label>
          <input 
            type="text" 
            name="name" 
            required
            value={formData.name} 
            onChange={handleChange} 
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="e.g. Rahul Kumar"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            required
            value={formData.email} 
            onChange={handleChange} 
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="e.g. student@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Course</label>
          <select
            name="course_id"
            required
            value={formData.course_id}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id || course._id} value={course.id || course._id}>
                {course.name || course.course_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Batch</label>
          <select
            name="batch_id"
            required
            value={formData.batch_id}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">Select Batch</option>
            {filteredBatches.length > 0 ? filteredBatches.map((batch) => (
              <option key={batch.id || batch._id} value={batch.id || batch._id}>
                {batch.name || batch.batch_name}
              </option>
            )) : batches.map((batch) => (
              <option key={batch.id || batch._id} value={batch.id || batch._id}>
                {batch.name || batch.batch_name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Attendance (%)</label>
            <input 
              type="number" 
              name="attendance" 
              min="0" max="100"
              value={formData.attendance} 
              onChange={handleChange} 
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Last Test Score</label>
            <input 
              type="number" 
              name="lastTest" 
              min="0" max="100"
              value={formData.lastTest} 
              onChange={handleChange} 
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Status</label>
           <select 
             name="status"
             value={formData.status}
             onChange={handleChange}
             className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
           >
             <option value="Active">Active</option>
             <option value="Warning">Warning</option>
             <option value="Critical">Critical</option>
           </select>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)] mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg)] transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center min-w-[100px] px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
