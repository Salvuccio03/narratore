// html/script.js

const audioMap = {
  "Allarme antincendio.mp3": "audio/Allarme_antincendio.mp3",
  "Colpo di frusta.mp3": "audio/Colpo_di_frusta.mp3",
  "Esplosione.mp3": "audio/Esplosione.mp3",
  "motosega.mp3": "audio/motosega.mp3",
  "Suoneria nokia3310.mp3": "audio/nokia3310.mp3",
  "Rutto.mp3": "audio/Rurro.mp3",
  "Sparo singolo (pistola).mp3": "audio/sapro_singolo.mp3",
  "Raffica di spari (mitraglietta).mp3": "audio/sparo_raffica.mp3",
  "Tosse.mp3": "audio/tosse.mp3",
  "Vomito.mp3": "audio/Vomito.mp3",
  "Mi son fatto l'amante.mp3": "audio/Fatto_Amante.mp3"
};

const apiUrl = "https://script.google.com/macros/s/AKfycbweziW6tRNNE3d8M3CPskkJ_602T9C2GTO05woaOYXGHDtse7FFxyD5NJtgDj9Q2qvM/exec";

const player = document.getElementById("player");
const nowPlaying = document.getElementById("nowPlaying");
const logContainer = document.getElementById("log");

let lastSeenRow = Number(sessionStorage.getItem("lastSeenRow")) || 0;

function enableAudio() {
  player.muted = false;
  player.play().catch(() => {});
}

function logEvent(text) {
  const div = document.createElement("div");
  div.className = "entry";
  div.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logContainer.prepend(div);
}

function updateNowPlaying(text) {
  nowPlaying.textContent = text;
  nowPlaying.classList.add("flash");
  setTimeout(() => nowPlaying.classList.remove("flash"), 1000);
}

async function checkLastRow() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) return;

    const last = data[data.length - 1];
    if (last.riga === lastSeenRow) return;

    lastSeenRow = last.riga;

    if (last.tipo === "suono") {
      const audioUrl = audioMap[last.valore];
      if (audioUrl) {
        updateNowPlaying(`🎵 ${last.valore.replace(".mp3", "")}`);
        logEvent(`Suono: ${last.valore}`);
        player.src = audioUrl;
        await player.play().catch(() => {});
      } else {
        logEvent(`⚠️ Audio mancante: ${last.valore}`);
      }
    } else if (last.tipo === "personaggio") {
      updateNowPlaying(`👤 Entra in scena: ${last.valore}`);
      logEvent(`Personaggio: ${last.valore}`);
    }
    sessionStorage.setItem("lastSeenRow", lastSeenRow);

  } catch (e) {
    logEvent("❌ Errore rete: " + e.message);
  }
}

function resetLog() {
  logContainer.innerHTML = "";
  nowPlaying.textContent = "In attesa di elementi...";
  lastSeenRow = 0;
  localStorage.clear(); // se in futuro vorrai salvare qualcosa
}

setInterval(checkLastRow, 1000); // ogni secondo
