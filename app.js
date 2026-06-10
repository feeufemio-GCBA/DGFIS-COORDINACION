// Data Models Structure & Initial State Setup
const DEFAULT_STATE = {
    people: [
        { id: "p1", name: "ZOE", team: "DATOS Y REPORTING" },
        { id: "p2", name: "FAUSTO", team: "DATOS Y REPORTING" },
        { id: "p3", name: "MARCELO", team: "PLANIFICACIÓN" },
        { id: "p4", name: "MARINA", team: "ANÁLISIS Y GESTIÓN" }
    ],
    events: [],
    coverageMatrix: {
        "p1": "p2", // Zoe cubre a Fausto
        "p2": "p1"  // Fausto cubre a Zoe
    },
    confirmedCoverages: {}, // Key: YYYY-MM-DD_absentId -> covererId
    tasks: [],
    observations: [],
    generatedDates: {} // Tracking auto-recurrent tasks instantiations
};

let state = JSON.parse(localStorage.getItem('DGFIS_STATE')) || DEFAULT_STATE;

// Fallback logic for systems scaling additions gracefully
if (!state.confirmedCoverages) state.confirmedCoverages = {};
if (!state.generatedDates) state.generatedDates = {};

function saveState() {
    localStorage.setItem('DGFIS_STATE', JSON.stringify(state));
}

// Global System Utilities & Time Parsers
function getTodayStr() {
    const d = new Date();
    return formatDateLocal(d);
}

function formatDateLocal(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDayNameEs(dateStr) {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    // Avoid timezone offset sliding by splitting explicit parts
    const parts = dateStr.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return days[d.getDay()];
}

// Navigation Tabs Router Control Engine
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = `tab-${btn.dataset.tab}`;
        document.getElementById(tabId).classList.add('active');
        
        triggerTabRender(btn.dataset.tab);
    });
});

function triggerTabRender(tabName) {
    if (tabName === 'dashboard') renderDashboard();
    if (tabName === 'equipo') renderPeople();
    if (tabName === 'calendario') renderCalendar();
    if (tabName === 'coberturas') renderCoverageMatrixTab();
    if (tabName === 'tareas') renderTasks();
    if (tabName === 'observaciones') renderObservations();
    if (tabName === 'seguimiento') renderHistory();
    if (tabName === 'reportes') renderReports();
}

