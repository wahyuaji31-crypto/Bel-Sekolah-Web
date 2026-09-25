/**
 * Storage Manager: Presets, LocalStorage, Export & Import
 */
class BellStorage {
  constructor() {
    this.STORAGE_KEY_SCHEDULES = 'school_bell_schedules_v1';
    this.STORAGE_KEY_CONFIG = 'school_bell_config_v1';
    this.STORAGE_KEY_LOGS = 'school_bell_logs_v1';
    this.STORAGE_KEY_USERS = 'school_bell_users_v1';
    this.STORAGE_KEY_SESSION = 'school_bell_session_v1';

    this.defaultUsers = [
      { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
      { username: 'piket', password: 'piket123', name: 'Guru Piket', role: 'piket' }
    ];

    this.defaultConfig = {
      schoolName: 'SMP / SMA NEGERI 1 INDONESIA',
      schoolSubtitle: 'Sistem Bel Otomatis & Informasi Jadwal Terpadu',
      runningText: 'Selamat Datang di Sistem Bel Sekolah Digital • Tingkatkan Disiplin dan Semangat Belajar!',
      volume: 0.9,
      autoBellActive: true,
      ttsEnabled: true,
      activePreset: 'regular', // regular, exam, ramadan
      theme: 'dark'
    };

    this.defaultSchedules = this.generateDefaultSchedules();
  }

  generateDefaultSchedules() {
    // 0: Minggu, 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu
    const schedules = {
      1: [ // Senin
        { id: 'mon-1', time: '06:45', label: 'Bel Persiapan Upacara', type: 'upacara', tone: 'westminster', announcement: 'Seluruh siswa dan dewan guru dimohon menuju lapangan upacara.', enabled: true },
        { id: 'mon-2', time: '07:00', label: 'Upacara Bendera Dimulai', type: 'upacara', tone: '3tone', announcement: 'Upacara pengibaran bendera dimulai.', enabled: true },
        { id: 'mon-3', time: '07:45', label: 'Jam Pelajaran Ke-1', type: 'pelajaran', tone: 'westminster', announcement: 'Saatnya jam pelajaran pertama dimulai.', enabled: true },
        { id: 'mon-4', time: '08:30', label: 'Jam Pelajaran Ke-2', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran kedua dimulai.', enabled: true },
        { id: 'mon-5', time: '09:15', label: 'Jam Pelajaran Ke-3', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran ketiga dimulai.', enabled: true },
        { id: 'mon-6', time: '10:00', label: 'Istirahat Pertama', type: 'istirahat', tone: 'westminster', announcement: 'Saatnya istirahat pertama. Selamat beristirahat.', enabled: true },
        { id: 'mon-7', time: '10:30', label: 'Masuk Kelas (Jam Ke-4)', type: 'masuk', tone: 'westminster', announcement: 'Waktu istirahat telah selesai. Silakan kembali masuk kelas untuk pelajaran ke-4.', enabled: true },
        { id: 'mon-8', time: '11:15', label: 'Jam Pelajaran Ke-5', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran kelima dimulai.', enabled: true },
        { id: 'mon-9', time: '12:00', label: 'Istirahat Kedua & Sholat Dzuhur', type: 'ibadah', tone: 'westminster', announcement: 'Saatnya istirahat kedua dan sholat dzuhur berjamaah.', enabled: true },
        { id: 'mon-10', time: '12:45', label: 'Masuk Kelas (Jam Ke-6)', type: 'masuk', tone: 'westminster', announcement: 'Waktu istirahat selesai. Silakan kembali ke kelas untuk pelajaran ke-6.', enabled: true },
        { id: 'mon-11', time: '13:30', label: 'Jam Pelajaran Ke-7', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran ketujuh dimulai.', enabled: true },
        { id: 'mon-12', time: '14:15', label: 'Bel Pulang Sekolah', type: 'pulang', tone: 'electric', announcement: 'Pelajaran hari ini telah selesai. Selamat pulang dan hati-hati di jalan.', enabled: true }
      ],
      2: [ // Selasa
        { id: 'tue-1', time: '07:00', label: 'Masuk Sekolah & Literasi', type: 'masuk', tone: 'westminster', announcement: 'Saatnya masuk kelas dan memulai kegiatan literasi pagi.', enabled: true },
        { id: 'tue-2', time: '07:30', label: 'Jam Pelajaran Ke-1', type: 'pelajaran', tone: '3tone', announcement: 'Saatnya jam pelajaran pertama dimulai.', enabled: true },
        { id: 'tue-3', time: '08:15', label: 'Jam Pelajaran Ke-2', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran kedua dimulai.', enabled: true },
        { id: 'tue-4', time: '09:00', label: 'Jam Pelajaran Ke-3', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran ketiga dimulai.', enabled: true },
        { id: 'tue-5', time: '09:45', label: 'Istirahat Pertama', type: 'istirahat', tone: 'westminster', announcement: 'Saatnya istirahat pertama. Selamat beristirahat.', enabled: true },
        { id: 'tue-6', time: '10:15', label: 'Masuk Kelas (Jam Ke-4)', type: 'masuk', tone: 'westminster', announcement: 'Istirahat selesai, saatnya jam pelajaran keempat.', enabled: true },
        { id: 'tue-7', time: '11:00', label: 'Jam Pelajaran Ke-5', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran kelima.', enabled: true },
        { id: 'tue-8', time: '11:45', label: 'Jam Pelajaran Ke-6', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran keenam.', enabled: true },
        { id: 'tue-9', time: '12:30', label: 'Istirahat Sholat & Makan', type: 'ibadah', tone: 'westminster', announcement: 'Saatnya istirahat kedua dan sholat berjamaah.', enabled: true },
        { id: 'tue-10', time: '13:15', label: 'Jam Pelajaran Ke-7', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran ketujuh.', enabled: true },
        { id: 'tue-11', time: '14:00', label: 'Jam Pelajaran Ke-8', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran kedelapan.', enabled: true },
        { id: 'tue-12', time: '14:45', label: 'Bel Pulang Sekolah', type: 'pulang', tone: 'electric', announcement: 'Pelajaran telah selesai. Selamat pulang ke rumah masing-masing.', enabled: true }
      ],
      3: [], // Rabu (akan disalin dari Selasa jika kosong)
      4: [], // Kamis (akan disalin dari Selasa jika kosong)
      5: [ // Jumat
        { id: 'fri-1', time: '06:45', label: 'Senam Pagi / Jaga Kebersihan', type: 'khusus', tone: '3tone', announcement: 'Saatnya kegiatan senam dan kebersihan lingkungan sekolah.', enabled: true },
        { id: 'fri-2', time: '07:30', label: 'Jam Pelajaran Ke-1', type: 'pelajaran', tone: 'westminster', announcement: 'Saatnya jam pelajaran pertama dimulai.', enabled: true },
        { id: 'fri-3', time: '08:15', label: 'Jam Pelajaran Ke-2', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran kedua dimulai.', enabled: true },
        { id: 'fri-4', time: '09:00', label: 'Istirahat Pagi', type: 'istirahat', tone: 'westminster', announcement: 'Saatnya istirahat pagi.', enabled: true },
        { id: 'fri-5', time: '09:30', label: 'Jam Pelajaran Ke-3', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran ketiga dimulai.', enabled: true },
        { id: 'fri-6', time: '10:15', label: 'Jam Pelajaran Ke-4', type: 'pelajaran', tone: 'dingdong', announcement: 'Saatnya jam pelajaran keempat dimulai.', enabled: true },
        { id: 'fri-7', time: '11:00', label: 'Persiapan Sholat Jumat / Pulang', type: 'ibadah', tone: 'electric', announcement: 'Pelajaran hari Jumat telah selesai. Silakan persiapan sholat Jumat.', enabled: true }
      ],
      6: [ // Sabtu (Eskul / Kegiatan Khusus)
        { id: 'sat-1', time: '07:30', label: 'Apel Pramuka & Ekstrakurikuler', type: 'khusus', tone: '3tone', announcement: 'Kegiatan ekstrakurikuler dan pengembangan bakat dimulai.', enabled: true },
        { id: 'sat-2', time: '11:30', label: 'Selesai Ekstrakurikuler', type: 'pulang', tone: 'electric', announcement: 'Kegiatan ekstrakurikuler telah selesai. Selamat berakhir pekan.', enabled: true }
      ],
      0: [] // Minggu (Libur)
    };

    // Salin struktur Selasa untuk Rabu dan Kamis
    schedules[3] = JSON.parse(JSON.stringify(schedules[2])).map(item => ({ ...item, id: item.id.replace('tue', 'wed') }));
    schedules[4] = JSON.parse(JSON.stringify(schedules[2])).map(item => ({ ...item, id: item.id.replace('tue', 'thu') }));

    return schedules;
  }

  getExamSchedulePreset() {
    return {
      1: [
        { id: 'ex-1', time: '07:15', label: 'Masuk Ruang Ujian', type: 'masuk', tone: 'westminster', announcement: 'Peserta ujian dipersilakan memasuki ruangan ujian.', enabled: true },
        { id: 'ex-2', time: '07:30', label: 'Ujian Sesi 1 Dimulai', type: 'pelajaran', tone: '3tone', announcement: 'Waktu pengerjaan ujian sesi pertama dimulai. Selamat mengerjakan.', enabled: true },
        { id: 'ex-3', time: '09:30', label: 'Ujian Sesi 1 Selesai & Istirahat', type: 'istirahat', tone: 'westminster', announcement: 'Waktu ujian sesi pertama telah habis. Silakan istirahat.', enabled: true },
        { id: 'ex-4', time: '10:00', label: 'Masuk Ruang Ujian Sesi 2', type: 'masuk', tone: 'dingdong', announcement: 'Peserta ujian dipersilakan masuk kembali ke ruang ujian.', enabled: true },
        { id: 'ex-5', time: '10:15', label: 'Ujian Sesi 2 Dimulai', type: 'pelajaran', tone: '3tone', announcement: 'Waktu pengerjaan ujian sesi kedua dimulai.', enabled: true },
        { id: 'ex-6', time: '11:45', label: 'Ujian Hari Ini Selesai', type: 'pulang', tone: 'electric', announcement: 'Ujian hari ini telah selesai. Silakan pulang dan belajar untuk besok.', enabled: true }
      ]
    };
  }

  getRamadanSchedulePreset() {
    return {
      1: [
        { id: 'rm-1', time: '07:30', label: 'Masuk & Tadarus Pagi', type: 'ibadah', tone: 'westminster', announcement: 'Saatnya masuk kelas dan kegiatan tadarus Al-Quran.', enabled: true },
        { id: 'rm-2', time: '08:00', label: 'Jam Pelajaran Ke-1', type: 'pelajaran', tone: '3tone', announcement: 'Jam pelajaran pertama dimulai.', enabled: true },
        { id: 'rm-3', time: '08:35', label: 'Jam Pelajaran Ke-2', type: 'pelajaran', tone: 'dingdong', announcement: 'Jam pelajaran kedua dimulai.', enabled: true },
        { id: 'rm-4', time: '09:10', label: 'Jam Pelajaran Ke-3', type: 'pelajaran', tone: 'dingdong', announcement: 'Jam pelajaran ketiga dimulai.', enabled: true },
        { id: 'rm-5', time: '09:45', label: 'Istirahat Singkat / Sholat Dhuha', type: 'ibadah', tone: 'westminster', announcement: 'Saatnya istirahat dan sholat dhuha.', enabled: true },
        { id: 'rm-6', time: '10:15', label: 'Jam Pelajaran Ke-4', type: 'pelajaran', tone: 'dingdong', announcement: 'Jam pelajaran keempat dimulai.', enabled: true },
        { id: 'rm-7', time: '10:50', label: 'Jam Pelajaran Ke-5', type: 'pelajaran', tone: 'dingdong', announcement: 'Jam pelajaran kelima dimulai.', enabled: true },
        { id: 'rm-8', time: '11:25', label: 'Jam Pelajaran Ke-6', type: 'pelajaran', tone: 'dingdong', announcement: 'Jam pelajaran keenam dimulai.', enabled: true },
        { id: 'rm-9', time: '12:00', label: 'Sholat Dzuhur & Pulang', type: 'pulang', tone: 'electric', announcement: 'Kegiatan belajar selesai. Selamat menunaikan ibadah puasa.', enabled: true }
      ]
    };
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_CONFIG);
      return stored ? { ...this.defaultConfig, ...JSON.parse(stored) } : { ...this.defaultConfig };
    } catch (e) {
      console.warn('Failed to load config from localStorage:', e);
      return { ...this.defaultConfig };
    }
  }

  saveConfig(config) {
    try {
      localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config to localStorage:', e);
    }
  }

  loadSchedules() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_SCHEDULES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load schedules from localStorage:', e);
    }
    const defaultData = this.generateDefaultSchedules();
    this.saveSchedules(defaultData);
    return defaultData;
  }

  saveSchedules(schedules) {
    try {
      localStorage.setItem(this.STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
    } catch (e) {
      console.error('Failed to save schedules to localStorage:', e);
    }
  }

  loadLogs() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_LOGS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  addLog(logItem) {
    const logs = this.loadLogs();
    logs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...logItem
    });
    // Batasi maksimum 100 log terbaru
    if (logs.length > 100) logs.pop();
    try {
      localStorage.setItem(this.STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {}
    return logs;
  }

  clearLogs() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_LOGS);
    } catch (e) {}
  }

  exportData() {
    const data = {
      config: this.loadConfig(),
      schedules: this.loadSchedules(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_jadwal_bel_sekolah_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.schedules) {
        this.saveSchedules(parsed.schedules);
      }
      if (parsed.config) {
        this.saveConfig(parsed.config);
      }
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  }

  loadUsers() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_USERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    this.saveUsers(this.defaultUsers);
    return this.defaultUsers;
  }

  saveUsers(users) {
    try {
      localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {}
  }

  authenticate(username, password) {
    const users = this.loadUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (user) {
      const sessionData = {
        username: user.username,
        name: user.name,
        role: user.role, // 'admin' | 'piket'
        loginAt: new Date().toISOString()
      };
      this.setSession(sessionData);
      return { success: true, user: sessionData };
    }
    return { success: false, message: 'Username atau kata sandi salah!' };
  }

  getSession() {
    try {
      const session = localStorage.getItem(this.STORAGE_KEY_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  setSession(sessionData) {
    try {
      localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    } catch (e) {}
  }

  clearSession() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_SESSION);
    } catch (e) {}
  }

  changePassword(username, oldPassword, newPassword) {
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (idx === -1) return { success: false, message: 'User tidak ditemukan.' };
    
    if (users[idx].password !== oldPassword) {
      return { success: false, message: 'Kata sandi lama salah.' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Kata sandi baru minimal 4 karakter.' };
    }

    users[idx].password = newPassword;
    this.saveUsers(users);
    return { success: true, message: 'Kata sandi berhasil diperbarui!' };
  }

  resetToDefault() {
    const defaults = this.generateDefaultSchedules();
    this.saveSchedules(defaults);
    this.saveConfig(this.defaultConfig);
    this.saveUsers(this.defaultUsers);
    return defaults;
  }
}

window.bellStorage = new BellStorage();
