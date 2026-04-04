import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Loader2, AlertCircle, X, PlusCircle, CheckCircle2 } from 'lucide-react';
import { fetchCourses, fetchBatches, fetchStudentById, allocateBatchesToStudent } from '../api';

export default function BatchAllocationModal({ isOpen, onClose, studentId, onUpdate }) {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [allocatedBatches, setAllocatedBatches] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !studentId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const [studentData, courseData, batchData] = await Promise.all([
          fetchStudentById(studentId),
          fetchCourses(),
          fetchBatches()
        ]);

        setStudent(studentData);
        setCourses(courseData);
        setBatches(batchData);
        
        // Populate current allocations
        if (studentData.allocated_batches) {
            setAllocatedBatches(studentData.allocated_batches.map(b => ({
                id: b._id || b.id,
                name: b.name || b.batch_name,
                courseName: b.course_name || 'Unknown'
            })));
        }
      } catch (err) {
        console.error('Failed to load allocation data', err);
        setError('Failed to load student or batch details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, studentId]);

  const handleAddBatch = () => {
    if (!selectedBatchId) return;

    const batchToAdd = batches.find(b => (b._id || b.id) === selectedBatchId);
    if (!batchToAdd) return;

    // Check if already in the list
    if (allocatedBatches.some(b => b.id === selectedBatchId)) {
      setError('This batch is already added to the allocation list');
      return;
    }

    const courseOfBatch = courses.find(c => (c._id || c.id) === (batchToAdd.course_id || batchToAdd.courseId));

    setAllocatedBatches(prev => [
      ...prev, 
      { 
        id: selectedBatchId, 
        name: batchToAdd.name || batchToAdd.batch_name,
        courseName: courseOfBatch?.name || 'Unknown'
      }
    ]);
    
    setSelectedBatchId('');
    setError(null);
  };

  const handleRemoveBatch = (id) => {
    setAllocatedBatches(prev => prev.filter(b => b.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const batchIds = allocatedBatches.map(b => b.id);
      await allocateBatchesToStudent(studentId, batchIds);
      setSuccess(true);
      if (onUpdate) onUpdate();
      
      // Auto close after success? Maybe show success for a bit
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save allocations', err);
      setError(err.message || 'Failed to save batch allocations');
    } finally {
      setSaving(false);
    }
  };

  const filteredBatches = batches.filter(b => {
    const courseId = b.course_id || b.courseId;
    const courseIdStr = typeof courseId === 'object' ? courseId?._id?.toString() : courseId?.toString();
    return courseIdStr === selectedCourseId;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enroll Student in Batches"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            <p className="mt-2 text-sm text-[var(--color-text-muted)] font-medium">Loading details...</p>
          </div>
        ) : (
          <>
            {/* Student ID Info */}
            <div className="p-3 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-md flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Managing Enrollment For</p>
                <p className="text-sm font-bold text-[var(--color-text)]">{student?.name || 'Loading...'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Student ID</p>
                <p className="text-xs font-mono text-[var(--color-text-muted)]">{studentId}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Enrollment updated successfully!</p>
              </div>
            )}

            {/* Select New Batch */}
            {!success && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[var(--color-text)]">Link New Batch</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Select Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        setSelectedBatchId('');
                      }}
                      className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    >
                      <option value="">Choose Course</option>
                      {courses.map(course => (
                        <option key={course._id || course.id} value={course._id || course.id}>
                          {course.name || course.course_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Select Batch</label>
                    <div className="flex gap-2">
                        <select
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        disabled={!selectedCourseId}
                        className="flex-1 px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none disabled:opacity-50"
                        >
                        <option value="">Choose Batch</option>
                        {filteredBatches.map(batch => (
                            <option key={batch._id || batch.id} value={batch._id || batch.id}>
                            {batch.name || batch.batch_name}
                            </option>
                        ))}
                        </select>
                        <button
                            onClick={handleAddBatch}
                            disabled={!selectedBatchId}
                            className="p-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
                        >
                            <PlusCircle className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Allocated Batches List */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[var(--color-text)] flex justify-between">
                <span>Current Enrollments</span>
                <span className="text-xs font-normal text-[var(--color-text-muted)]">{allocatedBatches.length} Batches</span>
              </h4>
              
              {allocatedBatches.length === 0 ? (
                <div className="py-8 border-2 border-dashed border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                  <p className="text-sm italic">No batches currently assigned</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {allocatedBatches.map(batch => (
                    <div key={batch.id} className="group relative flex items-center justify-between p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md hover:border-[var(--color-primary)] transition-all">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">{batch.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium">Course: {batch.courseName}</p>
                      </div>
                      {!success && (
                        <button
                          onClick={() => handleRemoveBatch(batch.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove allocation"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {!success && (
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center px-6 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-md hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Confirm Enrollment'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
