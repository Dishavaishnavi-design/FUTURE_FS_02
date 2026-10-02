/* Lead Management CRM - Application Logic */

const API_BASE = '/api';

// State Management
let state = {
  token: localStorage.getItem('crm_token') || null,
  user: JSON.parse(localStorage.getItem('crm_user')) || null,
  currentView: 'dashboard',
  leads: [],
  stats: null,
  activeLeadId: null,
  deleteLeadId: null
};

// DOM Elements
const elements = {
  authView: document.getElementById('auth-view'),
  appView: document.getElementById('app-view'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  btnFillDemo: document.getElementById('btn-fill-demo'),
  btnLogout: document.getElementById('btn-logout'),
  userName: document.getElementById('user-name'),
  userAvatar: document.getElementById('user-avatar'),
  pageTitle: document.getElementById('page-title'),
  
  // Navigation
  navDashboard: document.getElementById('nav-dashboard'),
  navLeads: document.getElementById('nav-leads'),
  navAddLead: document.getElementById('nav-add-lead'),
  navPublicForm: document.getElementById('nav-public-form'),
  sidebarLeadsCount: document.getElementById('sidebar-leads-count'),
  
  // Pages
  pageDashboard: document.getElementById('page-dashboard'),
  pageLeads: document.getElementById('page-leads'),
  
  // Dashboard Stats
  statTotal: document.getElementById('stat-total'),
  statNew: document.getElementById('stat-new'),
  statContacted: document.getElementById('stat-contacted'),
  statConverted: document.getElementById('stat-converted'),
  dashboardRecentLeadsTbody: document.getElementById('dashboard-recent-leads-tbody'),
  dashboardFollowupsList: document.getElementById('dashboard-followups-list'),
  pipelineBar: document.getElementById('pipeline-bar'),
  btnViewAllLeads: document.getElementById('btn-view-all-leads'),
  
  // Leads Page Controls
  leadSearchInput: document.getElementById('lead-search-input'),
  filterStatus: document.getElementById('filter-status'),
  filterSource: document.getElementById('filter-source'),
  btnOpenCreateModal: document.getElementById('btn-open-create-modal'),
  leadsTableTbody: document.getElementById('leads-table-tbody'),
  
  // Modals
  leadModal: document.getElementById('lead-modal'),
  leadModalTitle: document.getElementById('lead-modal-title'),
  leadForm: document.getElementById('lead-form'),
  leadId: document.getElementById('lead-id'),
  formName: document.getElementById('form-name'),
  formEmail: document.getElementById('form-email'),
  formPhone: document.getElementById('form-phone'),
  formCompany: document.getElementById('form-company'),
  formSource: document.getElementById('form-source'),
  formStatus: document.getElementById('form-status'),
  formValue: document.getElementById('form-value'),
  formMessage: document.getElementById('form-message'),
  
  // Details Modal
  leadDetailsModal: document.getElementById('lead-details-modal'),
  detailLeadName: document.getElementById('detail-lead-name'),
  detailLeadCompany: document.getElementById('detail-lead-company'),
  detailEmail: document.getElementById('detail-email'),
  detailPhone: document.getElementById('detail-phone'),
  detailSource: document.getElementById('detail-source'),
  detailStatusBadge: document.getElementById('detail-status-badge'),
  notesTimeline: document.getElementById('notes-timeline'),
  followupsTimeline: document.getElementById('followups-timeline'),
  addNoteForm: document.getElementById('add-note-form'),
  noteInput: document.getElementById('note-input'),
  addFollowupForm: document.getElementById('add-followup-form'),
  followupTitleInput: document.getElementById('followup-title-input'),
  followupDateInput: document.getElementById('followup-date-input'),
  
  // Delete Modal
  deleteModal: document.getElementById('delete-modal'),
  btnConfirmDelete: document.getElementById('btn-confirm-delete'),
  
  // Public Form Modal
  publicFormModal: document.getElementById('public-form-modal'),
  publicContactForm: document.getElementById('public-contact-form'),
  
  toastContainer: document.getElementById('toast-container')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  bindEvents();
});

function initApp() {
  if (state.token) {
    showAppView();
  } else {
    showAuthView();
  }
}

