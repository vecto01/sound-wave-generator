// Основной скрипт для генератора звуковых волн

// Конфигурация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const waveCanvas = document.getElementById('waveCanvas');
    const loader = document.getElementById('loader');
    const waveTypeSelect = document.getElementById('waveType');
    const frequencySlider = document.getElementById('frequency');
    const amplitudeSlider = document.getElementById('amplitude');
    const phaseSlider = document.getElementById('phase');
    const frequencyValue = document.getElementById('frequencyValue');
    const amplitudeValue = document.getElementById('amplitudeValue');
    const phaseValue = document.getElementById('phaseValue');
    const playPauseButton = document.getElementById('playPause');
    const themeToggle = document.getElementById('theme-toggle');

    // Контекст Canvas
    const ctx = waveCanvas.getContext('2d');
    
    // Параметры волны
    let waveType = 'sine';
    let frequency = 440;
    let amplitude = 0.5;
    let phase = 0;
    let isPlaying = false;
    let isLoading = true;
    
    // Аудио контекст
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = null;
    let gainNode = audioCtx.createGain();
    
    // Функция для показа/скрытия лоудера
    function showLoader() {
        loader.style.opacity = '1';
        waveCanvas.style.opacity = '0.3';
    }
    
    function hideLoader() {
        loader.style.opacity = '0';
        waveCanvas.style.opacity = '1';
    }
    
    // Настройка Canvas
    function resizeCanvas() {
        waveCanvas.width = waveCanvas.clientWidth;
        waveCanvas.height = 300;
        drawWave();
    }
    
    // Рисуем волну
    // Рисуем волну с анимацией
    function drawWave() {
        ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const centerY = waveCanvas.height / 2;
        const samples = 100;
        
        // Анимация появления волны
        const animationProgress = Math.min(1, Date.now() * 0.002);
        
        for (let i = 0; i <= samples; i++) {
            const x = (waveCanvas.width / samples) * i;
            let y = centerY;
            
            // Рассчитываем значение волны
            const progress = (i / samples) * 2 * Math.PI;
            let value = 0;
            
            switch (waveType) {
                case 'sine':
                    value = Math.sin(progress + (phase * Math.PI / 180)) * amplitude;
                    break;
                case 'triangle':
                    value = (2 * Math.abs(2 * ((progress + (phase * Math.PI / 180)) % (2 * Math.PI)) - Math.PI) - 1) * amplitude;
                    break;
                case 'sawtooth':
                    value = (2 * ((progress + (phase * Math.PI / 180)) % (2 * Math.PI)) - 1) * amplitude;
                    break;
                case 'noise':
                    value = (Math.random() - 0.5) * amplitude;
                    break;
            }
            
            // Анимация появления волны
            y += value * (waveCanvas.height * 0.4 * animationProgress);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Обратная связь при изменении параметров
        if (!isLoading) {
            frequencySlider.style.transform = 'scale(1.05)';
            amplitudeSlider.style.transform = 'scale(1.05)';
            phaseSlider.style.transform = 'scale(1.05)';
            setTimeout(() => {
                frequencySlider.style.transform = 'scale(1)';
                amplitudeSlider.style.transform = 'scale(1)';
                phaseSlider.style.transform = 'scale(1)';
            }, 100);
        }
    }
    
    // Обновление параметров
    function updateParameters() {
        frequencyValue.textContent = frequency;
        amplitudeValue.textContent = amplitude;
        phaseValue.textContent = phase;
        drawWave();
    }
    
    // Управление лоудером
    function simulateLoading() {
        showLoader();
        setTimeout(() => {
            hideLoader();
            isLoading = false;
            drawWave();
        }, 1500); // Симуляция загрузки
    }
    
    // Управление аудио
    function playSound() {
        if (oscillator) {
            oscillator.stop();
        }
        
        oscillator = audioCtx.createOscillator();
        oscillator.type = waveType;
        oscillator.frequency.value = frequency;
        
        oscillator.connect(gainNode);
        gainNode.gain.value = amplitude;
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        isPlaying = true;
        playPauseButton.textContent = 'Pause';
    }
    
    function pauseSound() {
        if (oscillator) {
            oscillator.stop();
            isPlaying = false;
            playPauseButton.textContent = 'Play';
        }
    }
    
    // Переключение тем
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }
    
    // Инициализация
    function init() {
        // Загрузка сохранённой темы
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        // Симуляция загрузки
        simulateLoading();
        
        // Установка обработчиков событий
        waveTypeSelect.addEventListener('change', (e) => {
            waveType = e.target.value;
            updateParameters();
        });
        
        frequencySlider.addEventListener('input', (e) => {
            frequency = parseFloat(e.target.value);
            updateParameters();
            if (isPlaying) {
                oscillator.frequency.value = frequency;
            }
        });
        
        amplitudeSlider.addEventListener('input', (e) => {
            amplitude = parseFloat(e.target.value);
            updateParameters();
            if (isPlaying) {
                gainNode.gain.value = amplitude;
            }
        });
        
        phaseSlider.addEventListener('input', (e) => {
            phase = parseFloat(e.target.value);
            updateParameters();
        });
        
        playPauseButton.addEventListener('click', () => {
            if (isPlaying) {
                pauseSound();
            } else {
                playSound();
            }
        });
        
        themeToggle.addEventListener('click', toggleTheme);
        
        // Ресайз Canvas
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }
    
    // Запуск
    init();
});