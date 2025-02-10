// ==UserScript==
// @name         Settera Highlighter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatycznie podświetla odpowiedzi i wybiera je z losowym opóźnieniem
// @author       troll
// @match        https://www.geoguessr.com/*
// @icon         https://img.sur.ly/favicons/o/online.seterra.net.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let lastQuestionId = null;
    let scriptEnabled = false;
    let highlightEnabled = false;
    let answerTimeoutId = null;

    function getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function selectAnswer(cityId) {
        const questionElement = document.querySelector(`g[data-qa="${cityId}"]`);
        if (questionElement && !questionElement.classList.contains('map-question_answered__m2JKl')) {
            answerTimeoutId = setTimeout(() => {
                if (scriptEnabled) questionElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }, getRandomDelay(2600, 4000));
        }
    }

    function changeColor(cityId) {
        const mapElement = document.querySelector(`g[data-qa="${cityId}"] circle.hitbox-dot_dot__laacR`);
        if (mapElement) mapElement.style.fill = 'black';
    }

    function resetColor(cityId) {
        const mapElement = document.querySelector(`g[data-qa="${cityId}"] circle.hitbox-dot_dot__laacR`);
        if (mapElement) mapElement.style.fill = '';
    }

    function resetIncorrectColors(currentCityId) {
        const groups = document.querySelectorAll('g[data-qa]');
        groups.forEach(group => {
            const cityId = group.getAttribute('data-qa');
            if (cityId !== currentCityId) {
                const circle = group.querySelector('circle.hitbox-dot_dot__laacR');
                if (circle && circle.style.fill === 'black') circle.style.fill = '';
            }
        });
    }

    function checkHeader() {
        const headerElement = document.querySelector('div[data-qa="game-map-header"]');
        if (headerElement) {
            const cityId = headerElement.getAttribute('data-current-question-id');
            if (cityId && cityId !== lastQuestionId) {
                if (highlightEnabled) {
                    resetIncorrectColors(cityId);
                    changeColor(cityId);
                }
                if (scriptEnabled) selectAnswer(cityId);
                lastQuestionId = cityId;
            }
        }
    }

    function updateButtonText(button, newText) {
        const span = button.querySelector('.button_label__ERkjz');
        if (span) span.textContent = newText;
        else button.textContent = newText;
    }

    function toggleScript() {
        scriptEnabled = !scriptEnabled;
        lastQuestionId = null;
        if (scriptEnabled) checkHeader();
        else clearTimeout(answerTimeoutId);
        const button = document.querySelector('#toggleScriptButton');
        if (button) updateButtonText(button, scriptEnabled ? 'Stop' : 'Start');
    }

    function toggleHighlight() {
        highlightEnabled = !highlightEnabled;
        const button = document.querySelector('#toggleHighlightButton');
        if (button) updateButtonText(button, highlightEnabled ? 'HL off' : 'HL on');
        if (!highlightEnabled) resetIncorrectColors(null);
        lastQuestionId = null;
    }

    function createToggleButton() {
        const footer = document.querySelector('.game-footer_buttons__Zpp2N');
        if (footer) {
            if (!document.querySelector('#toggleScriptButton')) {
                const scriptButton = document.createElement('button');
                scriptButton.type = 'button';
                scriptButton.id = 'toggleScriptButton';
                scriptButton.className = 'button_button__aR6_e button_variantSecondaryInverted__6G2ex button_sizeSmall__MB_qj';
                scriptButton.innerHTML = '<div class="button_wrapper__zayJ3"><span class="button_label__ERkjz">Start</span></div>';
                scriptButton.addEventListener('click', toggleScript);
                footer.prepend(scriptButton);
            }
            if (!document.querySelector('#toggleHighlightButton')) {
                const highlightButton = document.createElement('button');
                highlightButton.type = 'button';
                highlightButton.id = 'toggleHighlightButton';
                highlightButton.className = 'button_button__aR6_e button_variantSecondaryInverted__6G2ex button_sizeSmall__MB_qj';
                highlightButton.innerHTML = '<div class="button_wrapper__zayJ3"><span class="button_label__ERkjz">HL on</span></div>';
                highlightButton.addEventListener('click', toggleHighlight);
                footer.appendChild(highlightButton);
            }
        }
    }

    function observeDomMutations() {
        const observer = new MutationObserver(() => {
            createToggleButton();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function observeHeaderChanges() {
        const headerElement = document.querySelector('div[data-qa="game-map-header"]');
        if (headerElement) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-current-question-id') checkHeader();
                });
            });
            observer.observe(headerElement, { attributes: true });
        }
    }

    createToggleButton();
    observeDomMutations();
    observeHeaderChanges();
    setInterval(checkHeader, 1);

})();