// API Utility Function
async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  
  if (requiresAuth && state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const config = {
    method,
    headers
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const json = await res.json();

    if (res.status === 401 && requiresAuth) {
      handleLogout();
      showToast('Session expired. Please log in again.', 'error');
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      throw new Error(json.message || 'API Request Failed');
    }

    return json;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// UI Notification Toasts
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// View Switches
function showAuthView() {
  elements.authView.classList.remove('hidden');
  elements.appView.classList.add('hidden');
}

function showAppView() {
  elements.authView.classList.add('hidden');
  elements.appView.classList.remove('hidden');

  if (state.user) {
    elements.userName.textContent = state.user.name || 'Admin User';
    elements.userAvatar.textContent = (state.user.name || 'A').charAt(0).toUpperCase();
  }

  loadDashboardData();
  loadLeadsData();
}

function navigateTo(page) {
  state.currentView = page;

  // Update Nav Active state
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === page) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Toggle Page Sections
  if (page === 'dashboard') {
    elements.pageDashboard.classList.remove('hidden');
    elements.pageLeads.classList.add('hidden');
    elements.pageTitle.textContent = 'Dashboard Overview';
    loadDashboardData();
  } else if (page === 'leads') {
    elements.pageDashboard.classList.add('hidden');
    elements.pageLeads.classList.remove('hidden');
    elements.pageTitle.textContent = 'Client Lead Management';
    loadLeadsData();
  }
}

// Event Listeners Binding
function bindEvents() {
  // Demo Login Quick Fill
  elements.btnFillDemo.addEventListener('click', () => {
    elements.loginEmail.value = 'admin@crm.com';
    elements.loginPassword.value = 'admin123';
  });

  // Login Submit
  elements.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value.trim();

    try {
      const res = await apiCall('/auth/login', 'POST', { email, password }, false);
      if (res.success) {
        state.token = res.token;
        state.user = res.user;
        localStorage.setItem('crm_token', res.token);
        localStorage.setItem('crm_user', JSON.stringify(res.user));
        showToast('Login successful! Welcome back.');
        showAppView();
      }
    } catch (err) {
      showToast(err.message || 'Invalid email or password', 'error');
    }
  });

  // Logout
  elements.btnLogout.addEventListener('click', handleLogout);

  // Navigation Links
  elements.navDashboard.addEventListener('click', () => navigateTo('dashboard'));
  elements.navLeads.addEventListener('click', () => navigateTo('leads'));
  elements.btnViewAllLeads.addEventListener('click', () => navigateTo('leads'));

  // Modals Openers & Closers
  elements.navAddLead.addEventListener('click', () => openLeadModal());
  elements.btnOpenCreateModal.addEventListener('click', () => openLeadModal());
  elements.navPublicForm.addEventListener('click', () => openModal(elements.publicFormModal));

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = btn.getAttribute('data-close');
      closeModal(document.getElementById(modalId));
    });
  });

  // Lead Form Submit
  elements.leadForm.addEventListener('submit', handleLeadFormSubmit);

  // Search & Filters
  let searchTimeout;
  elements.leadSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadLeadsData, 300);
  });

  elements.filterStatus.addEventListener('change', loadLeadsData);
  elements.filterSource.addEventListener('change', loadLeadsData);

  // Modal Details Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.remove('hidden');
    });
  });

  // Add Note Form Submit
  elements.addNoteForm.addEventListener('submit', handleAddNoteSubmit);

  // Add Followup Form Submit
  elements.addFollowupForm.addEventListener('submit', handleAddFollowupSubmit);

  // Delete Lead Confirmation
  elements.btnConfirmDelete.addEventListener('click', handleDeleteLeadConfirm);

  // Public Form Submit
  elements.publicContactForm.addEventListener('submit', handlePublicFormSubmit);
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('crm_token');
  localStorage.removeItem('crm_user');
  showToast('Logged out successfully');
  showAuthView();
}

// Modal Helpers
function openModal(modalEl) {
  modalEl.classList.add('active');
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
}

