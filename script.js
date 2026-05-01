// INITIALIZE STREAK
document.addEventListener("DOMContentLoaded", () => {
  updateStreakDisplay();
});

function updateStreakDisplay() {
  const streak = localStorage.getItem('currentStreak') || 0;
  const streakEls = document.querySelectorAll('.streak-counter');
  streakEls.forEach(el => {
    el.innerHTML = `🔥 ${streak} Day Streak`;
  });
}

// SAVE DATA
document.getElementById("form")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    date: new Date().toISOString(),
    age: +document.getElementById("age").value,
    height: +document.getElementById("height").value,
    weight: +document.getElementById("weight").value,
    workType: document.getElementById("workType").value,
    diet: document.getElementById("diet").value,
    smoke: document.getElementById("smoke").value,
    alcohol: document.getElementById("alcohol").value,
    medicalHistory: document.getElementById("medicalHistory").value,
    bpSys: +document.getElementById("bpSys").value,
    bpDia: +document.getElementById("bpDia").value,
    sugar: +document.getElementById("sugar").value,
    sleep: +document.getElementById("sleep").value,
    steps: +document.getElementById("steps").value,
    water: +document.getElementById("water").value,
    screen: +document.getElementById("screen").value,
    stress: +document.getElementById("stress").value
  };

  // Save latest data
  localStorage.setItem("healthData", JSON.stringify(data));

  // Save to history array
  let history = JSON.parse(localStorage.getItem("healthHistory") || "[]");
  history.push(data);
  localStorage.setItem("healthHistory", JSON.stringify(history));

  // Update Streak
  const lastCheckIn = localStorage.getItem("lastCheckInDate");
  const today = new Date().toDateString();
  let currentStreak = parseInt(localStorage.getItem("currentStreak") || "0");

  if (lastCheckIn !== today) {
    if (lastCheckIn === new Date(Date.now() - 86400000).toDateString()) {
      currentStreak++; // Logged yesterday
    } else {
      currentStreak = 1; // Missed a day or first time
    }
    localStorage.setItem("lastCheckInDate", today);
    localStorage.setItem("currentStreak", currentStreak);
  }

  const btn = document.querySelector(".primary-btn");
  btn.innerText = "Analyzing...";
  btn.style.opacity = "0.7";

  setTimeout(() => {
    window.location.href = "analysis.html";
  }, 600);
});

