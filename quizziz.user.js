// ==UserScript==
// @name         Quizizz Highlighter
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Podświetla poprawne odpowiedzi na Quizizz
// @match        https://quizizz.com/*
// @icon         https://cf.quizizz.com/img/favicon/apple-touch-icon.png
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    let cachedAnswerKey = GM_getValue('answerKey', null);
    let highlightEnabled = GM_getValue('highlightEnabled', true);
    let questionObserver = null;

    function createMenuCommands() {
        GM_unregisterMenuCommand("Wyczyść Pamięć Cache");
        GM_unregisterMenuCommand("Wklej Klucz JSON");
        GM_unregisterMenuCommand("Wyłącz Podświetlanie");
        GM_unregisterMenuCommand("Włącz Podświetlanie");

        if (cachedAnswerKey) {
            GM_registerMenuCommand("Wyczyść Pamięć Cache", () => {
                GM_setValue('answerKey', null);
                cachedAnswerKey = null;
                highlightEnabled = false;
                GM_setValue('highlightEnabled', highlightEnabled);
                createMenuCommands();
                clearHighlightedAnswers();
            });

            GM_registerMenuCommand(highlightEnabled ? "Wyłącz Podświetlanie" : "Włącz Podświetlanie", () => {
                highlightEnabled = !highlightEnabled;
                GM_setValue('highlightEnabled', highlightEnabled);
                createMenuCommands();
                if (!highlightEnabled) {
                    clearHighlightedAnswers();
                    if (questionObserver) {
                        questionObserver.disconnect();
                        questionObserver = null;
                    }
                } else {
                    startListeningForQuestions();
                    highlightAnswers();
                }
            });
        } else {
            GM_registerMenuCommand("Wklej Klucz JSON", () => {
                setTimeout(() => {
                    const key = prompt("Wklej tutaj swój klucz JSON:");
                    if (key) {
                        try {
                            cachedAnswerKey = JSON.parse(key);
                            GM_setValue('answerKey', cachedAnswerKey);
                            highlightEnabled = true;
                            GM_setValue('highlightEnabled', highlightEnabled);
                            startListeningForQuestions();
                            highlightAnswers();
                            createMenuCommands();
                        } catch (e) {
                            alert("Nieprawidłowy format JSON");
                        }
                    }
                }, 0);
            });
        }
    }

    createMenuCommands();

    function clearHighlightedAnswers() {
        document.querySelectorAll('button[data-cy^="option-"] div').forEach(paragraph => {
            paragraph.style.color = "";
            paragraph.style.fontWeight = "";
        });
    }

    function startListeningForQuestions() {
        if (questionObserver) {
            questionObserver.disconnect();
        }

        questionObserver = new MutationObserver(async () => {
            if (highlightEnabled) {
                await highlightAnswers();
            }
        });

        questionObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function normalizeText(text) {
        return (text || "No question specified")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/[.,;!?]/g, '')
            .replace(/^\d+\.\s*/, '')
            .replace(/^\d+\s*/, '')
            .replace(/\s+\d+\\s*$/, '');
    }

    async function highlightAnswers() {
        if (!highlightEnabled || !cachedAnswerKey) return;

        const questionText = normalizeText(document.querySelector('[data-testid="question-container-text"]')?.innerText || "");
        const matchingQuestions = cachedAnswerKey.filter(item => normalizeText(item.question) === questionText);

        if (matchingQuestions.length === 0) return;

        const inputs = document.querySelectorAll('input[data-cy^="box"]');
        if (inputs.length) {
            const answer = matchingQuestions[0].answers[0];
            if (answer) {
                [...answer].forEach((char, index) => {
                    if (inputs[index]) {
                        inputs[index].value = char;
                        const event = new Event('input', { bubbles: true });
                        inputs[index].dispatchEvent(event);
                    }
                });
            }
        } else {
            document.querySelectorAll('button[data-cy^="option-"]').forEach(option => {
                const paragraphs = option.querySelectorAll('div');
                paragraphs.forEach(paragraph => {
                    const paragraphText = normalizeText(paragraph.innerText);
                    const isCorrect = matchingQuestions.some(question => question.answers.some(answer => normalizeText(answer) === paragraphText));
                    if (isCorrect) {
                        paragraph.style.color = "#ddffdd";
                        paragraph.style.fontWeight = "bold";
                    }
                });
            });
        }
    }

    window.addEventListener('load', startListeningForQuestions);
})();