// Dashboard Data Loader
async function loadDashboardData() {
  try {
    const res = await apiCall('/leads/stats');
    if (res.success) {
      state.stats = res.stats;
      
      // Update Stat Cards
      elements.statTotal.textContent = res.stats.totalLeads;
      elements.statNew.textContent = res.stats.newLeads;
      elements.statContacted.textContent = res.stats.contactedLeads;
      elements.statConverted.textContent = res.stats.convertedLeads;
      elements.sidebarLeadsCount.textContent = res.stats.totalLeads;

      // Render Pipeline Progress Bar
      renderPipelineBar(res.stats);

      // Render Follow-ups Widget
      renderDashboardFollowups(res.upcomingFollowups);
    }

    // Load recent 5 leads for dashboard table
    const recentRes = await apiCall('/leads?sort=newest');
    if (recentRes.success) {
      renderDashboardRecentLeads(recentRes.data.slice(0, 5));
    }
  } catch (err) {
    console.error('Failed loading dashboard stats:', err);
  }
}

function renderPipelineBar(stats) {
  const total = stats.totalLeads || 1;
  const newPct = (stats.newLeads / total) * 100;
  const contactedPct = (stats.contactedLeads / total) * 100;
  const convertedPct = (stats.convertedLeads / total) * 100;

  elements.pipelineBar.innerHTML = `
    <div class="pipeline-segment" style="width: ${newPct}%; background-color: var(--status-new);" title="New: ${stats.newLeads}"></div>
    <div class="pipeline-segment" style="width: ${contactedPct}%; background-color: var(--status-contacted);" title="Contacted: ${stats.contactedLeads}"></div>
    <div class="pipeline-segment" style="width: ${convertedPct}%; background-color: var(--status-converted);" title="Converted: ${stats.convertedLeads}"></div>
  `;
}