// DISPLAY RESULTS & CHARTS
function displayResults() {
  const dataString = localStorage.getItem("healthData");
  if (!dataString) {
    const sv = document.getElementById("scoreValue");
    if (sv) sv.innerText = "N/A";
    return;
  }

  const data = JSON.parse(dataString);
  let score = 100;
  let risks = [];
  let riskWeights = {
    "Fatigue": 0, "Hypertension": 0, "Mental Stress": 0,
    "Burnout Risk": 0, "Dehydration": 0, "Inactivity": 0,
    "Diabetic Risk": 0, "Obesity Risk": 0, "Toxicity Risk": 0
  };

  // BMI Calculation
  const heightM = data.height / 100;
  const bmi = data.weight / (heightM * heightM);
  data.bmi = bmi; // Store it for charts/reports

  // Adjust thresholds based on Medical History
  const isHypertensive = data.medicalHistory === 'Hypertension';
  const isDiabetic = data.medicalHistory === 'Diabetes';
  const hasHeartDisease = data.medicalHistory === 'Heart Disease';

  const bpThresholdSys = isHypertensive ? 125 : 130;
  const bpThresholdDia = isHypertensive ? 80 : 85;

  // Fetch Goals
  const goals = JSON.parse(localStorage.getItem('userGoals')) || { sleep: 8, steps: 8000, water: 2.0 };

  if (data.sleep <= goals.sleep - 2) { score -= 15; risks.push("Fatigue"); riskWeights["Fatigue"] = 15; }
  else if (data.sleep < goals.sleep) { score -= 5; risks.push("Mild Fatigue"); riskWeights["Fatigue"] = 5; }

  if (data.bpSys > bpThresholdSys || data.bpDia > bpThresholdDia) {
    score -= isHypertensive ? 20 : 10;
    risks.push("Hypertension");
    riskWeights["Hypertension"] = isHypertensive ? 20 : 10;
  }

  if (data.screen > 8) { score -= 10; risks.push("Mental Stress"); riskWeights["Mental Stress"] = 10; }

  if (data.stress > 7) {
    score -= hasHeartDisease ? 30 : 20;
    risks.push("Burnout Risk");
    riskWeights["Burnout Risk"] = hasHeartDisease ? 30 : 20;
  }
  else if (data.stress > 5) { score -= 10; risks.push("Elevated Stress"); riskWeights["Burnout Risk"] = 10; }

  if (data.water < goals.water - 0.5) { score -= 10; risks.push("Dehydration"); riskWeights["Dehydration"] = 10; }

  if (data.steps < goals.steps * 0.6) { score -= 10; risks.push("Inactivity"); riskWeights["Inactivity"] = 10; }

  if (data.sugar > (isDiabetic ? 110 : 140)) {
    score -= isDiabetic ? 20 : 10;
    risks.push("Diabetic Risk");
    riskWeights["Diabetic Risk"] = isDiabetic ? 20 : 10;
  }

  if (bmi > 25) {
    score -= (bmi > 30) ? 15 : 5;
    risks.push((bmi > 30) ? "Obesity Risk" : "Overweight");
    riskWeights["Obesity Risk"] = (bmi > 30) ? 15 : 5;
  }

  if (data.diet === 'Fast Food') { score -= 15; risks.push("Poor Nutrition"); }

  if (data.smoke === 'Yes') {
    score -= 20;
    risks.push("Cardiovascular/Lung Risk");
    riskWeights["Toxicity Risk"] += 20;
  }

  if (data.alcohol === 'Yes') {
    score -= 10;
    risks.push("Liver/Metabolic Risk");
    riskWeights["Toxicity Risk"] += 10;
  }

  score = Math.max(0, score);

  // Dynamic Theme
  document.body.setAttribute('data-health', score < 60 ? 'bad' : 'good');

  // Save score to today's history for trends
  let history = JSON.parse(localStorage.getItem("healthHistory") || "[]");
  if (history.length > 0) {
    history[history.length - 1].overallScore = score;
    localStorage.setItem("healthHistory", JSON.stringify(history));
  }

  const sv = document.getElementById("scoreValue");
  if (sv) sv.innerText = score;

  const circle = document.getElementById("scoreCircle");
  if (circle) {
    let scoreColor = '#00FF88'; // Good
    if (score < 60) scoreColor = '#FF3366'; // Bad
    else if (score < 80) scoreColor = '#FFB300'; // Warning
    else scoreColor = '#00E5FF'; // Primary/Excellent
    circle.style.background = `conic-gradient(${scoreColor} ${score}%, rgba(255,255,255,0.05) 0)`;
    circle.style.boxShadow = `inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px ${scoreColor}80`;
  }

  const catEl = document.getElementById("categories");
  if (catEl) {
    catEl.innerHTML = `
      <div class="card"><h4>Sleep</h4><div class="value ${data.sleep >= goals.sleep ? 'good' : (data.sleep >= goals.sleep - 1.5 ? 'warning' : 'bad')}">${data.sleep}h</div></div>
      <div class="card"><h4>Steps</h4><div class="value ${data.steps >= goals.steps ? 'good' : (data.steps >= goals.steps * 0.6 ? 'warning' : 'bad')}">${data.steps}</div></div>
      <div class="card"><h4>Stress</h4><div class="value ${data.stress <= 4 ? 'good' : (data.stress <= 7 ? 'warning' : 'bad')}">${data.stress}/10</div></div>
      <div class="card"><h4>BMI</h4><div class="value ${bmi >= 18.5 && bmi <= 25 ? 'good' : (bmi > 30 ? 'bad' : 'warning')}">${bmi.toFixed(1)}</div></div>
    `;
  }

  let strengths = [];
  let weaknesses = [];

  if (data.sleep >= goals.sleep) strengths.push(`Met Sleep Goal (${goals.sleep}h)`);
  else if (data.sleep <= goals.sleep - 2) weaknesses.push(`Poor Sleep (Under ${goals.sleep - 2}h)`);

  if (data.steps >= goals.steps) strengths.push(`Hit Step Goal (${goals.steps})`);
  else if (data.steps < goals.steps * 0.6) weaknesses.push(`Low Activity Levels`);

  if (data.stress <= 4) strengths.push("Great Stress Management");
  else if (data.stress > 7) weaknesses.push("High Stress / Burnout Risk");

  if (bmi >= 18.5 && bmi <= 25) strengths.push("Optimal BMI Maintained");
  else if (bmi > 30) weaknesses.push("High BMI (Obesity Risk)");

  if (data.water >= goals.water) strengths.push("Met Hydration Goal");
  else if (data.water < goals.water - 0.5) weaknesses.push("Dehydration Risk");

  const stText = document.getElementById("strengthsText");
  if (stText) {
    stText.innerHTML = strengths.length > 0 ? "• " + strengths.join("<br>• ") : "No major strengths detected currently.";
  }

  const wkText = document.getElementById("weaknessesText");
  if (wkText) {
    wkText.innerHTML = weaknesses.length > 0 ? "• " + weaknesses.join("<br>• ") : "No major weaknesses! Keep it up!";
  }

  generateAIInsights(history);

  if (document.getElementById('radarChart') && document.getElementById('pieChart')) {
    renderCharts(data, riskWeights);
  }
}

