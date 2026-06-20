const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('mock_access_token') || localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res, contextName) => {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('mock_access_token');
    localStorage.removeItem('token');
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(text || `${contextName} failed`);
  }
  if (!res.ok || !data.success) {
    throw {
      status: res.status,
      message: data.message || `${contextName} failed`,
      errors: data.errors
    };
  }
  return data;
};

// Generic HTTP entity wrapper
class HttpEntity {
  constructor(endpoint, name, serializers = {}) {
    this.endpoint = endpoint;
    this.name = name;
    this.toBackend = serializers.toBackend || ((p) => p);
    this.toFrontend = serializers.toFrontend || ((i) => i);
  }

  async list(order = '', limit = 100) {
    const headers = getHeaders();
    let url = `${BASE_URL}${this.endpoint}`;
    const params = new URLSearchParams();
    if (order) params.append('sort', order);
    if (limit) params.append('limit', limit);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, { headers });
    const data = await handleResponse(res, `List ${this.name}`);
    
    const items = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);
    return items.map(this.toFrontend);
  }

  async get(id) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}${this.endpoint}/${id}`, { headers });
    const data = await handleResponse(res, `Get ${this.name}`);
    return this.toFrontend(data.data);
  }

  async create(payload) {
    const headers = getHeaders();
    const backendPayload = this.toBackend(payload);
    
    const res = await fetch(`${BASE_URL}${this.endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendPayload)
    });
    const data = await handleResponse(res, `Create ${this.name}`);
    return this.toFrontend(data.data);
  }

  async update(id, payload) {
    const headers = getHeaders();
    const backendPayload = this.toBackend(payload);
    
    const res = await fetch(`${BASE_URL}${this.endpoint}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(backendPayload)
    });
    const data = await handleResponse(res, `Update ${this.name}`);
    return this.toFrontend(data.data);
  }

  async delete(id) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}${this.endpoint}/${id}`, {
      method: 'DELETE',
      headers
    });
    await handleResponse(res, `Delete ${this.name}`);
    return { success: true };
  }
}

// ---------------------- SERALIZATION RULES ----------------------

const staffSerializers = {
  toBackend: (p) => ({
    employeeId: p.employee_id,
    fullName: p.full_name,
    mobile: p.mobile,
    email: p.email,
    address: p.address || 'Ashram Campus',
    role: p.role || 'Admin',
    joiningDate: p.joining_date || new Date().toISOString(),
    status: p.status || 'Active',
    photo: p.photo || ''
  }),
  toFrontend: (i) => ({
    id: i._id,
    employee_id: i.employeeId,
    full_name: i.fullName,
    mobile: i.mobile,
    email: i.email,
    address: i.address,
    role: i.role,
    joining_date: i.joiningDate,
    status: i.status,
    photo: i.photo,
    created_date: i.createdAt
  })
};

const residentSerializers = {
  toBackend: (p) => ({
    residentId: p.resident_id,
    name: p.name,
    age: Number(p.age),
    gender: p.gender || 'Male',
    medicalNotes: p.medical_notes || '',
    admissionDate: p.admission_date || new Date().toISOString(),
    status: p.status || 'Active',
    photo: p.photo || '',
    guardianDetails: {
      name: p.guardian_name || 'None',
      mobile: p.guardian_phone || '0000000000',
      relation: p.guardian_relation || 'Self'
    }
  }),
  toFrontend: (i) => ({
    id: i._id,
    resident_id: i.residentId,
    name: i.name,
    age: i.age,
    gender: i.gender,
    medical_notes: i.medicalNotes,
    admission_date: i.admissionDate,
    status: i.status,
    photo: i.photo,
    guardian_name: i.guardianDetails?.name,
    guardian_phone: i.guardianDetails?.mobile,
    guardian_relation: i.guardianDetails?.relation,
    created_date: i.createdAt
  })
};

const donorSerializers = {
  toBackend: (p) => ({
    name: p.full_name || p.name,
    mobile: p.mobile || '0000000000',
    email: p.email,
    address: p.address || ''
  }),
  toFrontend: (i) => ({
    id: i._id,
    full_name: i.name,
    name: i.name,
    mobile: i.mobile,
    email: i.email,
    address: i.address,
    created_date: i.createdAt
  })
};

