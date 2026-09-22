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

// Прокрутка к позиции. Плавно — только если пользователь не просил
// уменьшить анимацию. Страховка: если через 400 мс страница не сдвинулась
// (встроенные браузеры и вебвью иногда игнорируют behavior:'smooth'),
// доезжаем мгновенно, чтобы кнопка не выглядела сломанной.
function scrollToY(y, smooth) {
    const target = Math.max(0, Math.round(y));
    const reduced = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const useSmooth = smooth && !reduced;

    const before = window.pageYOffset;
    window.scrollTo({ top: target, behavior: useSmooth ? 'smooth' : 'auto' });

    if (!useSmooth) return;
    setTimeout(() => {
        if (Math.abs(window.pageYOffset - before) < 2 && Math.abs(before - target) >= 2) {
            window.scrollTo(0, target);
        }
    }, 400);
}

// Переход к якорю с поправкой на липкую шапку.
// Шапка объявлена sticky top-0, поэтому обычный переход по #hash прячет
// начало блока под ней. Высоту считаем на лету — она разная на телефоне и десктопе.
function scrollToAnchor(hash, smooth) {
    if (!hash || hash === '#') return false;
    let target;
    try {
        target = document.querySelector(hash);
    } catch (e) {
        return false;
    }
    if (!target) return false;

    const header = document.querySelector('header');
    const offset = (header ? header.getBoundingClientRect().height : 0) + 12;
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;

    scrollToY(y, smooth);
    return true;
}

// Плавающая кнопка «наверх». Подключается сама на любой странице,
// где есть <button id="backToTop" class="back-to-top">.
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const sync = () => {
        btn.classList.toggle('is-visible', window.pageYOffset > 400);
        const lang = localStorage.getItem('portal_lang') || 'kk';
        btn.setAttribute('aria-label', lang === 'ru' ? 'Наверх' : 'Жоғары');
    };

    btn.addEventListener('click', () => scrollToY(0, true));
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('languageChanged', sync);
    sync();
}

// Инициализация при загрузке страницы (приоритет ҚАЗ)
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('portal_lang') || 'kk';
    setLanguage(savedLang);
    initBackToTop();

    // Клик по ссылке на якорь текущей страницы — плавно и с поправкой на шапку
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="#"]');
        if (!link) return;
        const url = new URL(link.href, window.location.href);
        if (url.pathname !== window.location.pathname || url.origin !== window.location.origin) return;
        if (scrollToAnchor(url.hash, true)) {
            e.preventDefault();
            history.replaceState(null, '', url.hash);
        }
    });

    // Переход с якорем с другой страницы: ждём отрисовку, иначе высота шапки считается неверно
    if (window.location.hash) {
        requestAnimationFrame(() => scrollToAnchor(window.location.hash, false));
    }
});