function renderDashboardRecentLeads(leads) {
  if (!leads || leads.length === 0) {
    elements.dashboardRecentLeadsTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No leads found yet.</td></tr>`;
    return;
  }

  elements.dashboardRecentLeadsTbody.innerHTML = leads.map(lead => `
    <tr>
      <td>
        <div class="lead-name-cell">
          <span class="name">${escapeHtml(lead.name)}</span>
          <span class="company">${escapeHtml(lead.company)}</span>
        </div>
      </td>
      <td><span style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(lead.source)}</span></td>
      <td>${renderStatusBadge(lead.status)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="openLeadDetails('${lead._id}')">
          <i class="fa-solid fa-eye"></i> Details
        </button>
      </td>
    </tr>
  `).join('');
}

function renderDashboardFollowups(followups) {
  if (!followups || followups.length === 0) {
    elements.dashboardFollowupsList.innerHTML = `<div style="text-align:center; font-size:0.85rem; color:var(--text-muted); padding:1rem;">No pending follow-ups scheduled.</div>`;
    return;
  }

  elements.dashboardFollowupsList.innerHTML = followups.map(item => `
    <div class="followup-item">
      <input type="checkbox" onchange="toggleFollowupStatus('${item.leadId}', '${item.followupId}', this.checked)" style="margin-top: 0.2rem; cursor: pointer;">
      <div style="flex:1;">
        <div style="font-weight:600; color:var(--text-main);">${escapeHtml(item.title)}</div>
        <div style="font-size:0.78rem; color:var(--text-muted);">Lead: ${escapeHtml(item.leadName)} (${escapeHtml(item.company)})</div>
      </div>
      <span class="date-tag">${formatDate(item.date)}</span>
    </div>
  `).join('');
}

// Leads Page Data Loader
async function loadLeadsData() {
  const search = elements.leadSearchInput.value.trim();
  const status = elements.filterStatus.value;
  const source = elements.filterSource.value;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (status !== 'all') queryParams.append('status', status);
  if (source !== 'all') queryParams.append('source', source);

  try {
    const res = await apiCall(`/leads?${queryParams.toString()}`);
    if (res.success) {
      state.leads = res.data;
      renderLeadsTable(res.data);
    }
  } catch (err) {
    console.error('Failed to load leads:', err);
  }
}

function renderLeadsTable(leads) {
  if (!leads || leads.length === 0) {
    elements.leadsTableTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No matching leads found.</td></tr>`;
    return;
  }

  elements.leadsTableTbody.innerHTML = leads.map(lead => `
    <tr>
      <td>
        <div class="lead-name-cell">
          <span class="name">${escapeHtml(lead.name)}</span>
          <span class="company">${escapeHtml(lead.company)}</span>
        </div>
      </td>
      <td>
        <div style="font-size: 0.85rem;">${escapeHtml(lead.email)}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(lead.phone)}</div>
      </td>
      <td><span style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(lead.source)}</span></td>
      <td>
        <select class="form-control" style="padding: 0.2rem 0.5rem; font-size: 0.78rem; width: auto;" onchange="quickUpdateStatus('${lead._id}', this.value)">
          <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
          <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="In Discussion" ${lead.status === 'In Discussion' ? 'selected' : ''}>In Discussion</option>
          <option value="Converted" ${lead.status === 'Converted' ? 'selected' : ''}>Converted</option>
          <option value="Lost" ${lead.status === 'Lost' ? 'selected' : ''}>Lost</option>
        </select>
      </td>
      <td><strong>$${(lead.value || 0).toLocaleString()}</strong></td>
      <td style="text-align: right;">
        <div class="flex gap-2 justify-between" style="justify-content: flex-end;">
          <button class="btn btn-sm btn-outline btn-icon" title="View Details & Activity" onclick="openLeadDetails('${lead._id}')">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline btn-icon" title="Edit Lead" onclick="openLeadModal('${lead._id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-icon" title="Delete Lead" onclick="promptDeleteLead('${lead._id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Add/Edit Modal Handlers
function openLeadModal(leadId = null) {
  elements.leadForm.reset();
  elements.leadId.value = '';

  if (leadId) {
    const lead = state.leads.find(l => l._id === leadId);
    if (lead) {
      elements.leadModalTitle.textContent = 'Edit Lead Information';
      elements.leadId.value = lead._id;
      elements.formName.value = lead.name;
      elements.formEmail.value = lead.email;
      elements.formPhone.value = lead.phone;
      elements.formCompany.value = lead.company;
      elements.formSource.value = lead.source;
      elements.formStatus.value = lead.status;
      elements.formValue.value = lead.value || 0;
      elements.formMessage.value = lead.message || '';
    }
  } else {
    elements.leadModalTitle.textContent = 'Add New Lead';
  }

  openModal(elements.leadModal);
}

async function handleLeadFormSubmit(e) {
  e.preventDefault();
  const id = elements.leadId.value;
  
  const leadData = {
    name: elements.formName.value.trim(),
    email: elements.formEmail.value.trim(),
    phone: elements.formPhone.value.trim(),
    company: elements.formCompany.value.trim() || 'N/A',
    source: elements.formSource.value,
    status: elements.formStatus.value,
    value: Number(elements.formValue.value) || 0,
    message: elements.formMessage.value.trim()
  };

  try {
    if (id) {
      const res = await apiCall(`/leads/${id}`, 'PUT', leadData);
      if (res.success) {
        showToast('Lead updated successfully');
      }
    } else {
      const res = await apiCall('/leads', 'POST', leadData);
      if (res.success) {
        showToast('New lead added successfully');
      }
    }

    closeModal(elements.leadModal);
    loadDashboardData();
    loadLeadsData();
  } catch (err) {
    showToast(err.message || 'Error saving lead', 'error');
  }
}

async function quickUpdateStatus(leadId, newStatus) {
  try {
    const res = await apiCall(`/leads/${leadId}`, 'PUT', { status: newStatus });
    if (res.success) {
      showToast(`Status updated to ${newStatus}`);
      loadDashboardData();
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
}

// Lead Details & Activity Drawer
async function openLeadDetails(leadId) {
  state.activeLeadId = leadId;
  try {
    const res = await apiCall(`/leads/${leadId}`);
    if (res.success) {
      const lead = res.data;
      elements.detailLeadName.textContent = lead.name;
      elements.detailLeadCompany.textContent = lead.company;
      elements.detailEmail.textContent = lead.email;
      elements.detailPhone.textContent = lead.phone;
      elements.detailSource.textContent = lead.source;
      elements.detailStatusBadge.innerHTML = renderStatusBadge(lead.status);

      renderNotesTimeline(lead.notes);
      renderFollowupsTimeline(lead.followups);

      openModal(elements.leadDetailsModal);
    }
  } catch (err) {
    showToast('Error fetching lead details', 'error');
  }
}

function renderNotesTimeline(notes) {
  if (!notes || notes.length === 0) {
    elements.notesTimeline.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.85rem;">No notes recorded yet.</div>`;
    return;
  }

  elements.notesTimeline.innerHTML = notes.map(note => `
    <div class="timeline-item">
      <div class="timeline-meta">
        <strong><i class="fa-solid fa-user me-1"></i> ${escapeHtml(note.author || 'Admin')}</strong>
        <span>${formatDate(note.createdAt)}</span>
      </div>
      <div style="font-size:0.88rem; color:var(--text-main);">${escapeHtml(note.content)}</div>
    </div>
  `).join('');
}

