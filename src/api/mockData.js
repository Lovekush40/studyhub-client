export let mockCourses = [
  { id: 'C1', name: 'JEE Advanced Preparation', subjects: ['Physics', 'Chemistry', 'Mathematics'], activeBatches: 3, description: 'Comprehensive 2-year program for engineering aspirants.' },
  { id: 'C2', name: 'NEET Foundation', subjects: ['Physics', 'Chemistry', 'Biology'], activeBatches: 2, description: 'Targeted program for medical entrance exams.' },
  { id: 'C3', name: 'Class 12 Boards Crash Course', subjects: ['Physics', 'Mathematics'], activeBatches: 4, description: 'Intensive 3-month board prep program.' },
];

export let mockBatches = [
  { id: 'B1', name: 'JEE Adv 2026 - Morning', course: 'JEE Advanced Preparation', start: '10 Feb 2024', days: 'Mon, Wed, Fri', time: '08:00 AM - 12:00 PM', strength: 45 },
  { id: 'B2', name: 'NEET Target 2025', course: 'NEET Foundation', start: '15 Jan 2024', days: 'Tue, Thu, Sat', time: '02:00 PM - 06:00 PM', strength: 60 },
  { id: 'B3', name: 'Class 12 Boards - Physics Only', course: 'Class 12 Boards Crash Course', start: '01 Mar 2024', days: 'Mon-Fri', time: '05:00 PM - 07:00 PM', strength: 30 },
];

export let mockTests = [
  {
    id: "T1",
    test_name: "JEE Adv Mock Test 1",
    subject: "Full Syllabus",
    course_id: "C1", // ✅ link with course
    totalMarks: 360,
    duration: 180, // ✅ number (minutes)
    date: "2026-03-30T10:00",
    form_url: "https://forms.gle/test1",
  },
  {
    id: "T2",
    test_name: "Physics Mechanics Unit Test",
    subject: "Physics",
    course_id: "C1",
    totalMarks: 100,
    duration: 60,
    date: "2026-02-20T10:00",
    form_url: "https://forms.gle/test2",
    avgScore: 68,
    userScore: 82,
  },
  {
    id: "T3",
    test_name: "Chemistry Organic Basics",
    subject: "Chemistry",
    course_id: "C2",
    totalMarks: 50,
    duration: 45,
    date: "2026-02-18T10:00",
    form_url: "https://forms.gle/AghozEbyP9PURuwj9",
    avgScore: 35,
    userScore: 45,
  },
];

export let mockStudents = [
  { id: 'STU101', name: 'Aarav Sharma', batch: 'JEE Adv 2026 - Morning', attendance: 92, lastTest: 85, status: 'Active', enrollmentDate: '10 Jan 2024' },
  { id: 'STU102', name: 'Aditi Verma', batch: 'NEET Target 2025', attendance: 88, lastTest: 91, status: 'Active', enrollmentDate: '12 Jan 2024' },
  { id: 'STU103', name: 'Rohan Gupta', batch: 'JEE Adv 2026 - Morning', attendance: 75, lastTest: 62, status: 'Warning', enrollmentDate: '15 Jan 2024' },
  { id: 'STU104', name: 'Sneha Patel', batch: 'Class 12 Boards - Physics Only', attendance: 98, lastTest: 95, status: 'Active', enrollmentDate: '20 Jan 2024' },
  { id: 'STU105', name: 'Vikram Singh', batch: 'NEET Target 2025', attendance: 60, lastTest: 45, status: 'Critical', enrollmentDate: '01 Feb 2024' },
];

export let mockAdminStats = {
  kpis: [
    { name: 'Total Students', value: '1,245', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Active Batches', value: '42', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Total Courses', value: '18', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Tests Conducted', value: '156', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ],
  chartData: [
    { name: 'Jan', students: 400, revenues: 2400 },
    { name: 'Feb', students: 300, revenues: 1398 },
    { name: 'Mar', students: 200, revenues: 9800 },
    { name: 'Apr', students: 278, revenues: 3908 },
    { name: 'May', students: 189, revenues: 4800 },
    { name: 'Jun', students: 239, revenues: 3800 },
    { name: 'Jul', students: 349, revenues: 4300 },
  ],
  upcomingEvents: [
    { id: 1, name: 'JEE Advanced 2026', time: '10:00 AM - 12:00 PM', tags: 'Physics' },
    { id: 2, name: 'NEET Target Batch', time: '02:00 PM - 05:00 PM', tags: 'Biology' },
    { id: 3, name: 'Class 12 Boards', time: '05:30 PM - 07:00 PM', tags: 'Maths' },
  ]
};

export const mockStudentStats = {
  kpis: [
    { name: 'My Attendance', value: '94%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Upcoming Tests', value: '2', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Enrolled Courses', value: '3', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Average Score', value: '78%', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ],
  chartData: [
    { name: 'Test 1', score: 65, avg: 55 },
    { name: 'Test 2', score: 72, avg: 60 },
    { name: 'Test 3', score: 68, avg: 58 },
    { name: 'Test 4', score: 85, avg: 62 },
    { name: 'Test 5', score: 79, avg: 64 },
    { name: 'Test 6', score: 92, avg: 68 },
  ],
  upcomingEvents: [
    { id: 1, name: 'JEE Advanced 2026', time: '10:00 AM - 12:00 PM', tags: 'Physics' },
    { id: 2, name: 'NEET Target Batch', time: '02:00 PM - 05:00 PM', tags: 'Biology' },
  ]
};
