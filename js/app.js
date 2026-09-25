/**
 * School Bell Main Application Controller
 */
class SchoolBellApp {
  constructor() {
    this.audio = window.bellAudio;
    this.storage = window.bellStorage;
    this.scheduler = window.bellScheduler;

    const today = new Date().getDay();
    this.selectedDay = today; // default to today's day
    this.config = this.storage.loadConfig();
    this.schedules = this.storage.loadSchedules();

    this.initDOM();
    this.bindEvents();
    this.applyConfig();
    this.renderDayTabs();
    this.renderScheduleTable();
    this.renderLogs();

    // Jalankan scheduler
    this.scheduler.start();
  }

  initDOM() {
    // Clock & Display
    this.liveClockDisplay = document.getElementById('liveClockDisplay');
    this.currentDayAndDate = document.getElementById('currentDayAndDate');
    this.activeDayPill = document.getElementById('activeDayPill');
    this.nextBellTimeBadge = document.getElementById('nextBellTimeBadge');
    this.nextBellLabel = document.getElementById('nextBellLabel');
    this.nextBellAnnouncement = document.getElementById('nextBellAnnouncement');
    this.nextBellCountdown = document.getElementById('nextBellCountdown');
    this.btnRingNextNow = document.getElementById('btnRingNextNow');

    // Header & Config
    this.headerSchoolName = document.getElementById('headerSchoolName');
    this.headerSchoolSubtitle = document.getElementById('headerSchoolSubtitle');
    this.marqueeTextDisplay = document.getElementById('marqueeTextDisplay');
    this.toggleAutoBell = document.getElementById('toggleAutoBell');
    this.autoBellStatusText = document.getElementById('autoBellStatusText');
    this.audioUnlockBanner = document.getElementById('audioUnlockBanner');
    this.btnUnlockAudio = document.getElementById('btnUnlockAudio');
    this.bellHeaderIcon = document.getElementById('bellHeaderIcon');

    // Table & Days
    this.dayTabsContainer = document.getElementById('dayTabsContainer');
    this.scheduleTableContainer = document.getElementById('scheduleTableContainer');
    this.scheduleTableBody = document.getElementById('scheduleTableBody');
    this.scheduleEmptyState = document.getElementById('scheduleEmptyState');
    this.presetSelect = document.getElementById('presetSelect');

    // Modals
    this.scheduleModal = document.getElementById('scheduleModal');
    this.scheduleForm = document.getElementById('scheduleForm');
    this.modalTitle = document.getElementById('modalTitle');
    this.formScheduleId = document.getElementById('formScheduleId');
    this.formDayIndex = document.getElementById('formDayIndex');
    this.formTime = document.getElementById('formTime');
    this.formType = document.getElementById('formType');
    this.formLabel = document.getElementById('formLabel');
    this.formTone = document.getElementById('formTone');
    this.formAnnouncement = document.getElementById('formAnnouncement');
    this.formEnabled = document.getElementById('formEnabled');
    this.btnTestTone = document.getElementById('btnTestTone');

    // Settings Modal
    this.settingsModal = document.getElementById('settingsModal');
    this.settingSchoolName = document.getElementById('settingSchoolName');
    this.settingSchoolSubtitle = document.getElementById('settingSchoolSubtitle');
    this.settingRunningText = document.getElementById('settingRunningText');
    this.settingVolume = document.getElementById('settingVolume');
    this.volumePercentDisplay = document.getElementById('volumePercentDisplay');
    this.settingTtsEnabled = document.getElementById('settingTtsEnabled');

    // Backup Modal
    this.backupModal = document.getElementById('backupModal');
    this.importJsonFileInput = document.getElementById('importJsonFileInput');

    // Copy Modal
    this.copyModal = document.getElementById('copyModal');
    this.copySourceDayLabel = document.getElementById('copySourceDayLabel');
    this.copyTargetDaysCheckboxes = document.getElementById('copyTargetDaysCheckboxes');

    // Logs & Toast
    this.logContainer = document.getElementById('logContainer');
    this.logCountBadge = document.getElementById('logCountBadge');
    this.btnClearLogs = document.getElementById('btnClearLogs');
    this.bellToastModal = document.getElementById('bellToastModal');
    this.toastSourceTag = document.getElementById('toastSourceTag');
    this.toastBellTitle = document.getElementById('toastBellTitle');
    this.toastBellAnnouncement = document.getElementById('toastBellAnnouncement');

    // Quick Manual speech
    this.manualCustomTtsText = document.getElementById('manualCustomTtsText');
    this.btnManualSpeech = document.getElementById('btnManualSpeech');
  }

