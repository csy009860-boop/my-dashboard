const stateLabels = {
  progress: "진행 중",
  done: "완료",
  delay: "지연"
};

const messageBox = document.getElementById("messageBox");
const totalCount = document.getElementById("totalCount");
const progressCount = document.getElementById("progressCount");
const doneCount = document.getElementById("doneCount");
const delayCount = document.getElementById("delayCount");
const dashboardTotalCount = document.getElementById("dashboardTotalCount");
const dashboardProgressCount = document.getElementById("dashboardProgressCount");
const dashboardDoneCount = document.getElementById("dashboardDoneCount");
const dashboardDelayCount = document.getElementById("dashboardDelayCount");
const teamProgressBoard = document.getElementById("teamProgressBoard");
const delayHighlightList = document.getElementById("delayHighlightList");
const highlightDelayCount = document.getElementById("highlightDelayCount");
const delayPanelCount = document.getElementById("delayPanelCount");
const allPanelCount = document.getElementById("allPanelCount");
const aiSummarySection = document.getElementById("aiSummarySection");
const aiSummaryContent = document.getElementById("aiSummaryContent");
const delayTaskBody = document.getElementById("delayTaskBody");
const taskBody = document.getElementById("taskBody");
const loadJsonButton = document.getElementById("loadJsonButton");
const jsonFileInput = document.getElementById("jsonFileInput");
const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitleInput");
const taskAssigneeInput = document.getElementById("taskAssigneeInput");
const taskTeamInput = document.getElementById("taskTeamInput");
const taskStatusInput = document.getElementById("taskStatusInput");
const taskProgressInput = document.getElementById("taskProgressInput");
const taskEditId = document.getElementById("taskEditId");
const taskSubmitButton = document.getElementById("taskSubmitButton");
const filterTeam = document.getElementById("filterTeam");
const filterAssignee = document.getElementById("filterAssignee");
const filterStatus = document.getElementById("filterStatus");
const toggleMyTasksButton = document.getElementById("toggleMyTasksButton");
const reportStartDate = document.getElementById("reportStartDate");
const reportEndDate = document.getElementById("reportEndDate");
const generateReportButton = document.getElementById("generateReportButton");
const copyReportButton = document.getElementById("copyReportButton");
const reportOutput = document.getElementById("reportOutput");
const memberPanelCount = document.getElementById("memberPanelCount");
const memberBody = document.getElementById("memberBody");
const memberForm = document.getElementById("memberForm");
const memberName = document.getElementById("memberName");
const memberPosition = document.getElementById("memberPosition");
const memberTeam = document.getElementById("memberTeam");
const memberEditId = document.getElementById("memberEditId");
const memberSubmitButton = document.getElementById("memberSubmitButton");

const MEMBERS_STORAGE_KEY = "team-dashboard-members";
const TASKS_STORAGE_KEY = "team-dashboard-tasks";
const MY_ASSIGNEE_STORAGE_KEY = "team-dashboard-my-assignee";
let currentTasks = [];
let currentMembers = [];
let taskFilters = {
  team: "",
  assignee: "",
  status: "",
  onlyMine: false
};

loadJsonButton.addEventListener("click", () => {
  jsonFileInput.click();
});

memberForm.addEventListener("submit", (event) => {
  event.preventDefault();
  upsertMember();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  upsertTask();
});

taskAssigneeInput.addEventListener("change", () => {
  syncTaskTeamWithAssignee();
});

filterTeam.addEventListener("change", () => {
  taskFilters.team = filterTeam.value;
  renderDashboard(currentTasks);
});

filterAssignee.addEventListener("change", () => {
  taskFilters.assignee = filterAssignee.value;
  saveMyAssignee(taskFilters.assignee);
  renderDashboard(currentTasks);
});

filterStatus.addEventListener("change", () => {
  taskFilters.status = filterStatus.value;
  renderDashboard(currentTasks);
});

toggleMyTasksButton.addEventListener("click", () => {
  taskFilters.onlyMine = !taskFilters.onlyMine;
  updateMyTasksButton();
  renderDashboard(currentTasks);
});

