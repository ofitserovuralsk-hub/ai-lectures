// Universal Copy Prompt Function (с поддержкой двуязычия)
function copyPrompt(button) {
    const container = button.closest('.prompt-box') || button.closest('.prompt-card') || button.parentElement;
    const promptCodeElement = container.querySelector('.prompt-code') || container.querySelector('code') || container;
    
    let promptText = promptCodeElement.innerText;
    promptText = promptText.replace(/ПРОМПТ:|Копировать промпт|Промптты көшіру|Көшіру|✓ Скопировано!|✓ Көшірілді!/g, '').trim();

    const currentLang = localStorage.getItem('portal_lang') || 'kk';
    const successMsg = currentLang === 'ru' ? '✓ Скопировано!' : '✓ Көшірілді!';

    navigator.clipboard.writeText(promptText).then(() => {
        const originalText = button.innerText;
        button.innerText = successMsg;
        button.classList.add('bg-teal-500', 'text-white');
        
        setTimeout(() => {
            button.innerText = originalText;
            button.classList.remove('bg-teal-500', 'text-white');
        }, 2000);
    }).catch(err => {
        console.error('Ошибка при копировании: ', err);
    });
}

// Система переключения языков (KK / RU) — по умолчанию KK
function setLanguage(lang) {
    localStorage.setItem('portal_lang', lang);
    document.body.setAttribute('data-lang', lang);
    document.documentElement.lang = lang;

    const btnKk = document.getElementById('btn-lang-kk');
    const btnRu = document.getElementById('btn-lang-ru');

    if (btnKk && btnRu) {
        if (lang === 'ru') {
            btnRu.className = "px-3 py-1 rounded-lg transition-all text-indigo-950 bg-amber-400 font-bold shadow";
            btnKk.className = "px-3 py-1 rounded-lg transition-all text-indigo-200 hover:text-white";
        } else {
            btnKk.className = "px-3 py-1 rounded-lg transition-all text-indigo-950 bg-amber-400 font-bold shadow";
            btnRu.className = "px-3 py-1 rounded-lg transition-all text-indigo-200 hover:text-white";
        }
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = lang === 'ru' ? "Поиск по лекциям..." : "Дәрістер бойынша іздеу...";
    }

    // Событие для обновления графиков Chart.js
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

// Инициализация при загрузке страницы (приоритет ҚАЗ)
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('portal_lang') || 'kk';
    setLanguage(savedLang);
});