document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const text = document.getElementById("textInput").value;

  if (!text.trim()) {
    alert("Please enter some text.");
    return;
  }

  const response = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  const result = await response.json();

  if (result.error) {
    alert("Error: " + result.error);
    return;
  }

  showResults(result);
});

function showResults(data) {
  const resultsDiv = document.getElementById("resultContainer");
  const sentimentResult = document.getElementById("sentimentResult");
  const confidenceFill = document.getElementById("confidenceFill");
  const confidenceText = document.getElementById("confidenceText");

  const emotionScores = data.emotions;
  const mainEmotion = data.main_emotion;
  const confidence = emotionScores[mainEmotion] || 0;

  sentimentResult.textContent = `😶 Dominant Emotion: ${mainEmotion}`;
  confidenceFill.style.width = `${confidence}%`;
  confidenceText.textContent = `Confidence: ${confidence}%`;

  // For Chart display
  const labels = Object.keys(emotionScores);
  const values = Object.values(emotionScores);

  renderChart(labels, values);

  // Make result container visible
  resultsDiv.style.display = 'block';
}


let chart;
function renderChart(labels, values) {
  const ctx = document.getElementById('emotionChart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'Emotions',
        data: values,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#a3e635', '#e879f9', '#fb923c', '#60a5fa'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: 'white' // ← makes legend text white
          }
        },
        tooltip: {
          bodyColor: 'white',
          titleColor: 'white'
        }
      }
    }
  });

}

for (const [emotion, percent] of Object.entries(data)) {
  if (emotion === "main_emotion") continue;

  resultsDiv.innerHTML += `<p style="color: white;"><strong>${emotion}</strong>: ${percent}%</p>`;
  labels.push(emotion);
  values.push(percent);
}