generateReportButton.addEventListener("click", () => {
  reportOutput.value = generateTaskReport(currentTasks, {
    startDate: reportStartDate.value,
    endDate: reportEndDate.value
  });
  setMessage("업무 보고서를 생성했습니다.", "success");
});

copyReportButton.addEventListener("click", async () => {
  if (!reportOutput.value.trim()) {
    setMessage("먼저 보고서를 생성해 주세요.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(reportOutput.value);
    setMessage("업무 보고서를 클립보드에 복사했습니다.", "success");
  } catch (error) {
    reportOutput.focus();
    reportOutput.select();
    setMessage("자동 복사에 실패했습니다. 선택된 텍스트를 직접 복사해 주세요.", "error");
  }
});

jsonFileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    hydrateApp(data);
    setMessage("선택한 JSON 파일을 불러왔습니다.", "success");
  } catch (error) {
    console.error(error);
    setMessage("선택한 파일을 읽지 못했습니다. JSON 형식을 확인해 주세요.", "error");
  } finally {
    jsonFileInput.value = "";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  setupScrollReveal();
  initialize();
});

async function initialize() {
  taskFilters.assignee = loadMyAssignee();

  try {
    const response = await fetch("./data.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    hydrateApp(data);
    setMessage("기본 data.json 파일을 자동으로 불러왔습니다.", "success");
  } catch (error) {
    console.warn("Automatic JSON load failed.", error);
    hydrateApp({ tasks: [], members: loadMembersFromStorage() });
    setMessage("자동 불러오기에 실패했습니다. 브라우저에서 로컬 JSON 접근을 막는 경우가 있으니 위 버튼으로 data.json 파일을 선택해 주세요.", "error");
  }
}

function hydrateApp(data) {
  const savedTasks = loadTasksFromStorage();
  currentTasks = savedTasks.length > 0 ? savedTasks : normalizeTasks(data);

  const savedMembers = loadMembersFromStorage();
  currentMembers = savedMembers.length > 0 ? savedMembers : normalizeMembers(data);

  saveTasksToStorage();
  saveMembersToStorage();
  populateTaskAssigneeOptions();
  populateAssigneeFilter(currentTasks);
  syncFilterControls();
  updateMyTasksButton();
  renderDashboard(currentTasks);
  renderMembers(currentMembers);
  reportOutput.value = generateTaskReport(currentTasks, {
    startDate: reportStartDate.value,
    endDate: reportEndDate.value
  });
}

function normalizeTasks(data) {
  const source = Array.isArray(data)
    ? data
    : data.tasks || data.items || data.data || [];

  return source.map((task, index) => ({
    id: task.id ?? index + 1,
    title: String(task.manager ?? task.title ?? task.name ?? "제목 없음"),
    assigneeId: normalizeAssigneeId(task.assigneeId),
    assignee: String(task.assignee ?? task.owner ?? task.manager_name ?? "미지정"),
    team: String(task.hours ?? task.team ?? task.cell ?? "-"),
    status: normalizeStatus(task.status),
    progress: clampProgress(task.progress ?? (task.status === "완료" ? 100 : 0))
  }));
}

function normalizeAssigneeId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeStatus(status) {
  const value = String(status ?? "progress").toLowerCase();
  return stateLabels[value] ? value : "progress";
}

function clampProgress(progress) {
  const number = Number(progress);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
}

function normalizeMembers(data) {
  const source = Array.isArray(data)
    ? []
    : data.members || [];

  return source.map((member, index) => ({
    id: member.id ?? Date.now() + index,
    name: String(member.name ?? ""),
    position: String(member.position ?? ""),
    team: String(member.team ?? "")
  }));
}

function renderDashboard(tasks) {
  renderOverviewDashboard(tasks);

  const filteredTasks = getFilteredTasks(tasks);
  const delayedTasks = filteredTasks.filter((task) => task.status === "delay");
  const orderedTasks = [...delayedTasks, ...filteredTasks.filter((task) => task.status !== "delay")];
  const filteredSummary = summarizeTasks(filteredTasks);

  totalCount.textContent = String(filteredSummary.total);
  progressCount.textContent = String(filteredSummary.progress);
  doneCount.textContent = String(filteredSummary.done);
  delayCount.textContent = String(filteredSummary.delay);
  delayPanelCount.textContent = `${delayedTasks.length}건`;
  allPanelCount.textContent = `${filteredTasks.length}건`;

  delayTaskBody.innerHTML = renderTaskRows(delayedTasks, false);
  taskBody.innerHTML = renderTaskRows(orderedTasks, true);
  updateAiSummaries(filteredTasks);
}

function renderOverviewDashboard(tasks) {
  const summary = summarizeTasks(tasks);
  const teamProgress = buildTeamProgress(tasks);
  const delayedTasks = tasks.filter((task) => task.status === "delay");

  dashboardTotalCount.textContent = `${summary.total}건`;
  dashboardProgressCount.textContent = String(summary.progress);
  dashboardDoneCount.textContent = String(summary.done);
  dashboardDelayCount.textContent = String(summary.delay);
  highlightDelayCount.textContent = `${summary.delay}건`;

  teamProgressBoard.innerHTML = renderTeamProgress(teamProgress);
  delayHighlightList.innerHTML = renderDelayHighlights(delayedTasks);
}

function summarizeTasks(tasks) {
  return {
    total: tasks.length,
    progress: tasks.filter((task) => task.status === "progress").length,
    done: tasks.filter((task) => task.status === "done").length,
    delay: tasks.filter((task) => task.status === "delay").length
  };
}

function buildTeamProgress(tasks) {
  const baseTeams = ["UXUI", "영상", "편집"];
  const discoveredTeams = [...new Set(
    tasks
      .map((task) => task.team)
      .filter((team) => team && team !== "-")
  )];

  return [...new Set([...baseTeams, ...discoveredTeams])].map((team) => {
    const teamTasks = tasks.filter((task) => task.team === team);
    const average = teamTasks.length === 0
      ? 0
      : Math.round(teamTasks.reduce((sum, task) => sum + task.progress, 0) / teamTasks.length);

    return {
      team,
      taskCount: teamTasks.length,
      average
    };
  });
}

function renderTeamProgress(teamProgress) {
  return teamProgress.map((item) => `
    <div class="team-progress-item">
      <div class="team-progress-head">
        <span class="team-progress-name">${escapeHtml(item.team)}</span>
        <span class="team-progress-meta">${item.taskCount}건 · 평균 ${item.average}%</span>
      </div>
      <div class="team-progress-track" aria-hidden="true">
        <div class="team-progress-bar" style="width: ${item.average}%"></div>
      </div>
    </div>
  `).join("");
}

function renderDelayHighlights(tasks) {
  if (tasks.length === 0) {
    return `<div class="delay-highlight-empty">현재 지연 업무가 없습니다.</div>`;
  }

  return tasks
    .slice(0, 4)
    .map((task) => `
      <article class="delay-highlight-card">
        <p class="delay-highlight-title">${escapeHtml(task.title)}</p>
        <div class="delay-highlight-meta">
          <span>${escapeHtml(getAssigneeName(task))}</span>
          <span>${escapeHtml(task.team)}</span>
          <span>${task.progress}%</span>
        </div>
      </article>
    `).join("");
}

function generateTaskReport(tasks, options = {}) {
  const filteredByPeriod = filterTasksByDateRange(tasks, options);
  const teamOrder = ["UXUI", "영상", "편집"];
  const discoveredTeams = [...new Set(
    filteredByPeriod
      .map((task) => task.team)
      .filter((team) => team && team !== "-")
  )];
  const teams = [...new Set([...teamOrder, ...discoveredTeams])];

  const sections = teams.map((team) => {
    const teamTasks = filteredByPeriod.filter((task) => task.team === team);

    if (teamTasks.length === 0) {
      return `[${team}]\n- 해당 기간 업무 없음`;
    }

    const doneTasks = teamTasks.filter((task) => task.status === "done");
    const progressTasks = teamTasks.filter((task) => task.status === "progress");
    const delayTasks = teamTasks.filter((task) => task.status === "delay");

    const lines = [`[${team}]`];

    if (doneTasks.length > 0) {
      lines.push(...doneTasks.map((task) => `- ${task.title} 완료`));
    }

    if (progressTasks.length > 0) {
      lines.push(...progressTasks.map((task) => `- ${task.title} ${task.progress}% (진행중)`));
    }

    if (delayTasks.length > 0) {
      lines.push(...delayTasks.map((task) => `- 지연: ${task.title}`));
    }

    return lines.join("\n");
  });

  return sections.join("\n\n");
}

function filterTasksByDateRange(tasks, options) {
  const startDate = options.startDate ? new Date(options.startDate) : null;
  const endDate = options.endDate ? new Date(options.endDate) : null;

  return tasks.filter((task) => {
    const taskDate = extractTaskDate(task);

    if (!taskDate || Number.isNaN(taskDate.getTime())) {
      return true;
    }

    const afterStart = !startDate || taskDate >= startDate;
    const beforeEnd = !endDate || taskDate <= endDate;
    return afterStart && beforeEnd;
  });
}

function extractTaskDate(task) {
  const candidate = task.startDate || task.date || task.createdAt || task.updatedAt || "";
  return candidate ? new Date(candidate) : null;
}

function getFilteredTasks(tasks) {
  return tasks.filter((task) => {
    const matchesTeam = !taskFilters.team || task.team === taskFilters.team;
    const matchesAssignee = !taskFilters.assignee || getAssigneeName(task) === taskFilters.assignee;
    const matchesStatus = !taskFilters.status || task.status === taskFilters.status;
    const matchesMine = !taskFilters.onlyMine || (taskFilters.assignee && getAssigneeName(task) === taskFilters.assignee);

    return matchesTeam && matchesAssignee && matchesStatus && matchesMine;
  });
}

function renderTaskRows(tasks, includeActions) {
  if (tasks.length === 0) {
    return `
      <tr>
        <td class="empty-state" colspan="${includeActions ? 6 : 5}">표시할 업무가 없습니다.</td>
      </tr>
    `;
  }

  return tasks.map((task) => `
    <tr>
      <td class="task-title">${escapeHtml(task.title)}</td>
      <td>${escapeHtml(getAssigneeName(task))}</td>
      <td>${escapeHtml(task.team)}</td>
      <td>
        <span class="status-badge status-${task.status}">
          ${stateLabels[task.status]}
        </span>
      </td>
      <td class="progress-cell">
        <div class="progress-row">
          <span class="progress-value">${task.progress}%</span>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-bar progress-${task.status}" style="width: ${task.progress}%"></div>
          </div>
        </div>
      </td>
      ${includeActions ? `
      <td>
        <button type="button" data-task-action="edit" data-task-id="${task.id}" style="margin-right: 8px;">수정</button>
        <button type="button" data-task-action="delete" data-task-id="${task.id}">삭제</button>
      </td>` : ""}
    </tr>
  `).join("");
}

function setMessage(text, type) {
  messageBox.textContent = text;
  messageBox.classList.remove("is-error", "is-success");

  if (type === "error") {
    messageBox.classList.add("is-error");
  }

  if (type === "success") {
    messageBox.classList.add("is-success");
  }
}

taskBody.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.taskAction;
  const id = Number(target.dataset.taskId);

  if (!action || !Number.isFinite(id)) {
    return;
  }

  if (action === "edit") {
    startEditTask(id);
    return;
  }

  if (action === "delete") {
    deleteTask(id);
  }
});

