// ==UserScript==
// @name         Filman.cc Layout Fix
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Hides ads and adjusts layout on filman.cc
// @author       CoddingNigga
// @match        https://filman.cc/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    const adLink = document.querySelector('a[href="https://filman.cc/cancerfighters.php"]');
    if (adLink) {
        adLink.style.display = 'none';
    }
    const alertDiv = document.querySelector('div.alert.alert-info');
    if (alertDiv) {
        alertDiv.style.display = 'none';
    }
    const kamBanPlayer = document.querySelector('#kam-ban-player');
    if (kamBanPlayer) {
        kamBanPlayer.style.display = 'none';
    }
    const frameDiv = document.querySelector('#frame');
    if (frameDiv) {
        frameDiv.style.display = 'block';
    }
    if (window.matchMedia("(max-width: 767px)").matches) {
        const posterDiv = document.querySelector('div#single-poster');
        if (posterDiv) {
            posterDiv.style.display = 'none';
        }
        const infoDiv = document.querySelector('div.col-sm-offset-3.col-sm-9');
        if (infoDiv) {
            infoDiv.classList.remove('col-sm-offset-3', 'col-sm-9');
            infoDiv.classList.add('col-sm-12');
        }
    }
    GM_addStyle(`
        div.col-sm-12 {
            margin-top: 50px !important;
        }
        #frame {
            display: block !important;
        }
        #player-container {
            min-height: 0 !important;
        }
    `);
})();