function generateAIInsights(history) {
  const container = document.getElementById("ai-insight-container");
  if (!container) return;

  if (history.length < 2) {
    container.innerHTML = `
      <div class="glass" style="border-left: 4px solid var(--primary); padding: 20px;">
        <h3 style="color: var(--primary); margin-bottom: 5px;">🤖 AI Initializing</h3>
        <p>Log a few more days to start receiving personalized trend insights.</p>
      </div>`;
    return;
  }

  const recent = history.slice(-3); // look at last 3 days
  let aiMessage = "";
  let type = "primary"; // primary, warning, bad, good

  // Simple logic checks over last 3 days
  const avgSleep = recent.reduce((sum, entry) => sum + entry.sleep, 0) / recent.length;
  const avgStress = recent.reduce((sum, entry) => sum + entry.stress, 0) / recent.length;

  if (avgSleep < 6 && recent.length >= 2) {
    aiMessage = `You've averaged only ${avgSleep.toFixed(1)}h of sleep over your recent logs. This is highly risky for cognitive function and immunity. Please prioritize rest today.`;
    type = "bad";
  } else if (avgStress > 7 && recent.length >= 2) {
    aiMessage = `Your stress levels have been consistently high recently. It's crucial to step back and practice mindfulness or disconnect from screens.`;
    type = "bad";
  } else if (avgSleep >= 7 && avgStress <= 4) {
    aiMessage = `Incredible work! You are maintaining an excellent balance of rest and stress management. Your body is in a prime state of recovery.`;
    type = "good";
  } else {
    aiMessage = `Your vitals are fluctuating normally. Keep tracking to build a stronger wellness profile.`;
    type = "primary";
  }

  let colorVar = `var(--${type})`;
  container.innerHTML = `
    <div class="glass" style="border-left: 4px solid ${colorVar}; padding: 20px; animation: slideUp 0.6s ease-out;">
      <h3 style="color: ${colorVar}; margin-bottom: 8px;">✨ Personalized AI Insight</h3>
      <p style="font-size: 1.05rem;">"${aiMessage}"</p>
    </div>`;
}

