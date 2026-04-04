import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardStats } from '../api';
import { Users, Layers, BookOpen, PenTool, CheckCircle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Map icon strings to actual Lucide components dynamically if needed, 
// but for now we'll just handle it statically or via mapping.
const iconMap = {
  Users, Layers, BookOpen, PenTool, CheckCircle, TrendingUp, Clock
};

export default function Dashboard() {
  const { user } = useAuth();
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
  const enrolledBatches = stats?.enrolledBatches || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {(enrolledCourses.length > 0 || enrolledBatches.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {enrolledCourses.length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">My Courses</h3>
              <ul className="space-y-2">
                {enrolledCourses.map((course) => (
                  <li key={course.id || course._id} className="rounded-lg p-3 border border-[var(--color-border)] bg-[var(--color-bg)]">
                    <p className="font-medium">{course.name}</p>
                    {course.description && <p className="text-xs text-[var(--color-text-muted)]">{course.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {enrolledBatches.length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">My Batches</h3>
              <ul className="space-y-2">
                {enrolledBatches.map((batch) => (
                  <li key={batch.id || batch._id} className="rounded-lg p-3 border border-[var(--color-border)] bg-[var(--color-bg)]">
                    <p className="font-medium">{batch.name}</p>
                    {batch.course && <p className="text-xs text-[var(--color-text-muted)]">Course: {batch.course}</p>}
                    {batch.start_date && <p className="text-xs text-[var(--color-text-muted)]">Start: {new Date(batch.start_date).toLocaleDateString()}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {isAdmin ? 'Student Enrollment Trends' : 'My Performance Graph'}
          </h2>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                  <YAxis stroke="var(--color-text-muted)" />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-alt)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                  {isAdmin ? (
                    <Area type="monotone" dataKey="students" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorPrimary)" />
                  ) : (
                    <>
                      <Area type="monotone" dataKey="score" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorPrimary)" name="My Score" />
                      <Area type="monotone" dataKey="avg" stroke="#9ca3af" fillOpacity={0.2} fill="#9ca3af" name="Class Average" strokeDasharray="4 4" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Activity Widget */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {isAdmin ? 'Upcoming Institute Batches' : 'My Today\'s Schedule'}
          </h2>
          <div className="flex-1 space-y-4">
            {upcomingEvents.map((batch) => (
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
            ))}
          </div>
          <button className="mt-4 w-full rounded-md bg-[var(--color-primary)]/10 px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
            {isAdmin ? 'Manage all batches' : 'Join Live Class'}
          </button>
        </div>
      </div>
    </div>
  );
}