// Automatic Recurrent Tasks Automator Engine - ACTUALIZADO 2026
function runDailyRecurrentTasksAutomation(dateStr) {
    if (state.generatedDates[dateStr]) return; // Detiene bucles de duplicación
    
    const dayName = getDayNameEs(dateStr);
    const generated = [];

    // Validamos que sea un día laboral (Lunes a Viernes)
    const diasLaborales = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
    if (!diasLaborales.includes(dayName)) return;

    state.people.forEach(person => {
        // --- ÁREA: DATOS Y REPORTING ---
        if (person.team === "DATOS Y REPORTING") {
            if (dayName === "LUNES") {
                generated.push(
                    "CABLEADO", 
                    "EXPEDIENTES LEGALES – ORDENAMIENTO", 
                    "ACTUALIZAR SLA - CONTROL PENDIENTES", 
                    "AUDITORÍA ORDENAMIENTO", 
                    "ACTUALIZAR SEGUIMIENTO ORDENAMIENTO"
                );
            } else if (dayName === "MARTES") {
                generated.push(
                    "ACTUALIZAR SLA - CONTROL PENDIENTES", 
                    "ACTUALIZACION AVANCE DE PENDIENTES VERI-RESO", 
                    "ACTUALIZACIÓN NUEVA COBERTURA", 
                    "PENDIENTES ORDENAMIENTO", 
                    "ENVIAR PENDIENTES A ORDENAMIENTO ( LO QUE SE PLANIFICO EL VIERNES Y MIERCOLES)"
                );
            } else if (dayName === "MIÉRCOLES") {
                generated.push(
                    "CABLEADO", 
                    "EXPEDIENTES LEGALES – ORDENAMIENTO", 
                    "REVISION DE DRIVES", 
                    "REPORTE SEMANAL"
                );
            } else if (dayName === "JUEVES") {
                generated.push(
                    "ACTUALIZAR SLA - CONTROL PENDIENTES", 
                    "ACTUALIZACION AVANCE DE PENDIENTES VERI-RESO", 
                    "PENDIENTES ORDENAMIENTO", 
                    "BASE GOIEP SEMANAL", 
                    "ACTUALIZAR SEGUIMIENTO ORDENAMIENTO", 
                    "ENVIAR PENDIENTES A ORDENAMIENTO (LO QUE SE PLANIFICO EL LUNES)"
                );
            } else if (dayName === "VIERNES") {
                generated.push(
                    "CABLEADO", 
                    "EXPEDIENTES LEGALES – ORDENAMIENTO", 
                    "COLUMNAS Y POSTE EXPEDIENTE", 
                    "COBERTURA CABLEADO (ENVIO POR WHATSSAP)", 
                    "COBERTURA DE EXPEDIENTES"
                );
            }
        }
        
        // --- ÁREA: ANÁLISIS Y GESTIÓN (Lunes a Viernes las mismas 4 tareas) ---
        if (person.team === "ANÁLISIS Y GESTIÓN") {
            generated.push(
                "BAJADAS 2026", 
                "CUCC", 
                "ACTUALIZAR BACKOFFICE MAÑANA", 
                "ACTUALIZAR BACKOFFICE TARDE"
            );
        }

        // --- ÁREA: PLANIFICACIÓN ---
        if (person.team === "PLANIFICACIÓN") {
            if (["LUNES", "MIÉRCOLES", "VIERNES"].includes(dayName)) {
                generated.push(
                    "PLANIFICACIÓN ÁREAS GASTRONÓMICAS", 
                    "PLANIFICACION ORDENAMIENTO"
                );
            } else if (["MARTES", "JUEVES"].includes(dayName)) {
                generated.push(
                    "PLANIFICACIÓN ÁREAS GASTRONÓMICAS"
                );
            }
        }
    });

    // Filtramos duplicados por si hay más de una persona en la misma área
    const uniqueTasks = [...new Set(generated)];
    uniqueTasks.forEach(desc => {
        state.tasks.push({
            id: 'tsk_' + Math.random().toString(36).substr(2, 9),
            description: desc,
            responsibleId: "", // Strict rule: MUST be instantiated completely unassigned
            status: "Pendiente",
            priority: "Media",
            date: dateStr,
            isRecurrent: true
        });
    });

    state.generatedDates[dateStr] = true;
    saveState();
}

// Shared State Evaluation Logic: Absences detection engine
function checkAbsenceStatus(personId, dateStr) {
    return state.events.find(ev => {
        return ev.personId === personId && 
               dateStr >= ev.startDate && 
               dateStr <= ev.endDate && 
               ["Vacaciones", "Licencia", "Día de estudio"].includes(ev.type);
    });
}

