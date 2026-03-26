const sidebarToggleBtns = document.querySelectorAll('.sidebar-toggle-btn');
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobileOverlay');
const newScanBtn = document.getElementById('newScanBtn');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const guideToggleBtns = document.querySelectorAll('.guide-toggle-btn'); // Selects both mobile and desktop buttons

const dashboardView = document.getElementById('dashboardView');
const guideView = document.getElementById('guideView');
const guideGrid = document.getElementById('guideGrid');

const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const fileNameEl = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFileBtn');
const wasteInput = document.getElementById('wasteInput');
const suggestionsList = document.getElementById('suggestionsList');
const analyzeBtn = document.getElementById('analyzeBtn');

const themeToggle = document.getElementById('themeToggle');
const scoreTracker = document.getElementById('scoreTracker');
const shareBtn = document.getElementById('shareBtn');
const startCameraBtn = document.getElementById('startCameraBtn');
const cameraContainer = document.getElementById('cameraContainer');
const cameraFeed = document.getElementById('cameraFeed');
const captureBtn = document.getElementById('captureBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const disposedBtn = document.getElementById('disposedBtn');

const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const resultsState = document.getElementById('resultsState');

const previewImage = document.getElementById('previewImage');
const textPreviewContainer = document.getElementById('textPreviewContainer');
const previewTextDisplay = document.getElementById('previewTextDisplay');
const previewBadge = document.getElementById('previewBadge');
const resultCategory = document.getElementById('resultCategory');
const catIcon = document.getElementById('catIcon');
const confidenceText = document.getElementById('confidenceText');
const confidenceFill = document.getElementById('confidenceFill');
const resultInstruction = document.getElementById('resultInstruction');
const resultImpact = document.getElementById('resultImpact');
const categoryHeader = document.querySelector('.category-header');

let currentFile = null;
let currentSearchTerm = "";
let mediaStream = null;

let ecoPoints = parseInt(localStorage.getItem('ecoPoints')) || 0;
let scanHistory = JSON.parse(localStorage.getItem('fullScanHistory')) || []; 

scoreTracker.textContent = ecoPoints;

// Centralized SVG Database (No Emojis)
const SVGS = {
  success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  moon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  recycle: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path></svg>`,
  package: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  plant: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2v1c0 5.6-4.5 10.1-10.1 10.1V15"></path></svg>`,
  plug: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
  battery: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="16" height="12" rx="2" ry="2"></rect><line x1="2" y1="10" x2="2" y2="14"></line><line x1="10" y1="6" x2="10" y2="18"></line></svg>`,
  trash: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
};

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'error' ? SVGS.error : SVGS.success}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('fadeOut'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Navigation Logic
function showDashboard() {
  guideView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
}

function showGuide() {
  dashboardView.classList.add('hidden');
  guideView.classList.remove('hidden');
}

guideToggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    showGuide();
    if(window.innerWidth <= 950) sidebar.classList.add('collapsed');
  });
});

function resetUI() {
  showDashboard();
  resultsState.classList.add('hidden');
  loadingState.classList.add('hidden');
  emptyState.classList.remove('hidden');
  if (currentFile) removeFileBtn.click();
  wasteInput.value = '';
  suggestionsList.classList.remove('show');
  currentSearchTerm = "";
}

function updateScore(points, message) {
  ecoPoints += points;
  localStorage.setItem('ecoPoints', ecoPoints);
  scoreTracker.textContent = ecoPoints;
  showToast(message, "success");
}

sidebarToggleBtns.forEach(btn => {
  btn.addEventListener('click', () => { 
    sidebar.classList.toggle('collapsed'); 
  });
});
mobileOverlay.addEventListener('click', () => { sidebar.classList.add('collapsed'); });
if (window.innerWidth <= 950) { sidebar.classList.add('collapsed'); }

newScanBtn.addEventListener('click', () => { resetUI(); showToast("Ready for a new scan!", "success"); });

function addToHistory(record) {
  if (scanHistory.length >= 8) scanHistory.pop(); 
  scanHistory.unshift(record);
  localStorage.setItem('fullScanHistory', JSON.stringify(scanHistory));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  scanHistory.forEach(record => {
    const li = document.createElement('li');
    li.className = 'history-item';
    const displayName = record.isImage ? "Visual Scan" : record.term;
    li.innerHTML = `<span class="history-icon">${record.icon}</span> <span class="history-text sidebar-text">${displayName}</span>`;
    li.addEventListener('click', () => {
      showDashboard();
      renderResultUI(record);
      if(window.innerWidth <= 950) sidebar.classList.add('collapsed');
    });
    historyList.appendChild(li);
  });
}

clearHistoryBtn.addEventListener('click', () => {
  if (scanHistory.length === 0) return showToast("Your history is already empty.", "error");
  if (confirm("Are you sure you want to clear your entire scan history?")) {
    scanHistory = [];
    localStorage.removeItem('fullScanHistory');
    renderHistory();
    resetUI();
    showToast("History cleared successfully.", "success");
  }
});

if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); themeToggle.innerHTML = SVGS.sun; }
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.innerHTML = isDark ? SVGS.sun : SVGS.moon;
});

startCameraBtn.addEventListener('click', async () => {
  try { mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); cameraFeed.srcObject = mediaStream; cameraContainer.classList.remove('hidden'); dropZone.classList.add('hidden'); } catch (err) { showToast("Camera access denied.", "error"); }
});
closeCameraBtn.addEventListener('click', stopCamera);
function stopCamera() { if (mediaStream) mediaStream.getTracks().forEach(track => track.stop()); cameraContainer.classList.add('hidden'); dropZone.classList.remove('hidden'); }
captureBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas'); canvas.width = cameraFeed.videoWidth; canvas.height = cameraFeed.videoHeight; canvas.getContext('2d').drawImage(cameraFeed, 0, 0);
  canvas.toBlob((blob) => { const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" }); processFile(file); stopCamera(); showToast("Photo captured!"); }, 'image/jpeg');
});

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragover'); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) processFile(file); });
imageInput.addEventListener('change', () => { if (imageInput.files[0]) processFile(imageInput.files[0]); });

function processFile(file) { currentFile = file; currentSearchTerm = "Visual Scan"; fileNameEl.textContent = file.name; removeFileBtn.classList.remove('hidden'); wasteInput.value = ''; }
removeFileBtn.addEventListener('click', () => { currentFile = null; imageInput.value = ''; fileNameEl.textContent = 'Drag & drop a photo'; removeFileBtn.classList.add('hidden'); });

const wasteDictionary = ["Plastic Water Bottle", "Banana Peel", "AA Batteries", "Cardboard Box", "Glass Jar", "Soda Can", "Coffee Grounds", "Old Smartphone", "Newspaper", "Pizza Box", "Lightbulb"];
wasteInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase(); suggestionsList.innerHTML = '';
  if (query) {
    if (currentFile) removeFileBtn.click();
    currentSearchTerm = e.target.value;
    const matches = wasteDictionary.filter(item => item.toLowerCase().includes(query));
    if (matches.length > 0) {
      matches.forEach(match => { const li = document.createElement('li'); li.textContent = match; li.onclick = () => { wasteInput.value = match; currentSearchTerm = match; suggestionsList.classList.remove('show'); }; suggestionsList.appendChild(li); });
      suggestionsList.classList.add('show');
    } else suggestionsList.classList.remove('show');
  } else suggestionsList.classList.remove('show');
});
document.addEventListener('click', (e) => { if (e.target !== wasteInput) suggestionsList.classList.remove('show'); });

const mockResults = [
  { category: 'Recyclable Plastic', icon: SVGS.recycle, color: '#059669', instructions: ['Empty out any remaining liquids or food.', 'Rinse the item lightly.', 'Place loose in the blue bin.'], impact: 'Saves enough energy to power a 60W lightbulb for 6 hours.' },
  { category: 'Clean Cardboard', icon: SVGS.package, color: '#059669', instructions: ['Remove all packaging tape.', 'Break down and flatten the box.', 'Place in paper recycling.'], impact: 'Saves 46 gallons of oil per ton.' },
  { category: 'Organic Compost', icon: SVGS.plant, color: '#65a30d', instructions: ['Remove plastic stickers.', 'Toss directly into green organic bin.', 'Do not use plastic bags.'], impact: 'Reduces methane emissions from landfills.' },
  { category: 'Electronic Waste', icon: SVGS.plug, color: '#dc2626', instructions: ['Do NOT throw in regular trash.', 'Wipe personal data.', 'Take to a certified e-waste facility.'], impact: 'Prevents toxic heavy metals from poisoning groundwater.' },
  { category: 'Hazardous Battery', icon: SVGS.battery, color: '#dc2626', instructions: ['Tape the positive and negative ends.', 'Do not mix with regular trash.', 'Drop off at a battery station.'], impact: 'Prevents dangerous chemical fires in garbage trucks.' },
  { category: 'General Landfill', icon: SVGS.trash, color: '#4b5563', instructions: ['Place securely in standard black/grey bin.', 'Ensure lid closes completely.', 'Consider reusable alternatives next time.'], impact: 'Landfill items take decades to break down.' }
];

// Populate the Waste Guide View dynamically
function populateWasteGuide() {
  const guideData = [
    { title: "Recyclable Plastics", icon: SVGS.recycle, color: "#059669", examples: "Water bottles, milk jugs, clean food containers", desc: "Plastics must be clean and free of food residue. Do not bag your recyclables." },
    { title: "Paper & Cardboard", icon: SVGS.package, color: "#059669", examples: "Newspapers, flattened boxes, mail", desc: "Keep dry. Pizza boxes heavily soiled with grease belong in the compost or trash, not recycling." },
    { title: "Organic / Compost", icon: SVGS.plant, color: "#65a30d", examples: "Food scraps, coffee grounds, yard trimmings", desc: "Turns into nutrient-rich soil. Avoid adding meat, dairy, or oils unless your local facility accepts them." },
    { title: "Electronic Waste", icon: SVGS.plug, color: "#dc2626", examples: "Smartphones, laptops, old cables, TVs", desc: "Contains toxic metals like lead and mercury. Must be taken to a certified e-waste drop-off." },
    { title: "Hazardous Materials", icon: SVGS.battery, color: "#dc2626", examples: "Batteries, paint, chemical cleaners, motor oil", desc: "Highly dangerous if crushed or mixed in landfills. Requires special drop-off events or facilities." },
    { title: "General Landfill", icon: SVGS.trash, color: "#4b5563", examples: "Styrofoam, broken ceramics, chip bags", desc: "Items that cannot be recycled or composted. Aim to minimize these by choosing reusable alternatives." }
  ];

  guideData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'guide-card';
    card.innerHTML = `
      <div class="guide-card-top">
        <div class="guide-card-icon">${item.icon}</div>
        <div class="guide-card-title">${item.title}</div>
      </div>
      <div class="guide-card-examples"><span>Examples</span>${item.examples}</div>
      <div class="guide-card-desc">${item.desc}</div>
    `;
    guideGrid.appendChild(card);
  });
}

analyzeBtn.addEventListener('click', () => {
  const textVal = wasteInput.value.trim();
  if (!currentFile && !textVal) return showToast("Please provide an image or text.", "error");

  emptyState.classList.add('hidden');
  resultsState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  if(textVal) currentSearchTerm = textVal;

  setTimeout(() => createNewAnalysisRecord(currentSearchTerm, currentFile), 1800); 
});

function createNewAnalysisRecord(term, file) {
  const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
  const randomConfidence = Math.floor(Math.random() * (98 - 75 + 1) + 75);

  const record = { id: Date.now(), term: term, isImage: !!file, imageData: null, category: randomResult.category, icon: randomResult.icon, color: randomResult.color, instructions: randomResult.instructions, impact: randomResult.impact, confidence: randomConfidence };

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => { record.imageData = e.target.result; finishAnalysis(record); };
    reader.readAsDataURL(file);
  } else { finishAnalysis(record); }
}

function finishAnalysis(record) {
  addToHistory(record);
  renderResultUI(record);
  updateScore(10, "Analyzed! +10 Points");
}

function renderResultUI(record) {
  emptyState.classList.add('hidden');
  loadingState.classList.add('hidden');
  resultsState.classList.remove('hidden');

  if (record.isImage && record.imageData) {
    previewImage.src = record.imageData;
    previewImage.classList.remove('hidden');
    textPreviewContainer.classList.add('hidden');
    previewBadge.textContent = 'Image Scan';
  } else {
    previewImage.classList.add('hidden');
    textPreviewContainer.classList.remove('hidden');
    previewTextDisplay.textContent = record.term; 
    previewBadge.textContent = 'NLP Analysis';
  }

  resultCategory.textContent = record.category;
  resultCategory.style.color = record.color;
  catIcon.innerHTML = record.icon;
  categoryHeader.style.borderColor = record.color;

  confidenceText.textContent = `${record.confidence}%`;
  confidenceFill.style.width = `0%`; 
  setTimeout(() => {
    confidenceFill.style.width = `${record.confidence}%`;
    confidenceFill.style.background = `linear-gradient(90deg, ${record.color}, #a7f3d0)`;
  }, 50);

  resultInstruction.innerHTML = '';
  record.instructions.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    resultInstruction.appendChild(li);
  });

  resultImpact.textContent = record.impact;
}

disposedBtn.addEventListener('click', () => { updateScore(5, "Disposed! +5 Points"); resetUI(); });
shareBtn.addEventListener('click', () => {
  const text = `I classified waste as ${resultCategory.textContent} using SmartBin AI!`;
  if (navigator.share) navigator.share({ title: 'SmartBin AI Result', text: text });
  else { navigator.clipboard.writeText(text); showToast("Copied to clipboard!", "success"); }
});

// Initialization Calls
renderHistory();
populateWasteGuide();