function renderFollowupsTimeline(followups) {
  if (!followups || followups.length === 0) {
    elements.followupsTimeline.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.85rem;">No scheduled follow-ups.</div>`;
    return;
  }

  elements.followupsTimeline.innerHTML = followups.map(f => `
    <div class="timeline-item flex justify-between items-center">
      <div>
        <div style="font-weight:600; color:var(--text-main);">${escapeHtml(f.title)}</div>
        <div style="font-size:0.78rem; color:var(--text-muted);">Due: ${formatDate(f.date)}</div>
      </div>
      <span class="badge ${f.status === 'Completed' ? 'badge-converted' : 'badge-new'}">${f.status}</span>
    </div>
  `).join('');
}

async function handleAddNoteSubmit(e) {
  e.preventDefault();
  const content = elements.noteInput.value.trim();
  if (!content || !state.activeLeadId) return;

  try {
    const res = await apiCall(`/leads/${state.activeLeadId}/notes`, 'POST', { content });
    if (res.success) {
      elements.noteInput.value = '';
      renderNotesTimeline(res.data.notes);
      showToast('Note added');
    }
  } catch (err) {
    showToast('Failed to add note', 'error');
  }
}

async function handleAddFollowupSubmit(e) {
  e.preventDefault();
  const title = elements.followupTitleInput.value.trim();
  const date = elements.followupDateInput.value;
  if (!title || !date || !state.activeLeadId) return;

  try {
    const res = await apiCall(`/leads/${state.activeLeadId}/followups`, 'POST', { title, date });
    if (res.success) {
      elements.followupTitleInput.value = '';
      elements.followupDateInput.value = '';
      renderFollowupsTimeline(res.data.followups);
      loadDashboardData();
      showToast('Follow-up scheduled');
    }
  } catch (err) {
    showToast('Failed to schedule follow-up', 'error');
  }
}

async function toggleFollowupStatus(leadId, followupId, isChecked) {
  const newStatus = isChecked ? 'Completed' : 'Pending';
  try {
    const res = await apiCall(`/leads/${leadId}/followups/${followupId}`, 'PUT', { status: newStatus });
    if (res.success) {
      showToast(`Task marked as ${newStatus}`);
      loadDashboardData();
    }
  } catch (err) {
    showToast('Error updating task status', 'error');
  }
}

// Delete Lead Prompt & Confirm
function promptDeleteLead(leadId) {
  state.deleteLeadId = leadId;
  openModal(elements.deleteModal);
}

async function handleDeleteLeadConfirm() {
  if (!state.deleteLeadId) return;

  try {
    const res = await apiCall(`/leads/${state.deleteLeadId}`, 'DELETE');
    if (res.success) {
      showToast('Lead deleted successfully');
      closeModal(elements.deleteModal);
      state.deleteLeadId = null;
      loadDashboardData();
      loadLeadsData();
    }
  } catch (err) {
    showToast('Failed to delete lead', 'error');
  }
}

// Public Contact Form Simulator Submit
async function handlePublicFormSubmit(e) {
  e.preventDefault();
  const publicData = {
    name: document.getElementById('pub-name').value.trim(),
    email: document.getElementById('pub-email').value.trim(),
    phone: document.getElementById('pub-phone').value.trim(),
    company: document.getElementById('pub-company').value.trim() || 'Website Visitor',
    message: document.getElementById('pub-message').value.trim()
  };

  try {
    const res = await apiCall('/public/contact', 'POST', publicData, false);
    if (res.success) {
      showToast('Web lead generated! Check your dashboard.');
      elements.publicContactForm.reset();
      closeModal(elements.publicFormModal);
      
      // Auto refresh CRM data if logged in
      if (state.token) {
        loadDashboardData();
        loadLeadsData();
      }
    }
  } catch (err) {
    showToast('Error submitting website form', 'error');
  }
}

// Utility Helpers
function renderStatusBadge(status) {
  const statusMap = {
    'New': 'badge-new',
    'Contacted': 'badge-contacted',
    'In Discussion': 'badge-discussion',
    'Converted': 'badge-converted',
    'Lost': 'badge-lost'
  };
  const cls = statusMap[status] || 'badge-new';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
