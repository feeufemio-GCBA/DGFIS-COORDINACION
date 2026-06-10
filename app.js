// CONFIGURACIÓN INICIAL DEL ESTADO
const DEFAULT_STATE = {
    people: [
        { id: "p1", name: "ZOE", team: "DATOS Y REPORTING" },
        { id: "p2", name: "FAUSTO", team: "DATOS Y REPORTING" },
        { id: "p3", name: "MARCELO", team: "PLANIFICACIÓN" },
        { id: "p4", name: "MARINA", team: "ANÁLISIS Y GESTIÓN" }
    ],
    events: [],
    coverageMatrix: { "p1": "p2", "p2": "p1" },
    confirmedCoverages: {}, 
    tasks: [],
    observations: [],
    generatedDates: {} 
};

let state = JSON.parse(localStorage.getItem('DGFIS_STATE')) || DEFAULT_STATE;

if (!state.confirmedCoverages) state.confirmedCoverages = {};
if (!state.generatedDates) state.generatedDates = {};

function saveState() {
    localStorage.setItem('DGFIS_STATE', JSON.stringify(state));
}

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
    const parts = dateStr.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return days[d.getDay()];
}

// CONTROLADOR DE PESTAÑAS (RUTEO)
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

// AUTOMATIZADOR DE TAREAS RECURRENTES
function runDailyRecurrentTasksAutomation(dateStr) {
    if (state.generatedDates[dateStr]) return; 
    
    const dayName = getDayNameEs(dateStr);
    const generated = [];
    const diasLaborales = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
    if (!diasLaborales.includes(dayName)) return;

    state.people.forEach(person => {
        if (person.team === "DATOS Y REPORTING") {
            if (dayName === "LUNES") {
                generated.push({ desc: "CABLEADO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "EXPEDIENTES LEGALES – ORDENAMIENTO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "ACTUALIZAR SLA - CONTROL PENDIENTES", team: "DATOS Y REPORTING" });
                generated.push({ desc: "AUDITORÍA ORDENAMIENTO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "ACTUALIZAR SEGUIMIENTO ORDENAMIENTO", team: "DATOS Y REPORTING" });
            } else if (dayName === "MARTES") {
                generated.push({ desc: "ACTUALIZAR SLA - CONTROL PENDIENTES", team: "DATOS Y REPORTING" });
                generated.push({ desc: "ACTUALIZACION AVANCE DE PENDIENTES VERI-RESO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "ACTUALIZACIÓN NUEVA COBERTURA", team: "DATOS Y REPORTING" });
                generated.push({ desc: "PENDIENTES ORDENAMIENTO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "ENVIAR PENDIENTES A ORDENAMIENTO ( LO QUE SE PLANIFICO EL VIERNES Y MIERCOLES)", team: "DATOS Y REPORTING" });
            } else if (dayName === "MIÉRCOLES") {
                generated.push({ desc: "CABLEADO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "EXPEDIENTES LEGALES – ORDENAMIENTO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "REVISION DE DRIVES", team: "DATOS Y REPORTING" });
                generated.push({ desc: "REPORTE SEMANAL", team: "DATOS Y REPORTING" });
            } else if (dayName === "JUEVES") {
                generated.push({ desc: "ACTUALIZAR SLA - CONTROL PENDIENTES", team: "DATOS Y REPORTING" });
                generated.push({ desc: "ACTUALIZACION AVANCE DE PENDIENTES VERI-RESO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "PENDIENTES ORDENAMIENTO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "BASE GOIEP SEMANAL", team: "DATOS Y REPORTING" });
                generated.push({ desc: "ACTUALIZAR SEGUIMIENTO ORDENAMIENTO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "ENVIAR PENDIENTES A ORDENAMIENTO (LO QUE SE PLANIFICO EL LUNES)", team: "DATOS Y REPORTING" });
            } else if (dayName === "VIERNES") {
                generated.push({ desc: "CABLEADO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "EXPEDIENTES LEGALES – ORDENAMIENTO", team: "DATOS Y REPORTING" });
                generated.push({ desc: "COLUMNAS Y POSTE EXPEDIENTE", team: "DATOS Y REPORTING" });
                generated.push({ desc: "COBERTURA CABLEADO (ENVIO POR WHATSSAP)", team: "DATOS Y REPORTING" });
                generated.push({ desc: "COBERTURA DE EXPEDIENTES", team: "DATOS Y REPORTING" });
            }
        }
        
        if (person.team === "ANÁLISIS Y GESTIÓN") {
            generated.push({ desc: "BAJADAS 2026", team: "ANÁLISIS Y GESTIÓN" });
            generated.push({ desc: "CUCC", team: "ANÁLISIS Y GESTIÓN" });
            generated.push({ desc: "ACTUALIZAR BACKOFFICE MAÑANA", team: "ANÁLISIS Y GESTIÓN" });
            generated.push({ desc: "ACTUALIZAR BACKOFFICE TARDE", team: "ANÁLISIS Y GESTIÓN" });
        }

        if (person.team === "PLANIFICACIÓN") {
            if (["LUNES", "MIÉRCOLES", "VIERNES"].includes(dayName)) {
                generated.push({ desc: "PLANIFICACIÓN ÁREAS GASTRONÓMICAS", team: "PLANIFICACIÓN" });
                generated.push({ desc: "PLANIFICACION ORDENAMIENTO", team: "PLANIFICACIÓN" });
            } else if (["MARTES", "JUEVES"].includes(dayName)) {
                generated.push({ desc: "PLANIFICACIÓN ÁREAS GASTRONÓMICAS", team: "PLANIFICACIÓN" });
            }
        }
    });

    const seen = new Set();
    const uniqueTasks = generated.filter(t => {
        const duplicate = seen.has(t.desc);
        seen.add(t.desc);
        return !duplicate;
    });

    uniqueTasks.forEach(t => {
        state.tasks.push({
            id: 'tsk_' + Math.random().toString(36).substr(2, 9),
            description: t.desc,
            taskGroup: t.team, 
            responsibleId: "", 
            status: "Pendiente",
            priority: "Media",
            date: dateStr,
            isRecurrent: true
        });
    });

    state.generatedDates[dateStr] = true;
    saveState();
}

function checkAbsenceStatus(personId, dateStr) {
    return state.events.find(ev => {
        return ev.personId === personId && 
               dateStr >= ev.startDate && 
               dateStr <= ev.endDate && 
               ["Vacaciones", "Licencia", "Día de estudio"].includes(ev.type);
    });
}

// DASHBOARD MONITOR
function renderDashboard() {
    const today = getTodayStr();
    runDailyRecurrentTasksAutomation(today);

    let presentes = 0; let ausentes = 0; let activeCoberturasCount = 0;
    const summaryListHTML = []; const alertsHTML = [];

    state.people.forEach(p => {
        const absenceEvent = checkAbsenceStatus(p.id, today);
        if (absenceEvent) {
            ausentes++;
            const cobKey = `${today}_${p.id}`;
            const confirmedCovererId = state.confirmedCoverages[cobKey];
            let covererName = "Nadie asignado";
            
            if (confirmedCovererId) {
                const cPerson = state.people.find(pe => pe.id === confirmedCovererId);
                if (cPerson) { covererName = cPerson.name; activeCoberturasCount++; }
            }

            summaryListHTML.push(`
                <div class="summary-item">
                    <span>🔴 <strong>${p.name}</strong> (${p.team}) - Ausente por ${absenceEvent.type}</span>
                    <span class="text-blue">Cubierto por: ${covererName}</span>
                </div>
            `);

            if (!confirmedCovererId) {
                const suggestedId = state.coverageMatrix[p.id] || "";
                const suggestedPerson = state.people.find(pe => pe.id === suggestedId);
                const suggestedName = suggestedPerson ? suggestedPerson.name : "Sin sugerencia";

                alertsHTML.push(`
                    <div class="alert-box">
                        <div>
                            <strong>Ausencia Detectada:</strong> ${p.name} requiere cobertura hoy por ${absenceEvent.type}. 
                            <br><small>Sugerencia: Cobertura por <strong>${suggestedName}</strong></small>
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
                        <div>✅ Cobertura activa: <strong>${covererName}</strong> está cubriendo a <strong>${p.name}</strong> hoy.</div>
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

    document.getElementById('dash-presentes').innerText = presentes;
    document.getElementById('dash-ausentes').innerText = ausentes;
    document.getElementById('dash-coberturas').innerText = activeCoberturasCount;
    document.getElementById('dash-tareas').innerText = state.tasks.filter(t => t.date === today && t.status !== "Finalizada").length;
    document.getElementById('dash-vacaciones').innerText = state.events.filter(e => e.type === "Vacaciones" && e.startDate >= today).length;
    document.getElementById('dash-estudio').innerText = state.events.filter(e => e.type === "Día de estudio" && e.startDate >= today).length;
    document.getElementById('dash-observaciones').innerText = state.observations.filter(o => o.date.substring(0, 7) === today.substring(0, 7)).length;

    document.getElementById('dashboard-cober-alerts').innerHTML = alertsHTML.join('');
    document.getElementById('dashboard-summary-list').innerHTML = summaryListHTML.join('');
}

function confirmSystemCoverage(dateStr, absentId, covererId) {
    if (!covererId) { alert("No hay cobertura configurada."); return; }
    state.confirmedCoverages[`${dateStr}_${absentId}`] = covererId;
    saveState(); renderDashboard();
}

function promptManualCoverage(dateStr, absentId) {
    let options = state.people.filter(p => p.id !== absentId).map(p => `${p.id}: ${p.name}`).join('\n');
    const choice = prompt(`Ingrese el ID de la persona:\n\n${options}`);
    if (choice && state.people.some(p => p.id === choice)) {
        state.confirmedCoverages[`${dateStr}_${absentId}`] = choice;
        saveState(); renderDashboard();
    }
}

function clearConfirmedCoverage(dateStr, absentId) {
    delete state.confirmedCoverages[`${dateStr}_${absentId}`];
    saveState(); renderDashboard();
}

// CONTROL DE PERSONAL
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
        const p = state.people.find(x => x.id === id);
        document.getElementById('person-modal-title').innerText = "Editar Persona";
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
    if (!name) return;
    if (id) {
        const p = state.people.find(x => x.id === id);
        p.name = name; p.team = team;
    } else {
        state.people.push({ id: 'per_' + Math.random().toString(36).substr(2, 9), name, team });
    }
    saveState(); closeModal('modal-person'); renderPeople();
}

function deletePerson(id) {
    if (confirm("¿Eliminar persona?")) { state.people = state.people.filter(p => p.id !== id); saveState(); renderPeople(); }
}

// CALENDARIO
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function renderCalendar() {
    const mSel = document.getElementById('cal-month-select');
    const ySel = document.getElementById('cal-year-select');
    if (mSel.options.length === 0) {
        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        months.forEach((m, idx) => mSel.add(new Option(m, idx, false, idx === currentCalendarMonth)));
        for (let y = 2025; y <= 2030; y++) ySel.add(new Option(y, y, false, y === currentCalendarYear));
        mSel.onchange = () => { currentCalendarMonth = parseInt(mSel.value); renderCalendar(); };
        ySel.onchange = () => { currentCalendarYear = parseInt(ySel.value); renderCalendar(); };
    }

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const firstDayIndex = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    const totalDays = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
    const prevTotalDays = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();

    for (let i = firstDayIndex; i > 0; i--) {
        const d = document.createElement('div'); d.className = 'calendar-day other-month';
        d.innerHTML = `<span class="day-number">${prevTotalDays - i + 1}</span>`; grid.appendChild(d);
    }

    const todayStr = getTodayStr();
    for (let day = 1; day <= totalDays; day++) {
        const d = document.createElement('div'); d.className = 'calendar-day';
        const loopDateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        if (loopDateStr === todayStr) d.classList.add('today');
        d.innerHTML = `<span class="day-number">${day}</span>`;

        state.events.filter(e => loopDateStr >= e.startDate && loopDateStr <= e.endDate).forEach(ev => {
            const b = document.createElement('div');
            const person = state.people.find(p => p.id === ev.personId);
            let cClass = ev.type === "Día de estudio" ? 'bg-green' : ev.type === "Licencia" ? 'bg-red' : ev.type === "Capacitación" ? 'bg-yellow' : 'bg-blue';
            b.className = `calendar-item-badge ${cClass}`;
            b.innerText = `${person ? person.name : '?'}: ${ev.type}`;
            b.onclick = (e) => { e.stopPropagation(); openEventModal(ev.id); };
            d.appendChild(b);
        });
        grid.appendChild(d);
    }
}

// MATRIZ COBERTURAS
function renderCoverageMatrixTab() {
    const container = document.getElementById('cober-matrix-inputs');
    container.innerHTML = '';
    state.people.forEach(p => {
        let selectHtml = `<select data-for-person="${p.id}" class="form-control"><option value="">-- Sin Cobertura --</option>`;
        state.people.forEach(op => {
            if (op.id !== p.id) selectHtml += `<option value="${op.id}" ${state.coverageMatrix[p.id] === op.id ? 'selected' : ''}>${op.name}</option>`;
        });
        container.innerHTML += `<div class="matrix-row"><span><strong>${p.name}</strong></span> ➔ ${selectHtml}</select></div>`;
    });
}

function saveCoverageMatrix() {
    document.querySelectorAll('#cober-matrix-inputs select').forEach(sel => state.coverageMatrix[sel.dataset.forPerson] = sel.value);
    saveState(); alert("Matriz guardada.");
}

// ==========================================
// CONTROL DE TAREAS: SEPARACIÓN REAL POR CUADROS (OCULTANDO FINALIZADAS)
// ==========================================
let selectedTasksDate = getTodayStr();

function renderTasks() {
    const dInput = document.getElementById('tasks-date-filter');
    if (!dInput.value) dInput.value = selectedTasksDate;
    
    selectedTasksDate = dInput.value;
    runDailyRecurrentTasksAutomation(selectedTasksDate);

    // FILTRO CLAVE: Se obtienen las tareas del día pero se EXCLUYEN por completo las "Finalizada"
    const dayTasks = state.tasks.filter(t => t.date === selectedTasksDate && t.status !== "Finalizada");
    
    const container = document.getElementById('tasks-dynamic-container'); 
    container.innerHTML = ''; 

    // ESTRUCTURACIÓN DE LOS CUADROS INDEPENDIENTES SOLICITADOS
    const configuracionCuadros = [
        {
            titulo: "Cuadro Operativo: ZOE y FAUSTO",
            color: "#58a6ff", 
            evaluar: (t) => t.taskGroup === "DATOS Y REPORTING" || t.description.includes("CABLEADO") || t.description.includes("SLA") || t.description.includes("ORDENAMIENTO")
        },
        {
            titulo: "Cuadro Operativo: MARINA",
            color: "#ff7b72", 
            evaluar: (t) => t.taskGroup === "ANÁLISIS Y GESTIÓN" || t.description.includes("BAJADAS") || t.description.includes("CUCC") || t.description.includes("BACKOFFICE")
        },
        {
            titulo: "Cuadro Operativo: MARCELO",
            color: "#7ee787", 
            evaluar: (t) => t.taskGroup === "PLANIFICACIÓN" || t.description.includes("GASTRONÓMICAS") || t.description.includes("PLANIFICACION")
        },
        {
            titulo: "Tareas Manuales / Sin Asignación",
            color: "#d29922", 
            evaluar: (t) => !t.taskGroup || t.taskGroup === "MANUALES O SIN GRUPO"
        }
    ];

    configuracionCuadros.forEach(cuadro => {
        let tareasDelCuadro = [];

        if (cuadro.titulo === "Tareas Manuales / Sin Asignación") {
            tareasDelCuadro = dayTasks.filter(t => 
                !(t.taskGroup === "DATOS Y REPORTING" || t.description.includes("CABLEADO") || t.description.includes("SLA") || t.description.includes("ORDENAMIENTO")) &&
                !(t.taskGroup === "ANÁLISIS Y GESTIÓN" || t.description.includes("BAJADAS") || t.description.includes("CUCC") || t.description.includes("BACKOFFICE")) &&
                !(t.taskGroup === "PLANIFICACIÓN" || t.description.includes("GASTRONÓMICAS") || t.description.includes("PLANIFICACION"))
            );
        } else {
            tareasDelCuadro = dayTasks.filter(cuadro.evaluar);
        }

        if (tareasDelCuadro.length === 0) return; 

        const groupSection = document.createElement('div');
        groupSection.className = 'task-group-container';
        groupSection.style.marginBottom = '2.5rem';
        groupSection.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        groupSection.style.padding = '1rem';
        groupSection.style.borderRadius = '6px';
        groupSection.style.border = '1px solid #30363d';

        const idTbody = `tbody-cuadro-${cuadro.titulo.replace(/[^a-zA-Z0-9]/g, '-')}`;
        groupSection.innerHTML = `
            <h3 style="color: ${cuadro.color}; border-bottom: 2px solid ${cuadro.color}40; padding-bottom: 0.5rem; margin-bottom: 0.75rem; font-size: 1.15rem;">
                📋 ${cuadro.titulo}
            </h3>
            <table class="table" style="width:100%; text-align:left; margin-top: 0.5rem;">
                <thead>
                    <tr>
                        <th style="width: 40%;">Descripción de la Tarea</th>
                        <th>Asignar Operador</th>
                        <th>Prioridad</th>
                        <th>Estado Actual</th>
                        <th>Origen</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="${idTbody}"></tbody>
            </table>
        `;

        container.appendChild(groupSection);
        const groupTbody = document.getElementById(idTbody);

        tareasDelCuadro.forEach(t => {
            const tr = document.createElement('tr');
            
            let resSelect = `<select class="form-control form-control-sm" onchange="assignTaskResponsible('${t.id}', this.value)"><option value="">-- Sin Asignar --</option>`;
            state.people.forEach(p => resSelect += `<option value="${p.id}" ${t.responsibleId === p.id ? 'selected' : ''}>${p.name}</option>`);
            resSelect += `</select>`;

            let prioritySelect = `<select class="form-control form-control-sm" onchange="updateTaskPriority('${t.id}', this.value)" style="font-weight:bold;">`;
            ["Baja", "Media", "Alta"].forEach(prio => prioritySelect += `<option value="${prio}" ${(t.priority || "Media") === prio ? 'selected' : ''}>${prio}</option>`);
            prioritySelect += `</select>`;

            let statusSelect = `<select class="form-control form-control-sm" onchange="updateTaskStatusAndRefresh('${t.id}', this.value)">`;
            ["Pendiente", "En curso", "Finalizada", "Observada"].forEach(st => statusSelect += `<option value="${st}" ${t.status === st ? 'selected' : ''}>${st}</option>`);
            statusSelect += `</select>`;

            tr.innerHTML = `
                <td><strong>${t.description}</strong></td>
                <td>${resSelect}</td>
                <td>${prioritySelect}</td>
                <td><span class="status-badge ${t.status.toLowerCase().replace(' ', '-')}">${statusSelect}</span></td>
                <td><span style="font-size:0.75rem; color:var(--text-secondary);">${t.isRecurrent ? 'Recurrente' : 'Manual'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openTaskModal('${t.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTask('${t.id}')">Eliminar</button>
                </td>
            `;
            groupTbody.appendChild(tr);
        });
    });

    if (dayTasks.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 3rem; color: var(--text-secondary); font-style: italic;">No hay tareas pendientes para esta fecha.</div>`;
    }
    dInput.onchange = () => { selectedTasksDate = dInput.value; renderTasks(); };
}

function assignTaskResponsible(taskId, val) { const t = state.tasks.find(x => x.id === taskId); if (t) { t.responsibleId = val; saveState(); } }
function updateTaskPriority(taskId, val) { const t = state.tasks.find(x => x.id === taskId); if (t) { t.priority = val; saveState(); renderTasks(); } }

// FUNCIÓN AUXILIAR: Actualiza el estado y refresca la pantalla de inmediato para ocultar las finalizadas
function updateTaskStatusAndRefresh(taskId, val) {
    const t = state.tasks.find(x => x.id === taskId);
    if (t) { 
        t.status = val; 
        saveState(); 
        renderTasks(); 
    }
}

function openTaskModal(id = '') {
    const modal = document.getElementById('modal-task');
    const rSel = document.getElementById('task-responsible');
    rSel.innerHTML = '<option value="">-- Sin Asignar --</option>';
    state.people.forEach(p => rSel.add(new Option(p.name, p.id)));

    if (id) {
        const t = state.tasks.find(x => x.id === id);
        document.getElementById('task-modal-title').innerText = "Editar Tarea";
        document.getElementById('task-id').value = t.id;
        document.getElementById('task-desc').value = t.description;
        document.getElementById('task-responsible').value = t.responsibleId;
        document.getElementById('task-priority').value = t.priority || "Media";
        document.getElementById('task-status').value = t.status;
        document.getElementById('task-date').value = t.date;
    } else {
        document.getElementById('task-modal-title').innerText = "Crear Tarea Manual";
        document.getElementById('task-id').value = ''; document.getElementById('task-desc').value = '';
        document.getElementById('task-responsible').value = ''; document.getElementById('task-priority').value = 'Media';
        document.getElementById('task-status').value = 'Pendiente'; document.getElementById('task-date').value = selectedTasksDate;
    }
    modal.classList.add('active');
}

function saveTaskForm() {
    const id = document.getElementById('task-id').value;
    const description = document.getElementById('task-desc').value.trim();
    const date = document.getElementById('task-date').value;
    if (!description || !date) return;
    if (id) {
        const t = state.tasks.find(x => x.id === id);
        t.description = description; t.responsibleId = document.getElementById('task-responsible').value;
        t.priority = document.getElementById('task-priority').value; t.status = document.getElementById('task-status').value; t.date = date;
    } else {
        state.tasks.push({
            id: 'tsk_' + Math.random().toString(36).substr(2, 9), description, taskGroup: "MANUALES O SIN GRUPO",
            responsibleId: document.getElementById('task-responsible').value, priority: document.getElementById('task-priority').value, status: 'Pendiente', date, isRecurrent: false
        });
    }
    saveState(); closeModal('modal-task'); renderTasks();
}

function deleteTask(id) { if (confirm("¿Eliminar tarea?")) { state.tasks = state.tasks.filter(x => x.id !== id); saveState(); renderTasks(); } }

// FORMULARIOS ADICIONALES (EVENTOS, OBSERVACIONES, BACKUPS)
function saveEventForm() {
    const id = document.getElementById('event-id').value;
    const personId = document.getElementById('event-person').value;
    const type = document.getElementById('event-type').value;
    const startDate = document.getElementById('event-start').value;
    const endDate = document.getElementById('event-end').value;
    if (!personId || !startDate || !endDate) return;
    if (id) {
        const ev = state.events.find(x => x.id === id);
        ev.personId = personId; ev.type = type; ev.startDate = startDate; ev.endDate = endDate; ev.observations = document.getElementById('event-obs').value.trim();
    } else {
        state.events.push({ id: 'ev_' + Math.random().toString(36).substr(2, 9), personId, type, startDate, endDate, observations: document.getElementById('event-obs').value.trim() });
    }
    saveState(); closeModal('modal-event'); renderCalendar();
}

function deleteEventClick() { const id = document.getElementById('event-id').value; if (id && confirm("¿Eliminar?")) { state.events = state.events.filter(x => x.id !== id); saveState(); closeModal('modal-event'); renderCalendar(); } }

function renderObservations() {
    const tbody = document.getElementById('table-obs-body'); tbody.innerHTML = '';
    state.observations.sort((a,b) => b.date.localeCompare(a.date)).forEach(o => {
        const person = state.people.find(p => p.id === o.personId);
        tbody.innerHTML += `<tr><td>${o.date}</td><td><strong>${person ? person.name : '?'}</strong></td><td>${o.text}</td><td><button class="btn btn-danger btn-sm" onclick="deleteObservation('${o.id}')">Eliminar</button></td></tr>`;
    });
}

function openObservationModal() {
    const oSel = document.getElementById('obs-person'); oSel.innerHTML = '';
    state.people.forEach(p => oSel.add(new Option(p.name, p.id)));
    document.getElementById('obs-id').value = ''; document.getElementById('obs-date').value = getTodayStr(); document.getElementById('obs-text').value = '';
    document.getElementById('modal-observation').classList.add('active');
}

function saveObservationForm() {
    const date = document.getElementById('obs-date').value; const personId = document.getElementById('obs-person').value; const text = document.getElementById('obs-text').value.trim();
    if (!date || !personId || !text) return;
    state.observations.push({ id: 'obs_' + Math.random().toString(36).substr(2, 9), date, personId, text });
    saveState(); closeModal('modal-observation'); renderObservations();
}

function deleteObservation(id) { if (confirm("¿Eliminar?")) { state.observations = state.observations.filter(x => x.id !== id); saveState(); renderObservations(); } }

function renderHistory() {
    const pFilter = document.getElementById('seg-filter-person').value;
    const dFilter = document.getElementById('seg-filter-date').value;
    const mFilter = document.getElementById('seg-filter-month').value;
    const pSelect = document.getElementById('seg-filter-person');
    if (pSelect.options.length <= 1) state.people.forEach(p => pSelect.add(new Option(p.name, p.id)));

    const tbody = document.getElementById('table-history-body'); tbody.innerHTML = '';
    const trackingList = [];
    state.tasks.forEach(t => trackingList.push({ date: t.date, type: "Tareas", detail: `"${t.description}" [${t.status}]`, personId: t.responsibleId }));
    state.events.forEach(e => trackingList.push({ date: e.startDate, type: `Novedad (${e.type})`, detail: `Hasta: ${e.endDate}`, personId: e.personId }));

    trackingList.sort((a,b) => b.date.localeCompare(a.date)).filter(item => {
        if (pFilter && item.personId !== pFilter) return false;
        if (dFilter && item.date !== dFilter) return false;
        if (mFilter && item.date.substring(0,7) !== mFilter) return false;
        return true;
    }).forEach(item => {
        const person = state.people.find(p => p.id === item.personId);
        tbody.innerHTML += `<tr><td><code>${item.date}</code></td><td><span class="status-badge en-curso">${item.type}</span></td><td>${item.detail}</td><td><strong>${person ? person.name : '--'}</strong></td></tr>`;
    });
    document.getElementById('seg-filter-person').onchange = renderHistory;
    document.getElementById('seg-filter-date').onchange = renderHistory;
    document.getElementById('seg-filter-month').onchange = renderHistory;
}

function clearFilters() { document.getElementById('seg-filter-person').value = ""; document.getElementById('seg-filter-date').value = ""; document.getElementById('seg-filter-month').value = ""; renderHistory(); }

function renderReports() {
    const mInput = document.getElementById('report-month-filter');
    if (!mInput.value) mInput.value = getTodayStr().substring(0, 7);
    const targetMonth = mInput.value;
    const tbody = document.getElementById('table-reports-body'); tbody.innerHTML = '';

    state.people.forEach(p => {
        const monthTasks = state.tasks.filter(t => t.responsibleId === p.id && t.date.substring(0, 7) === targetMonth);
        const totalAssigned = monthTasks.length;
        const totalCompleted = monthTasks.filter(t => t.status === "Finalizada").length;
        const compliancePct = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
        const absences = state.events.filter(e => e.personId === p.id && ["Vacaciones", "Licencia"].includes(e.type) && e.startDate.substring(0, 7) === targetMonth).length;
        const studyDays = state.events.filter(e => e.personId === p.id && e.type === "Día de estudio" && e.startDate.substring(0, 7) === targetMonth).length;
        
        let coveragesDone = 0;
        Object.keys(state.confirmedCoverages).forEach(key => { if (key.split('_')[0].substring(0, 7) === targetMonth && state.confirmedCoverages[key] === p.id) coveragesDone++; });

        tbody.innerHTML += `<tr><td><strong>${p.name}</strong></td><td>${totalAssigned}</td><td>${totalCompleted}</td><td><strong>${compliancePct}%</strong></td><td>${absences}</td><td>${studyDays}</td><td><span class="status-badge finalizada">${coveragesDone} hechas</span></td></tr>`;
    });
    mInput.onchange = renderReports;
}

function openEventModal(id = '') {
    const modal = document.getElementById('modal-event'); const pSel = document.getElementById('event-person');
    pSel.innerHTML = ''; state.people.forEach(p => pSel.add(new Option(p.name, p.id)));
    if (id) {
        const ev = state.events.find(x => x.id === id); document.getElementById('event-modal-title').innerText = "Editar Evento"; document.getElementById('btn-del-event').style.display = 'inline-block';
        document.getElementById('event-id').value = ev.id; document.getElementById('event-person').value = ev.personId; document.getElementById('event-type').value = ev.type;
        document.getElementById('event-start').value = ev.startDate; document.getElementById('event-end').value = ev.endDate; document.getElementById('event-obs').value = ev.observations || '';
    } else {
        document.getElementById('event-modal-title').innerText = "Cargar Novedad"; document.getElementById('btn-del-event').style.display = 'none';
        document.getElementById('event-id').value = ''; document.getElementById('event-start').value = getTodayStr(); document.getElementById('event-end').value = getTodayStr(); document.getElementById('event-obs').value = '';
    }
    modal.classList.add('active');
}

function exportJSON() {
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2)));
    downloadAnchor.setAttribute("download", `DGFIS_Backup_${getTodayStr()}.json`); document.body.appendChild(downloadAnchor); downloadAnchor.click(); downloadAnchor.remove();
}

function importJSON(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.people && parsed.tasks) { state = parsed; saveState(); alert("Importado."); location.reload(); }
        } catch (err) { alert("Error."); }
    };
    reader.readAsText(file);
}

function exportCSV() {
    let csv = "ID Tarea,Fecha,Grupo,Descripcion,Responsable,Prioridad,Estado\n";
    state.tasks.forEach(t => { const p = state.people.find(pe => pe.id === t.responsibleId); csv += `${t.id},${t.date},${t.taskGroup || "Manual"},"${t.description}",${p ? p.name : "Sin Asignar"},${t.priority || "Media"},${t.status}\n`; });
    const anchor = document.createElement('a'); anchor.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + csv)); anchor.setAttribute("download", `Tareas_${getTodayStr()}.csv`); document.body.appendChild(anchor); anchor.click(); anchor.remove();
}

function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date-display').innerText = getTodayStr().split('-').reverse().join('/');
    renderDashboard();
});
