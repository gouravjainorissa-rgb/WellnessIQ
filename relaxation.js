let breathingInterval;
let isBreathing = false;
let timeoutInhale;
let timeoutHold;
let timeoutExhale;

function toggleBreathing() {
  const btn = document.getElementById('startBreathingBtn');
  if (isBreathing) {
    stopBreathing();
    btn.innerText = 'Start Session';
  } else {
    startBreathing();
    btn.innerText = 'Stop Session';
  }
}

function startBreathing() {
  isBreathing = true;
  const circle = document.getElementById('breathingCircle');
  const text = document.getElementById('breathingText');

  function cycle() {
    if (!isBreathing) return;
    
    // Inhale (4s)
    text.innerText = 'Breathe In...';
    circle.style.transition = 'transform 4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 4s ease';
    circle.style.transform = 'scale(1.5)';
    circle.style.boxShadow = '0 0 60px var(--primary-glow), inset 0 0 30px rgba(0, 229, 255, 0.3)';
    
    timeoutHold = setTimeout(() => {
      if (!isBreathing) return;
      // Hold (7s)
      text.innerText = 'Hold...';
      circle.style.transition = 'transform 7s linear, box-shadow 7s linear';
      // keep it scaled
      
      timeoutExhale = setTimeout(() => {
        if (!isBreathing) return;
        // Exhale (8s)
        text.innerText = 'Breathe Out...';
        circle.style.transition = 'transform 8s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 8s ease';
        circle.style.transform = 'scale(1)';
        circle.style.boxShadow = '0 0 20px var(--primary-glow), inset 0 0 10px rgba(0, 229, 255, 0.1)';
        
      }, 7000);
    }, 4000);
  }

  // Start immediately
  cycle();
  // Loop every 19s (4+7+8)
  breathingInterval = setInterval(cycle, 19000);
}

function stopBreathing() {
  isBreathing = false;
  clearInterval(breathingInterval);
  clearTimeout(timeoutInhale);
  clearTimeout(timeoutHold);
  clearTimeout(timeoutExhale);
  
  const circle = document.getElementById('breathingCircle');
  const text = document.getElementById('breathingText');
  
  circle.style.transition = 'transform 1s ease, box-shadow 1s ease';
  circle.style.transform = 'scale(1)';
  circle.style.boxShadow = 'none';
  text.innerText = 'Ready';
}

let isEyeTracking = false;

function toggleEyeTracking() {
  const btn = document.getElementById('startEyeBtn');
  const orb = document.getElementById('eyeOrb');
  
  if (isEyeTracking) {
    isEyeTracking = false;
    btn.innerText = 'Start Exercise';
    orb.classList.remove('orb-animate');
  } else {
    isEyeTracking = true;
    btn.innerText = 'Stop Exercise';
    orb.classList.add('orb-animate');
  }
}

// --- POMODORO TIMER LOGIC ---
let pomodoroInterval;
let pomodoroTimeLeft = 25 * 60; // 25 minutes in seconds
let isPomodoroRunning = false;
const pomodoroTotalTime = 25 * 60;

function togglePomodoro() {
  const btn = document.getElementById('startPomodoroBtn');
  
  if (isPomodoroRunning) {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    btn.innerText = 'Resume Focus';
  } else {
    isPomodoroRunning = true;
    btn.innerText = 'Pause Focus';
    
    pomodoroInterval = setInterval(() => {
      if (pomodoroTimeLeft > 0) {
        pomodoroTimeLeft--;
        updatePomodoroDisplay();
      } else {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        btn.innerText = 'Start Focus';
        alert('Focus session complete! Take a 5-minute break.');
      }
    }, 1000);
  }
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  isPomodoroRunning = false;
  pomodoroTimeLeft = pomodoroTotalTime;
  
  const btn = document.getElementById('startPomodoroBtn');
  btn.innerText = 'Start Focus';
  
  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  const timeDisplay = document.getElementById('pomodoroTime');
  const progressCircle = document.getElementById('pomodoroProgress');
  
  // Format time (MM:SS)
  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Update progress ring
  // Circumference = 2 * pi * 90 = 565.48
  const circumference = 565.48;
  const progress = 1 - (pomodoroTimeLeft / pomodoroTotalTime);
  const offset = circumference * progress;
  
  if (progressCircle) {
    progressCircle.style.strokeDashoffset = offset;
  }
}