function upsertTask() {
  const title = taskTitleInput.value.trim();
  const assigneeId = normalizeAssigneeId(taskAssigneeInput.value);
  const team = getMemberTeamById(assigneeId);
  const status = normalizeStatus(taskStatusInput.value);
  const progress = clampProgress(taskProgressInput.value);

  if (!title || !assigneeId || !team) {
    setMessage("업무 제목과 담당자를 모두 입력해 주세요.", "error");
    return;
  }

  const editingId = Number(taskEditId.value);

  if (Number.isFinite(editingId) && editingId > 0) {
    currentTasks = currentTasks.map((task) =>
      task.id === editingId
        ? {
            ...task,
            title,
            assigneeId,
            assignee: getMemberNameById(assigneeId),
            team,
            status,
            progress
          }
        : task
    );
    setMessage("업무를 수정했습니다.", "success");
  } else {
    currentTasks = [
      ...currentTasks,
      {
        id: Date.now(),
        title,
        assigneeId,
        assignee: getMemberNameById(assigneeId),
        team,
        status,
        progress
      }
    ];
    setMessage("업무를 추가했습니다.", "success");
  }

  saveTasksToStorage();
  populateTaskAssigneeOptions();
  populateAssigneeFilter(currentTasks);
  syncFilterControls();
  renderDashboard(currentTasks);
  resetTaskForm();
}

