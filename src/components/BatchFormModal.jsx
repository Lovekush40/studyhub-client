import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Loader2 } from 'lucide-react';

export default function BatchFormModal({ isOpen, onClose, batchData, coursesList, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    start: '',
    days: '',
    time: '',
    strength: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batchData) {
      setFormData(batchData);
    } else {
      setFormData({
        name: '',
        course: coursesList.length > 0 ? coursesList[0].name : '', // Default to first course
        start: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        days: '',
        time: '',
        strength: 0
      });
    }
  }, [batchData, isOpen, coursesList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'strength' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={batchData ? "Edit Batch" : "Add New Batch"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Batch Name</label>
          <input 
            type="text" 
            name="name" 
            required
            value={formData.name} 
            onChange={handleChange} 
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="e.g. Morning Star Batch"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Associated Course</label>
           <select 
             name="course"
             required
             value={formData.course}
             onChange={handleChange}
             className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
           >
             {coursesList.map(c => (
               <option key={c.id} value={c.name}>{c.name}</option>
             ))}
           </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Start Date</label>
            <input 
              type="text" 
              name="start" 
              required
              value={formData.start} 
              onChange={handleChange} 
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="e.g. 10 Feb 2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Timing</label>
            <input 
              type="text" 
              name="time" 
              required
              value={formData.time} 
              onChange={handleChange} 
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="e.g. 10:00 AM - 12:00 PM"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Active Days</label>
            <input 
              type="text" 
              name="days" 
              required
              value={formData.days} 
              onChange={handleChange} 
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="e.g. Mon, Wed, Fri"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Batch Strength</label>
            <input 
              type="number" 
              name="strength" 
              required
              min="0"
              value={formData.strength} 
              onChange={handleChange} 
              className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Batch'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
