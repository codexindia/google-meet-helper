document.getElementById('save').addEventListener('click', () => {
  const notes = document.getElementById('notes').value;
  chrome.storage.sync.set({ notes }, () => {
    console.log('Notes saved.');
  });
});

function checkPing() {
  const startTime = Date.now();
  fetch('https://meet.google.com')
    .then(() => {
      const endTime = Date.now();
      const ping = endTime - startTime;
      document.getElementById('ping-result').textContent = `Ping: ${ping} ms`;
    })
    .catch(() => {
      document.getElementById('ping-result').textContent = 'Failed to check ping.';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['notes'], (data) => {
    document.getElementById('notes').value = data.notes || '';
  });

  // Check ping every 1-2 seconds
  setInterval(checkPing, 1500);

  // Drawing tool
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;

  canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  });

  canvas.addEventListener('mouseup', () => {
    drawing = false;
  });

  canvas.addEventListener('mouseout', () => {
    drawing = false;
  });

  document.getElementById('clear-canvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Voice recording
  let mediaRecorder;
  let audioChunks = [];

  document.getElementById('start-recording').addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      console.log('Recording started');

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = document.getElementById('audio-playback');
        audio.src = audioUrl;
        audioChunks = [];
        console.log('Recording stopped and audio saved');
      };

      document.getElementById('start-recording').disabled = true;
      document.getElementById('stop-recording').disabled = false;
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  });

  document.getElementById('stop-recording').addEventListener('click', () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      document.getElementById('start-recording').disabled = false;
      document.getElementById('stop-recording').disabled = true;
    }
  });
});