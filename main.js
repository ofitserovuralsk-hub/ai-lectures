// Функция копирования текста в буфер обмена
function copyPrompt(button) {
    // Находим блок с промптом (соседний элемент или внутри контейнера)
    const container = button.closest('.prompt-card') || button.parentElement;
    const promptText = container.querySelector('.prompt-code').innerText;

    navigator.clipboard.writeText(promptText).then(() => {
        const originalText = button.innerText;
        button.innerText = '✓ Скопировано!';
        button.classList.add('bg-teal-600', 'text-white');
        
        setTimeout(() => {
            button.innerText = originalText;
            button.classList.remove('bg-teal-600', 'text-white');
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования: ', err);
    });
}