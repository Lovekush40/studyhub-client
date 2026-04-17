import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function MaterialFormModal({
  isOpen,
  onClose,
  materialData,
  onSubmit,
  subjects = [],
  preSelectedSubject = ""
}) {
  const [form, setForm] = useState({
    type: "videos",
    title: "",
    url: "",
    description: "",
    subject_name: preSelectedSubject || (subjects.length > 0 ? subjects[0] : "")
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (materialData) {
      setForm({
        type: materialData.type || "videos",
        title: materialData.title || "",
        url: materialData.url || "",
        description: materialData.description || "",
        subject_name: preSelectedSubject || materialData.subject_name || (subjects.length > 0 ? subjects[0] : "")
      });
    } else {
      setForm({
        type: "videos",
        title: "",
        url: "",
        description: "",
        subject_name: preSelectedSubject || (subjects.length > 0 ? subjects[0] : "")
      });
    }
  }, [materialData, isOpen, preSelectedSubject, subjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ validation
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!form.url.trim()) {
      alert("URL is required");
      return;
    }

    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">

      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-lg">

        {/* Header */}
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          {materialData ? "Edit Material" : "Add Material"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Subject (if available) */}
          {subjects.length > 0 && (
            <div>
              <label className="text-sm text-[var(--color-text-muted)] block mb-1">
                Subject
              </label>
              <select
                value={form.subject_name}
                onChange={(e) =>
                  setForm({ ...form, subject_name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)]"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="text-sm text-[var(--color-text-muted)] block mb-1">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)]"
            >
              <option value="videos">Video</option>
              <option value="notes">Notes</option>
              <option value="assignments">Assignment</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm text-[var(--color-text-muted)] block mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-[var(--color-text-muted)] block mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="Enter description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] resize-none h-20"
            />
          </div>

          {/* URL */}
          <div>
            <label className="text-sm text-[var(--color-text-muted)] block mb-1">
              URL / Link
            </label>
            <input
              type="url"
              placeholder={
                form.type === "videos"
                  ? "https://youtube.com/..."
                  : "https://link..."
              }
              value={form.url}
              onChange={(e) =>
                setForm({ ...form, url: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg-alt)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center min-w-[90px] px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : materialData ? (
                "Update"
              ) : (
                "Save"
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}