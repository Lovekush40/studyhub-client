import { useState, useEffect } from 'react';
import { X, Trophy, AlertCircle } from 'lucide-react';

export default function ResultFormModal({ isOpen, onClose, onSubmit, tests, students }) {
  const [form, setForm] = useState({
    student_id: "",
    test_id: "",
    score: "",
    rank: ""
  });
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({ student_id: "", test_id: "", score: "", rank: "" });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student_id || !form.test_id || !form.score) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--color-primary)]/10 p-2 rounded-xl">
               <Trophy className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">Upload Result</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
               <AlertCircle className="w-4 h-4 flex-shrink-0" />
               <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Student <span className="text-red-500">*</span></label>
              <select 
                value={form.student_id}
                onChange={e => setForm({...form, student_id: e.target.value})}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all font-medium appearance-none"
              >
                <option value="" disabled>Select a student...</option>
                {students?.map(s => (
                  <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Assessment <span className="text-red-500">*</span></label>
              <select 
                value={form.test_id}
                onChange={e => setForm({...form, test_id: e.target.value})}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all font-medium appearance-none"
              >
                <option value="" disabled>Select an assessment...</option>
                {tests?.map(t => (
                  <option key={t.id || t._id} value={t.id || t._id}>{t.test_name || t.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Final Score <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 85"
                  value={form.score}
                  onChange={e => setForm({...form, score: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Class Rank <span className="text-[var(--color-text-muted)] font-normal ml-1">(Optional)</span></label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={form.rank}
                  onChange={e => setForm({...form, rank: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-[var(--color-primary)]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Publish Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}