const donationSerializers = {
  toBackend: (p) => {
    const payload = {
      amount: Number(p.amount),
      transactionId: p.transaction_id || p.transactionId,
      screenshot: p.screenshot_url || p.screenshot || '',
      verificationStatus: p.verification_status || p.verificationStatus || 'Pending',
      notes: p.purpose || p.message || p.notes || ''
    };
    if (p.donor_id || p.donorId) {
      payload.donorId = p.donor_id || p.donorId;
    } else if (p.donor_name) {
      payload.donorDetails = {
        name: p.donor_name,
        mobile: p.mobile || '0000000000',
        email: p.email || `${p.donor_name.replace(/\s+/g, '').toLowerCase() || 'donor'}@example.com`,
        address: p.address || ''
      };
    }
    return payload;
  },
  toFrontend: (i) => ({
    id: i._id,
    donor_id: i.donorId?._id || i.donorId,
    donor_name: i.donorId?.name || 'Donor',
    mobile: i.donorId?.mobile || '',
    email: i.donorId?.email || '',
    amount: i.amount,
    transaction_id: i.transactionId,
    screenshot_url: i.screenshot,
    verification_status: i.verificationStatus,
    purpose: i.notes,
    message: i.notes,
    donation_date: i.donationDate,
    created_date: i.createdAt
  })
};

const volunteerSerializers = {
  toBackend: (p) => ({
    volunteerId: p.volunteer_id || Math.random().toString(36).substr(2, 9).toUpperCase(),
    fullName: p.full_name,
    mobile: p.mobile,
    email: p.email,
    address: p.address || '',
    skills: Array.isArray(p.skills) ? p.skills : (p.skills ? p.skills.split(',').map(s => s.trim()) : []),
    interests: Array.isArray(p.interests) ? p.interests : (p.interests ? p.interests.split(',').map(i => i.trim()) : []),
    totalHours: Number(p.total_hours || p.totalHours) || 0
  }),
  toFrontend: (i) => ({
    id: i._id,
    volunteer_id: i.volunteerId,
    full_name: i.fullName,
    name: i.fullName,
    mobile: i.mobile,
    email: i.email,
    address: i.address,
    skills: Array.isArray(i.skills) ? i.skills.join(', ') : i.skills,
    interests: Array.isArray(i.interests) ? i.interests.join(', ') : i.interests,
    total_hours: i.totalHours,
    created_date: i.createdAt,
    join_date: i.createdAt
  })
};

const eventSerializers = {
  toBackend: (p) => ({
    title: p.title,
    description: p.description || '',
    date: p.event_date || p.date || new Date().toISOString(),
    location: p.location || 'Ashram Area',
    gallery: p.gallery_urls || (p.image_url ? [p.image_url] : [])
  }),
  toFrontend: (i) => ({
    id: i._id,
    title: i.title,
    description: i.description,
    event_date: i.date,
    date: i.date,
    location: i.location,
    gallery_urls: i.gallery || [],
    image_url: i.gallery && i.gallery.length > 0 ? i.gallery[0] : '',
    status: new Date(i.date) >= new Date() ? 'upcoming' : 'completed',
    created_date: i.createdAt
  })
};

const wishWallSerializers = {
  toBackend: (p) => ({
    title: p.title || p.wish_item || 'Welfare Need',
    quantity: 1,
    priority: p.priority || 'Medium',
    status: p.status || 'Pending',
    description: JSON.stringify({
      description: p.description || '',
      category: p.category || 'Other',
      estimated_cost: Number(p.estimated_cost) || 0,
      requested_by: p.requested_by || 'Staff',
      target_date: p.target_date || ''
    })
  }),
  toFrontend: (i) => {
    let extra = {};
    try {
      extra = JSON.parse(i.description);
    } catch (e) {
      extra = { description: i.description };
    }
    return {
      id: i._id,
      title: i.title,
      description: extra.description || i.description,
      category: extra.category || 'Other',
      estimated_cost: extra.estimated_cost || 0,
      requested_by: extra.requested_by || 'Staff',
      target_date: extra.target_date || '',
      priority: i.priority,
      status: i.status === 'Pending' ? 'Open' : (i.status === 'Partially Fulfilled' ? 'In Progress' : i.status),
      created_date: i.createdAt
    };
  }
};

