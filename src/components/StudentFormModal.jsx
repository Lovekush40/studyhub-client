import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { fetchCourses, fetchBatches, addStudent, updateStudent } from '../api';

export default function StudentFormModal({ isOpen, onClose, studentData, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    email: '',
    contact: '',
    address: '',
    gender: '',
    dob: '',
    age: '',
    course_id: '',
    batch_id: '', // Primary batch (for new students)
    attendance: 100,
    lastTest: 0,
    status: 'Active'
  });

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [allocatedBatches, setAllocatedBatches] = useState([]); // Multi-batch for editing
  const [selectedCourseForAllocation, setSelectedCourseForAllocation] = useState('');
  const [selectedBatchForAllocation, setSelectedBatchForAllocation] = useState('');
  const [filteredBatchesForAllocation, setFilteredBatchesForAllocation] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // ============================================
  // LOAD COURSES + BATCHES
  // ============================================
  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      try {
        const [courseData, batchData] = await Promise.all([
          fetchCourses(),
          fetchBatches()
        ]);

        setCourses(courseData);
        setBatches(batchData);
        setError(null);
      } catch (e) {
        console.error('Failed to load courses/batches', e);
        setError('Failed to load courses and batches');
      }
    };

    loadOptions();

    // ============================================
    // POPULATE FORM WITH EXISTING DATA
    // ============================================
    if (studentData) {
      setIsEditingExisting(true);
      setFormData({
        name: studentData.name || '',
        father_name: studentData.father_name || '',
        email: studentData.email || '',
        contact: studentData.contact || '',
        address: studentData.address || '',
        gender: studentData.gender || '',
        dob: studentData.dob ? new Date(studentData.dob).toISOString().split('T')[0] : '',
        age: studentData.age || '',
        course_id: studentData.course_id || '',
        batch_id: studentData.batch_id || '',
        attendance: studentData.attendance || 100,
        lastTest: studentData.lastTest || 0,
        status: studentData.status || 'Active'
      });

      // Load allocated batches (could be array from backend or single batch_id)
      if (Array.isArray(studentData.allocated_batches)) {
        setAllocatedBatches(studentData.allocated_batches);
      } else if (studentData.batch_id) {
        setAllocatedBatches([{ _id: studentData.batch_id, name: studentData.batch_name || 'Unknown' }]);
      }
    } else {
      setIsEditingExisting(false);
      setFormData({
        name: '',
        father_name: '',
        email: '',
        contact: '',
        address: '',
        gender: '',
        dob: '',
        age: '',
        course_id: '',
        batch_id: '',
        attendance: 100,
        lastTest: 0,
        status: 'Active'
      });
      setAllocatedBatches([]);
    }

    setTouched({});
    setSelectedCourseForAllocation('');
    setSelectedBatchForAllocation('');
  }, [studentData, isOpen]);

  // ============================================
  // HANDLE MAIN FORM INPUT CHANGE
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);

    // For new students: filter batches by course
    if (name === 'course_id' && !isEditingExisting) {
      const nextBatches = batches.filter(
        (b) => String(b.courseId || b.course_id) === String(value)
      );

      setFilteredBatches(nextBatches);

      setFormData((prev) => ({
        ...prev,
        course_id: value,
        batch_id: ''
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: ['attendance', 'lastTest', 'age'].includes(name) 
        ? (value === '' ? '' : Number(value)) 
        : value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
  };

  // ============================================
  // BATCH ALLOCATION HANDLERS (For Editing)
  // ============================================
  const handleAllocationCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourseForAllocation(courseId);
    setSelectedBatchForAllocation('');

    if (courseId) {
      const filtered = batches.filter(
        (b) => String(b.courseId || b.course_id) === String(courseId)
      );
      setFilteredBatchesForAllocation(filtered);
    } else {
      setFilteredBatchesForAllocation([]);
    }
  };

  const handleAllocateBatch = () => {
    if (!selectedBatchForAllocation) {
      alert('Please select a batch');
      return;
    }

    // Check if already allocated
    if (allocatedBatches.some(b => String(b._id || b.id) === String(selectedBatchForAllocation))) {
      alert('This batch is already allocated');
      return;
    }

    // Find batch details
    const batchToAdd = filteredBatchesForAllocation.find(
      b => String(b._id || b.id) === String(selectedBatchForAllocation)
    );

    if (batchToAdd) {
      setAllocatedBatches([...allocatedBatches, batchToAdd]);
      setSelectedBatchForAllocation('');
      setSelectedCourseForAllocation('');
      setFilteredBatchesForAllocation([]);
    }
  };

  const handleRemoveAllocatedBatch = (batchId) => {
    setAllocatedBatches(allocatedBatches.filter(b => String(b._id || b.id) !== String(batchId)));
  };

  // ============================================
  // VALIDATION
  // ============================================
  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Valid email is required';
    
    // New students need at least primary batch
    if (!isEditingExisting && !formData.batch_id) {
      return 'Primary batch is required for new students';
    }
    
    // Editing students need at least one allocated batch
    if (isEditingExisting && allocatedBatches.length === 0) {
      return 'Allocate at least one batch to the student';
    }

    if (formData.attendance < 0 || formData.attendance > 100) {
      return 'Attendance must be between 0-100';
    }
    
    if (formData.lastTest < 0 || formData.lastTest > 100) {
      return 'Test score must be between 0-100';
    }

    return null;
  };

  // ============================================
  // SUBMIT FORM
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        name: formData.name.trim(),
        father_name: formData.father_name.trim() || undefined,
        email: formData.email.trim(),
        contact: formData.contact.trim() || undefined,
        address: formData.address.trim() || undefined,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        age: formData.age || undefined,
        attendance: formData.attendance,
        lastTest: formData.lastTest,
        status: formData.status
      };

      // ✅ NEW STUDENT: Create with primary batch
      if (!isEditingExisting) {
        submitData.batch_id = formData.batch_id;
        submitData.course_id = formData.course_id;

        const newStudent = await addStudent(submitData);
        console.log('✅ Student created with primary batch:', newStudent);
      }
      // ✏️ EXISTING STUDENT: Update with multiple batches
      else {
        const studentId = studentData._id || studentData.id;
        
        // Send allocated batches array
        submitData.allocated_batches = allocatedBatches.map(b => ({
          _id: b._id || b.id,
          name: b.name || b.batch_name
        }));

        // For compatibility, also set primary batch (first in list)
        if (allocatedBatches.length > 0) {
          submitData.batch_id = allocatedBatches[0]._id || allocatedBatches[0].id;
          submitData.batch_name = allocatedBatches[0].name || allocatedBatches[0].batch_name;
        }

        await updateStudent(studentId, submitData);
        console.log('✅ Student updated with multiple batches:', studentId);
      }

      // Call parent onSubmit callback
      await onSubmit(submitData);

      // Reset and close
      setFormData({
        name: '',
        father_name: '',
        email: '',
        contact: '',
        address: '',
        gender: '',
        dob: '',
        age: '',
        course_id: '',
        batch_id: '',
        attendance: 100,
        lastTest: 0,
        status: 'Active'
      });
      setAllocatedBatches([]);
      setTouched({});
      onClose();
    } catch (err) {
      console.error('❌ Error saving student:', err);
      setError(err.message || 'Failed to save student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFieldInvalid = (fieldName) => touched[fieldName] && !formData[fieldName];

  // ============================================
  // RENDER
  // ============================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditingExisting ? "Edit Student & Allocate Batches" : "Enroll New Student"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
        
        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md sticky top-0 z-10">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* STUDENT TYPE BADGE */}
        {isEditingExisting && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700 font-medium">
              ℹ️ Edit student details and allocate multiple batches
            </p>
          </div>
        )}

        {/* ========== BASIC INFO SECTION ========== */}
        <div className="border-b border-[var(--color-border)] pb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Personal Information</h3>

          {/* NAME */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                isFieldInvalid('name') ? 'border-red-500' : 'border-[var(--color-border)]'
              }`}
              placeholder="e.g. Rajesh Kumar"
            />
            {isFieldInvalid('name') && (
              <p className="mt-1 text-sm text-red-500">Name is required</p>
            )}
          </div>

          {/* FATHER NAME */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Father's Name
            </label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="e.g. Amit Kumar"
            />
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                isFieldInvalid('email') ? 'border-red-500' : 'border-[var(--color-border)]'
              }`}
              placeholder="student@example.com"
            />
            {isFieldInvalid('email') && (
              <p className="mt-1 text-sm text-red-500">Valid email is required</p>
            )}
          </div>

          {/* CONTACT & GENDER */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Contact
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* DOB & AGE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                min="5"
                max="100"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Age"
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              placeholder="Full address"
            />
          </div>
        </div>

        {/* ========== ENROLLMENT SECTION ========== */}
        <div className="border-b border-[var(--color-border)] pb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">
            {isEditingExisting ? "Batch Allocation" : "Initial Batch Enrollment"}
          </h3>

          {/* NEW STUDENT: Select Primary Batch */}
          {!isEditingExisting && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                  Select Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="course_id"
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                  Select Primary Batch <span className="text-red-500">*</span>
                </label>
                <select
                  name="batch_id"
                  value={formData.batch_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Select Batch</option>
                  {(filteredBatches.length > 0 ? filteredBatches : batches).map((batch) => (
                    <option key={batch.id || batch._id} value={batch.id || batch._id}>
                      {batch.name || batch.batch_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* EXISTING STUDENT: Allocate Multiple Batches */}
          {isEditingExisting && (
            <div className="space-y-4">
              {/* Add Batch Section */}
              <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md">
                <h4 className="text-xs font-semibold text-[var(--color-text)] uppercase mb-3">Add Batch</h4>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <select
                    value={selectedCourseForAllocation}
                    onChange={handleAllocationCourseChange}
                    className="px-3 py-2 bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id || course._id} value={course.id || course._id}>
                        {course.name || course.course_name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedBatchForAllocation}
                    onChange={(e) => setSelectedBatchForAllocation(e.target.value)}
                    disabled={!selectedCourseForAllocation}
                    className="px-3 py-2 bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm disabled:opacity-50"
                  >
                    <option value="">Select Batch</option>
                    {filteredBatchesForAllocation.map((batch) => (
                      <option key={batch.id || batch._id} value={batch.id || batch._id}>
                        {batch.name || batch.batch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAllocateBatch}
                  disabled={!selectedBatchForAllocation}
                  className="w-full px-3 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-md hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  + Add Batch
                </button>
              </div>

              {/* Allocated Batches List */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text)] uppercase mb-2">
                  Allocated Batches ({allocatedBatches.length})
                </h4>
                
                {allocatedBatches.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)] italic">No batches allocated yet</p>
                ) : (
                  <div className="space-y-2">
                    {allocatedBatches.map((batch) => (
                      <div
                        key={batch._id || batch.id}
                        className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-md"
                      >
                        <div>
                          <p className="text-sm font-medium text-emerald-900">{batch.name || batch.batch_name}</p>
                          <p className="text-xs text-emerald-700">ID: {batch._id || batch.id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAllocatedBatch(batch._id || batch.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                          title="Remove batch"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========== PERFORMANCE SECTION ========== */}
        <div className="border-b border-[var(--color-border)] pb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Performance & Status</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Attendance (%)
              </label>
              <input
                type="number"
                name="attendance"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Last Test Score (%)
              </label>
              <input
                type="number"
                name="lastTest"
                min="0"
                max="100"
                value={formData.lastTest}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="0-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="Active">🟢 Active</option>
              <option value="Warning">🟡 Warning</option>
              <option value="Critical">🔴 Critical</option>
            </select>
          </div>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center min-w-[140px] px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : isEditingExisting ? (
              'Update Student'
            ) : (
              'Enroll Student'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}