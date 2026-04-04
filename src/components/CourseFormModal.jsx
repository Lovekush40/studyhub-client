import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Loader2, AlertCircle } from 'lucide-react';

export default function CourseFormModal({ isOpen, onClose, courseData, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjects: '',
    activeBatches: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTouched({});
      
      if (courseData) {
        setFormData({
          name: courseData.name || courseData.course_name || '',
          description: courseData.description || '',
          subjects: Array.isArray(courseData.subjects) 
            ? courseData.subjects.join(', ')
            : courseData.subjects || '',
          activeBatches: courseData.activeBatches || 0
        });
      } else {
        setFormData({
          name: '',
          description: '',
          subjects: '',
          activeBatches: 0
        });
      }
    }
  }, [courseData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setFormData(prev => ({
      ...prev,
      [name]: name === 'activeBatches' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Course name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.subjects.trim()) return 'At least one subject is required';
    if (formData.activeBatches < 0) return 'Active batches cannot be negative';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Parse subjects string to array, trimming whitespace
      const submissionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        subjects: formData.subjects
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0),
        activeBatches: Math.max(0, formData.activeBatches)
      };

      await onSubmit(submissionData);
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        subjects: '',
        activeBatches: 0
      });
      setTouched({});
    } catch (err) {
      setError(err.message || 'Failed to save course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFieldInvalid = (fieldName) => touched[fieldName] && !formData[fieldName];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={courseData ? "Edit Course" : "Add New Course"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Course Name <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="name" 
            required
            value={formData.name} 
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
              isFieldInvalid('name') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-[var(--color-border)]'
            }`}
            placeholder="e.g. JEE Mains Target 2026"
            aria-invalid={isFieldInvalid('name')}
          />
          {isFieldInvalid('name') && (
            <p className="mt-1 text-sm text-red-500">Course name is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea 
            name="description" 
            rows={3}
            required
            value={formData.description} 
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none transition-colors ${
              isFieldInvalid('description') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-[var(--color-border)]'
            }`}
            placeholder="Brief overview of the course content..."
            aria-invalid={isFieldInvalid('description')}
          />
          {isFieldInvalid('description') && (
            <p className="mt-1 text-sm text-red-500">Description is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Subjects <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="subjects" 
            required
            value={formData.subjects} 
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
              isFieldInvalid('subjects') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-[var(--color-border)]'
            }`}
            placeholder="e.g. Physics, Chemistry, Mathematics"
            aria-invalid={isFieldInvalid('subjects')}
          />
          {isFieldInvalid('subjects') && (
            <p className="mt-1 text-sm text-red-500">At least one subject is required</p>
          )}
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Separate multiple subjects with commas</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Initial Active Batches
          </label>
          <input 
            type="number" 
            name="activeBatches" 
            min="0"
            value={formData.activeBatches} 
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)] mt-6">
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
            className="flex items-center justify-center min-w-[120px] px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              courseData ? 'Update Course' : 'Create Course'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}