const auditLogSerializers = {
  toFrontend: (i) => ({
    id: i._id,
    user_name: i.user?.name || 'System User',
    action: i.action,
    details: typeof i.details === 'object' ? JSON.stringify(i.details) : i.details,
    created_date: i.timestamp
  })
};

// ---------------------- DYNAMIC QR CONFIG LOGIC ----------------------
const qrEntity = {
  list: async () => {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/qr/details`, { headers });
    const data = await handleResponse(res, 'Fetch QR Config');
    
    const genRes = await fetch(`${BASE_URL}/qr/generate`, { headers });
    const genData = await handleResponse(genRes, 'Generate QR');
    
    return [{
      id: 'qr-config-id',
      title: data.data.upiName,
      purpose: data.data.upiId,
      qr_code_url: genData.qrDataUrl,
      qr_image: genData.qrDataUrl,
      status: 'Active',
      created_date: new Date().toISOString()
    }];
  },
  get: async () => {
    const listData = await qrEntity.list();
    return listData[0];
  },
  create: async (payload) => {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/qr/store`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        upiId: payload.purpose,
        upiName: payload.title
      })
    });
    const data = await handleResponse(res, 'Save QR Config');
    
    const genRes = await fetch(`${BASE_URL}/qr/generate`, { headers });
    const genData = await handleResponse(genRes, 'Generate QR');

    return {
      id: data.data._id,
      title: data.data.upiName,
      purpose: data.data.upiId,
      qr_code_url: genData.qrDataUrl,
      qr_image: genData.qrDataUrl,
      status: 'Active'
    };
  },
  update: async (id, payload) => {
    return qrEntity.create(payload);
  },
  delete: async () => {
    return { success: true };
  }
};

// ---------------------- EXPORTED CLIENT ----------------------
export const base44 = {
  auth: {
    me: async () => {
      const headers = getHeaders();
      const res = await fetch(`${BASE_URL}/auth/me`, { headers });
      const data = await handleResponse(res, 'Get Me');
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      };
    },
    loginViaEmailPassword: async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await handleResponse(res, 'Login');
      localStorage.setItem('mock_access_token', data.token);
      localStorage.setItem('token', data.token);
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      };
    },
    logout: (redirectUrl) => {
      localStorage.removeItem('mock_access_token');
      localStorage.removeItem('token');
      if (redirectUrl) {
        window.location.href = '/login';
      }
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = '/login';
    },
    loginWithProvider: (provider, redirectUrl) => {
      window.location.href = '/login';
    },
    register: async ({ email, password }) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: email.split('@')[0], email, password, role: 'Admin' })
      });
      return handleResponse(res, 'Register');
    },
    verifyOtp: async ({ email, otpCode }) => {
      return { access_token: 'mock-token-xyz' };
    },
    resendOtp: async (email) => {
      return { success: true };
    },
    setToken: (token) => {
      localStorage.setItem('mock_access_token', token);
      localStorage.setItem('token', token);
    }
  },
  entities: {
    Staff: new HttpEntity('/staff', 'Staff', staffSerializers),
    Resident: new HttpEntity('/residents', 'Resident', residentSerializers),
    Donation: new HttpEntity('/donations', 'Donation', donationSerializers),
    DonationSubmission: new HttpEntity('/donations', 'Donation', donationSerializers),
    Donor: new HttpEntity('/donors', 'Donor', donorSerializers),
    Volunteer: new HttpEntity('/volunteers', 'Volunteer', volunteerSerializers),
    Event: new HttpEntity('/events', 'Event', eventSerializers),
    WishWall: new HttpEntity('/requirements', 'WishWall', wishWallSerializers),
    QRDonation: qrEntity,
    AuditLog: new HttpEntity('/dashboard', 'AuditLog', { toFrontend: auditLogSerializers.toFrontend })
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('mock_access_token') || localStorage.getItem('token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${BASE_URL}/upload`, {
          method: 'POST',
          headers,
          body: formData
        });
        const data = await handleResponse(res, 'Upload File');
        return { file_url: data.file_url };
      }
    }
  }
};