function startEditTask(id) {
  const task = currentTasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  taskEditId.value = String(task.id);
  taskTitleInput.value = task.title;
  taskAssigneeInput.value = task.assigneeId ? String(task.assigneeId) : "";
  syncTaskTeamWithAssignee();
  taskStatusInput.value = task.status;
  taskProgressInput.value = String(task.progress);
  taskSubmitButton.textContent = "업무 수정";
  setMessage("수정할 업무 내용을 변경한 뒤 버튼을 눌러 주세요.", "success");
}

function deleteTask(id) {
  currentTasks = currentTasks.filter((task) => task.id !== id);
  saveTasksToStorage();
  populateTaskAssigneeOptions();
  populateAssigneeFilter(currentTasks);
  syncFilterControls();
  renderDashboard(currentTasks);

  if (Number(taskEditId.value) === id) {
    resetTaskForm();
  }

  setMessage("업무를 삭제했습니다.", "success");
}

function resetTaskForm() {
  taskForm.reset();
  taskEditId.value = "";
  taskTeamInput.value = "";
  taskStatusInput.value = "progress";
  taskSubmitButton.textContent = "업무 추가";
}

function populateAssigneeFilter(tasks) {
  const assignees = [...new Set(
    tasks
      .map((task) => getAssigneeName(task))
      .filter((assignee) => assignee && assignee !== "미지정" && assignee !== "-")
  )].sort((left, right) => left.localeCompare(right, "ko"));

  const currentValue = taskFilters.assignee;
  filterAssignee.innerHTML = [
    '<option value="">전체 담당자</option>',
    ...assignees.map((assignee) => `<option value="${escapeHtml(assignee)}">${escapeHtml(assignee)}</option>`)
  ].join("");

  if (assignees.includes(currentValue)) {
    filterAssignee.value = currentValue;
  } else {
    taskFilters.assignee = "";
    filterAssignee.value = "";
    saveMyAssignee("");
  }
}

