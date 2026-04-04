const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Centralized API request handler with auth and error management
 */
async function request(path, options = {}) {
  const tokenData = localStorage.getItem('studyhub_user');
  const token = tokenData ? JSON.parse(tokenData).token : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const method = options.method || 'GET';
  console.log(`📡 API Request: ${method} ${path}`, { 
    token: token ? '✓ Present' : '✗ Missing',
    hasBody: !!options.body 
  });

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers,
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    // Parse response
    const responseData = await res.json().catch(() => ({}));

    // Handle non-ok responses
    if (!res.ok) {
      const errorMessage = responseData.error || responseData.message || res.statusText || 'Network error';
      console.error(`❌ API Error ${res.status}:`, errorMessage);
      throw new Error(errorMessage);
    }

    // Extract data from response
    const data = responseData.data !== undefined ? responseData.data : responseData;
    console.log(`✅ API Response: ${method} ${path}`, { 
      status: res.status,
      dataType: Array.isArray(data) ? `Array[${data.length}]` : typeof data
    });
    
    return data;
  } catch (error) {
    console.error(`❌ API Request Failed: ${method} ${path}`, error.message);
    throw error;
  }
}

// ============================================
// DASHBOARD API
// ============================================
export const fetchDashboardStats = async (role) => {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  return request(`/dashboard${query}`);
};

// ============================================
// STUDENTS API
// ============================================
export const fetchStudentsList = async () => {
  return request('/students');
};

export const addStudent = async (studentData) => {
  return request('/students', { 
    method: 'POST', 
    body: studentData 
  });
};

export const updateStudent = async (id, studentData) => {
  return request(`/students/${id}`, { 
    method: 'PUT', 
    body: studentData 
  });
};

export const deleteStudent = async (id) => {
  return request(`/students/${id}`, { 
    method: 'DELETE' 
  });
};

export const enrollStudent = async (studentId, batchId, courseId) => {
  return request('/students/enroll', {
    method: 'POST',
    body: {
      student_id: studentId,
      ...(batchId && { batch_id: batchId }),
      ...(courseId && { course_id: courseId })
    }
  });
};

// ============================================
// COURSES API
// ============================================
export const fetchCourses = async () => {
  return request('/courses');
};

export const getCourse = async (id) => {
  return request(`/courses/${id}`);
};

export const addCourse = async (courseData) => {
  // Ensure subjects is an array
  const payload = {
    ...courseData,
    subjects: Array.isArray(courseData.subjects) 
      ? courseData.subjects 
      : courseData.subjects?.split(',').map(s => s.trim()).filter(s => s) || []
  };

  return request('/courses', { 
    method: 'POST', 
    body: payload 
  });
};

export const updateCourse = async (id, courseData) => {
  // Ensure subjects is an array
  const payload = {
    ...courseData,
    subjects: Array.isArray(courseData.subjects) 
      ? courseData.subjects 
      : courseData.subjects?.split(',').map(s => s.trim()).filter(s => s) || []
  };

  return request(`/courses/${id}`, { 
    method: 'PUT', 
    body: payload 
  });
};

export const deleteCourse = async (id) => {
  return request(`/courses/${id}`, { 
    method: 'DELETE' 
  });
};

// ============================================
// BATCHES API
// ============================================
export const fetchBatches = async () => {
  return request('/batches');
};

export const addBatch = async (batchData) => {
  return request('/batches', { 
    method: 'POST', 
    body: batchData 
  });
};

export const updateBatch = async (id, batchData) => {
  return request(`/batches/${id}`, { 
    method: 'PUT', 
    body: batchData 
  });
};

export const deleteBatch = async (id) => {
  return request(`/batches/${id}`, { 
    method: 'DELETE' 
  });
};

// ============================================
// TESTS API
// ============================================
export const fetchTestsList = async () => {
  return request('/tests');
};

export const addTest = async (testData) => {
  return request('/tests', { 
    method: 'POST', 
    body: testData 
  });
};

export const updateTest = async (id, testData) => {
  return request(`/tests/${id}`, { 
    method: 'PUT', 
    body: testData 
  });
};

export const deleteTest = async (id) => {
  return request(`/tests/${id}`, { 
    method: 'DELETE' 
  });
};

// ============================================
// MATERIALS/CONTENT API
// ============================================
export const fetchMaterials = async (filters = {}) => {
  const query = new URLSearchParams();
  
  if (filters.course_id) query.append('course_id', filters.course_id);
  if (filters.courseId) query.append('course_id', filters.courseId);
  if (filters.subject_id) query.append('subject_id', filters.subject_id);
  if (filters.subjectId) query.append('subject_id', filters.subjectId);
  if (filters.batch_id) query.append('batch_id', filters.batch_id);
  if (filters.batchId) query.append('batch_id', filters.batchId);
  
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/materials${queryString}`);
};

export const addMaterial = async (materialData) => {
  return request('/materials', { 
    method: 'POST', 
    body: materialData 
  });
};

export const updateMaterial = async (id, materialData) => {
  return request(`/materials/${id}`, { 
    method: 'PUT', 
    body: materialData 
  });
};

export const deleteMaterial = async (id) => {
  return request(`/materials/${id}`, { 
    method: 'DELETE' 
  });
};

// ============================================
// AUTHENTICATION API
// ============================================
export const registerUser = async (name, email, password) => {
  return request('/auth/register', { 
    method: 'POST', 
    body: { name, email, password } 
  });
};

export const authenticateUser = async (email, password) => {
  return request('/auth', { 
    method: 'POST', 
    body: { email, password } 
  });
};

export const googleLoginWithToken = async (credential, role = 'STUDENT', requesterRole = 'STUDENT') => {
  return request('/auth/google', { 
    method: 'POST', 
    body: { credential, role, requesterRole } 
  });
};

export const createTeacher = async (token, name, email, password) => {
  return request('/auth/teacher', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { name, email, password }
  });
};

export const fetchDemoGoogleAuth = () => {
  return request('/auth/google');
};