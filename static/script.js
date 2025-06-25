const analyzeBtn = document.getElementById("analyzeBtn");

analyzeBtn.addEventListener("click", async () => {
  const text = document.getElementById("textInput").value;

  if (!text.trim()) {
    alert("Please enter some text.");
    return;
  }

  // Set button to loading state
  analyzeBtn.innerHTML = "⏳";
  analyzeBtn.disabled = true;

  try {
    // const response = await fetch("http://localhost:5000/analyze", {
  const response = await fetch("https://emotif.onrender.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const result = await response.json();

    if (result.error) {
      alert("Error: " + result.error);
    } else {
      showResults(result);
    }

  } catch (error) {
    alert("Request failed. Please try again.");
    console.error(error);
  }

  // Reset button state
  analyzeBtn.innerHTML = "⚡";
  analyzeBtn.disabled = false;
});

function showResults(data) {
  if (!data || typeof data !== 'object') {
    alert("Invalid response format.");
    return;
  }

  if (data.error) {
    alert("API Error: " + data.error);
    return;
  }

  const resultContainer = document.getElementById("resultContainer");
  const sentimentResult = document.getElementById("sentimentResult");
  const confidenceFill = document.getElementById("confidenceFill");
  const confidenceText = document.getElementById("confidenceText");

  // Determine main emotion
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const [mainEmotion, confidence] = sorted[0];

  // Display main result
  sentimentResult.textContent = `${mainEmotion.toUpperCase()} Detected`;
  confidenceFill.style.width = `${confidence}%`;
  confidenceText.textContent = `Confidence: ${confidence}%`;

  resultContainer.style.display = 'block';

  // Chart rendering
  const labels = [];
  const values = [];

  for (const [emotion, percent] of sorted) {
    labels.push(emotion);
    values.push(percent);
  }

  renderChart(labels, values);

  renderBarChart(labels, values);

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
            color: '#fff'
          }
        },
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold'
          },
          formatter: (value) => `${value}%`
        },
        tooltip: {
          bodyColor: 'white',
          titleColor: 'white'
        }
      }
    }
    // ,plugins: [ChartDataLabels]  // 👈 This is where you add it
  });

}

let barChart;
function renderBarChart(labels, values) {
  const ctx = document.getElementById('emotionBarChart').getContext('2d');

  if (barChart) barChart.destroy();

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Emotions',
        data: values,
        backgroundColor: '#ffa500',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          ticks: {
            color: '#fff',
            beginAtZero: true
          }
        },
        x: {
          ticks: {
            color: '#fff'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        },
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold'
          },
          formatter: (value) => `${value}%`
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

// document.addEventListener("DOMContentLoaded", function () {
//   document.getElementById('footer').innerHTML =
//     `Made by Adebiyi using Hugging Face & Flask ❤️ | © Emotif ${new Date().getFullYear()}`;
// });