function populateTaskAssigneeOptions() {
  const selectedValue = taskAssigneeInput.value;
  const options = [
    '<option value="">담당자 선택</option>',
    ...currentMembers.map((member) => (
      `<option value="${member.id}">${escapeHtml(member.name)} · ${escapeHtml(member.position)}</option>`
    ))
  ];

  taskAssigneeInput.innerHTML = options.join("");

  if (selectedValue && currentMembers.some((member) => String(member.id) === selectedValue)) {
    taskAssigneeInput.value = selectedValue;
  }

  syncTaskTeamWithAssignee();
}

function syncFilterControls() {
  filterTeam.value = taskFilters.team;
  filterAssignee.value = taskFilters.assignee;
  filterStatus.value = taskFilters.status;
}

function updateMyTasksButton() {
  toggleMyTasksButton.textContent = `내 업무만 보기: ${taskFilters.onlyMine ? "켬" : "끔"}`;
}

function renderMembers(members) {
  memberPanelCount.textContent = `${members.length}명`;

  if (members.length === 0) {
    memberBody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="4">등록된 팀원이 없습니다.</td>
      </tr>
    `;
    return;
  }

  memberBody.innerHTML = members.map((member) => `
    <tr>
      <td>${escapeHtml(member.name)}</td>
      <td>${escapeHtml(member.position)}</td>
      <td>${escapeHtml(member.team)}</td>
      <td>
        <button type="button" data-action="edit" data-id="${member.id}" style="margin-right: 8px;">수정</button>
        <button type="button" data-action="delete" data-id="${member.id}">삭제</button>
      </td>
    </tr>
  `).join("");
}

memberBody.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  const id = Number(target.dataset.id);

  if (!action || !Number.isFinite(id)) {
    return;
  }

  if (action === "edit") {
    startEditMember(id);
    return;
  }

  if (action === "delete") {
    deleteMember(id);
  }
});

function upsertMember() {
  const name = memberName.value.trim();
  const position = memberPosition.value.trim();
  const team = memberTeam.value;

  if (!name || !position || !team) {
    setMessage("팀원 이름, 직책, 셀을 모두 입력해 주세요.", "error");
    return;
  }

  const editingId = Number(memberEditId.value);

  if (Number.isFinite(editingId) && editingId > 0) {
    currentMembers = currentMembers.map((member) =>
      member.id === editingId
        ? { ...member, name, position, team }
        : member
    );
    setMessage("팀원 정보를 수정했습니다.", "success");
  } else {
    currentMembers = [
      ...currentMembers,
      {
        id: Date.now(),
        name,
        position,
        team
      }
    ];
    setMessage("팀원을 추가했습니다.", "success");
  }

  saveMembersToStorage();
  populateTaskAssigneeOptions();
  refreshTaskAssigneeNames();
  saveTasksToStorage();
  populateAssigneeFilter(currentTasks);
  syncFilterControls();
  renderDashboard(currentTasks);
  renderMembers(currentMembers);
  resetMemberForm();
}

function startEditMember(id) {
  const member = currentMembers.find((item) => item.id === id);

  if (!member) {
    return;
  }

  memberEditId.value = String(member.id);
  memberName.value = member.name;
  memberPosition.value = member.position;
  memberTeam.value = member.team;
  memberSubmitButton.textContent = "팀원 수정";
  setMessage("수정할 팀원 정보를 변경한 뒤 버튼을 눌러 주세요.", "success");
}

function deleteMember(id) {
  const assignedTasks = currentTasks.filter((task) => task.assigneeId === id);
  currentMembers = currentMembers.filter((member) => member.id !== id);
  currentTasks = currentTasks.map((task) =>
    task.assigneeId === id
      ? { ...task, assigneeId: null, assignee: "미지정" }
      : task
  );

  saveMembersToStorage();
  saveTasksToStorage();
  populateTaskAssigneeOptions();
  populateAssigneeFilter(currentTasks);
  syncFilterControls();
  renderDashboard(currentTasks);
  renderMembers(currentMembers);

  if (Number(memberEditId.value) === id) {
    resetMemberForm();
  }

  if (assignedTasks.length > 0) {
    setMessage(`팀원을 삭제했습니다. 담당 업무 ${assignedTasks.length}건은 미지정으로 변경했습니다.`, "success");
    return;
  }

  setMessage("팀원을 삭제했습니다.", "success");
}

function resetMemberForm() {
  memberForm.reset();
  memberEditId.value = "";
  memberSubmitButton.textContent = "팀원 추가";
}

function loadMembersFromStorage() {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeMembers({ members: parsed }) : [];
  } catch (error) {
    console.warn("Failed to read members from storage.", error);
    return [];
  }
}

function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeTasks(parsed) : [];
  } catch (error) {
    console.warn("Failed to read tasks from storage.", error);
    return [];
  }
}

function loadMyAssignee() {
  return localStorage.getItem(MY_ASSIGNEE_STORAGE_KEY) || "";
}

function saveMyAssignee(value) {
  if (value) {
    localStorage.setItem(MY_ASSIGNEE_STORAGE_KEY, value);
    return;
  }

  localStorage.removeItem(MY_ASSIGNEE_STORAGE_KEY);
}

function saveTasksToStorage() {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(currentTasks));
}

function saveMembersToStorage() {
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(currentMembers));
}

function getMemberNameById(id) {
  if (!id) {
    return "미지정";
  }

  const member = currentMembers.find((item) => item.id === id);
  return member ? member.name : "미지정";
}

function getMemberTeamById(id) {
  if (!id) {
    return "";
  }

  const member = currentMembers.find((item) => item.id === id);
  return member ? member.team : "";
}

function getAssigneeName(task) {
  if (task.assigneeId) {
    return getMemberNameById(task.assigneeId);
  }

  return task.assignee || "미지정";
}

function refreshTaskAssigneeNames() {
  currentTasks = currentTasks.map((task) => ({
    ...task,
    assignee: getAssigneeName(task),
    team: task.assigneeId ? getMemberTeamById(task.assigneeId) || task.team : task.team
  }));
}

function syncTaskTeamWithAssignee() {
  const assigneeId = normalizeAssigneeId(taskAssigneeInput.value);
  taskTeamInput.value = getMemberTeamById(assigneeId);
}

function setupScrollReveal() {
  const targets = document.querySelectorAll(".reveal-on-scroll");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.15
  });

  targets.forEach((element) => observer.observe(element));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* Chrome Built-in AI (Summarizer API) 요약 기능 */
let aiSummarizer = null;

async function updateAiSummaries(tasks) {
  if (!aiSummarySection || !aiSummaryContent) return;

  // 1. 셀별(team) 데이터 그룹화
  const cellGroups = {};
  tasks.forEach(task => {
    // 셀 정보 정제 (공백 제거, 대소문자 통일 등)
    let cell = String(task.team || "미지정").trim();
    if (cell === "-" || cell === "") cell = "미지정";
    
    if (!cellGroups[cell]) cellGroups[cell] = [];
    // 중복 업무명 방지 및 유효한 텍스트만 추가
    if (task.title && task.title !== "제목 없음" && !cellGroups[cell].includes(task.title)) {
      cellGroups[cell].push(task.title);
    }
  });

  // 요약할 유효한 셀 목록 추출 (미지정 제외하고 업무가 있는 것만)
  const cells = Object.keys(cellGroups).filter(c => c !== "미지정" && cellGroups[c].length > 0);
  
  if (cells.length === 0) {
    aiSummarySection.style.display = "none";
    return;
  }

  aiSummarySection.style.display = "block";
  aiSummaryContent.innerHTML = '<div class="ai-loading">AI가 셀별 업무 내용을 분석하여 요약 중입니다...</div>';

  try {
    // 2. AI Summarizer 지원 여부 확인
    const canSummarize = await window.ai?.summarizer?.capabilities();
    if (!canSummarize || canSummarize.available === 'no') {
      aiSummaryContent.innerHTML = `
        <div class="ai-error">
          Chrome Built-in AI (Summarizer API)를 사용할 수 없는 브라우저 환경입니다.<br>
          설정(chrome://flags/#optimization-guide-on-device-model) 및 관련 구성 요소를 확인해 주세요.
        </div>
      `;
      return;
    }

    // 3. 셀별 요약 수행
    const summaryCards = [];
    // 상위 5개 셀만 요약 (너무 많으면 API 호출이 많아질 수 있음)
    const topCells = cells.slice(0, 5);
    
    for (const cell of topCells) {
      const titles = cellGroups[cell];
      // 요약 대상 업무를 최대 10개로 제한
      const sampleTitles = titles.slice(0, 10);

      const inputText = `다음은 "${cell}" 셀의 최근 업무 리스트입니다. 핵심 내용을 한국어로 간결하게 한 문장으로 요약해 주세요:\n- ${sampleTitles.join('\n- ')}`;
      const summaryText = await getSummaryForCell(inputText);

      summaryCards.push(`
        <article class="ai-summary-card">
          <h3>${escapeHtml(cell)}</h3>
          <div class="ai-summary-text">${escapeHtml(summaryText)}</div>
        </article>
      `);
    }

    aiSummaryContent.innerHTML = summaryCards.join("");

  } catch (err) {
    console.error("AI 요약 실패:", err);
    aiSummaryContent.innerHTML = `<div class="ai-error">AI 요약 중 오류가 발생했습니다: ${err.message}</div>`;
  }
}

async function getSummaryForCell(text) {
  try {
    if (!aiSummarizer) {
      aiSummarizer = await window.ai.summarizer.create({
        type: 'tl;dr',
        format: 'plain-text',
        length: 'short',
      });
    }
    return await aiSummarizer.summarize(text);
  } catch (error) {
    console.error("Summarizer Error:", error);
    return "요약에 실패했습니다.";
  }
}

