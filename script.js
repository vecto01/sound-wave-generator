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
        const loaderContainer = document.querySelector('.loader-container');
        if (loaderContainer) {
            loaderContainer.classList.add('active');
            waveCanvas.style.opacity = '0.3';
        }
    }
    
    function hideLoader() {
        const loaderContainer = document.querySelector('.loader-container');
        if (loaderContainer) {
            loaderContainer.classList.remove('active');
            waveCanvas.style.opacity = '1';
        }
    }
    
    // Настройка Canvas
    function resizeCanvas() {
        waveCanvas.width = waveCanvas.clientWidth;
        waveCanvas.height = 300;
        drawWave();
    }
    
    // Рисуем волну
    // Рисуем волну с анимацией
    // Переменные для анимации волны
    let animationProgress = 0;
    let isAnimating = false;
    
    // Функция для анимации волны с использованием requestAnimationFrame
    function animateWave() {
        if (animationProgress < 1) {
            animationProgress += 0.02;
            drawWaveFrame();
            requestAnimationFrame(animateWave);
        } else {
            isAnimating = false;
        }
    }
    
    // Основная функция рисования волны
    function drawWave() {
        ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const centerY = waveCanvas.height / 2;
        const samples = 100;
        
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
        
        // Функция для рисования загрузочной волны
        function drawLoadingWave(canvas) {
            const ctx = canvas.getContext('2d');
            const centerY = canvas.height / 2;
            const samples = 100;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i <= samples; i++) {
                const x = (canvas.width / samples) * i;
                const progress = (i / samples) * 2 * Math.PI;
                const value = Math.sin(progress) * 0.3;
                const y = centerY + value * (canvas.height * 0.3);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        if (!isLoading) {
            // Пульсация волны
            waveCanvas.classList.add('wave-pulse');
            setTimeout(() => {
                waveCanvas.classList.remove('wave-pulse');
            }, 1000);
        }
    }
    
    // Функция для рисования одного кадра анимации
    function drawWaveFrame() {
        drawWave();
    }
    
    // Функция для запуска анимации волны
    function startWaveAnimation() {
        if (!isAnimating) {
            animationProgress = 0;
            isAnimating = true;
            requestAnimationFrame(animateWave);
        }
    }
    
    // Обновление параметров
    function updateParameters() {
        frequencyValue.textContent = frequency;
        amplitudeValue.textContent = amplitude;
        phaseValue.textContent = phase;
        drawWave();
        if (!isAnimating) {
            startWaveAnimation(); // Запускаем анимацию волны при изменении параметров
        }
    }
    
    // Управление лоудером
    function simulateLoading() {
        showLoader();
        setTimeout(() => {
            hideLoader();
            isLoading = false;
            startWaveAnimation(); // Запускаем анимацию волны
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
        // Синхронизация слайдеров и числовых инпутов
        const frequencyNumber = document.getElementById('frequencyNumber');
        const amplitudeNumber = document.getElementById('amplitudeNumber');
        const phaseNumber = document.getElementById('phaseNumber');
        
        // Обновление слайдера при изменении числового инпута
        frequencyNumber.addEventListener('input', (e) => {
            frequency = parseFloat(e.target.value);
            frequencySlider.value = frequency;
            updateParameters();
            if (isPlaying) {
                oscillator.frequency.value = frequency;
            }
        });
        
        amplitudeNumber.addEventListener('input', (e) => {
            amplitude = parseFloat(e.target.value);
            amplitudeSlider.value = amplitude;
            updateParameters();
            if (isPlaying) {
                gainNode.gain.value = amplitude;
            }
        });
        
        phaseNumber.addEventListener('input', (e) => {
            phase = parseFloat(e.target.value);
            phaseSlider.value = phase;
            updateParameters();
        });
        
        // Обновление числового инпута при изменении слайдера
        frequencySlider.addEventListener('input', (e) => {
            frequency = parseFloat(e.target.value);
            frequencyNumber.value = frequency;
            updateParameters();
            if (isPlaying) {
                oscillator.frequency.value = frequency;
            }
        });
        
        amplitudeSlider.addEventListener('input', (e) => {
            amplitude = parseFloat(e.target.value);
            amplitudeNumber.value = amplitude;
            updateParameters();
            if (isPlaying) {
                gainNode.gain.value = amplitude;
            }
        });
        
        phaseSlider.addEventListener('input', (e) => {
            phase = parseFloat(e.target.value);
            phaseNumber.value = phase;
            updateParameters();
        });

        // Добавление градиентного следа при движении слайдеров
        function addSliderTrail(slider) {
            slider.addEventListener('mousedown', () => {
                slider.classList.add('active-slider');
            });
            
            slider.addEventListener('mouseup', () => {
                slider.classList.remove('active-slider');
            });
            
            slider.addEventListener('mouseleave', () => {
                slider.classList.remove('active-slider');
            });
        }
        
        // Применяем эффект ко всем слайдерам
        addSliderTrail(frequencySlider);
        addSliderTrail(amplitudeSlider);
        addSliderTrail(phaseSlider);
        
        playPauseButton.addEventListener('click', () => {
            if (isPlaying) {
                pauseSound();
            } else {
                playSound();
            }
        });
        
        themeToggle.addEventListener('click', toggleTheme);
        
        // Добавление эффекта пульсации для кнопок
        playPauseButton.classList.add('pulse-on-hover');
        exportAudioButton.classList.add('pulse-on-hover');
        exportImageButton.classList.add('pulse-on-hover');
        
        // Ресайз Canvas
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // Добавление эффекта пульсации для кнопок
        playPauseButton.classList.add('pulse-on-hover');
        exportAudioButton.classList.add('pulse-on-hover');
        exportImageButton.classList.add('pulse-on-hover');
    }
    
    // Функция для показа сообщения об успехе
    function showSuccessMessage(message = 'Генерация завершена!') {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `<p>${message}</p><button id="close-message">Закрыть</button>`;
        document.body.appendChild(successMessage);
        
        // Запускаем анимацию
        setTimeout(() => {
            successMessage.style.animation = 'fadeIn 0.5s ease forwards';
        }, 10);
        
        // Закрытие сообщения по клику на кнопку
        const closeButton = document.getElementById('close-message');
        closeButton.addEventListener('click', () => {
            successMessage.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                successMessage.remove();
            }, 300);
        });
        
        // Удаляем сообщение после 5 секунд, если не закрыто вручную
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    successMessage.remove();
                }, 300);
            }
        }, 5000);
    }
    
    // Функция для анимации появления элементов
    function showElements() {
        const elements = document.querySelectorAll('.wave-visualizer, .controls, .audio-controls');
        elements.forEach(el => {
            el.classList.add('visible');
        });
    }
    
    // Функция для анимации прогресс-бара
    function animateProgressBar() {
        const progressBar = document.querySelector('.progress-bar::after');
        if (progressBar) {
            progressBar.style.animation = 'none';
            setTimeout(() => {
                progressBar.style.animation = 'progress-fill 1.5s ease-in forwards';
            }, 10);
        }
    }
    
    // Обновляем функцию simulateLoading для задержки появления элементов
    function simulateLoading() {
        showLoader();
        animateProgressBar();
        setTimeout(() => {
            hideLoader();
            isLoading = false;
            drawWave();
            
            // Задержка перед появлением элементов
            setTimeout(showElements, 500);
            
            // Показать сообщение об успехе
            showSuccessMessage();
        }, 1500); // Симуляция загрузки
    }
    
    // Запуск
    init();

    // Экспорт аудио
    const exportAudioButton = document.getElementById('exportAudio');
    exportAudioButton.addEventListener('click', () => {
        const sound = new Howl({
            src: ['https://assets.mixkit.co/sfx/preview/mixkit-clear-water-dripping-1225.mp3'],
            onplay: function() {
                showSuccessMessage('Аудио успешно экспортировано!');
            }
        });
        sound.play();
        
        // В реальном приложении можно использовать Web Audio API для записи звука
        // и сохранения его в формате WAV или MP3.
        // Для простоты пока отображаем сообщение.
    });
    
    // Экспорт изображения волны
    const exportImageButton = document.getElementById('exportImage');
    exportImageButton.addEventListener('click', () => {
        const visualizer = document.querySelector('.wave-visualizer');
        const loader = document.getElementById('loader');
        
        // Показать лоудер
        showLoader();
        
        html2canvas(visualizer, {
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'wave-visualization.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Скрыть лоудер и показать сообщение об успехе
            hideLoader();
            showSuccessMessage('Изображение волны успешно экспортировано!');
        });
    });
});