const imageUpload = document.getElementById("imageUpload");
const thresholdRange = document.getElementById("thresholdRange");
const thresholdValue = document.getElementById("thresholdValue");

const originalCanvas = document.getElementById("originalCanvas");
const grayscaleCanvas = document.getElementById("grayscaleCanvas");
const binaryCanvas = document.getElementById("binaryCanvas");

const ctxOriginal = originalCanvas.getContext("2d");
const ctxGray = grayscaleCanvas.getContext("2d");
const ctxBinary = binaryCanvas.getContext("2d");

let imageDataGray;
let histogramChart;

// === FUNÇÃO PARA CARREGAR IMAGEM ===
imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    [originalCanvas, grayscaleCanvas, binaryCanvas].forEach((c) => {
      c.width = img.width;
      c.height = img.height;
    });

    ctxOriginal.drawImage(img, 0, 0);
    processImage();
  };

  img.src = URL.createObjectURL(file);
});

// === CONVERSÃO PARA CINZA E BINÁRIA ===
function processImage() {
  const { width, height } = originalCanvas;
  const imgData = ctxOriginal.getImageData(0, 0, width, height);
  const data = imgData.data;

  const grayData = ctxGray.createImageData(width, height);
  const binaryData = ctxBinary.createImageData(width, height);
  const threshold = parseInt(thresholdRange.value);

  const hist = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    hist[Math.floor(gray)]++;
    grayData.data[i] = grayData.data[i + 1] = grayData.data[i + 2] = gray;
    grayData.data[i + 3] = 255;

    const bin = gray > threshold ? 255 : 0;
    binaryData.data[i] = binaryData.data[i + 1] = binaryData.data[i + 2] = bin;
    binaryData.data[i + 3] = 255;
  }

  imageDataGray = grayData;
  ctxGray.putImageData(grayData, 0, 0);
  ctxBinary.putImageData(binaryData, 0, 0);

  updateHistogram(hist);
}

// === HISTOGRAMA ===
function updateHistogram(hist) {
  const ctx = document.getElementById("histogramChart").getContext("2d");
  if (histogramChart) histogramChart.destroy();

  histogramChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Array.from({ length: 256 }, (_, i) => i),
      datasets: [
        {
          label: "Intensidade de Pixels",
          data: hist,
          backgroundColor: "#4dd0e1",
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        x: { ticks: { color: "#aaa" } },
        y: { ticks: { color: "#aaa" } },
      },
    },
  });
}

// === SLIDER INTERATIVO ===
thresholdRange.addEventListener("input", () => {
  thresholdValue.textContent = thresholdRange.value;
  if (imageDataGray) processImage();
});
