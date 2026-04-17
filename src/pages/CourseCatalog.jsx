import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Check, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAvailableCourses, enrollInCourse, unenrollFromCourse, fetchStudentEnrolledCourses } from '../api';

export default function CourseCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'STUDENT';

  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const coursesData = await fetchAvailableCourses();
      setCourses(coursesData);

      if (isStudent) {
        const enrolled = await fetchStudentEnrolledCourses();
        setEnrolledCourses(enrolled.map(c => c._id || c.id));
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [isStudent]);

  const handleEnroll = async (courseId) => {
    if (!isStudent) {
      alert('Only students can enroll in courses');
      navigate('/login');
      return;
    }

    setEnrollingId(courseId);
    try {
      await enrollInCourse(courseId);
      setEnrolledCourses([...enrolledCourses, courseId]);
      alert('Successfully enrolled in course!');
    } catch (error) {
      alert(error.message || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;

    setEnrollingId(courseId);
    try {
      await unenrollFromCourse(courseId);
      setEnrolledCourses(enrolledCourses.filter(id => id !== courseId));
      alert('Successfully unenrolled from course');
    } catch (error) {
      alert(error.message || 'Failed to unenroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-[var(--color-primary)]" />
          Course Catalog
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          {isStudent 
            ? 'Browse and enroll in courses to start learning for free'
            : 'Login as a student to enroll in courses'
          }
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      )}

      {/* Courses Grid */}
      {!loading && (
        <>
          {courses.length === 0 ? (
            <div className="text-center py-20 border rounded-lg border-dashed text-[var(--color-text-muted)]">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No courses available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const enrolled = isEnrolled(course._id || course.id);
                const courseId = course._id || course.id;

                return (
                  <div
                    key={courseId}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-[var(--color-bg-alt)]"
                  >
                    {/* Course Header */}
                    <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80 p-6 text-white">
                      <h3 className="text-xl font-semibold line-clamp-2">{course.name || course.course_name}</h3>
                    </div>

                    {/* Course Content */}
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-[var(--color-text-muted)] line-clamp-3">
                        {course.description}
                      </p>

                      {/* Subjects */}
                      {course.subjects && course.subjects.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">
                            Subjects
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {course.subjects.map((subject, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-[var(--color-bg)] rounded text-xs font-medium text-[var(--color-primary)]"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Duration */}
                      {course.duration > 0 && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                          <span className="font-medium">Duration:</span> {course.duration} hours
                        </p>
                      )}

                      {/* Status Badge */}
                      {enrolled && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-medium flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Enrolled
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        {enrolled ? (
                          <>
                            <button
                              onClick={() => navigate(`/course-materials/${courseId}`)}
                              className="flex-1 bg-[var(--color-primary)] text-white py-2 rounded-md font-medium hover:opacity-90 transition"
                            >
                              View Content
                            </button>
                            <button
                              onClick={() => handleUnenroll(courseId)}
                              disabled={enrollingId === courseId}
                              className="flex-1 bg-red-100 text-red-700 py-2 rounded-md font-medium hover:bg-red-200 transition disabled:opacity-70"
                            >
                              {enrollingId === courseId ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                              ) : (
                                'Unenroll'
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEnroll(courseId)}
                            disabled={!isStudent || enrollingId === courseId}
                            className="w-full bg-[var(--color-primary)] text-white py-2 rounded-md font-medium hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {enrollingId === courseId ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enrolling...
                              </>
                            ) : !isStudent ? (
                              <>
                                <LogIn className="w-4 h-4" />
                                Login to Enroll
                              </>
                            ) : (
                              'Enroll Now'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