function renderCharts(data, riskWeights) {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  Chart.defaults.color = isLight ? '#475569' : '#cbd5e1';
  Chart.defaults.font.family = "'Outfit', sans-serif";

  const ctxRadar = document.getElementById('radarChart').getContext('2d');

  // Premium Gradient
  let gradient = ctxRadar.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(0, 229, 255, 0.5)'); // Cyan primary
  gradient.addColorStop(1, 'rgba(138, 43, 226, 0.1)'); // Purple secondary

  const normalizedData = [
    Math.min(10, data.sleep * (10 / 8)),
    Math.min(10, data.water * (10 / 2.5)),
    Math.max(0, 10 - (data.stress)),
    Math.min(10, data.steps / 1000),
    Math.max(0, 10 - (data.screen / 1.5))
  ];

  window.myRadar = new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: ['Sleep Quality', 'Hydration', 'Mental Calm', 'Activity', 'Screen Detox'],
      datasets: [{
        label: 'Your Wellness Profile',
        data: normalizedData,
        backgroundColor: gradient,
        borderColor: '#00E5FF',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#00E5FF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { display: false },
          grid: { display: false },
          pointLabels: { color: isLight ? '#0f172a' : '#cbd5e1', font: { size: 12, weight: 600 } },
          ticks: { display: false, min: 0, max: 10 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });

  const ctxPie = document.getElementById('pieChart').getContext('2d');
  const riskLabels = Object.keys(riskWeights).filter(k => riskWeights[k] > 0);
  const riskValues = riskLabels.map(k => riskWeights[k]);

  let pieLabels = riskLabels;
  let pieData = riskValues;
  let pieColors = ['#FF3366', '#FFB300', '#00E5FF', '#00FF88', '#FF007F', '#8A2BE2', '#ec4899', '#9f1239'];

  if (riskValues.length === 0) {
    pieLabels = ['Optimal Health']; pieData = [100]; pieColors = ['#00FF88'];
  }

  window.myPie = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: pieLabels,
      datasets: [{ data: pieData, backgroundColor: pieColors, borderWidth: 0, hoverOffset: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '70%',
      plugins: { legend: { position: 'right', labels: { color: isLight ? '#475569' : '#cbd5e1', usePointStyle: true, boxWidth: 8 } } }
    }
  });
}

