// js/ui.js

// --- Global Chart Variables ---
let userGrowthChart = null;
let userStatusChart = null;

// --- UI Rendering Functions ---

function renderTable(tableBody, data) {
    tableBody.innerHTML = '';
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px;">No records found.</td></tr>`;
        return;
    }
    data.forEach(row => {
        const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim();
        const avatar = row.profile_pic_url
            ? `<img src="${row.profile_pic_url}" alt="${fullName}" class="avatar">`
            : `<div class="avatar">${(row.first_name?.[0] || '')}${(row.last_name?.[0] || '')}</div>`;

        const docCount = row.documents ? row.documents.length : 0;
        const docButton = `<button class="btn" style="padding: 5px 10px; font-size: 12px; background: #1e293b;" onclick="event.stopPropagation(); showToast('${docCount} documents found.')">${docCount} <i class="fas fa-folder"></i></button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="user-profile-cell">
                ${avatar}
                <div class="user-info">
                    <div class="user-name truncate" title="${fullName}">${fullName}</div>
                    <div class="user-id">ID: ${row.id}</div>
                </div>
            </td>
            <td class="truncate" title="${row.email}">${row.email || 'N/A'}</td>
            <td><span class="status-badge status-${row.status}">${row.status}</span></td>
            <td>${docButton}</td>
            <td class="action-buttons">
                <button class="action-btn edit-btn" onclick="viewRecordHandler(${row.id})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-btn" onclick="editRecordHandler(${row.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deleteRecordHandler(${row.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function updateDashboardStats(data) {
    const recordCount = data.length;
    const statusCounts = data.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
    }, { active: 0, inactive: 0, pending: 0, new: 0, contacted: 0 });

    document.getElementById('tableCount').textContent = `${data.length > 0 ? 1 : 0} Tables`;
    document.getElementById('recordCount').textContent = `${recordCount} Records`;
    document.getElementById('userCount').textContent = statusCounts.active;
    document.getElementById('inactiveUserCount').textContent = statusCounts.inactive;
    document.getElementById('pendingUserCount').textContent = statusCounts.pending;
    document.getElementById('newUserCount').textContent = statusCounts.new;
    document.getElementById('contactedUserCount').textContent = statusCounts.contacted;
    document.getElementById('totalRecordCount').textContent = recordCount;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show toast-${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function openModal(modalId, record = null) {
    const modal = document.getElementById(modalId);
    const form = document.getElementById('recordForm');
    const title = document.getElementById('modalTitle');
    const preview = document.getElementById('profilePicPreview');

    form.reset();
    if (record) {
        title.textContent = 'Edit Record';
        form.recordId.value = record.id;
        form.first_name.value = record.first_name || '';
        form.last_name.value = record.last_name || '';
        form.email.value = record.email || '';
        form.phone.value = record.phone || '';
        form.company.value = record.company || '';
        form.role.value = record.role || '';
        form.assigned_to.value = record.assigned_to || '';
        form.profile_pic_url.value = record.profile_pic_url || '';
        preview.src = record.profile_pic_url || '';
        form.documents.value = record.documents ? record.documents.join(', ') : '';
        form.notes.value = record.notes || '';
        form.status.value = record.status || 'new';
    } else {
        title.textContent = 'Add New Record';
        form.recordId.value = '';
        preview.src = '';
    }
    modal.classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function runQuery(data) {
    const query = document.getElementById('queryText').value;
    const resultEl = document.getElementById('queryResult');
    if (!query.trim()) {
        resultEl.innerHTML = '<p style="color: #ef4444;">Query cannot be empty.</p>';
        return;
    }
    try {
        alasql.tables.users = { data: data };
        const results = alasql(query);
        // ... (rest of the runQuery logic from original file)
        if (results.length === 0) {
            resultEl.innerHTML = '<p>Query executed successfully, but returned no results.</p>';
        } else {
            let tableHTML = '<table style="width: 100%; border-collapse: collapse; font-family: inherit;"><thead><tr>';
            const headers = Object.keys(results[0]);
            headers.forEach(header => {
                tableHTML += `<th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid rgba(99, 102, 241, 0.3); background: rgba(99, 102, 241, 0.2);">${header}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';
            results.forEach(row => {
                tableHTML += '<tr>';
                headers.forEach(header => {
                    let cellValue = row[header];
                    if (typeof cellValue === 'object' && cellValue !== null) {
                        cellValue = JSON.stringify(cellValue);
                    }
                    tableHTML += `<td style="padding: 12px 15px; border-bottom: 1px solid rgba(99, 102, 241, 0.1);">${cellValue}</td>`;
                });
                tableHTML += '</tr>';
            });
            tableHTML += '</tbody></table>';
            resultEl.innerHTML = tableHTML;
        }
        showToast('Query executed successfully!', 'success');
    } catch (e) {
        resultEl.innerHTML = `<p style="color: #ef4444; font-weight: bold;">Query Error:</p><pre style="color: #fca5a5; background: rgba(239, 68, 68, 0.1); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${e.message}</pre>`;
        showToast('Query failed!', 'error');
    }
}

// ... (Add other UI functions like renderAnalyticsCharts, openViewModal, downloadProfileAsPDF, etc. from the original file)
// Make sure to pass necessary data (like mockData) as arguments to these functions.
