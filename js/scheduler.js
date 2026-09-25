/**
 * Scheduler Engine: Precise Timekeeping, Auto-Bell Checking, & Next Bell Countdown
 */
class BellScheduler {
  constructor(audioEngine, storageEngine) {
    this.audio = audioEngine;
    this.storage = storageEngine;
    this.timerInterval = null;
    this.lastTriggerKey = null;
    this.onTickCallbacks = [];
    this.onBellRingCallbacks = [];
    this.isPaused = false;
  }

  start() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    // Jalankan pertama kali
    this.tick();

    // Loop interval 500ms agar update jam dan detik sangat mulus dan tidak terlewat
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 500);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onTick(cb) {
    this.onTickCallbacks.push(cb);
  }

  onBellRing(cb) {
    this.onBellRingCallbacks.push(cb);
  }

  tick() {
    const now = new Date();
    const currentDay = now.getDay(); // 0: Minggu, 1: Senin, ..., 6: Sabtu
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    const config = this.storage.loadConfig();
    const schedules = this.storage.loadSchedules();
    const todaySchedules = schedules[currentDay] || [];

    // Hitung bel berikutnya
    const nextBellInfo = this.calculateNextBell(now, todaySchedules, schedules);

    // Kirim update waktu ke UI
    const timeData = {
      dateObj: now,
      timeString: `${hours}:${minutes}:${seconds}`,
      shortTime: currentTimeStr,
      dayName: this.getDayName(currentDay),
      dateFormatted: this.formatIndonesianDate(now),
      nextBell: nextBellInfo
    };

    this.onTickCallbacks.forEach(cb => cb(timeData));

    // Cek apakah auto-bell aktif dan ada jadwal yang harus berbunyi
    if (config.autoBellActive && !this.isPaused) {
      this.checkAutoBellTrigger(now, currentDay, currentTimeStr, seconds, todaySchedules);
    }
  }

  checkAutoBellTrigger(now, currentDay, currentTimeStr, seconds, todaySchedules) {
    // Jalankan tepat saat detik antara 00 s/d 02 detik
    const secNum = parseInt(seconds, 10);
    if (secNum > 5) return;

    const matchingBells = todaySchedules.filter(item => item.enabled && item.time === currentTimeStr);

    matchingBells.forEach(bell => {
      const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${bell.time}_${bell.id}`;

      if (this.lastTriggerKey !== dateKey) {
        this.lastTriggerKey = dateKey;
        this.triggerBell(bell, 'Otomatis');
      }
    });
  }

  async triggerBell(bellItem, source = 'Otomatis') {
    console.log(`[BEL BERBUNYI] (${source}): ${bellItem.label} @ ${bellItem.time}`);

    // Simpan ke log
    const logItem = {
      label: bellItem.label,
      time: bellItem.time || new Date().toTimeString().slice(0, 5),
      type: bellItem.type,
      tone: bellItem.tone,
      source: source,
      announcement: bellItem.announcement
    };
    this.storage.addLog(logItem);

    // Beritahu UI
    this.onBellRingCallbacks.forEach(cb => cb(bellItem, source));

    // Bunyikan audio & TTS
    await this.audio.ring({
      toneType: bellItem.tone,
      announcement: bellItem.announcement
    });
  }

  calculateNextBell(now, todaySchedules, allSchedules) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();

    // Filter jadwal hari ini yang aktif dan waktunya setelah sekarang
    const futureToday = todaySchedules
      .filter(item => item.enabled)
      .map(item => {
        const [h, m] = item.time.split(':').map(Number);
        return {
          ...item,
          totalMinutes: h * 60 + m,
          diffMinutes: (h * 60 + m) - currentMinutes
        };
      })
      .filter(item => {
        if (item.diffMinutes > 0) return true;
        // Jika menit sama tapi detik masih 0
        if (item.diffMinutes === 0 && currentSeconds < 2) return true;
        return false;
      })
      .sort((a, b) => a.totalMinutes - b.totalMinutes);

    if (futureToday.length > 0) {
      const next = futureToday[0];
      const targetTime = new Date(now);
      const [h, m] = next.time.split(':').map(Number);
      targetTime.setHours(h, m, 0, 0);

      const diffMs = targetTime.getTime() - now.getTime();
      return {
        bell: next,
        isToday: true,
        diffMs: Math.max(0, diffMs),
        countdownStr: this.formatCountdown(diffMs)
      };
    }

    // Jika jadwal hari ini sudah habis, cari bel pertama di hari berikutnya
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (now.getDay() + i) % 7;
      const nextDaySchedules = (allSchedules[nextDayIndex] || []).filter(item => item.enabled);

      if (nextDaySchedules.length > 0) {
        // Urutkan berdasarkan jam paling awal
        const sorted = [...nextDaySchedules].sort((a, b) => {
          const [ha, ma] = a.time.split(':').map(Number);
          const [hb, mb] = b.time.split(':').map(Number);
          return (ha * 60 + ma) - (hb * 60 + mb);
        });

        const next = sorted[0];
        const targetTime = new Date(now);
        targetTime.setDate(targetTime.getDate() + i);
        const [h, m] = next.time.split(':').map(Number);
        targetTime.setHours(h, m, 0, 0);

        const diffMs = targetTime.getTime() - now.getTime();
        return {
          bell: next,
          isToday: false,
          dayName: this.getDayName(nextDayIndex),
          diffMs: Math.max(0, diffMs),
          countdownStr: this.formatCountdown(diffMs)
        };
      }
    }

    return null;
  }

  formatCountdown(diffMs) {
    if (diffMs <= 0) return '00:00:00';
    const totalSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getDayName(dayIndex) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex] || '';
  }

  formatIndonesianDate(dateObj) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  }
}

window.bellScheduler = new BellScheduler(window.bellAudio, window.bellStorage);