// INFERENCE ENGINE & DETAILED REPORT
function generateDetailedAnalysis(data) {
  let analysis = [];
  const history = data.medicalHistory;
  const goals = JSON.parse(localStorage.getItem('userGoals')) || { sleep: 8, steps: 8000, water: 2.0 };

  // BMI & PHYSICAL
  const heightM = data.height / 100;
  const bmi = data.weight / (heightM * heightM);
  let bmiLabel = (bmi >= 18.5 && bmi <= 24.9) ? 'Excellent' : ((bmi < 18.5 || bmi < 30) ? 'Needs Improvement' : 'Poor');
  let bmiClass = bmiLabel === 'Excellent' ? 'excellent' : (bmiLabel === 'Poor' ? 'bad' : 'warning');
  analysis.push({
    title: "⚖️ Physical Profile (BMI)",
    current: `Your BMI is ${bmi.toFixed(1)} (${data.weight}kg, ${data.height}cm).`,
    label: bmiLabel,
    class: bmiClass,
    futureRisk: bmi > 30 ? "Obesity significantly increases the risk of heart disease, type 2 diabetes, and severe joint issues." : "Maintaining a healthy BMI lowers risk of all metabolic diseases.",
    remedies: ["Track daily caloric intake based on your metabolic rate.", "Incorporate strength training 2x a week to build muscle mass."],
    medicine: "Consult a nutritionist for a personalized meal plan. Avoid severe caloric deficits without supervision."
  });

  // SUBSTANCE HABITS (SMOKING / ALCOHOL)
  if (data.smoke === 'Yes' || data.alcohol === 'Yes') {
    let habits = [];
    if (data.smoke === 'Yes') habits.push("Smoking");
    if (data.alcohol === 'Yes') habits.push("Alcohol Consumption");

    analysis.push({
      title: "🚬 Substance & Lifestyle Habits",
      current: `You reported engaging in: ${habits.join(" and ")}.`,
      label: 'Poor',
      class: 'bad',
      futureRisk: "Smoking radically accelerates arterial plaque, reduces lung capacity, and causes cellular mutation. Alcohol consumption chronically stresses the liver and disrupts sleep architecture.",
      remedies: ["Replace smoking triggers with chewing gum or a short walk.", "Limit alcohol strictly to 1-2 standard drinks occasionally.", "Drink a full glass of water between alcoholic beverages."],
      medicine: "Nicotine replacement therapy (NRT) is highly effective under medical supervision. Consider routine liver enzyme tests (ALT/AST)."
    });
  }

  // SLEEP
  let sleepLabel = data.sleep >= goals.sleep ? 'Excellent' : (data.sleep >= goals.sleep - 1 ? 'Good' : (data.sleep >= goals.sleep - 2 ? 'Needs Improvement' : 'Poor'));
  let sleepClass = sleepLabel === 'Excellent' ? 'excellent' : (sleepLabel === 'Good' ? 'good' : (sleepLabel === 'Poor' ? 'bad' : 'warning'));
  let sleepRisk = data.sleep < 7 ? "If this continues, you may face chronic fatigue, reduced concentration, weakened immunity, and stress-related issues." : "Maintaining this will support long-term cognitive health and immunity.";
  if (history === 'Fever' || history === 'Thyroid Issues') {
    sleepRisk += ` Given your history of ${history}, lack of sleep could severely impact your immune recovery and hormonal balance.`;
  }

  analysis.push({
    title: "🛌 Sleep Analysis",
    current: `You are currently sleeping for ${data.sleep} hours (Goal: ${goals.sleep}h).`,
    label: sleepLabel,
    class: sleepClass,
    futureRisk: sleepRisk,
    remedies: ["Try sleeping at a fixed time every day.", "Avoid screen usage 1 hour before sleep.", "Keep your bedroom cool and dark."],
    medicine: "You may consider consulting a doctor about common supplements like Magnesium or Melatonin if you have chronic insomnia. For persistent issues, professional medical advice is recommended."
  });

  // BLOOD PRESSURE
  let isHypertensive = history === 'Hypertension';
  let bpThresholdGood = isHypertensive ? 125 : 130;
  let bpThresholdWarning = isHypertensive ? 135 : 140;

  let bpLabel = (data.bpSys <= 120 && data.bpDia <= 80) ? 'Excellent' : ((data.bpSys <= bpThresholdGood && data.bpDia <= 85) ? 'Good' : 'Needs Improvement');
  if (data.bpSys > bpThresholdWarning || data.bpDia > 90) bpLabel = 'Poor';

  let bpClass = bpLabel === 'Excellent' ? 'excellent' : (bpLabel === 'Good' ? 'good' : (bpLabel === 'Poor' ? 'bad' : 'warning'));

  let bpRisk = bpLabel === 'Poor' || bpLabel === 'Needs Improvement' ? "Elevated blood pressure increases the risk of hypertension, heart disease, and strokes over time." : "Your heart health is currently in a safe range.";
  if (isHypertensive && (bpLabel === 'Poor' || bpLabel === 'Needs Improvement')) {
    bpRisk = "🚨 Critical: Since you have a history of Hypertension, these elevated levels are very dangerous and significantly increase stroke risk.";
  } else if (history === 'Heart Disease') {
    bpRisk += " Since you have a history of Heart Disease, keeping your BP strictly regulated is paramount.";
  }

  analysis.push({
    title: "❤️ Blood Pressure Analysis",
    current: `Your blood pressure is ${data.bpSys}/${data.bpDia} mmHg.`,
    label: bpLabel,
    class: bpClass,
    futureRisk: bpRisk,
    remedies: ["Reduce sodium (salt) intake in daily meals.", "Engage in 30 minutes of aerobic exercise daily.", "Practice stress-relief techniques like deep breathing."],
    medicine: "If consistently high, you should consult a cardiologist. General cardiovascular support includes Omega-3 supplements, but only under medical guidance."
  });

  // BLOOD SUGAR
  let isDiabetic = history === 'Diabetes';
  let sugarLabel = data.sugar < 100 ? 'Excellent' : (data.sugar < (isDiabetic ? 130 : 140) ? 'Good' : 'Poor');
  let sugarClass = sugarLabel === 'Excellent' ? 'excellent' : (sugarLabel === 'Good' ? 'good' : 'bad');

  let sugarRisk = sugarLabel === 'Poor' ? "High levels can lead to pre-diabetes or Type 2 Diabetes, affecting nerve and kidney health." : "Your insulin sensitivity appears stable.";
  if (isDiabetic) {
    if (sugarLabel === 'Poor') {
      sugarRisk = "🚨 Warning: Since you have Diabetes, these high sugar levels can lead to severe diabetic complications (neuropathy, retinopathy). Immediate dietary action needed.";
    } else {
      sugarRisk = "You are managing your Diabetes well. Continue monitoring.";
    }
  }

  analysis.push({
    title: "🍬 Blood Sugar Analysis",
    current: `Your blood sugar level is ${data.sugar} mg/dL.`,
    label: sugarLabel,
    class: sugarClass,
    futureRisk: sugarRisk,
    remedies: ["Reduce consumption of refined sugars and simple carbs.", "Increase dietary fiber (vegetables, whole grains).", "A short 15-minute walk after meals helps regulate spikes."],
    medicine: "General metabolic health can be supported by Vitamin D or Apple Cider Vinegar, but consult a doctor if your fasting sugar is consistently above 100."
  });

  // STRESS
  let stressLabel = data.stress <= 3 ? 'Excellent' : (data.stress <= 6 ? 'Good' : (data.stress <= 8 ? 'Needs Improvement' : 'Poor'));
  let stressClass = stressLabel === 'Excellent' ? 'excellent' : (stressLabel === 'Good' ? 'good' : (stressLabel === 'Poor' ? 'bad' : 'warning'));
  let stressRisk = stressLabel === 'Poor' || stressLabel === 'Needs Improvement' ? "Prolonged high stress leads to severe burnout, anxiety disorders, and cardiovascular strain." : "You have a good handle on your mental well-being.";

  if (history === 'Heart Disease' || history === 'Asthma') {
    stressRisk += ` Your history of ${history} means high stress can directly trigger physical symptoms or acute attacks.`;
  }

  analysis.push({
    title: "🧠 Stress & Mental State",
    current: `Your perceived stress level is ${data.stress} out of 10.`,
    label: stressLabel,
    class: stressClass,
    futureRisk: stressRisk,
    remedies: ["Practice 10 minutes of mindfulness meditation daily.", "Engage in hobbies completely detached from your work.", "Maintain social connections and talk to loved ones."],
    medicine: "Ashwagandha or L-Theanine are common natural adaptogens, but therapy or counseling is highly recommended for persistent high stress."
  });

  // LIFESTYLE & DIET
  let stepsLabel = data.steps >= goals.steps ? 'Excellent' : (data.steps >= goals.steps * 0.75 ? 'Good' : (data.steps >= goals.steps * 0.5 ? 'Needs Improvement' : 'Poor'));
  let stepsClass = stepsLabel === 'Excellent' ? 'excellent' : (stepsLabel === 'Good' ? 'good' : (stepsLabel === 'Poor' ? 'bad' : 'warning'));
  let stepsRisk = stepsLabel === 'Poor' ? "A sedentary lifestyle significantly increases risks for obesity, joint issues, and metabolic syndrome." : "Your activity levels support good musculoskeletal and cardiovascular health.";

  analysis.push({
    title: "🚶 Activity & Diet",
    current: `You take ${data.steps} steps daily (Goal: ${goals.steps}), work a ${data.workType || 'mixed'} job, and eat a ${data.diet} diet.`,
    label: data.diet === 'Fast Food' ? 'Poor' : stepsLabel,
    class: data.diet === 'Fast Food' ? 'bad' : stepsClass,
    futureRisk: data.diet === 'Fast Food' ? "A fast-food heavy diet combined with any sedentary behavior skyrockets arterial plaque formation and insulin resistance." : stepsRisk,
    remedies: ["Use a standing desk or take stretching breaks every 45 minutes.", "Aim for at least 10,000 steps by incorporating walking into your commute or breaks.", "Swap sugary drinks for water or herbal tea."],
    medicine: "Ensure adequate Calcium and Vitamin D3 for bone health, especially if working indoors all day."
  });

  return analysis;
}

