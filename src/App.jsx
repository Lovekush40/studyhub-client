  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { ThemeProvider } from './context/ThemeContext';
  import { AuthProvider, useAuth } from './context/AuthContext';
  import MainLayout from './components/Layout/MainLayout';
  import ProtectedRoute from './components/ProtectedRoute';
  import Login from './pages/auth/Login';
  import Dashboard from './pages/Dashboard';
  import LandingPage from './pages/LandingPage';
  import Profile from './pages/Profile';
  import StudentsList from './pages/StudentsList';
  import CoursesAndBatches from './pages/CoursesAndBatches';
  import TestsAndResults from './pages/TestsAndResults';
  import CourseMaterials from './pages/CourseMaterials';
import CourseCatalog from './pages/CourseCatalog';
  );

  function HomeOrDashboard() {
    const { user } = useAuth();
    return user ? <Dashboard /> : <LandingPage />;
  }

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
                {/* Dynamic Root Route */}
                <Route path="/" element={<HomeOrDashboard />} />
                
                {/* Features and Pricing placeholder pages, accessible publicly */}
                <Route path="/features" element={<PlaceholderPage title="Features Showcase" />} />
                <Route path="/pricing" element={<PlaceholderPage title="Pricing Tiers" />} />

                {/* Secure Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Admin Only Routes */}
                  <Route path="/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><StudentsList /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><PlaceholderPage title="Institute Analytics" /></ProtectedRoute>} />

                  {/* Shared Accessible Routes */}
                  <Route path="/batches" element={<CoursesAndBatches />} />
                  <Route path="/courses" element={<CoursesAndBatches />} />
                  <Route path="/catalog" element={<CourseCatalog />} />
                  <Route path="/browse-courses" element={<CourseCatalog />} />
                  <Route path="/tests" element={<TestsAndResults />} />
                  <Route path="/course/:id" element={<CourseMaterials />} />
                  <Route path="/course-materials/:id" element={<CourseMaterials />} />
                  <Route path="/content" element={<PlaceholderPage title="Content Library" />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  export default App;
