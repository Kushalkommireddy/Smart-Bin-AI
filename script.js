// ==========================================
// 1. DOM ELEMENTS SELECTION
// ==========================================

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const newScanBtn = document.getElementById('newScanBtn');
const historyList = document.getElementById('historyList');

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

// ==========================================
// 2. STATE VARIABLES & INITIALIZATION
// ==========================================

let currentFile = null;
let currentSearchTerm = "";
let mediaStream = null;

// Load Gamification & History from Local Storage
let ecoPoints = parseInt(localStorage.getItem('ecoPoints')) || 0;
// We now store FULL result objects in this array
let scanHistory = JSON.parse(localStorage.getItem('fullScanHistory')) || []; 

scoreTracker.textContent = ecoPoints;
renderHistory();

// ==========================================
// 3. UTILITY FUNCTIONS
// ==========================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✅'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function resetUI() {
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

// ==========================================
// 4. APP FEATURES (Sidebar, Dark Mode, Camera)
// ==========================================

sidebarToggle.addEventListener('click', () => { sidebar.classList.toggle('collapsed'); });
newScanBtn.addEventListener('click', () => { resetUI(); showToast("Ready for a new scan!", "success"); });

function addToHistory(record) {
  // Keep max 8 items so LocalStorage doesn't crash from too many saved Base64 images
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
    
    // Display name: either the text they typed, or "Image Scan"
    const displayName = record.isImage ? "Visual Scan" : record.term;
    
    li.innerHTML = `<span class="history-icon">${record.icon}</span> <span class="history-text sidebar-text">${displayName}</span>`;
    
    // THE MAGIC: Clicking history now renders the EXACT saved record
    li.addEventListener('click', () => {
      renderResultUI(record);
      if(window.innerWidth <= 950) sidebar.classList.add('collapsed'); // Auto-close on mobile
    });

    historyList.appendChild(li);
  });
}

// Clear History Logic
clearHistoryBtn.addEventListener('click', () => {
  if (scanHistory.length === 0) {
    showToast("Your history is already empty.", "error");
    return;
  }
  
  // Ask for confirmation before deleting
  if (confirm("Are you sure you want to clear your entire scan history?")) {
    scanHistory = []; // Empty the array
    localStorage.removeItem('fullScanHistory'); // Remove from browser memory
    renderHistory(); // Update the sidebar UI
    resetUI(); // Clear the main screen
    showToast("History cleared successfully.", "success");
  }
});

// Dark Mode
if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); themeToggle.textContent = '☀️'; }
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// Camera
startCameraBtn.addEventListener('click', async () => {
  try { mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); cameraFeed.srcObject = mediaStream; cameraContainer.classList.remove('hidden'); dropZone.classList.add('hidden'); } catch (err) { showToast("Camera access denied.", "error"); }
});
closeCameraBtn.addEventListener('click', stopCamera);
function stopCamera() { if (mediaStream) mediaStream.getTracks().forEach(track => track.stop()); cameraContainer.classList.add('hidden'); dropZone.classList.remove('hidden'); }
captureBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas'); canvas.width = cameraFeed.videoWidth; canvas.height = cameraFeed.videoHeight; canvas.getContext('2d').drawImage(cameraFeed, 0, 0);
  canvas.toBlob((blob) => {
    const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
    processFile(file); stopCamera(); showToast("Photo captured!");
  }, 'image/jpeg');
});

// ==========================================
// 5. INPUT HANDLING
// ==========================================

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

// ==========================================
// 6. AI ANALYSIS & HISTORY RENDERING
// ==========================================

const mockResults = [
  { category: 'Recyclable Plastic', icon: '♻️', color: '#059669', instructions: ['Empty out any remaining liquids or food.', 'Rinse the item lightly.', 'Place loose in the blue bin.'], impact: 'Saves enough energy to power a 60W lightbulb for 6 hours.' },
  { category: 'Clean Cardboard', icon: '📦', color: '#059669', instructions: ['Remove all packaging tape.', 'Break down and flatten the box.', 'Place in paper recycling.'], impact: 'Saves 46 gallons of oil per ton.' },
  { category: 'Organic Compost', icon: '🌱', color: '#65a30d', instructions: ['Remove plastic stickers.', 'Toss directly into green organic bin.', 'Do not use plastic bags.'], impact: 'Reduces methane emissions from landfills.' },
  { category: 'Electronic Waste', icon: '🔌', color: '#dc2626', instructions: ['Do NOT throw in regular trash.', 'Wipe personal data.', 'Take to a certified e-waste facility.'], impact: 'Prevents toxic heavy metals from poisoning groundwater.' },
  { category: 'Hazardous Battery', icon: '🔋', color: '#dc2626', instructions: ['Tape the positive and negative ends.', 'Do not mix with regular trash.', 'Drop off at a battery station.'], impact: 'Prevents dangerous chemical fires in garbage trucks.' },
  { category: 'General Landfill', icon: '🗑️', color: '#4b5563', instructions: ['Place securely in standard black/grey bin.', 'Ensure lid closes completely.', 'Consider reusable alternatives next time.'], impact: 'Landfill items take decades to break down.' }
];

analyzeBtn.addEventListener('click', () => {
  const textVal = wasteInput.value.trim();
  if (!currentFile && !textVal) return showToast("Please provide an image or text.", "error");

  emptyState.classList.add('hidden');
  resultsState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  if(textVal) currentSearchTerm = textVal;

  setTimeout(() => createNewAnalysisRecord(currentSearchTerm, currentFile), 1800); 
});

// STEP 1: Create and save the data snapshot
function createNewAnalysisRecord(term, file) {
  const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
  const randomConfidence = Math.floor(Math.random() * (98 - 75 + 1) + 75);

  const record = {
    id: Date.now(),
    term: term,
    isImage: !!file,
    imageData: null, // Will hold base64 string if it's an image
    category: randomResult.category,
    icon: randomResult.icon,
    color: randomResult.color,
    instructions: randomResult.instructions,
    impact: randomResult.impact,
    confidence: randomConfidence
  };

  // If there's an image, convert it to Base64 to save it, then render
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      record.imageData = e.target.result;
      finishAnalysis(record);
    };
    reader.readAsDataURL(file);
  } else {
    finishAnalysis(record); // Text only
  }
}

function finishAnalysis(record) {
  addToHistory(record);
  renderResultUI(record);
  updateScore(10, "+10 Points for scanning!");
}

// STEP 2: Paint the saved data onto the screen
function renderResultUI(record) {
  emptyState.classList.add('hidden');
  loadingState.classList.add('hidden');
  resultsState.classList.remove('hidden');

  // Load Preview (Image or Text)
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

  // Load Data
  resultCategory.textContent = record.category;
  resultCategory.style.color = record.color;
  catIcon.textContent = record.icon;
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

// ==========================================
// 7. POST-ANALYSIS ACTIONS
// ==========================================

disposedBtn.addEventListener('click', () => { updateScore(5, "Item disposed properly! +5 Bonus Points 🌍"); resetUI(); });
shareBtn.addEventListener('click', () => {
  const text = `I just classified waste as ${resultCategory.textContent} using SmartBin AI! 🌍♻️`;
  if (navigator.share) navigator.share({ title: 'SmartBin AI Result', text: text });
  else { navigator.clipboard.writeText(text); showToast("Result copied to clipboard!", "success"); }
});