function checkComboRisks(data) {
  let combos = [];
  const heightM = data.height / 100;
  const bmi = data.weight / (heightM * heightM);

  // Combo 1: Heart Attack Risk
  if (bmi > 30 && (data.bpSys > 140 || data.bpDia > 90) && (data.diet === 'Fast Food' || data.smoke === 'Yes')) {
    combos.push("🚨 CRITICAL HEART RISK: Your combination of Obesity, High Blood Pressure, and Lifestyle Habits (Poor Diet / Smoking) puts you at an extreme risk of a cardiovascular event. Immediate lifestyle intervention is required.");
  }

  // Combo 2: Severe Burnout
  if (data.stress > 8 && data.sleep < 5 && data.screen > 8) {
    combos.push("🚨 SEVERE BURNOUT: High stress, extreme lack of sleep, and excessive screen time will cause a mental and physical breakdown. Please disconnect immediately and prioritize rest.");
  }

  // Combo 3: Diabetic Crash
  if (data.sugar > 140 && data.steps < 3000 && data.diet === 'Fast Food') {
    combos.push("🚨 METABOLIC WARNING: Extremely low activity coupled with poor diet and high blood sugar is aggressively pushing you towards severe metabolic syndrome. Daily walking is absolutely necessary.");
  }

  // Combo 4: Toxic Overload
  if (data.smoke === 'Yes' && data.alcohol === 'Yes' && data.bpSys > 130) {
    combos.push("🚨 TOXIC VASCULAR STRESS: Combining smoking, alcohol, and elevated blood pressure places massive strain on your liver and blood vessels. Please reduce substance intake immediately.");
  }

  return combos;
}