// Render Dashboard View Module
function renderDashboard() {
    const today = getTodayStr();
    runDailyRecurrentTasksAutomation(today);

    let presentes = 0;
    let ausentes = 0;
    let activeCoberturasCount = 0;

    const summaryListHTML = [];
    const alertsHTML = [];

    state.people.forEach(p => {
        const absenceEvent = checkAbsenceStatus(p.id, today);
        if (absenceEvent) {
            ausentes++;
            const cobKey = `${today}_${p.id}`;
            const confirmedCovererId = state.confirmedCoverages[cobKey];
            let covererName = "Nadie asignado";
            
            if (confirmedCovererId) {
                const cPerson = state.people.find(pe => pe.id === confirmedCovererId);
                if (cPerson) {
                    covererName = cPerson.name;
                    activeCoberturasCount++;
                }
            }

            summaryListHTML.push(`
                <div class="summary-item">
                    <span>🔴 <strong>${p.name}</strong> (${p.team}) - Ausente por ${absenceEvent.type}</span>
                    <span class="text-blue">Cubierto por: ${covererName}</span>
                </div>
            `);

            // If coverage isn't confirmed yet, output action card layout
            if (!confirmedCovererId) {
                const suggestedId = state.coverageMatrix[p.id] || "";
                const suggestedPerson = state.people.find(pe => pe.id === suggestedId);
                const suggestedName = suggestedPerson ? suggestedPerson.name : "Sin sugerencia";

                alertsHTML.push(`
                    <div class="alert-box">
                        <div>
                            <strong>Ausencia Detectada:</strong> ${p.name} requiere cobertura hoy por ${absenceEvent.type}. 
                            <br><small>Sugerencia del sistema: Cobertura por <strong>${suggestedName}</strong></small>
                        </div>
                        <div style="display:flex; gap:0.5rem; margin-left:1rem;">
                            <button class="btn btn-primary btn-sm" onclick="confirmSystemCoverage('${today}', '${p.id}', '${suggestedId}')">Confirmar</button>
                            <button class="btn btn-secondary btn-sm" onclick="promptManualCoverage('${today}', '${p.id}')">Modificar</button>
                        </div>
                    </div>
                `);
            } else {
                alertsHTML.push(`
                    <div class="alert-box active-cober">
                        <div>
                            ✅ Cobertura activa: <strong>${covererName}</strong> está cubriendo el puesto de <strong>${p.name}</strong> hoy.
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="clearConfirmedCoverage('${today}', '${p.id}')">Liberar</button>
                    </div>
                `);
            }
        } else {
            presentes++;
            summaryListHTML.push(`
                <div class="summary-item">
                    <span>🟢 <strong>${p.name}</strong> (${p.team})</span>
                    <span class="text-green">Presente</span>
                </div>
            `);
        }
    });

    // Computing advanced metrics lookaheads
    const vancancionesCount = state.events.filter(e => e.type === "Vacaciones" && e.startDate >= today).length;
    const estudioCount = state.events.filter(e => e.type === "Día de estudio" && e.startDate >= today).length;
    const pendingTasksCount = state.tasks.filter(t => t.date === today && t.status !== "Finalizada").length;
    
    const currentMonthStr = today.substring(0, 7);
    const obsMonthCount = state.observations.filter(o => o.date.substring(0, 7) === currentMonthStr).length;

    // Output fields maps variables to DOM
    document.getElementById('dash-presentes').innerText = presentes;
    document.getElementById('dash-ausentes').innerText = ausentes;
    document.getElementById('dash-coberturas').innerText = activeCoberturasCount;
    document.getElementById('dash-vacaciones').innerText = vancancionesCount;
    document.getElementById('dash-estudio').innerText = estudioCount;
    document.getElementById('dash-tareas').innerText = pendingTasksCount;
    document.getElementById('dash-observaciones').innerText = obsMonthCount;

    document.getElementById('dashboard-cober-alerts').innerHTML = alertsHTML.join('');
    document.getElementById('dashboard-summary-list').innerHTML = summaryListHTML.join('');
}

function confirmSystemCoverage(dateStr, absentId, covererId) {
    if (!covererId) {
        alert("No hay una cobertura sugerida predefinida estructurada. Use la opción Modificar.");
        return;
    }
    const key = `${dateStr}_${absentId}`;
    state.confirmedCoverages[key] = covererId;
    saveState();
    renderDashboard();
}

function promptManualCoverage(dateStr, absentId) {
    const key = `${dateStr}_${absentId}`;
    let options = state.people.filter(p => p.id !== absentId).map(p => `${p.id}: ${p.name}`).join('\n');
    const choice = prompt(`Ingrese el ID de la persona responsable de la cobertura:\n\n${options}`);
    if (choice && state.people.some(p => p.id === choice)) {
        state.confirmedCoverages[key] = choice;
        saveState();
        renderDashboard();
    } else if (choice) {
        alert("ID de persona inválido.");
    }
}