  bindEvents() {
    // Unlock Audio Context on button click or page interaction
    const unlockAudioFn = () => {
      this.audio.initAudioContext();
      if (this.audioUnlockBanner) {
        this.audioUnlockBanner.classList.add('hidden');
      }
    };
    if (this.btnUnlockAudio) this.btnUnlockAudio.addEventListener('click', unlockAudioFn);
    document.addEventListener('click', () => {
      if (!this.audio.isAudioUnlocked) unlockAudioFn();
    }, { once: true });

    // Auto Bell toggle
    this.toggleAutoBell.addEventListener('change', (e) => {
      this.config.autoBellActive = e.target.checked;
      this.storage.saveConfig(this.config);
      this.updateAutoBellStatusUI();
    });

    // Scheduler tick callback
    this.scheduler.onTick((timeData) => {
      this.renderClock(timeData);
    });

    // Scheduler ring callback
    this.scheduler.onBellRing((bellItem, source) => {
      this.showToast(bellItem, source);
      this.renderLogs();
      this.triggerBellVisualAnimation();
    });

    // Ring next now button
    this.btnRingNextNow.addEventListener('click', () => {
      const now = new Date();
      const currentDay = now.getDay();
      const todayList = (this.schedules[currentDay] || []).filter(item => item.enabled);
      const nextInfo = this.scheduler.calculateNextBell(now, todayList, this.schedules);
      if (nextInfo && nextInfo.bell) {
        this.scheduler.triggerBell(nextInfo.bell, 'Manual Cepat');
      } else {
        alert('Tidak ada jadwal bel yang dapat dibunyikan.');
      }
    });

    // Day tabs
    this.dayTabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.day-tab');
      if (tab) {
        const day = parseInt(tab.dataset.day, 10);
        this.selectedDay = day;
        this.renderDayTabs();
        this.renderScheduleTable();
      }
    });

    // Add modal button
    document.getElementById('btnOpenAddModal').addEventListener('click', () => {
      this.openAddModal();
    });

    document.getElementById('btnCloseModal').addEventListener('click', () => this.closeScheduleModal());
    document.getElementById('btnCancelModal').addEventListener('click', () => this.closeScheduleModal());

    // Schedule form submit
    this.scheduleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveScheduleFromForm();
    });

    // Test tone button in modal
    this.btnTestTone.addEventListener('click', () => {
      const tone = this.formTone.value;
      const announcement = this.formAnnouncement.value;
      this.audio.ring({ toneType: tone, announcement: announcement });
    });

    // Settings Modal triggers
    document.getElementById('btnOpenSettings').addEventListener('click', () => this.openSettingsModal());
    document.getElementById('btnEditSchoolName').addEventListener('click', () => this.openSettingsModal());
    document.getElementById('btnEditMarquee').addEventListener('click', () => this.openSettingsModal());
    this.settingVolume.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.volumePercentDisplay.textContent = `${Math.round(val * 100)}%`;
      this.audio.setVolume(val);
    });

    // Backup Modal triggers
    document.getElementById('btnOpenBackup').addEventListener('click', () => this.openBackupModal());
    this.importJsonFileInput.addEventListener('change', (e) => this.handleImportFile(e));

    // Copy schedule triggers
    document.getElementById('btnCopyDaySchedule').addEventListener('click', () => this.openCopyModal());

    // Presets
    this.presetSelect.addEventListener('change', (e) => {
      this.applyPreset(e.target.value);
    });

    // Fullscreen toggle
    document.getElementById('btnFullscreen').addEventListener('click', () => this.toggleFullscreen());

    // Clear logs
    this.btnClearLogs.addEventListener('click', () => {
      if (confirm('Yakin ingin menghapus semua catatan riwayat bel hari ini?')) {
        this.storage.clearLogs();
        this.renderLogs();
      }
    });

    // Manual custom TTS speech
    this.btnManualSpeech.addEventListener('click', () => {
      const text = this.manualCustomTtsText.value.trim();
      if (!text) {
        alert('Silakan ketik kalimat pengumuman terlebih dahulu.');
        return;
      }
      this.audio.ring({ toneType: 'dingdong', announcement: text });
      this.storage.addLog({
        label: 'Pengumuman Manual',
        time: new Date().toTimeString().slice(0, 5),
        type: 'khusus',
        tone: 'dingdong',
        source: 'Manual Suara',
        announcement: text
      });
      this.renderLogs();
      this.manualCustomTtsText.value = '';
    });
  }

  applyConfig() {
    this.headerSchoolName.childNodes[0].textContent = this.config.schoolName + ' ';
    this.headerSchoolSubtitle.textContent = this.config.schoolSubtitle;
    this.marqueeTextDisplay.textContent = this.config.runningText;
    this.toggleAutoBell.checked = this.config.autoBellActive;
    this.audio.setVolume(this.config.volume);
    this.audio.ttsEnabled = this.config.ttsEnabled;
    this.updateAutoBellStatusUI();
  }

  updateAutoBellStatusUI() {
    if (this.config.autoBellActive) {
      this.autoBellStatusText.textContent = 'Otomatis Aktif';
      this.autoBellStatusText.className = 'font-bold text-emerald-400 leading-none';
    } else {
      this.autoBellStatusText.textContent = 'Nonaktif (Manual)';
      this.autoBellStatusText.className = 'font-bold text-amber-400 leading-none';
    }
  }

  renderClock(timeData) {
    this.liveClockDisplay.textContent = timeData.timeString;
    this.currentDayAndDate.textContent = `${timeData.dayName}, ${timeData.dateFormatted}`;
    this.activeDayPill.textContent = this.getDayName(this.selectedDay);

    // Update Next Bell
    if (timeData.nextBell && timeData.nextBell.bell) {
      const bell = timeData.nextBell.bell;
      this.nextBellTimeBadge.textContent = bell.time;
      this.nextBellLabel.textContent = bell.label;
      this.nextBellAnnouncement.textContent = bell.announcement || 'Nada Bel: ' + this.getToneName(bell.tone);
      this.nextBellCountdown.textContent = timeData.nextBell.countdownStr;
      
      if (!timeData.nextBell.isToday) {
        this.nextBellTimeBadge.textContent = `${timeData.nextBell.dayName} ${bell.time}`;
      }
    } else {
      this.nextBellTimeBadge.textContent = '--:--';
      this.nextBellLabel.textContent = 'Tidak Ada Bel Tersisa';
      this.nextBellAnnouncement.textContent = 'Semua jadwal bel hari ini telah selesai atau belum diatur.';
      this.nextBellCountdown.textContent = '--:--:--';
    }
  }

  renderDayTabs() {
    const todayIndex = new Date().getDay();
    const tabs = this.dayTabsContainer.querySelectorAll('.day-tab');
    
    tabs.forEach(tab => {
      const day = parseInt(tab.dataset.day, 10);
      const isSelected = day === this.selectedDay;
      const isToday = day === todayIndex;

      const todayTag = tab.querySelector('.today-tag');
      if (todayTag) {
        if (isToday) todayTag.classList.remove('hidden');
        else todayTag.classList.add('hidden');
      }

      if (isSelected) {
        tab.className = 'day-tab px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-blue-600 text-white shadow-lg shadow-blue-600/30';
      } else {
        tab.className = 'day-tab px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5';
      }
    });
  }

  renderScheduleTable() {
    const daySchedules = this.schedules[this.selectedDay] || [];
    
    // Sort schedules chronologically by time
    daySchedules.sort((a, b) => {
      const [ha, ma] = a.time.split(':').map(Number);
      const [hb, mb] = b.time.split(':').map(Number);
      return (ha * 60 + ma) - (hb * 60 + mb);
    });

    if (daySchedules.length === 0) {
      this.scheduleEmptyState.classList.remove('hidden');
      this.scheduleTableContainer.classList.add('hidden');
      return;
    }

    this.scheduleEmptyState.classList.add('hidden');
    this.scheduleTableContainer.classList.remove('hidden');

    this.scheduleTableBody.innerHTML = daySchedules.map(item => {
      const badgeClass = `badge-${item.type || 'pelajaran'}`;
      const typeName = this.getTypeName(item.type);
      const toneName = this.getToneName(item.tone);

      return `
        <tr class="hover:bg-slate-800/40 transition group">
          
          <!-- Toggle Switch -->
          <td class="py-3 px-3 whitespace-nowrap">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" ${item.enabled ? 'checked' : ''} onchange="window.bellApp.toggleScheduleEnabled('${item.id}', this.checked)" class="sr-only peer">
              <div class="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </td>

          <!-- Jam Bel -->
          <td class="py-3 px-3 whitespace-nowrap font-mono font-bold text-sm ${item.enabled ? 'text-blue-400' : 'text-slate-500 line-through'}">
            ${item.time}
          </td>

          <!-- Nama Kegiatan / Label -->
          <td class="py-3 px-3">
            <span class="font-bold ${item.enabled ? 'text-white' : 'text-slate-400'}">${item.label}</span>
          </td>

          <!-- Kategori Badge -->
          <td class="py-3 px-3 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeClass}">
              ${typeName}
            </span>
          </td>

          <!-- Jenis Nada -->
          <td class="py-3 px-3 whitespace-nowrap text-slate-300 text-xs">
            <span class="inline-flex items-center gap-1">
              <i class="fa-solid fa-music text-slate-500 text-[10px]"></i> ${toneName}
            </span>
          </td>

          <!-- Teks TTS -->
          <td class="py-3 px-3 text-slate-400 max-w-xs truncate text-[11px]" title="${item.announcement || '-'}">
            ${item.announcement ? `<i class="fa-solid fa-volume-high text-blue-400 mr-1 text-[10px]"></i> ${item.announcement}` : '<span class="text-slate-600 italic">Hanya Lonceng</span>'}
          </td>

          <!-- Action Buttons -->
          <td class="py-3 px-3 text-right whitespace-nowrap space-x-1">
            <button onclick="window.bellApp.ringSingleBell('${item.id}')" title="Bunyikan Sekarang" class="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition">
              <i class="fa-solid fa-play text-xs"></i>
            </button>
            <button onclick="window.bellApp.openEditModal('${item.id}')" title="Edit Jadwal" class="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white rounded-lg transition">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button onclick="window.bellApp.deleteSchedule('${item.id}')" title="Hapus Jadwal" class="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </td>

        </tr>
      `;
    }).join('');
  }

  renderLogs() {
    const logs = this.storage.loadLogs();
    this.logCountBadge.textContent = `${logs.length} Catatan`;

    if (logs.length === 0) {
      this.logContainer.innerHTML = '<p class="text-xs text-slate-500 py-3 text-center italic">Belum ada riwayat bel yang berbunyi hari ini.</p>';
      return;
    }

    this.logContainer.innerHTML = logs.slice(0, 30).map(log => {
      const timeFormatted = new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <span class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span class="font-mono text-slate-400 font-bold">${timeFormatted}</span>
            <span class="font-bold text-slate-200 truncate">${log.label}</span>
            <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700 hidden sm:inline">${log.source}</span>
          </div>
          <span class="text-[11px] text-slate-500 italic truncate max-w-[150px] ml-2">${log.announcement || this.getToneName(log.tone)}</span>
        </div>
      `;
    }).join('');
  }

  // Quick manual ring panel
  quickRing(type) {
    const quickPresets = {
      masuk: { label: 'Masuk Kelas (Manual)', tone: 'westminster', announcement: 'Saatnya masuk kelas dan memulai kegiatan belajar.' },
      istirahat: { label: 'Istirahat (Manual)', tone: 'westminster', announcement: 'Saatnya waktu istirahat. Selamat beristirahat.' },
      pulang: { label: 'Pulang Sekolah (Manual)', tone: 'electric', announcement: 'Kegiatan belajar mengajar telah selesai. Selamat pulang dan hati-hati di jalan.' },
      darurat: { label: 'Peringatan Darurat / Evakuasi', tone: 'siren', announcement: 'Perhatian! Keadaan darurat. Harap segera evakuasi dengan tertib keluar ruangan.' }
    };

    const preset = quickPresets[type];
    if (preset) {
      this.scheduler.triggerBell({
        id: `quick-${type}-${Date.now()}`,
        time: new Date().toTimeString().slice(0, 5),
        type: type === 'darurat' ? 'khusus' : type,
        label: preset.label,
        tone: preset.tone,
        announcement: preset.announcement,
        enabled: true
      }, 'Tombol Cepat');
    }
  }

  ringSingleBell(scheduleId) {
    const dayList = this.schedules[this.selectedDay] || [];
    const item = dayList.find(b => b.id === scheduleId);
    if (item) {
      this.scheduler.triggerBell(item, 'Manual Uji');
    }
  }

  toggleScheduleEnabled(scheduleId, isEnabled) {
    const dayList = this.schedules[this.selectedDay] || [];
    const item = dayList.find(b => b.id === scheduleId);
    if (item) {
      item.enabled = isEnabled;
      this.storage.saveSchedules(this.schedules);
      this.renderScheduleTable();
    }
  }

  // Modal Handlers
  openAddModal() {
    this.modalTitle.innerHTML = '<i class="fa-solid fa-clock text-blue-400"></i> Tambah Jadwal Bel';
    this.formScheduleId.value = '';
    this.formDayIndex.value = this.selectedDay;
    this.formTime.value = '07:00';
    this.formType.value = 'pelajaran';
    this.formLabel.value = '';
    this.formTone.value = 'westminster';
    this.formAnnouncement.value = '';
    this.formEnabled.checked = true;

    this.scheduleModal.classList.remove('hidden');
  }

  openEditModal(scheduleId) {
    const dayList = this.schedules[this.selectedDay] || [];
    const item = dayList.find(b => b.id === scheduleId);
    if (!item) return;

    this.modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square text-amber-400"></i> Edit Jadwal Bel';
    this.formScheduleId.value = item.id;
    this.formDayIndex.value = this.selectedDay;
    this.formTime.value = item.time;
    this.formType.value = item.type || 'pelajaran';
    this.formLabel.value = item.label;
    this.formTone.value = item.tone || 'westminster';
    this.formAnnouncement.value = item.announcement || '';
    this.formEnabled.checked = item.enabled !== false;

    this.scheduleModal.classList.remove('hidden');
  }

  closeScheduleModal() {
    this.scheduleModal.classList.add('hidden');
  }

  saveScheduleFromForm() {
    const id = this.formScheduleId.value;
    const day = parseInt(this.formDayIndex.value, 10);
    const newSchedule = {
      id: id || `bell-${Date.now()}`,
      time: this.formTime.value,
      type: this.formType.value,
      label: this.formLabel.value.trim(),
      tone: this.formTone.value,
      announcement: this.formAnnouncement.value.trim(),
      enabled: this.formEnabled.checked
    };

    if (!this.schedules[day]) this.schedules[day] = [];

    if (id) {
      const idx = this.schedules[day].findIndex(b => b.id === id);
      if (idx !== -1) {
        this.schedules[day][idx] = newSchedule;
      }
    } else {
      this.schedules[day].push(newSchedule);
    }

    this.storage.saveSchedules(this.schedules);
    this.closeScheduleModal();
    this.renderScheduleTable();
  }

  deleteSchedule(scheduleId) {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal bel ini?')) {
      if (this.schedules[this.selectedDay]) {
        this.schedules[this.selectedDay] = this.schedules[this.selectedDay].filter(b => b.id !== scheduleId);
        this.storage.saveSchedules(this.schedules);
        this.renderScheduleTable();
      }
    }
  }

  // Copy modal
  openCopyModal() {
    this.copySourceDayLabel.textContent = this.getDayName(this.selectedDay);
    const days = [
      { id: 1, name: 'Senin' },
      { id: 2, name: 'Selasa' },
      { id: 3, name: 'Rabu' },
      { id: 4, name: 'Kamis' },
      { id: 5, name: 'Jumat' },
      { id: 6, name: 'Sabtu' },
      { id: 0, name: 'Minggu' }
    ];

    this.copyTargetDaysCheckboxes.innerHTML = days
      .filter(d => d.id !== this.selectedDay)
      .map(d => `
        <label class="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 cursor-pointer hover:bg-slate-800 transition">
          <input type="checkbox" value="${d.id}" class="copy-target-checkbox rounded text-blue-600 focus:ring-0">
          <span>Salin ke <strong>${d.name}</strong></span>
        </label>
      `).join('');

    this.copyModal.classList.remove('hidden');
  }

  closeCopyModal() {
    this.copyModal.classList.add('hidden');
  }

  executeCopySchedule() {
    const checkedBoxes = document.querySelectorAll('.copy-target-checkbox:checked');
    if (checkedBoxes.length === 0) {
      alert('Pilih setidaknya satu hari tujuan.');
      return;
    }

    const sourceSchedules = this.schedules[this.selectedDay] || [];
    checkedBoxes.forEach(box => {
      const targetDay = parseInt(box.value, 10);
      this.schedules[targetDay] = sourceSchedules.map(item => ({
        ...item,
        id: `bell-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      }));
    });

    this.storage.saveSchedules(this.schedules);
    this.closeCopyModal();
    alert('Jadwal berhasil disalin!');
  }

  // Presets
  applyPreset(presetName) {
    if (confirm(`Terapkan template '${presetName}' ke jadwal? Tindakan ini akan memperbarui jadwal sesuai preset.`)) {
      if (presetName === 'exam') {
        const examData = this.storage.getExamSchedulePreset();
        // Terapkan ke Senin-Kamis
        [1, 2, 3, 4, 5].forEach(d => {
          this.schedules[d] = JSON.parse(JSON.stringify(examData[1]));
        });
      } else if (presetName === 'ramadan') {
        const ramadanData = this.storage.getRamadanSchedulePreset();
        [1, 2, 3, 4, 5].forEach(d => {
          this.schedules[d] = JSON.parse(JSON.stringify(ramadanData[1]));
        });
      } else {
        this.schedules = this.storage.generateDefaultSchedules();
      }
      this.storage.saveSchedules(this.schedules);
      this.renderScheduleTable();
    }
  }

  // Settings
  openSettingsModal() {
    this.settingSchoolName.value = this.config.schoolName;
    this.settingSchoolSubtitle.value = this.config.schoolSubtitle;
    this.settingRunningText.value = this.config.runningText;
    this.settingVolume.value = this.config.volume;
    this.volumePercentDisplay.textContent = `${Math.round(this.config.volume * 100)}%`;
    this.settingTtsEnabled.checked = this.config.ttsEnabled;

    this.settingsModal.classList.remove('hidden');
  }

  closeSettingsModal() {
    this.settingsModal.classList.add('hidden');
  }

  saveSettings() {
    this.config.schoolName = this.settingSchoolName.value.trim() || 'SEKOLAH';
    this.config.schoolSubtitle = this.settingSchoolSubtitle.value.trim();
    this.config.runningText = this.settingRunningText.value.trim();
    this.config.volume = parseFloat(this.settingVolume.value);
    this.config.ttsEnabled = this.settingTtsEnabled.checked;

    this.storage.saveConfig(this.config);
    this.applyConfig();
    this.closeSettingsModal();
  }

  // Backup & Restore
  openBackupModal() {
    this.backupModal.classList.remove('hidden');
  }

  closeBackupModal() {
    this.backupModal.classList.add('hidden');
  }

  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = this.storage.importData(e.target.result);
        if (success) {
          this.config = this.storage.loadConfig();
          this.schedules = this.storage.loadSchedules();
          this.applyConfig();
          this.renderScheduleTable();
          this.closeBackupModal();
          alert('Data jadwal berhasil dipulihkan dari backup JSON!');
        } else {
          alert('Format file backup JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal memproses file backup: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  handleResetToDefault() {
    if (confirm('PERINGATAN: Semua perubahan jadwal Anda akan dihapus dan dikembalikan ke jadwal standar default. Lanjutkan?')) {
      this.schedules = this.storage.resetToDefault();
      this.config = this.storage.loadConfig();
      this.applyConfig();
      this.renderScheduleTable();
      this.closeBackupModal();
      alert('Jadwal berhasil direset ke standar bawaan.');
    }
  }

  // Fullscreen
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Gagal masuk ke mode layar penuh: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Visual Bell Ringing Animation & Toast
  triggerBellVisualAnimation() {
    if (this.bellHeaderIcon) {
      this.bellHeaderIcon.classList.add('animate-ringing');
      setTimeout(() => {
        this.bellHeaderIcon.classList.remove('animate-ringing');
      }, 7000);
    }
  }

  showToast(bellItem, source = 'Otomatis') {
    this.toastSourceTag.textContent = `BEL ${source.toUpperCase()} BERBUNYI`;
    this.toastBellTitle.textContent = bellItem.label;
    this.toastBellAnnouncement.textContent = bellItem.announcement || 'Nada Bel: ' + this.getToneName(bellItem.tone);

    this.bellToastModal.classList.remove('translate-y-28', 'opacity-0', 'pointer-events-none');
    this.bellToastModal.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      this.hideToast();
    }, 7000);
  }

  hideToast() {
    this.bellToastModal.classList.remove('translate-y-0', 'opacity-100');
    this.bellToastModal.classList.add('translate-y-28', 'opacity-0', 'pointer-events-none');
  }

  // Helpers
  getDayName(dayIndex) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex] || '';
  }

  getTypeName(type) {
    const map = {
      masuk: 'Masuk Kelas',
      pelajaran: 'Ganti Pelajaran',
      istirahat: 'Istirahat',
      ibadah: 'Ibadah / Sholat',
      pulang: 'Pulang Sekolah',
      upacara: 'Upacara / Apel',
      khusus: 'Kegiatan Khusus'
    };
    return map[type] || 'Kegiatan';
  }

  getToneName(tone) {
    const map = {
      westminster: 'Westminster Chimes',
      '3tone': '3-Tone Melody',
      dingdong: 'Ding-Dong Chime',
      electric: 'Lonceng Listrik Kring',
      siren: 'Sirine Darurat'
    };
    return map[tone] || 'Westminster Chimes';
  }
}

// Inisialisasi aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  window.bellApp = new SchoolBellApp();
});
