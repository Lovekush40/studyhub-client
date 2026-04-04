import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Loader2, AlertCircle } from 'lucide-react';
import { addStudent, updateStudent } from '../api';

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
    attendance: 100,
    lastTest: 0,
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

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
        attendance: studentData.attendance || 100,
        lastTest: studentData.lastTest || 0,
        status: studentData.status || 'Active'
      });
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
        attendance: 100,
        lastTest: 0,
        status: 'Active'
      });
    }

    setTouched({});
    setError(null);
  }, [studentData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);

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

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Valid email is required';
    
    if (formData.attendance < 0 || formData.attendance > 100) {
      return 'Attendance must be between 0-100';
    }
    
    if (formData.lastTest < 0 || formData.lastTest > 100) {
      return 'Test score must be between 0-100';
    }

    return null;
  };

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

      if (!isEditingExisting) {
        await addStudent(submitData);
      } else {
        const studentId = studentData._id || studentData.id;
        await updateStudent(studentId, submitData);
      }

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('❌ Error saving student:', err);
      setError(err.message || 'Failed to save student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFieldInvalid = (fieldName) => touched[fieldName] && !formData[fieldName];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditingExisting ? "Edit Student Profile" : "Register New Student"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
        
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md sticky top-0 z-10 text-red-700 font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="border-b border-[var(--color-border)] pb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Personal Information</h3>

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
              <p className="mt-1 text-sm text-red-500 font-medium">Name is required</p>
            )}
          </div>

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
              <p className="mt-1 text-sm text-red-500 font-medium">Valid email is required</p>
            )}
          </div>

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
              'Update Profile'
            ) : (
              'Register Student'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}