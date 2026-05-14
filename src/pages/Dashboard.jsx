import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardStats } from '../api';
import { Users, Layers, BookOpen, PenTool, CheckCircle, TrendingUp, Clock, Loader2 } from 'lucide-react';

// Map icon strings to actual Lucide components dynamically if needed, 
// but for now we'll just handle it statically or via mapping.
const iconMap = {
  Users, Layers, BookOpen, PenTool, CheckCircle, TrendingUp, Clock
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardStats(user?.role);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role) {
      loadData();
    }
  }, [user?.role]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-2 rounded-full font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading Dashboard Analytics
        </div>
      </div>
    );
  }

  // Helper to resolve icon component from string mapping or fallback
  const getIcon = (iconName) => {
    // We didn't save string names in the mock data, but we can map based on title or use a default
    // Wait, the mockData currently doesn't store the icon reference because functions can't be serialized.
    // Instead we can map based on the 'name' field
    const nameMap = {
      'Total Students': Users,
      'Active Batches': Layers,
      'Total Courses': BookOpen,
      'Tests Conducted': PenTool,
      'My Attendance': CheckCircle,
      'Upcoming Tests': Clock,
      'Enrolled Courses': BookOpen,
      'Average Score': TrendingUp
    };
    return nameMap[iconName] || BookOpen;
  };

  const kpis = stats?.kpis || [];
  const chartData = stats?.chartData || [];
  const upcomingEvents = stats?.upcomingEvents || [];
  const enrolledCourses = stats?.enrolledCourses || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {kpis.map((stat) => {
          const IconComp = getIcon(stat.name);
          return (
            <div key={stat.name} className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <dt>
                <div className={`absolute rounded-md p-3 ${stat.bg}`}>
                  <IconComp className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-[var(--color-text-muted)]">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                <p className="text-2xl font-semibold text-[var(--color-text)]">{stat.value}</p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {enrolledCourses.length > 0 && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold mb-3">My Courses</h3>
            <ul className="space-y-2 flex-1 overflow-y-auto max-h-[400px] pr-2">
              {enrolledCourses.map((course) => (
                <li 
                  key={course.id || course._id} 
                  onClick={() => navigate(`/course/${course.id || course._id}`)}
                  className="rounded-lg p-3 border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-primary)]/5 cursor-pointer transition-all hover:shadow-sm group flex items-center gap-3"
                >
                  <div className="p-2 bg-[var(--color-primary)]/10 rounded-md text-[var(--color-primary)]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-[var(--color-primary)] transition-colors">{course.name}</p>
                    {course.description && <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{course.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Activity Widget */}
        <div className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 shadow-sm flex flex-col ${enrolledCourses.length > 0 ? '' : 'lg:col-span-2'}`}>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {isAdmin ? 'Upcoming Assessments' : 'My Upcoming Assessments'}
          </h2>
          <div className="flex-1 space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((batch) => (
                <div key={batch.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-[var(--color-bg)] transition-colors border border-transparent hover:border-[var(--color-border)]">
                  <div className="flex-shrink-0">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                      <Layers className="h-4 w-4 text-[var(--color-primary)]" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)]">{batch.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{batch.time}</p>
                    <p className="text-xs text-[var(--color-primary)] mt-1 font-medium bg-[var(--color-primary)]/10 inline-block px-2 py-0.5 rounded-md">{batch.tags}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 text-[var(--color-text-muted)]">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p>No upcoming schedule for today</p>
                {!isAdmin && <p className="text-sm mt-1">Enroll in a course to start learning</p>}
              </div>
            )}
          </div>
          {upcomingEvents.length > 0 ? (
            <button 
              onClick={() => navigate(isAdmin ? '/tests' : '/tests')}
              className="mt-4 w-full rounded-md bg-[var(--color-primary)]/10 px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              {isAdmin ? 'Manage all assessments' : 'View Assessments'}
            </button>
          ) : (
            !isAdmin && (
              <button 
                onClick={() => navigate('/catalog')}
                className="mt-4 w-full rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:brightness-110 shadow-sm transition-all">
                Explore Courses
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
