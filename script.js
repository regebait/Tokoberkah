// ===== DAFTAR EMOJI ANEH YANG AKAN MUNCUL =====
const emojiList = ["👽", "🤪", "😱", "🥴", "👹", "🫠", "🐙", "💀", "🤯", "👻"];

const overlay = document.getElementById("overlay");
const container = document.getElementById("emoji-container");

// ===== SPAWN EMOJI ACAK BERTERBANGAN =====
function spawnEmoji() {
  const el = document.createElement("div");
  el.className = "emoji";
  el.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];
  el.style.left = Math.random() * 90 + "vw";
  el.style.animationDuration = (2 + Math.random() * 2) + "s, 3s";
  container.appendChild(el);

  // bersihkan emoji lama biar HP ga berat
  setTimeout(() => el.remove(), 4000);
}

// terus-terusan muncul emoji baru
const spawnInterval = setInterval(spawnEmoji, 250);

// ===== GETAR HP (kalau browser mendukung, biasanya Android Chrome) =====
if (navigator.vibrate) {
  const vibrateInterval = setInterval(() => {
    navigator.vibrate([150, 80, 150]);
  }, 800);

  // simpan supaya bisa dimatikan nanti
  window.__vibrateInterval = vibrateInterval;
}

// ===== COBA MODE FULLSCREEN SAAT DISENTUH PERTAMA KALI =====
document.body.addEventListener(
  "click",
  () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  },
  { once: true }
);

// ===== INI KUNCI UTAMA PRANK-NYA =====
// Saat "Mode Pesawat" diaktifkan, koneksi internet HP mati.
// Browser otomatis mendeteksi ini lewat event "offline".
window.addEventListener("offline", () => {
  clearInterval(spawnInterval);
  if (window.__vibrateInterval) clearInterval(window.__vibrateInterval);
  if (navigator.vibrate) navigator.vibrate(0);

  container.innerHTML = "";
  overlay.innerHTML = `
    <h1 id="fixed-text">✅ Berhasil dibersihkan!<br>😂 Kena prank ya~</h1>
  `;

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
});
