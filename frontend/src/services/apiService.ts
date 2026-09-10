import { api } from '../lib/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface BusinessData {
  id?: number | string;
  name: string;
  business_type?: string;
  type?: string;
  sector: string;
  industry?: string;
  state: string;
  district: string;
  location?: string;
  investment: number | string;
  employees: number;
  stage?: string;
  activities?: string[];
  registrationNo?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponseData {
  user: AuthUser;
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
  sector?: string;
  state?: string;
  district?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// 0. Authentication endpoints
export const registerUser = async (data: RegisterPayload) => {
  const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
  return res.data?.data;
};

export const loginUser = async (data: LoginPayload) => {
  const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', data);
  return res.data?.data;
};

export const getMe = async () => {
  const res = await api.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
  return res.data?.data?.user;
};

export const logoutUser = async () => {
  try {
    const res = await api.post<ApiResponse<any>>('/auth/logout');
    return res.data;
  } catch {
    return { success: true };
  }
};

// 1. Health
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const res = await api.get('/health');
    return res.data?.success === true;
  } catch {
    return false;
  }
};

// 2. Business endpoints
export const getBusinesses = async () => {
  const res = await api.get<ApiResponse<{ total: number; businesses: any[] }>>('/business');
  return res.data?.data?.businesses || [];
};

export const getBusiness = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/business/${businessId}`);
  return res.data?.data;
};

export const createBusiness = async (data: {
  name: string;
  business_type?: string;
  sector: string;
  state: string;
  district: string;
  investment: number;
  employees: number;
  stage?: string;
}) => {
  const res = await api.post<ApiResponse<any>>('/business', data);
  return res.data?.data;
};

export const updateBusiness = async (
  businessId: number | string,
  data: Partial<{
    name: string;
    business_type: string;
    sector: string;
    state: string;
    district: string;
    investment: number;
    employees: number;
    stage: string;
  }>
) => {
  const res = await api.put<ApiResponse<any>>(`/business/${businessId}`, data);
  return res.data?.data;
};

// 3. Dashboard aggregate
export const getDashboard = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/dashboard/${businessId}`);
  return res.data?.data;
};

// 4. Requirements & Approvals
export const getRequirements = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/requirements/${businessId}`);
  return res.data?.data;
};

export const getApprovals = async (
  businessId: number | string,
  params?: { status?: string; category?: string; search?: string }
) => {
  const res = await api.get<ApiResponse<{ total: number; approvals: any[] }>>(`/approvals/${businessId}`, {
    params,
  });
  return res.data?.data;
};

export const getApprovalDetail = async (businessId: number | string, approvalId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/approvals/${businessId}/${approvalId}`);
  return res.data?.data;
};

export const getWhereToApply = async (approvalId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/approvals/${approvalId}/where-to-apply`);
  return res.data?.data;
};

export const getApprovalDocuments = async (approvalId: number | string, businessId: number | string = 1) => {
  const res = await api.get<ApiResponse<any>>(`/approvals/${approvalId}/documents`, {
    params: { business_id: businessId },
  });
  return res.data?.data;
};

// 5. Documents
export const getDocuments = async (businessId?: number | string) => {
  const res = await api.get<ApiResponse<{ total: number; documents: any[] }>>('/documents', {
    params: businessId ? { business_id: businessId } : undefined,
  });
  return res.data?.data?.documents || [];
};

export const uploadDocument = async (
  businessId: number | string,
  file: File,
  documentType: string,
  applicationId?: number | string | null
) => {
  const formData = new FormData();
  formData.append('business_id', String(businessId));
  formData.append('document_type', documentType);
  if (applicationId) {
    formData.append('application_id', String(applicationId));
  }
  formData.append('file', file);

  const res = await api.post<ApiResponse<any>>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data?.data;
};

export const validateDocument = async (documentId: number | string) => {
  const res = await api.post<ApiResponse<any>>(`/documents/${documentId}/validate`);
  return res.data?.data;
};

export const getDocument = async (documentId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/documents/${documentId}`);
  return res.data?.data;
};

// 6. Applications & Tracker
export const getApplications = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<{ total: number; applications: any[] }>>(`/applications/business/${businessId}`);
  return res.data?.data?.applications || [];
};

export const getApplicationDetail = async (applicationId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/applications/${applicationId}`);
  return res.data?.data;
};

export const createOrRefreshApplication = async (businessId: number | string, requirementId: number | string) => {
  const res = await api.post<ApiResponse<any>>('/applications', {
    business_id: Number(businessId),
    requirement_id: Number(requirementId),
  });
  return res.data?.data;
};

export const updateApplicationStatus = async (applicationId: number | string, status: string) => {
  const res = await api.patch<ApiResponse<any>>(`/applications/${applicationId}/status`, {
    status,
  });
  return res.data?.data;
};

// 7. Dependencies Graph
export const getDependencies = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/dependencies/${businessId}`);
  return res.data?.data;
};

// 8. Risk Intelligence
export const getRisk = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/risk/${businessId}`);
  return res.data?.data;
};

// 9. AI Recommendations
export const getRecommendations = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/recommendations/${businessId}`);
  return res.data?.data;
};

// 10. Grievances
export const getGrievances = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<{ total: number; grievances: any[] }>>(`/grievances/${businessId}`);
  return res.data?.data?.grievances || [];
};

export const createGrievance = async (data: {
  business_id: number | string;
  application_id?: number | string | null;
  category: string;
  description: string;
  priority?: string;
}) => {
  const res = await api.post<ApiResponse<any>>('/grievances', {
    ...data,
    business_id: Number(data.business_id),
    application_id: data.application_id ? Number(data.application_id) : undefined,
  });
  return res.data?.data;
};

export const updateGrievance = async (
  grievanceId: number | string,
  data: { status?: string; priority?: string; description?: string }
) => {
  const res = await api.patch<ApiResponse<any>>(`/grievances/${grievanceId}`, data);
  return res.data?.data;
};

// 11. Schemes & Incentives
export const getIncentives = async (businessId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/incentives/${businessId}`);
  return res.data?.data;
};

// 12. AI Copilot Chat
export const chatCopilot = async (businessId: number | string, message: string) => {
  const res = await api.post<ApiResponse<any>>('/copilot/chat', {
    business_id: Number(businessId),
    message,
  });
  return res.data?.data;
};
