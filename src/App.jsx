  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { ThemeProvider } from './context/ThemeContext';
  import { AuthProvider, useAuth } from './context/AuthContext';
  import MainLayout from './components/Layout/MainLayout';
  import ProtectedRoute from './components/ProtectedRoute';
  import Login from './pages/auth/Login';
  import Dashboard from './pages/Dashboard';
  import LandingPage from './pages/LandingPage';
  import Profile from './pages/Profile';
  import PublishedResults from './pages/PublishedResults';

  import CoursesAndBatches from './pages/CoursesAndBatches';
  import TestsAndResults from './pages/TestsAndResults';
  import CourseMaterials from './pages/CourseMaterials';
  import CourseCatalog from './pages/CourseCatalog';
  import WriteReview from './pages/WriteReview';
  import ReviewModeration from './components/Admin/ReviewModeration';
  import AnnouncementManagement from './components/Admin/AnnouncementManagement';
  import './App.css';

  // Placeholder components for unimplemented paths
  const PlaceholderPage = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-in fade-in duration-500">
      <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[var(--color-primary)]/20 to-blue-500/20 flex items-center justify-center mb-6">
        <span className="text-4xl text-[var(--color-primary)]">🚧</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] mb-2">{title} Page</h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-md">
        This section is under construction. It will be implemented in the next development phase based on the ER specs.
      </p>
    </div>
  );


  function App() {
    return (
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Full Screen Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Navigate to="/login" replace />} />

              {/* Layout Wraps Everything Else */}
              <Route element={<MainLayout />}>
                {/* Always show LandingPage at Root */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Features and Pricing placeholder pages, accessible publicly */}
                <Route path="/features" element={<PlaceholderPage title="Features Showcase" />} />
                <Route path="/pricing" element={<PlaceholderPage title="Pricing Tiers" />} />

                {/* Secure Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Admin Only Routes */}

                  <Route path="/moderate-reviews" element={<ProtectedRoute allowedRoles={['ADMIN']}><div className="p-6"><ReviewModeration /></div></ProtectedRoute>} />
                  <Route path="/manage-announcements" element={<ProtectedRoute allowedRoles={['ADMIN']}><div className="p-6"><AnnouncementManagement /></div></ProtectedRoute>} />

                  {/* Shared Accessible Routes */}
                  <Route path="/reports" element={<PublishedResults />} />
                  <Route path="/batches" element={<CoursesAndBatches />} />
                  <Route path="/courses" element={<CoursesAndBatches />} />
                  <Route path="/catalog" element={<CourseCatalog />} />
                  <Route path="/browse-courses" element={<CourseCatalog />} />
                  <Route path="/tests" element={<TestsAndResults />} />
                  <Route path="/course/:id" element={<CourseMaterials />} />
                  <Route path="/course-materials/:id" element={<CourseMaterials />} />
                  <Route path="/content" element={<PlaceholderPage title="Content Library" />} />
                  <Route path="/write-review" element={<WriteReview />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  export default App;
