// ==UserScript==
// @name         Filman.cc ADblock+
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Usuwa banery reklamowe, powiadomienia premium, sekcję komentarzy, przyciski dodawania odcinków, ustala max-height na none dla link-list, przesuwa pasek wyszukiwania 15px niżej na mobilkach, przekierowuje do odtwarzacza, umożliwia kliknięcie w nazwę serialu do strony serialu. Ukrywa single-poster na mobilkach (<768px).
// @author       Olo
// @match        https://filman.cc/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function bypassBannersAndComments() {
        const banner1 = document.getElementById('kam-ban-player');
        if (banner1) {
            banner1.style.display = 'none';
        }

        const banner2 = document.querySelector('center > a[href="https://filman.cc/cancerfighters.php"]');
        if (banner2) {
            banner2.parentElement.style.display = 'none';
        }

        const premiumSections = document.querySelectorAll('.col-sm-12, .col-sm-6');
        premiumSections.forEach(section => {
            if (section.querySelector('.alert.alert-danger, .alert.alert-info')) {
                section.style.display = 'none';
            }
        });

        const commentRules = document.querySelector('.alert.alert-info');
        if (commentRules) {
            commentRules.style.display = 'none';
        }

        const fbComments = document.querySelector('.fb-comments');
        if (fbComments) {
            fbComments.parentElement.style.display = 'none';
        }

        const addEpisodeButton = document.querySelector('a[href*="dodaj-odcinek"]');
        if (addEpisodeButton) {
            addEpisodeButton.parentElement.style.display = 'none';
        }

        const addEpisodesButton = document.querySelector('a[href*="dodaj-odcinki"]');
        if (addEpisodesButton) {
            addEpisodesButton.parentElement.style.display = 'none';
        }

        const linkList = document.getElementById('link-list');
        if (linkList) {
            linkList.style.maxHeight = 'none';
        }

        const playerButton = document.querySelector('#frame a.btn.btn-primary.btn-sm');
        if (playerButton) {
            window.location.href = playerButton.href;
        }

        const posterLink = document.querySelector('#single-poster a');
        const title = document.querySelector('.col-sm-offset-3.col-sm-9 h2');
        if (posterLink && title) {
            const href = posterLink.getAttribute('href');
            title.style.cursor = 'pointer';
            title.addEventListener('click', () => {
                window.location.href = href;
            });
        }

        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                #single-poster {
                    display: none !important;
                }
                .col-sm-12 form[action="https://filman.cc/item"] {
                    margin-top: 50px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    window.addEventListener('load', bypassBannersAndComments);
})();