function clearConfirmedCoverage(dateStr, absentId) {
    const key = `${dateStr}_${absentId}`;
    delete state.confirmedCoverages[key];
    saveState();
    renderDashboard();
}

// Render Team Module View
function renderPeople() {
    const tbody = document.getElementById('table-people-body');
    tbody.innerHTML = '';
    state.people.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${p.name}</strong></td>
            <td><span class="status-badge" style="background: rgba(88,166,255,0.1); color: var(--accent);">${p.team}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openPersonModal('${p.id}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deletePerson('${p.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openPersonModal(id = '') {
    const modal = document.getElementById('modal-person');
    if (id) {
        document.getElementById('person-modal-title').innerText = "Editar Persona";
        const p = state.people.find(x => x.id === id);
        document.getElementById('person-id').value = p.id;
        document.getElementById('person-name').value = p.name;
        document.getElementById('person-team').value = p.team;
    } else {
        document.getElementById('person-modal-title').innerText = "Agregar Persona";
        document.getElementById('person-id').value = '';
        document.getElementById('person-name').value = '';
    }
    modal.classList.add('active');
}

function savePersonForm() {
    const id = document.getElementById('person-id').value;
    const name = document.getElementById('person-name').value.trim().toUpperCase();
    const team = document.getElementById('person-team').value;

    if (!name) { alert("El nombre es obligatorio"); return; }

    if (id) {
        const p = state.people.find(x => x.id === id);
        p.name = name;
        p.team = team;
    } else {
        state.people.push({
            id: 'per_' + Math.random().toString(36).substr(2, 9),
            name: name,
            team: team
        });
    }
    saveState();
    closeModal('modal-person');
    renderPeople();
}

function deletePerson(id) {
    if (confirm("¿Estás seguro de eliminar esta persona del equipo operativo?")) {
        state.people = state.people.filter(p => p.id !== id);
        saveState();
        renderPeople();
    }
}

// Visual Month Calendar Processing Layout Matrix
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function initCalendarSelects() {
    const mSel = document.getElementById('cal-month-select');
    const ySel = document.getElementById('cal-year-select');
    if (mSel.options.length > 0) return;

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    months.forEach((m, idx) => {
        let opt = new Option(m, idx);
        if (idx === currentCalendarMonth) opt.selected = true;
        mSel.add(opt);
    });

    for (let y = 2025; y <= 2030; y++) {
        let opt = new Option(y, y);
        if (y === currentCalendarYear) opt.selected = true;
        ySel.add(opt);
    }

    mSel.addEventListener('change', () => { currentCalendarMonth = parseInt(mSel.value); renderCalendar(); });
    ySel.addEventListener('change', () => { currentCalendarYear = parseInt(ySel.value); renderCalendar(); });
}

function renderCalendar() {
    initCalendarSelects();
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const firstDayIndex = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    const totalDays = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
    const prevTotalDays = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();

    // Render preceding days from adjacent month
    for (let i = firstDayIndex; i > 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.innerHTML = `<span class="day-number">${prevTotalDays - i + 1}</span>`;
        grid.appendChild(dayDiv);
    }

    // Active calendar target loop iteration processing
    const todayStr = getTodayStr();
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        const mFixed = String(currentCalendarMonth + 1).padStart(2, '0');
        const dFixed = String(day).padStart(2, '0');
        const loopDateStr = `${currentCalendarYear}-${mFixed}-${dFixed}`;

        if (loopDateStr === todayStr) dayDiv.classList.add('today');

        dayDiv.innerHTML = `<span class="day-number">${day}</span>`;

        // Render matching operational event badges mapping bounds
        const dayEvents = state.events.filter(e => loopDateStr >= e.startDate && loopDateStr <= e.endDate);
        dayEvents.forEach(ev => {
            const b = document.createElement('div');
            const person = state.people.find(p => p.id === ev.personId);
            const name = person ? person.name : 'Desconocido';
            
            let colorClass = 'bg-blue';
            if (ev.type === "Día de estudio") colorClass = 'bg-green';
            if (ev.type === "Licencia") colorClass = 'bg-red';
            if (ev.type === "Capacitación") colorClass = 'bg-yellow';

            b.className = `calendar-item-badge ${colorClass}`;
            b.innerText = `${name}: ${ev.type}`;
            b.title = `${name}\n${ev.type}\nNota: ${ev.observations || ''}`;
            b.onclick = (e) => { e.stopPropagation(); openEventModal(ev.id); };
            dayDiv.appendChild(b);
        });

        grid.appendChild(dayDiv);
    }
}

// Configurable Sugested Coverage Matrix Configuration Views
function renderCoverageMatrixTab() {
    const container = document.getElementById('cober-matrix-inputs');
    container.innerHTML = '';

    state.people.forEach(p => {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        
        let selectHtml = `<select data-for-person="${p.id}" class="form-control"><option value="">-- Sin Cobertura --</option>`;
        state.people.forEach(optPerson => {
            if (optPerson.id !== p.id) {
                const isSelected = state.coverageMatrix[p.id] === optPerson.id ? 'selected' : '';
                selectHtml += `<option value="${optPerson.id}" ${isSelected}>${optPerson.name}</option>`;
            }
        });
        selectHtml += `</select>`;

        row.innerHTML = `<span><strong>${p.name}</strong></span> ➔ <span style="font-size:0.8rem; color:var(--text-secondary);">Sugerir a:</span> ${selectHtml}`;
        container.appendChild(row);
    });
}

function saveCoverageMatrix() {
    const selects = document.querySelectorAll('#cober-matrix-inputs select');
    selects.forEach(sel => {
        const forPerson = sel.dataset.forPerson;
        state.coverageMatrix[forPerson] = sel.value || "";
    });
    saveState();
    alert("Matriz de coberturas guardada correctamente.");
}

// Tasks Matrix Controller
let selectedTasksDate = getTodayStr();

function renderTasks() {
    const dInput = document.getElementById('tasks-date-filter');
    if (!dInput.value) dInput.value = selectedTasksDate;
    
    selectedTasksDate = dInput.value;
    runDailyRecurrentTasksAutomation(selectedTasksDate);

    // Filter tasks exactly by targeting operational date standard scope
    const dayTasks = state.tasks.filter(t => t.date === selectedTasksDate);
    const tbody = document.getElementById('table-tasks-body');
    tbody.innerHTML = '';

    dayTasks.forEach(t => {
        const tr = document.createElement('tr');
        
        // Build dynamic flexible interactive dropdown options list selectors cleanly
        let resSelect = `<select class="form-control form-control-sm" onchange="assignTaskResponsible('${t.id}', this.value)"><option value="">-- Sin Asignar --</option>`;
        state.people.forEach(p => {
            const isSel = t.responsibleId === p.id ? 'selected' : '';
            resSelect += `<option value="${p.id}" ${isSel}>${p.name}</option>`;
        });
        resSelect += `</select>`;

        let statusSelect = `<select class="form-control form-control-sm" onchange="updateTaskStatus('${t.id}', this.value)">`;
        ["Pendiente", "En curso", "Finalizada", "Observada"].forEach(st => {
            const isSel = t.status === st ? 'selected' : '';
            statusSelect += `<option value="${st}" ${isSel}>${st}</option>`;
        });
        statusSelect += `</select>`;

        tr.innerHTML = `
            <td><strong>${t.description}</strong></td>
            <td>${resSelect}</td>
            <td><span class="priority-badge ${t.priority}">${t.priority}</span></td>
            <td><span class="status-badge ${t.status.toLowerCase().replace(' ', '-')}">${statusSelect}</span></td>
            <td><span style="font-size:0.75rem; color:var(--text-secondary);">${t.isRecurrent ? 'Recurrente' : 'Manual'}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openTaskModal('${t.id}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTask('${t.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    dInput.onchange = () => { selectedTasksDate = dInput.value; renderTasks(); };
}

function assignTaskResponsible(taskId, val) {
    const t = state.tasks.find(x => x.id === taskId);
    if (t) {
        t.responsibleId = val;
        saveState();
    }
}

function updateTaskStatus(taskId, val) {
    const t = state.tasks.find(x => x.id === taskId);
    if (t) {
        t.status = val;
        saveState();
    }
}

function openTaskModal(id = '') {
    const modal = document.getElementById('modal-task');
    const rSel = document.getElementById('task-responsible');
    
    rSel.innerHTML = '<option value="">-- Sin Asignar --</option>';
    state.people.forEach(p => rSel.add(new Option(p.name, p.id)));

    if (id) {
        document.getElementById('task-modal-title').innerText = "Editar Tarea";
        const t = state.tasks.find(x => x.id === id);
        document.getElementById('task-id').value = t.id;
        document.getElementById('task-desc').value = t.description;
        document.getElementById('task-responsible').value = t.responsibleId;
        document.getElementById('task-priority').value = t.priority;
        document.getElementById('task-status').value = t.status;
        document.getElementById('task-date').value = t.date;
    } else {
        document.getElementById('task-modal-title').innerText = "Crear Tarea Manual";
        document.getElementById('task-id').value = '';
        document.getElementById('task-desc').value = '';
        document.getElementById('task-responsible').value = '';
        document.getElementById('task-priority').value = 'Media';
        document.getElementById('task-status').value = 'Pendiente';
        document.getElementById('task-date').value = selectedTasksDate;
    }
    modal.classList.add('active');
}

function saveTaskForm() {
    const id = document.getElementById('task-id').value;
    const description = document.getElementById('task-desc').value.trim();
    const responsibleId = document.getElementById('task-responsible').value;
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value;
    const date = document.getElementById('task-date').value;

    if (!description || !date) { alert("Descripción y fecha requeridas."); return; }

    if (id) {
        const t = state.tasks.find(x => x.id === id);
        t.description = description;
        t.responsibleId = responsibleId;
        t.priority = priority;
        t.status = status;
        t.date = date;
    } else {
        state.tasks.push({
            id: 'tsk_' + Math.random().toString(36).substr(2, 9),
            description, responsibleId, priority, status, date, isRecurrent: false
        });
    }
    saveState();
    closeModal('modal-task');
    renderTasks();
}

function deleteTask(id) {
    if (confirm("¿Estás seguro de eliminar esta tarea del registro diario?")) {
        state.tasks = state.tasks.filter(x => x.id !== id);
        saveState();
        renderTasks();
    }
}

function openEventModal(id = '') {
    const modal = document.getElementById('modal-event');
    const pSel = document.getElementById('event-person');
    
    pSel.innerHTML = '';
    state.people.forEach(p => pSel.add(new Option(p.name, p.id)));

    if (id) {
        document.getElementById('event-modal-title').innerText = "Editar Evento";
        document.getElementById('btn-del-event').style.display = 'inline-block';
        const ev = state.events.find(x => x.id === id);
        document.getElementById('event-id').value = ev.id;
        document.getElementById('event-person').value = ev.personId;
        document.getElementById('event-type').value = ev.type;
        document.getElementById('event-start').value = ev.startDate;
        document.getElementById('event-end').value = ev.endDate;
        document.getElementById('event-obs').value = ev.observations || '';
    } else {
        document.getElementById('event-modal-title').innerText = "Cargar Evento";
        document.getElementById('btn-del-event').style.display = 'none';
        document.getElementById('event-id').value = '';
        document.getElementById('event-start').value = getTodayStr();
        document.getElementById('event-end').value = getTodayStr();
        document.getElementById('event-obs').value = '';
    }
    modal.classList.add('active');
}

function saveEventForm() {
    const id = document.getElementById('event-id').value;
    const personId = document.getElementById('event-person').value;
    const type = document.getElementById('event-type').value;
    const startDate = document.getElementById('event-start').value;
    const endDate = document.getElementById('event-end').value;
    const observations = document.getElementById('event-obs').value.trim();

    if (!personId || !startDate || !endDate) { alert("Complete los campos requeridos"); return; }
    if (startDate > endDate) { alert("La fecha de inicio no puede ser posterior a la fecha de fin"); return; }

    if (id) {
        const ev = state.events.find(x => x.id === id);
        ev.personId = personId;
        ev.type = type;
        ev.startDate = startDate;
        ev.endDate = endDate;
        ev.observations = observations;
    } else {
        state.events.push({
            id: 'ev_' + Math.random().toString(36).substr(2, 9),
            personId, type, startDate, endDate, observations
        });
    }
    saveState();
    closeModal('modal-event');
    renderCalendar();
}

function deleteEventClick() {
    const id = document.getElementById('event-id').value;
    if (id && confirm("¿Eliminar este registro del calendario?")) {
        state.events = state.events.filter(x => x.id !== id);
        saveState();
        closeModal('modal-event');
        renderCalendar();
    }
}

// Observations Engine Feature Layout
function renderObservations() {
    const tbody = document.getElementById('table-obs-body');
    tbody.innerHTML = '';
    
    state.observations.sort((a,b) => b.date.localeCompare(a.date)).forEach(o => {
        const person = state.people.find(p => p.id === o.personId);
        const name = person ? person.name : 'Desconocido';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${o.date}</td>
            <td><strong>${name}</strong></td>
            <td>${o.text}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteObservation('${o.id}')">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function openObservationModal() {
    const modal = document.getElementById('modal-observation');
    const oSel = document.getElementById('obs-person');
    
    oSel.innerHTML = '';
    state.people.forEach(p => oSel.add(new Option(p.name, p.id)));
    
    document.getElementById('obs-id').value = '';
    document.getElementById('obs-date').value = getTodayStr();
    document.getElementById('obs-text').value = '';
    
    modal.classList.add('active');
}

function saveObservationForm() {
    const date = document.getElementById('obs-date').value;
    const personId = document.getElementById('obs-person').value;
    const text = document.getElementById('obs-text').value.trim();

    if (!date || !personId || !text) { alert("Rellene todos los campos de la observación."); return; }

    state.observations.push({
        id: 'obs_' + Math.random().toString(36).substr(2, 9),
        date, personId, text
    });
    
    saveState();
    closeModal('modal-observation');
    renderObservations();
}

function deleteObservation(id) {
    if (confirm("¿Eliminar observación?")) {
        state.observations = state.observations.filter(x => x.id !== id);
        saveState();
        renderObservations();
    }
}

// Unified Track Audit History Timeline View Filter
function renderHistory() {
    const pFilter = document.getElementById('seg-filter-person').value;
    const dFilter = document.getElementById('seg-filter-date').value;
    const mFilter = document.getElementById('seg-filter-month').value;

    // Repopulate dynamic selection listings if unbuilt
    const pSelect = document.getElementById('seg-filter-person');
    if (pSelect.options.length <= 1) {
        state.people.forEach(p => pSelect.add(new Option(p.name, p.id)));
    }

    const tbody = document.getElementById('table-history-body');
    tbody.innerHTML = '';

    const trackingList = [];

    // Push task mutations tracking rows
    state.tasks.forEach(t => {
        trackingList.push({
            date: t.date,
            type: "Gestión de Tareas",
            detail: `Tarea: "${t.description}" [Prioridad: ${t.priority} | Estado: ${t.status}]`,
            personId: t.responsibleId
        });
    });

    // Push active occurrences logs
    state.events.forEach(e => {
        trackingList.push({
            date: e.startDate,
            type: `Novedad (${e.type})`,
            detail: `Fin planeado: ${e.endDate}. Notas: ${e.observations || 'Sin observaciones'}`,
            personId: e.personId
        });
    });

    // Sorting algorithm outputs chronologically descending
    trackingList.sort((a,b) => b.date.localeCompare(a.date));

    // Dynamic stream filters execution
    const filtered = trackingList.filter(item => {
        if (pFilter && item.personId !== pFilter) return false;
        if (dFilter && item.date !== dFilter) return false;
        if (mFilter && item.date.substring(0,7) !== mFilter) return false;
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-secondary); font-style:italic;">No hay registros históricos con los filtros actuales.</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const person = state.people.find(p => p.id === item.personId);
        const name = person ? person.name : '--';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${item.date}</code></td>
            <td><span class="status-badge en-curso">${item.type}</span></td>
            <td>${item.detail}</td>
            <td><strong>${name}</strong></td>
        `;
        tbody.appendChild(tr);
    });

    // Wire real-time reactivity inputs mapping updates dynamically
    document.getElementById('seg-filter-person').onchange = renderHistory;
    document.getElementById('seg-filter-date').onchange = renderHistory;
    document.getElementById('seg-filter-month').onchange = renderHistory;
}

function clearFilters() {
    document.getElementById('seg-filter-person').value = "";
    document.getElementById('seg-filter-date').value = "";
    document.getElementById('seg-filter-month').value = "";
    renderHistory();
}

// Analytical Metrics Dashboard Reports Calculations Engine
function renderReports() {
    const mInput = document.getElementById('report-month-filter');
    if (!mInput.value) mInput.value = getTodayStr().substring(0, 7);
    
    const targetMonth = mInput.value; // Format expected YYYY-MM
    const tbody = document.getElementById('table-reports-body');
    tbody.innerHTML = '';

    state.people.forEach(p => {
        // Calculate assigned tasks for specific person and month bounds
        const monthTasks = state.tasks.filter(t => t.responsibleId === p.id && t.date.substring(0, 7) === targetMonth);
        const totalAssigned = monthTasks.length;
        const totalCompleted = monthTasks.filter(t => t.status === "Finalizada").length;
        const compliancePct = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

        // Count calendar incidents matches
        const absences = state.events.filter(e => e.personId === p.id && ["Vacaciones", "Licencia"].includes(e.type) && e.startDate.substring(0, 7) === targetMonth).length;
        const studyDays = state.events.filter(e => e.personId === p.id && e.type === "Día de estudio" && e.startDate.substring(0, 7) === targetMonth).length;

        // Calculate count of transactional active coverages executed successfully
        let coveragesDone = 0;
        Object.keys(state.confirmedCoverages).forEach(key => {
            // key layout structure expected: YYYY-MM-DD_absentId
            const datePart = key.split('_')[0];
            if (datePart.substring(0, 7) === targetMonth && state.confirmedCoverages[key] === p.id) {
                coveragesDone++;
            }
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${p.name}</strong></td>
            <td>${totalAssigned}</td>
            <td>${totalCompleted}</td>
            <td><strong class="${compliancePct >= 80 ? 'text-green' : 'text-yellow'}">${compliancePct}%</strong></td>
            <td>${absences}</td>
            <td>${studyDays}</td>
            <td><span class="status-badge finalizada">${coveragesDone} realizadas</span></td>
        `;
        tbody.appendChild(tr);
    });

    mInput.onchange = renderReports;
}

// Data Portability Hub & Sync Managers
function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `DGFIS_Backup_${getTodayStr()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.people && parsed.tasks) {
                state = parsed;
                saveState();
                alert("Respaldo JSON importado y sincronizado correctamente con éxito.");
                location.reload();
            } else {
                alert("Estructura de archivo JSON no válida para el sistema.");
            }
        } catch (err) {
            alert("Error al parsear el archivo JSON cargado.");
        }
    };
    reader.readAsText(file);
}

function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Tarea,Fecha,Descripcion,Responsable,Prioridad,Estado,Origen\n";

    state.tasks.forEach(t => {
        const p = state.people.find(pe => pe.id === t.responsibleId);
        const name = p ? p.name : "Sin Asignar";
        const row = [
            t.id,
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            name,
            t.priority,
            t.status,
            t.isRecurrent ? 'Recurrente' : 'Manual'
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `DGFIS_Matriz_Tareas_${getTodayStr()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Global Interfaces Closures Utility
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Initial Core Activation App Setup
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date-display').innerText = getTodayStr().split('-').reverse().join('/');
    renderDashboard();
});
