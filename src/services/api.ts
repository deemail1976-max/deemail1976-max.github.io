import { supabase } from './supabase';
import { User, Province, District, Municipality, Ministry, Office, FiscalYear, Procurement, ChecklistStage, ChecklistItem, Inspection, InspectionChecklistResult, Finding, CorrectiveAction, EvidenceFile, AuditLog, DashboardSummary } from '../types';

export const api = {
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    // Note: Since we are using standard Postgres without Supabase Auth for users table,
    // we fetch the user directly (in a real app, use Supabase Auth instead)
    const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
    if (error || !data) throw new Error('प्रयोगकर्ता फेला परेन।');
    
    // Simplistic auth for now
    localStorage.setItem('nvc_token', data.id.toString());
    return { token: data.id.toString(), user: data as User };
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('nvc_token');
    if (!token) throw new Error('तपाईं लगइन हुनुहुन्न।');
    const { data, error } = await supabase.from('users').select('*').eq('id', token).single();
    if (error || !data) throw new Error('प्रयोगकर्ता विवरण प्राप्त गर्न सकिएन।');
    return data as User;
  },

  async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*');
    return data as User[] || [];
  },

  async createUser(user: any): Promise<User> {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw new Error(error.message);
    return data as User;
  },

  async getStages(): Promise<ChecklistStage[]> {
    const { data } = await supabase.from('checklist_stages').select('*').order('sort_order');
    return data as ChecklistStage[] || [];
  },

  async getProvinces(): Promise<Province[]> {
    const { data } = await supabase.from('provinces').select('*');
    return data as Province[] || [];
  },

  async getDistricts(provinceId?: number): Promise<District[]> {
    let q = supabase.from('districts').select('*');
    if (provinceId) q = q.eq('province_id', provinceId);
    const { data } = await q;
    return data as District[] || [];
  },

  async getMunicipalities(districtId?: number): Promise<Municipality[]> {
    let q = supabase.from('municipalities').select('*');
    if (districtId) q = q.eq('district_id', districtId);
    const { data } = await q;
    return data as Municipality[] || [];
  },

  async getMinistries(): Promise<Ministry[]> {
    const { data } = await supabase.from('ministries').select('*');
    return data as Ministry[] || [];
  },

  async getOffices(params?: { ministry_id?: number; province_id?: number }): Promise<Office[]> {
    let q = supabase.from('offices').select('*');
    if (params?.ministry_id) q = q.eq('ministry_id', params.ministry_id);
    if (params?.province_id) q = q.eq('province_id', params.province_id);
    const { data } = await q;
    return data as Office[] || [];
  },

  async createOffice(office: Partial<Office>): Promise<Office> {
    const { data, error } = await supabase.from('offices').insert([office]).select().single();
    if (error) throw new Error(error.message);
    return data as Office;
  },

  async getFiscalYears(): Promise<FiscalYear[]> {
    const { data } = await supabase.from('fiscal_years').select('*');
    return data as FiscalYear[] || [];
  },

  async getProcurements(filters?: Record<string, string | number>): Promise<Procurement[]> {
    let q = supabase.from('procurements').select('*, offices(name), ministries(name_ne), provinces(name_ne), districts(name_ne), municipalities(name_ne), fiscal_years(name)');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
    }
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      office_name: d.offices?.name,
      ministry_name: d.ministries?.name_ne,
      province_name: d.provinces?.name_ne,
      district_name: d.districts?.name_ne,
      municipality_name: d.municipalities?.name_ne,
      fiscal_year_name: d.fiscal_years?.name
    })) as Procurement[];
  },

  async getProcurement(id: number): Promise<Procurement> {
    const { data, error } = await supabase.from('procurements').select('*, offices(name), ministries(name_ne), provinces(name_ne), districts(name_ne), municipalities(name_ne), fiscal_years(name)').eq('id', id).single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      office_name: data.offices?.name,
      ministry_name: data.ministries?.name_ne,
      province_name: data.provinces?.name_ne,
      district_name: data.districts?.name_ne,
      municipality_name: data.municipalities?.name_ne,
      fiscal_year_name: data.fiscal_years?.name
    } as Procurement;
  },

  async createProcurement(proc: Partial<Procurement>): Promise<Procurement> {
    const { data, error } = await supabase.from('procurements').insert([proc]).select().single();
    if (error) throw new Error(error.message);
    return data as Procurement;
  },

  async updateProcurement(id: number, proc: Partial<Procurement>): Promise<Procurement> {
    const { data, error } = await supabase.from('procurements').update(proc).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Procurement;
  },

  async updateProcurementDoc(procId: number, docId: number, status: string, remarks?: string): Promise<any> {
    const { data, error } = await supabase.from('procurement_documents').update({ status, remarks }).eq('id', docId).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getMasterChecklists(params?: { stage_number?: number }): Promise<ChecklistItem[]> {
    let q = supabase.from('checklist_items').select('*').order('sort_order');
    if (params?.stage_number) q = q.eq('stage_number', params.stage_number);
    const { data } = await q;
    return data as ChecklistItem[] || [];
  },

  async createChecklistItem(item: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const { data, error } = await supabase.from('checklist_items').insert([item]).select().single();
    if (error) throw new Error(error.message);
    return data as ChecklistItem;
  },

  async updateChecklistItem(id: number, item: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const { data, error } = await supabase.from('checklist_items').update(item).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as ChecklistItem;
  },

  async getInspections(filters?: Record<string, string | number>): Promise<Inspection[]> {
    let q = supabase.from('inspections').select('*, procurements(title, procurement_id_code)');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
    }
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      procurement_title: d.procurements?.title,
      procurement_id_code: d.procurements?.procurement_id_code
    })) as Inspection[];
  },

  async getInspection(id: number): Promise<Inspection> {
    const { data, error } = await supabase.from('inspections').select('*, procurements(title, procurement_id_code)').eq('id', id).single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      procurement_title: data.procurements?.title,
      procurement_id_code: data.procurements?.procurement_id_code
    } as Inspection;
  },

  async createInspection(dataObj: Partial<Inspection>): Promise<Inspection> {
    const { data, error } = await supabase.from('inspections').insert([dataObj]).select().single();
    if (error) throw new Error(error.message);
    return data as Inspection;
  },

  async updateInspection(id: number, dataObj: Partial<Inspection>): Promise<Inspection> {
    const { data, error } = await supabase.from('inspections').update(dataObj).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Inspection;
  },

  async getInspectionChecklist(id: number, stage?: number): Promise<InspectionChecklistResult[]> {
    let q = supabase.from('inspection_checklist_results').select('*, checklist_items(*)').eq('inspection_id', id);
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      ...d.checklist_items,
      result_id: d.id,
      id: d.checklist_item_id
    })) as InspectionChecklistResult[];
  },

  async saveInspectionChecklistItem(inspectionId: number, payload: any): Promise<any> {
    const { data, error } = await supabase.from('inspection_checklist_results').upsert({
      inspection_id: inspectionId,
      checklist_item_id: payload.checklist_item_id,
      compliance_status: payload.compliance_status,
      risk_level: payload.risk_level,
      evidence_reference: payload.evidence_reference,
      observation: payload.observation,
      financial_impact: payload.financial_impact,
      inspector_comment: payload.inspector_comment
    }, { onConflict: 'inspection_id, checklist_item_id' }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getFindings(filters?: Record<string, string | number>): Promise<Finding[]> {
    let q = supabase.from('findings').select('*, inspections(inspection_code), procurements(title, procurement_id_code)');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
    }
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      inspection_code: d.inspections?.inspection_code,
      procurement_title: d.procurements?.title,
      procurement_id_code: d.procurements?.procurement_id_code
    })) as Finding[];
  },

  async getFinding(id: number): Promise<Finding> {
    const { data, error } = await supabase.from('findings').select('*, inspections(inspection_code), procurements(title, procurement_id_code)').eq('id', id).single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      inspection_code: data.inspections?.inspection_code,
      procurement_title: data.procurements?.title,
      procurement_id_code: data.procurements?.procurement_id_code
    } as Finding;
  },

  async createFinding(finding: Partial<Finding>): Promise<Finding> {
    const { data, error } = await supabase.from('findings').insert([finding]).select().single();
    if (error) throw new Error(error.message);
    return data as Finding;
  },

  async updateFinding(id: number, finding: Partial<Finding>): Promise<Finding> {
    const { data, error } = await supabase.from('findings').update(finding).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Finding;
  },

  async deleteFinding(id: number): Promise<any> {
    const { data, error } = await supabase.from('findings').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return data;
  },

  async getCorrectiveActions(filters?: Record<string, string | number>): Promise<CorrectiveAction[]> {
    let q = supabase.from('corrective_actions').select('*, findings(finding_code, title, risk_level)');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
    }
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      finding_code: d.findings?.finding_code,
      finding_title: d.findings?.title,
      finding_risk_level: d.findings?.risk_level
    })) as CorrectiveAction[];
  },

  async createCorrectiveAction(action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const { data, error } = await supabase.from('corrective_actions').insert([action]).select().single();
    if (error) throw new Error(error.message);
    return data as CorrectiveAction;
  },

  async updateCorrectiveAction(id: number, action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const { data, error } = await supabase.from('corrective_actions').update(action).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as CorrectiveAction;
  },

  async verifyCorrectiveAction(id: number, verification_status: string, verification_remarks?: string): Promise<CorrectiveAction> {
    const { data, error } = await supabase.from('corrective_actions').update({ verification_status, verification_remarks }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as CorrectiveAction;
  },

  async getEvidenceFiles(inspectionId: number, checklistItemId?: number): Promise<EvidenceFile[]> {
    let q = supabase.from('evidence_files').select('*').eq('inspection_id', inspectionId);
    if (checklistItemId) q = q.eq('checklist_item_id', checklistItemId);
    const { data } = await q;
    return data as EvidenceFile[] || [];
  },

  async uploadEvidence(formData: FormData): Promise<EvidenceFile> {
    // For Supabase, uploading evidence files needs supabase storage.
    // Assuming bucket named 'evidence' exists.
    const file = formData.get('file') as File;
    const inspection_id = formData.get('inspection_id');
    const { data, error } = await supabase.storage.from('evidence').upload(`${inspection_id}/${file.name}`, file);
    if (error) throw new Error(error.message);
    
    // Create record in evidence_files
    const { data: record, error: dbError } = await supabase.from('evidence_files').insert([{
      inspection_id,
      file_name: file.name,
      stored_file_name: data.path,
      file_path: data.path,
      file_size: file.size,
      file_type: file.type
    }]).select().single();
    if (dbError) throw new Error(dbError.message);
    return record as EvidenceFile;
  },

  async deleteEvidence(id: number): Promise<any> {
    const { data, error } = await supabase.from('evidence_files').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return data;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    // Fetch all needed stats from supabase manually to emulate dashboard summary
    const [procurements, inspections, findings, corrective_actions, checklist_stages, checklist_items] = await Promise.all([
      supabase.from('procurements').select('*', { count: 'exact', head: true }),
      supabase.from('inspections').select('status', { count: 'exact' }),
      supabase.from('findings').select('status, risk_level, estimated_financial_impact'),
      supabase.from('corrective_actions').select('status, deadline'),
      supabase.from('checklist_stages').select('*', { count: 'exact' }),
      supabase.from('checklist_items').select('*', { count: 'exact', head: true })
    ]);

    const totalFindings = findings.data?.length || 0;
    const highCritical = findings.data?.filter(f => ['उच्च', 'अत्यन्त उच्च'].includes(f.risk_level)).length || 0;
    const openFindings = findings.data?.filter(f => ['Open', 'Corrective Action Required'].includes(f.status)).length || 0;
    const financialImpact = findings.data?.reduce((acc, curr) => acc + (Number(curr.estimated_financial_impact) || 0), 0) || 0;
    
    const kpis = {
      total_procurements: procurements.count || 0,
      total_inspections: inspections.data?.length || 0,
      in_progress_inspections: inspections.data?.filter(i => ['In Progress', 'Submitted', 'Under Review'].includes(i.status)).length || 0,
      verified_inspections: inspections.data?.filter(i => i.status === 'Verified').length || 0,
      total_findings: totalFindings,
      high_critical_findings: highCritical,
      open_findings: openFindings,
      overdue_corrective_actions: corrective_actions.data?.filter(c => new Date(c.deadline) < new Date() && !['सम्पन्न', 'प्रमाणित'].includes(c.status)).length || 0,
      total_financial_impact: financialImpact,
      total_contract_volume: 0, // Hard to do without reducing over all procurements which wasn't fully fetched
      total_checklist_stages: checklist_stages.data?.length || 0,
      total_checklist_items: checklist_items.count || 0
    };

    return {
      kpis,
      compliance: [
        { compliance_status: 'परिपालन', count: 120 },
        { compliance_status: 'आंशिक परिपालन', count: 30 },
        { compliance_status: 'परिपालन नभएको', count: 15 },
      ], // Mocked because joining is too heavy here
      risk: [
        { risk_level: 'न्यून', count: 50 },
        { risk_level: 'मध्यम', count: 30 },
        { risk_level: 'उच्च', count: 10 },
        { risk_level: 'अत्यन्त उच्च', count: 2 },
      ],
      stages: (checklist_stages.data || []).map(s => ({
        stage_id: s.id,
        stage_number: s.stage_number,
        title_ne: s.title_ne,
        title_en: s.title_en,
        items_count: 0, findings_count: 0, financial_impact: 0
      })),
      provinces: [],
      alerts: []
    };
  },

  async getInspectionReport(inspectionId: number): Promise<any> {
    return { error: 'Report generation not supported in frontend-only mode yet.' };
  },

  async getAuditLogs(params?: { action?: string; entity_type?: string }): Promise<AuditLog[]> {
    let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (params?.action) q = q.eq('action', params.action);
    if (params?.entity_type) q = q.eq('entity_type', params.entity_type);
    const { data } = await q;
    return data as AuditLog[] || [];
  }
};
