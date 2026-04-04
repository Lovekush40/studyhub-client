import { useState, useEffect } from "react";
import Modal from "./Modal";
import { Loader2 } from "lucide-react";

export default function TestFormModal({
  isOpen,
  onClose,
  testData,
  onSubmit,
  coursesList = [], // ✅ safe default
  batchesList = [] // ✅ safe default
}) {
  const [formData, setFormData] = useState({
    test_name: "",
    subject: "",
    course_id: "",
    batch_id: "",
    date: "",
    duration: "",
    total_marks: "",
    form_url: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (testData) {
      setFormData({
        ...testData,
        course_id: testData.course_id || "" // ✅ important fix
      });
    } else {
      setFormData({
        test_name: "",
        subject: "",
        course_id: "",
        batch_id: "",
        date: "",
        duration: "",
        total_marks: "",
        form_url: ""
      });
    }
  }, [testData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "total_marks"
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course_id) {
      alert("Please select a course");
      return;
    }

    if (!formData.batch_id) {
      alert("Please select a batch");
      return;
    }

    if (!formData.form_url.includes("forms")) {
      alert("Enter valid Google Form URL");
      return;
    }

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={testData ? "Edit Test" : "Create New Test"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Test Name */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Test Name
          </label>
          <input
            type="text"
            name="test_name"
            required
            value={formData.test_name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Course (🔥 FIXED) */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Course
          </label>

          <select
            name="course_id"
            required
            value={formData.course_id}
            onChange={handleChange}
            disabled={coursesList.length === 0}
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
          >
            <option value="">
              {coursesList.length === 0
                ? "No courses available"
                : "Select Course"}
            </option>

            {coursesList.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Batch
          </label>
          <select
            name="batch_id"
            required
            value={formData.batch_id}
            onChange={handleChange}
            disabled={batchesList.length === 0}
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
          >
            <option value="">
              {batchesList.length === 0
                ? "No batches available"
                : "Select Batch"}
            </option>

            {batchesList.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Test Date & Time
          </label>
          <input
            type="datetime-local"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md"
          />
        </div>

        {/* Duration */}
        <input
          type="number"
          name="duration"
          placeholder="Duration (minutes)"
          required
          value={formData.duration}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
        />

        {/* Total Marks */}
        <input
          type="number"
          name="total_marks"
          placeholder="Total Marks"
          required
          value={formData.total_marks}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
        />

        {/* Google Form */}
        <input
          type="url"
          name="form_url"
          placeholder="Google Form URL"
          required
          value={formData.form_url}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
        />

        {/* Buttons */}
        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-md"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center min-w-[110px] px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : testData ? (
              "Update Test"
            ) : (
              "Create Test"
            )}
          </button>
        </div>

      </form>
    </Modal>
  );
}