// DOM Elements
const toggleDarkBtn = document.getElementById("toggleDark");
const form = document.getElementById('recommendForm');
const resultDiv = document.getElementById('result');
const chatForm = document.getElementById('chatForm');
const chatResponse = document.getElementById('chatResponse');
const typingIndicator = document.getElementById('typingIndicator');
const chatText = document.getElementById('chatText');
const userQuestion = document.getElementById('userQuestion');

// Check for saved theme preference or use system preference
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark');
    toggleDarkBtn.innerHTML = '☀️ Mode Terang';
  } else {
    toggleDarkBtn.innerHTML = '🌙 Mode Gelap';
  }
  
  // Animate containers on load
  setTimeout(() => {
    document.querySelectorAll('.container').forEach((container, index) => {
      container.style.opacity = '0';
      container.style.transform = 'translateY(20px)';
      container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }, 100);
});

// Dark mode toggle
toggleDarkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  
  if (document.body.classList.contains('dark')) {
    toggleDarkBtn.innerHTML = '☀️ Mode Terang';
    localStorage.setItem('theme', 'dark');
  } else {
    toggleDarkBtn.innerHTML = '🌙 Mode Gelap';
    localStorage.setItem('theme', 'light');
  }
});

// Calculate BMI and calorie needs
function calculateHealth(weight, height, age, gender, activity) {
  // BMI Calculation
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // BMR Calculation (Mifflin-St Jeor Equation)
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // TDEE (Total Daily Energy Expenditure) based on activity level
  const activityFactors = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'very_active': 1.725,
    'extra_active': 1.9
  };
  
  const tdee = Math.round(bmr * activityFactors[activity]);
  
  return {
    bmi: bmi.toFixed(1),
    bmr: Math.round(bmr),
    tdee: tdee
  };
}

// Rekomendasi nutrisi form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Collect form data
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = ['weight', 'height', 'age'].includes(key) ? parseInt(value) : value;
  });
  
  // Show loading state
  resultDiv.innerHTML = '<div class="loading-spinner"></div> Memproses data dan menyiapkan rekomendasi...';
  resultDiv.classList.add('loading');
  
  try {
    // Calculate health metrics
    const healthMetrics = calculateHealth(data.weight, data.height, data.age, data.gender, data.activity);
    
    // Adjust calories based on objective
    let targetCalories = healthMetrics.tdee;
    if (data.objective === 'weight_loss') {
      targetCalories = Math.round(healthMetrics.tdee * 0.85); // 15% deficit
    } else if (data.objective === 'muscle_gain') {
      targetCalories = Math.round(healthMetrics.tdee * 1.1); // 10% surplus
    }
    
    // API call
    const res = await fetch('http://127.0.0.1:9090/getRecomend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        targetCalories
      })
    });
    
    const json = await res.json();
    resultDiv.classList.remove('loading');
    
    // Format and display results
    if (Array.isArray(json)) {
      // Health metrics summary
      let bmiCategory;
      if (healthMetrics.bmi < 18.5) bmiCategory = 'Berat badan kurang';
      else if (healthMetrics.bmi < 25) bmiCategory = 'Normal';
      else if (healthMetrics.bmi < 30) bmiCategory = 'Kelebihan berat badan';
      else bmiCategory = 'Obesitas';
      
      let outputHtml = `
      <div class="summary-stats">
        <div class="stat-box">
          <p class="stat-value">${healthMetrics.bmi}</p>
          <p class="stat-label">BMI (${bmiCategory})</p>
        </div>
        <div class="stat-box">
          <p class="stat-value">${healthMetrics.bmr}</p>
          <p class="stat-label">BMR (kalori)</p>
        </div>
        <div class="stat-box">
          <p class="stat-value">${targetCalories}</p>
          <p class="stat-label">Target Kalori</p>
        </div>
      </div>
      <h3>✨ Rekomendasi Makanan:</h3>`;
      
      // Food recommendations
      json.forEach(item => {
        outputHtml += `
        <div class="recommendation-item">
          <span class="food-name">${item.Name}</span>
          <span class="calories">${item.Calories} kalori</span>
        </div>`;
      });
      
      // Nutrition tips based on objective
      let nutritionTip = '';
      if (data.objective === 'weight_loss') {
        nutritionTip = 'Tip: Fokus pada makanan tinggi protein & serat untuk kenyang lebih lama.';
      } else if (data.objective === 'muscle_gain') {
        nutritionTip = 'Tip: Pastikan asupan protein mencukupi (1.6-2.2g/kg berat badan).';
      } else {
        nutritionTip = 'Tip: Jaga keseimbangan makronutrien untuk kesehatan optimal.';
      }
      
      outputHtml += `<p><em>${nutritionTip}</em></p>`;
      resultDiv.innerHTML = outputHtml;
    } else {
      resultDiv.innerHTML = '⚠️ Gagal mendapatkan rekomendasi.';
    }
  } catch (err) {
    resultDiv.classList.remove('loading');
    resultDiv.innerHTML = '❌ Terjadi kesalahan saat memanggil API.';
    console.error(err);
  }
});

// Chatbot AI
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const question = userQuestion.value.trim();
  if (!question) return;
  
  // Keyword validation for nutrition and health topics
  const allowed = /nutrisi|gizi|makan|diet|sehat|kesehatan|kalori|vitamin|mineral|protein|karbohidrat|lemak|olahraga|berat badan|metabolisme|bmi|minuman/i;
  
  if (!allowed.test(question)) {
    chatText.innerHTML = "❌ Pertanyaan dibatasi hanya seputar nutrisi dan kesehatan.";
    return;
  }
  
  // Show the question and clear input
  chatText.innerHTML = `<div style="margin-bottom:10px"><strong>Anda:</strong> ${question}</div>`;
  userQuestion.value = '';
  
  // Show typing indicator with animation
  typingIndicator.style.display = 'flex';
  typingIndicator.innerHTML = '<div class="loading-spinner"></div> AI sedang mengetik...';
  
  try {
    const res = await fetch('http://localhost:9090/askAI', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    
    const json = await res.json();
    typingIndicator.style.display = 'none';
    
    const reply = json.reply || "Maaf, tidak bisa menjawab pertanyaan ini.";
    
    // Parse markdown ke HTML dan animasi ketik per potongan
    const html = marked.parse(reply);
let currentIndex = 0;

function animateHTMLText() {
  if (currentIndex <= html.length) {
    // Ambil substring dari hasil parse HTML
    chatText.innerHTML = `<div style="margin-bottom:10px"><strong>Anda:</strong> ${question}</div><div><strong>AI:</strong> ${html.substring(0, currentIndex)}</div>`;
    currentIndex++;
    
    const delay = html.length > 100 ? 10 : 20;
    setTimeout(animateHTMLText, delay);
  }
}

    
    animateHTMLText();
  } catch (err) {
    typingIndicator.style.display = 'none';
    chatText.innerHTML = `<div style="margin-bottom:10px"><strong>Anda:</strong> ${question}</div><div><strong>AI:</strong> ❌ Terjadi kesalahan saat memanggil AI.</div>`;
    console.error(err);
  }
});

// Enter key to submit in chat input
userQuestion.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// Add hover effects for buttons
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
  });
});
