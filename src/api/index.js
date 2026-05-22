const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

let isRefreshing = false;
let refreshPromise = null;

export async function request(path, options = {}) {
  const tokenData = localStorage.getItem('studyhub_user');
  const token = tokenData ? JSON.parse(tokenData).token : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const method = options.method || 'GET';
  const fetchOptions = {
    headers,
    credentials: 'omit', 
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  };

  try {
    let res = await fetch(`${BASE_URL}${path}`, fetchOptions);

    
    if (!res.ok) {
      
      if (res.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = fetch(`${BASE_URL}/auth/refresh`, { credentials: 'include' })
            .then(async r => {
               if (!r.ok) throw new Error('Refresh failed');
               return r.json();
            })
            .then(data => {
                if (data.token) {
                    const ud = JSON.parse(localStorage.getItem('studyhub_user') || '{}');
                    ud.token = data.token;
                    localStorage.setItem('studyhub_user', JSON.stringify(ud));
                    return data.token;
                } else {
                    throw new Error('Refresh token invalid');
                }
            })
            .catch(err => {
                localStorage.removeItem('studyhub_user');
                window.location.href = '/login?error=session_expired';
                throw err;
            })
            .finally(() => {
                isRefreshing = false;
                refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        if (newToken) {
          
          fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
          res = await fetch(`${BASE_URL}${path}`, fetchOptions);
        }
      }

      
      if (!res.ok) {
        const responseData = await res.json().catch(() => ({}));
        const errorMessage = responseData.error || responseData.message || res.statusText || 'Network error';
        console.error(`❌ API Error ${res.status}:`, errorMessage);
        throw new Error(errorMessage);
      }
    }

    
    const responseData = await res.json().catch(() => ({}));
    const data = responseData.data !== undefined ? responseData.data : responseData;
    
    return data;
  } catch (error) {
    console.error(`❌ API Request Failed: ${method} ${path}`, error.message);
    throw error;
  }
}




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

export const fetchStudentById = async (id) => {
  return request(`/students/${id}`);
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

export const allocateBatchesToStudent = async (studentId, batchIds) => {
  if (!Array.isArray(batchIds)) {
    throw new Error('batchIds must be an array');
  }

  return request(`/students/${studentId}/allocate-batches`, {
    method: 'POST',
    body: { batch_ids: batchIds }
  });
};

export const removeBatchFromStudent = async (studentId, batchId) => {
  return request('/students/remove-batch', {
    method: 'POST',
    body: {
      student_id: studentId,
      batch_id: batchId
    }
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




export const fetchCourses = async () => {
  return request('/courses');
};

export const fetchAvailableCourses = async () => {
  return request('/courses/available');
};

export const getCourse = async (id) => {
  return request(`/courses/${id}`);
};

export const addCourse = async (courseData) => {
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


export const enrollInCourse = async (courseId) => {
  return request(`/courses/${courseId}/enroll`, {
    method: 'POST'
  });
};

export const unenrollFromCourse = async (courseId) => {
  return request(`/courses/${courseId}/unenroll`, {
    method: 'POST'
  });
};

export const fetchStudentEnrolledCourses = async () => {
  return request('/student/enrolled-courses');
};




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




export const fetchPublishedResults = async () => {
  return request('/published-results');
};

export const addPublishedResult = async (resultData) => {
  return request('/published-results', {
    method: 'POST',
    body: resultData
  });
};

export const deletePublishedResult = async (id) => {
  return request(`/published-results/${id}`, {
    method: 'DELETE'
  });
};




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

export const fetchCurrentUser = async () => {
  return request('/auth/profile');
};

export const updateProfile = async (profileData) => {
  return request('/auth/profile', {
    method: 'PUT',
    body: profileData
  });
};

export const fetchDemoGoogleAuth = () => {
  return request('/auth/google');
};