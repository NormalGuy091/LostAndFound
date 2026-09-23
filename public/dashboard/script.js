async function logout() {
    await fetch('/auth/logout', { method: 'POST' })
    window.location.href = '/login'
}

const reports = document.getElementById('reports')
const reportsMessage = document.getElementById('reports-message')
const search = document.getElementById('search')
const typeFilter = document.getElementById('type-filter')
const reportDialog = document.getElementById('report-dialog')
const reportDetail = document.getElementById('report-detail')

function formatDate(value) {
    if (!value) return 'Date not provided'
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function renderReports(items) {
    reports.replaceChildren()
    if (items.length === 0) {
        reportsMessage.textContent = 'No reports match your search.'
        return
    }
    reportsMessage.textContent = ''
    items.forEach(item => {
        const card = document.createElement('article')
        card.className = 'report'
        card.dataset.reportId = item.id
        card.tabIndex = 0
        card.innerHTML = `
            <span class="report-type ${item.type}">${item.type}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description || 'No description provided.')}</p>
            <small>${escapeHtml(item.location)} &middot; ${formatDate(item.date)}</small>
        `
        card.addEventListener('click', () => openReport(item.id))
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') openReport(item.id)
        })
        reports.append(card)
    })
}

async function openReport(id) {
    try {
        const response = await fetch(`/items/${id}`)
        const item = await response.json()
        if (!response.ok) throw new Error(item.message || 'Unable to load report.')
        reportDetail.innerHTML = `
            <span class="report-type ${item.type}">${item.type}</span>
            <h2>${escapeHtml(item.title)}</h2>
            ${item.image_url ? `<img class="report-image" src="${encodeURI(item.image_url)}" alt="Photo of ${escapeHtml(item.title)}">` : ''}
            <p>${escapeHtml(item.description || 'No description provided.')}</p>
            <dl>
                <dt>Category</dt><dd>${escapeHtml(item.category)}</dd>
                <dt>Location</dt><dd>${escapeHtml(item.location)}</dd>
                <dt>Date</dt><dd>${formatDate(item.date)}</dd>
            </dl>
            ${item.can_edit ? `
                <div class="dialog-actions">
                    <button class="primary-button" type="button" id="edit-report">Edit report</button>
                    <button class="danger-button" type="button" id="delete-report">Delete report</button>
                </div>
            ` : ''}
        `
        reportDialog.showModal()
        document.getElementById('edit-report')?.addEventListener('click', () => renderEditForm(item))
        document.getElementById('delete-report')?.addEventListener('click', () => deleteReport(item.id))
    } catch (error) {
        alert(error.message)
    }
}

function renderEditForm(item) {
    reportDetail.innerHTML = `
        <h2>Edit report</h2>
        <form id="edit-form" class="edit-form">
            <label>Title<input name="title" value="${escapeHtml(item.title)}" required></label>
            <label>Type<select name="type"><option value="lost" ${item.type === 'lost' ? 'selected' : ''}>Lost</option><option value="found" ${item.type === 'found' ? 'selected' : ''}>Found</option></select></label>
            <label>Category<input name="category" value="${escapeHtml(item.category)}" required></label>
            <label>Location<input name="location" value="${escapeHtml(item.location)}" required></label>
            <label>Description<textarea name="description">${escapeHtml(item.description || '')}</textarea></label>
            <label>Date<input name="date" type="date" value="${String(item.date).slice(0, 10)}" required></label>
            <div class="dialog-actions"><button class="primary-button" type="submit">Save changes</button><button class="secondary-button" type="button" id="cancel-edit">Cancel</button></div>
        </form>
    `
    document.getElementById('cancel-edit').addEventListener('click', () => openReport(item.id))
    document.getElementById('edit-form').addEventListener('submit', async event => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const payload = Object.fromEntries(formData.entries())
        const response = await fetch(`/items/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const data = await response.json()
        if (!response.ok) {
            alert(data.message || 'Unable to update report.')
            return
        }
        await loadReports()
        openReport(item.id)
    })
}

async function deleteReport(id) {
    if (!confirm('Delete this report permanently?')) return
    const response = await fetch(`/items/${id}`, { method: 'DELETE' })
    if (!response.ok) {
        const data = await response.json()
        alert(data.message || 'Unable to delete report.')
        return
    }
    reportDialog.close()
    loadReports()
}

document.querySelector('.close-dialog').addEventListener('click', () => reportDialog.close())
reportDialog.addEventListener('click', event => {
    if (event.target === reportDialog) reportDialog.close()
})

function escapeHtml(value) {
    const element = document.createElement('div')
    element.textContent = value
    return element.innerHTML
}

async function loadReports() {
    const params = new URLSearchParams()
    if (search.value.trim()) params.set('search', search.value.trim())
    if (typeFilter.value) params.set('type', typeFilter.value)
    reportsMessage.textContent = 'Loading reports...'
    try {
        const response = await fetch(`/items?${params}`)
        if (!response.ok) throw new Error('Unable to load reports.')
        renderReports(await response.json())
    } catch (error) {
        reports.replaceChildren()
        reportsMessage.textContent = error.message
    }
}

let searchTimer
search.addEventListener('input', () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(loadReports, 250)
})
typeFilter.addEventListener('change', loadReports)
loadReports()