function renderDetailedReport() {
  const container = document.getElementById("detailed-report-container");
  if (!container) return;

  const dataString = localStorage.getItem("healthData");
  if (!dataString) {
    container.innerHTML = "<p>No data found. Please complete a check-in first.</p>";
    return;
  }

  const data = JSON.parse(dataString);
  const analysisCards = generateDetailedAnalysis(data);
  const comboRisks = checkComboRisks(data);

  let html = "";

  // Combo Risk Banner
  if (comboRisks.length > 0) {
    html += `
      <div style="background: rgba(239, 68, 68, 0.15); border: 2px solid var(--bad); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <h2 style="color: var(--bad); margin-bottom: 10px;">⚠️ CRITICAL COMBO ALERTS</h2>
        <ul style="color: var(--text-main); font-weight: 500; font-size: 1.1rem; padding-left: 20px;">
          ${comboRisks.map(c => `<li style="margin-bottom:8px;">${c}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (data.medicalHistory && data.medicalHistory !== 'None') {
    html += `
      <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid var(--primary); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
        <h3 style="color: var(--primary); margin-bottom: 5px;">🩺 Medical Profile Context</h3>
        <p>Your analysis has been adjusted specifically for your history of <strong>${data.medicalHistory}</strong>.</p>
      </div>
    `;
  }

  const history = JSON.parse(localStorage.getItem("healthHistory") || "[]");
  const recent = history.slice(-3);

  analysisCards.forEach(card => {
    // Attempt to generate a "Why this is happening" string based on trends
    let whyReason = "Based on your current lifestyle inputs, these metrics are directly influenced by your daily habits and genetic predispositions.";
    if (recent.length > 1) {
      if (card.title.includes("Sleep") && recent.every(r => r.sleep < 7)) {
        whyReason = "Your logs show a consistent pattern of insufficient sleep over the past few days, likely due to prolonged screen time or high stress.";
      } else if (card.title.includes("Stress") && recent.every(r => r.stress > 6)) {
        whyReason = "Consistent high stress levels recorded recently suggest ongoing work or personal pressures are heavily taxing your nervous system.";
      } else if (card.title.includes("Activity") && recent.every(r => r.steps < 6000)) {
        whyReason = "A pattern of low physical activity has been recorded, typically associated with a sedentary desk job or lack of dedicated exercise time.";
      }
    }

    html += `
      <div class="glass report-card">
        <div class="report-header">
          <h2>${card.title}</h2>
          <span class="badge ${card.class}">${card.label}</span>
        </div>
        
        <div class="report-section" style="border-left-color: var(--primary); margin-top: 15px;">
          <h4 style="color: var(--primary);">Current Status</h4>
          <p style="font-size:1.1rem; font-weight: 500;">${card.current}</p>
        </div>

        <div class="report-section" style="border-left-color: var(--secondary); margin-top: 15px;">
          <h4 style="color: var(--secondary);">Why This Is Happening</h4>
          <p>${whyReason}</p>
        </div>
        
        <div class="report-section risk" style="margin-top: 15px;">
          <h4 style="color: var(--warning);">Future Risk</h4>
          <p>${card.futureRisk}</p>
        </div>
        
        <div class="report-section remedy" style="margin-top: 15px;">
          <h4 style="color: var(--good);">Improvement Steps & Home Remedies</h4>
          <ul class="remedy-list">
            ${card.remedies.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        
        <div class="report-section medicine" style="margin-top: 15px; opacity: 0.8;">
          <h4 style="color: var(--text-muted);">Medical Context</h4>
          <p style="font-size:0.9rem;"><i>${card.medicine}</i></p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Listen for theme changes to re-render charts with correct colors
window.addEventListener('themeChanged', () => {
  if (window.myRadar && window.myPie) {
    window.myRadar.destroy();
    window.myPie.destroy();
    displayResults(); // Re-render with new theme colors
  }
});

// HYDRATION TRACKER WIDGET LOGIC
function updateWater(amount) {
  const waterInput = document.getElementById('water');
  if (!waterInput) return;
  
  let currentValue = parseFloat(waterInput.value) || 0;
  currentValue += amount;
  
  // Constrain between 0 and 10 liters
  if (currentValue < 0) currentValue = 0;
  if (currentValue > 10) currentValue = 10;
  
  waterInput.value = currentValue.toFixed(2);
  
  // Update display
  const display = document.getElementById('waterDisplay');
  if (display) {
    display.innerText = `${currentValue.toFixed(1)} L`;
  }
  
  // Update water level visual (assume 4L is max for UI purposes)
  const maxVisualWater = 4.0;
  let percentage = (currentValue / maxVisualWater) * 100;
  if (percentage > 100) percentage = 100;
  
  const level = document.getElementById('waterLevel');
  if (level) {
    level.style.height = `${percentage}%`;
  }
}

// Initialize water widget on load if on dashboard
document.addEventListener("DOMContentLoaded", () => {
  const waterInput = document.getElementById('water');
  if (waterInput && document.getElementById('waterLevel')) {
    updateWater(0); // Trigger initial render
  }
});