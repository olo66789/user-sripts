// ==UserScript==
// @name         Przewijanie wideo o 10s voe.sx
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Dodaje strzałki do przewijania wideo o 10s w lewym górnym rogu z przyciskiem do ukrywania, domyślnie ukryte
// @author       CoddingNigga
// @match        https://jilliandescribecompany.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.left = '10px';
    container.style.zIndex = '9999';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.color = 'white';
    container.style.padding = '5px 10px';
    container.style.borderRadius = '5px';
    container.style.fontSize = '30px';
    container.style.cursor = 'pointer';
    container.style.userSelect = 'none';
    container.style.display = 'flex';
    container.style.gap = '50px';
    container.innerHTML = '<span class="arrow left">←</span><span class="arrow right">→</span><span class="toggle">+</span>'; // ← dla tyłu, → dla przodu, + dla ukrywania

    function seekVideo(seconds) {
        const video = document.querySelector('video');
        if (video && !isNaN(video.duration)) {
            video.currentTime += seconds;
        }
    }

    let arrowsVisible = false;

    container.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('arrow') && arrowsVisible) {
            if (target.classList.contains('left')) {
                seekVideo(-10);
            } else if (target.classList.contains('right')) {
                seekVideo(10);
            }
        } else if (target.classList.contains('toggle')) {
            arrowsVisible = !arrowsVisible;
            const arrows = container.querySelectorAll('.arrow');
            const toggle = container.querySelector('.toggle');
            if (arrowsVisible) {
                arrows.forEach(arrow => {
                    arrow.style.display = 'inline';
                    arrow.style.opacity = '0.5';
                });
                toggle.style.opacity = '0.5';
                container.style.opacity = '0.5';
            } else {
                arrows.forEach(arrow => {
                    arrow.style.display = 'none';
                });
                toggle.style.opacity = '0';
                container.style.opacity = '0';
            }
        }
    });

    container.style.opacity = '0';
    container.querySelectorAll('.arrow').forEach(arrow => {
        arrow.style.display = 'none';
    });
    container.querySelector('.toggle').style.opacity = '0';

    document.body.appendChild(container);

    const video = document.querySelector('video');
    if (video) {
        const observer = new MutationObserver(() => {
            if (document.visibilityState === 'hidden' || !video.paused) {
                container.style.opacity = arrowsVisible ? '0.5' : '0';
            } else {
                container.style.opacity = arrowsVisible ? '0.5' : '0';
            }
        });
        observer.observe(document, { subtree: true, childList: true });
    }
})();