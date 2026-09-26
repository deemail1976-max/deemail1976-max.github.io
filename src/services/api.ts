import {
  User,
  Province,
  District,
  Municipality,
  Ministry,
  Office,
  FiscalYear,
  Procurement,
  ChecklistStage,
  ChecklistItem,
  Inspection,
  InspectionChecklistResult,
  Finding,
  CorrectiveAction,
  EvidenceFile,
  AuditLog,
  DashboardSummary,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('nvc_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    // Mock authentication for GitHub pages without a backend
    const mockUsers: Record<string, { u: string; p: string; role: string; name: string; id: number }> = {
      admin: { u: 'admin', p: 'admin123', role: 'admin', name: 'Admin User', id: 1 },
      inspector: { u: 'inspector', p: 'inspector123', role: 'inspector', name: 'Inspector User', id: 2 },
      reviewer: { u: 'reviewer', p: 'reviewer123', role: 'reviewer', name: 'Reviewer User', id: 3 },
      viewer: { u: 'viewer', p: 'viewer123', role: 'public_officer', name: 'Public Officer', id: 4 },
    };

    const userKey = Object.keys(mockUsers).find(k => mockUsers[k].u === username && mockUsers[k].p === password);
    if (userKey) {
      const mockUser = mockUsers[userKey];
      return {
        token: `mock-token-${mockUser.role}`,
        user: { id: mockUser.id, username: mockUser.u, role: mockUser.role as any, name: mockUser.name, isActive: true },
      };
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'लगइन असफल भयो।');
      return data;
    } catch (error) {
      throw new Error('लगइन असफल भयो। कृपया सही विवरण राख्नुहोस्।');
    }
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('nvc_token');
    
    // Mock get current user for GitHub pages
    if (token?.startsWith('mock-token-')) {
      const role = token.replace('mock-token-', '');
      let username = role;
      let name = role + ' User';
      let id = 1;
      
      if (role === 'admin') { username = 'admin'; name = 'Admin User'; id = 1; }
      else if (role === 'inspector') { username = 'inspector'; name = 'Inspector User'; id = 2; }
      else if (role === 'reviewer') { username = 'reviewer'; name = 'Reviewer User'; id = 3; }
      else if (role === 'public_officer') { username = 'viewer'; name = 'Public Officer'; id = 4; }
      
      return { id, username, role: role as any, name, isActive: true };
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'प्रयोगकर्ता विवरण प्राप्त गर्न सकिएन।');
      return data;
    } catch (error) {
      throw new Error('प्रयोगकर्ता विवरण प्राप्त गर्न सकिएन।');
    }
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'प्रयोगकर्ता सूची प्राप्त गर्न सकिएन।');
    return data;
  },

  async createUser(user: any): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'प्रयोगकर्ता सिर्जना गर्न सकिएन।');
    return data;
  },

  // Master Data
  async getStages(): Promise<ChecklistStage[]> {
    const res = await fetch(`${API_BASE}/master/stages`);
    return res.json();
  },

  async getProvinces(): Promise<Province[]> {
    const res = await fetch(`${API_BASE}/master/provinces`);
    return res.json();
  },

  async getDistricts(provinceId?: number): Promise<District[]> {
    const url = provinceId ? `${API_BASE}/master/districts?province_id=${provinceId}` : `${API_BASE}/master/districts`;
    const res = await fetch(url);
    return res.json();
  },

  async getMunicipalities(districtId?: number): Promise<Municipality[]> {
    const url = districtId ? `${API_BASE}/master/municipalities?district_id=${districtId}` : `${API_BASE}/master/municipalities`;
    const res = await fetch(url);
    return res.json();
  },

  async getMinistries(): Promise<Ministry[]> {
    const res = await fetch(`${API_BASE}/master/ministries`);
    return res.json();
  },

  async getOffices(params?: { ministry_id?: number; province_id?: number }): Promise<Office[]> {
    let url = `${API_BASE}/master/offices`;
    const searchParams = new URLSearchParams();
    if (params?.ministry_id) searchParams.append('ministry_id', String(params.ministry_id));
    if (params?.province_id) searchParams.append('province_id', String(params.province_id));
    if (searchParams.toString()) url += `?${searchParams.toString()}`;
    const res = await fetch(url);
    return res.json();
  },

  async createOffice(office: Partial<Office>): Promise<Office> {
    const res = await fetch(`${API_BASE}/master/offices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(office),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'कार्यालय थप्न सकिएन।');
    return data;
  },

  async getFiscalYears(): Promise<FiscalYear[]> {
    const res = await fetch(`${API_BASE}/master/fiscal-years`);
    return res.json();
  },

  // Procurements
  async getProcurements(filters?: Record<string, string | number>): Promise<Procurement[]> {
    let url = `${API_BASE}/procurements`;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      if (params.toString()) url += `?${params.toString()}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async getProcurement(id: number): Promise<Procurement> {
    const res = await fetch(`${API_BASE}/procurements/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'खरिद विवरण प्राप्त गर्न सकिएन।');
    return data;
  },

  async createProcurement(proc: Partial<Procurement>): Promise<Procurement> {
    const res = await fetch(`${API_BASE}/procurements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(proc),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'खरिद दर्ता गर्न सकिएन।');
    return data;
  },

  async updateProcurement(id: number, proc: Partial<Procurement>): Promise<Procurement> {
    const res = await fetch(`${API_BASE}/procurements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(proc),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'खरिद अद्यावधिक गर्न सकिएन।');
    return data;
  },

  async updateProcurementDoc(procId: number, docId: number, status: string, remarks?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/procurements/${procId}/documents/${docId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, remarks }),
    });
    return res.json();
  },

  // Checklists (Master Admin)
  async getMasterChecklists(params?: { stage_number?: number }): Promise<ChecklistItem[]> {
    let url = `${API_BASE}/checklists`;
    if (params?.stage_number) url += `?stage_number=${params.stage_number}`;
    const res = await fetch(url);
    return res.json();
  },

  async createChecklistItem(item: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const res = await fetch(`${API_BASE}/checklists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'चेकलिस्ट बुँदा थप्न सकिएन।');
    return data;
  },

  async updateChecklistItem(id: number, item: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const res = await fetch(`${API_BASE}/checklists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'चेकलिस्ट बुँदा अद्यावधिक गर्न सकिएन।');
    return data;
  },

  // Inspections
  async getInspections(filters?: Record<string, string | number>): Promise<Inspection[]> {
    let url = `${API_BASE}/inspections`;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      if (params.toString()) url += `?${params.toString()}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async getInspection(id: number): Promise<Inspection> {
    const res = await fetch(`${API_BASE}/inspections/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'निरीक्षण विवरण लोड गर्न सकिएन।');
    return data;
  },

  async createInspection(data: Partial<Inspection>): Promise<Inspection> {
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'निरीक्षण सिर्जना गर्न सकिएन।');
    return resData;
  },

  async updateInspection(id: number, data: Partial<Inspection>): Promise<Inspection> {
    const res = await fetch(`${API_BASE}/inspections/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'निरीक्षण अद्यावधिक गर्न सकिएन।');
    return resData;
  },

  async getInspectionChecklist(id: number, stage?: number): Promise<InspectionChecklistResult[]> {
    let url = `${API_BASE}/inspections/${id}/checklist`;
    if (stage) url += `?stage=${stage}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async saveInspectionChecklistItem(
    inspectionId: number,
    payload: {
      checklist_item_id: number;
      compliance_status: string;
      risk_level?: string;
      evidence_reference?: string;
      observation?: string;
      financial_impact?: number;
      inspector_comment?: string;
    }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/inspections/${inspectionId}/checklist/save-item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'चेकलिस्ट नतिजा सुरक्षित गर्न सकिएन।');
    return data;
  },

  // Findings
  async getFindings(filters?: Record<string, string | number>): Promise<Finding[]> {
    let url = `${API_BASE}/findings`;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      if (params.toString()) url += `?${params.toString()}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async getFinding(id: number): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Finding फेला परेन।');
    return data;
  },

  async createFinding(finding: Partial<Finding>): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(finding),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Finding सिर्जना गर्न सकिएन।');
    return data;
  },

  async updateFinding(id: number, finding: Partial<Finding>): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(finding),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Finding अद्यावधिक गर्न सकिएन।');
    return data;
  },

  async deleteFinding(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/findings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Corrective Actions
  async getCorrectiveActions(filters?: Record<string, string | number>): Promise<CorrectiveAction[]> {
    let url = `${API_BASE}/corrective-actions`;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      if (params.toString()) url += `?${params.toString()}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async createCorrectiveAction(action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const res = await fetch(`${API_BASE}/corrective-actions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(action),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'सुधारात्मक कार्य सिर्जना गर्न सकिएन।');
    return data;
  },

  async updateCorrectiveAction(id: number, action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const res = await fetch(`${API_BASE}/corrective-actions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(action),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'सुधारात्मक कार्य अद्यावधिक गर्न सकिएन।');
    return data;
  },

  async verifyCorrectiveAction(id: number, verification_status: string, verification_remarks?: string): Promise<CorrectiveAction> {
    const res = await fetch(`${API_BASE}/corrective-actions/${id}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ verification_status, verification_remarks }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'प्रमाणीकरण असफल भयो।');
    return data;
  },

  // Evidence Files
  async getEvidenceFiles(inspectionId: number, checklistItemId?: number): Promise<EvidenceFile[]> {
    let url = `${API_BASE}/evidence/inspections/${inspectionId}`;
    if (checklistItemId) url += `?checklist_item_id=${checklistItemId}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async uploadEvidence(formData: FormData): Promise<EvidenceFile> {
    const token = localStorage.getItem('nvc_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/evidence/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'फाइल अपलोड गर्न सकिएन।');
    return data;
  },

  async deleteEvidence(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/evidence/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Dashboard Summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    const token = localStorage.getItem('nvc_token');
    const mockSummary: DashboardSummary = {
      kpis: {
        total_procurements: 120,
        total_inspections: 45,
        in_progress_inspections: 12,
        verified_inspections: 30,
        total_findings: 18,
        high_critical_findings: 4,
        open_findings: 14,
        overdue_corrective_actions: 5,
        total_financial_impact: 4500000,
        total_contract_volume: 120000000,
        total_checklist_stages: 8,
        total_checklist_items: 180,
      },
      compliance: [
        { compliance_status: 'परिपालन', count: 120 },
        { compliance_status: 'आंशिक परिपालन', count: 30 },
        { compliance_status: 'परिपालन नभएको', count: 15 },
      ],
      risk: [
        { risk_level: 'न्यून', count: 50 },
        { risk_level: 'मध्यम', count: 30 },
        { risk_level: 'उच्च', count: 10 },
        { risk_level: 'अत्यन्त उच्च', count: 2 },
      ],
      stages: [
        { stage_id: 1, stage_number: 1, title_ne: 'तयारी', title_en: 'Preparation', items_count: 20, findings_count: 5, financial_impact: 0 },
      ],
      provinces: [
        { id: 1, name_ne: 'कोशी', name_en: 'Koshi', inspections_count: 10, findings_count: 2 },
      ],
      alerts: []
    };

    if (token?.startsWith('mock-token-')) {
      return mockSummary;
    }
    
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return mockSummary;
    }
  },

  // Reports
  async getInspectionReport(inspectionId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/inspection/${inspectionId}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'प्रतिवेदन लोड गर्न सकिएन।');
    return data;
  },

  // Audit Logs
  async getAuditLogs(params?: { action?: string; entity_type?: string }): Promise<AuditLog[]> {
    let url = `${API_BASE}/audit-logs`;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.action) searchParams.append('action', params.action);
      if (params.entity_type) searchParams.append('entity_type', params.entity_type);
      if (searchParams.toString()) url += `?${searchParams.toString()}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'अडिट लग लोड गर्न सकिएन।');
    return Array.isArray(data) ? data : [];
  },
};
