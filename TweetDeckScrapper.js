
// ==UserScript==
// @name         TweetDeckScrapper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Scrap and send tweets
// @author       Artur Augustyniak <artur@aaugustyniak.pl>
// @match        https://tweetdeck.twitter.com/
// @grant        none
// ==/UserScript==


var targetUrl = window.localStorage.getItem('target_url');
if (!targetUrl) {
    targetUrl = prompt("Please enter your target url");
    window.localStorage.setItem('target_url', targetUrl);
}

var apiKey = window.localStorage.getItem('target_api_key');
if (!apiKey) {
    apiKey = prompt("Please enter your target api key");
    window.localStorage.setItem('target_api_key', apiKey);
}

let scanIntervalMs = 120000;

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

var intervalID = setInterval(function () {

    const tweetsCols = document.getElementsByClassName("js-chirp-container");

    console.log(tweetsCols);
    Array.prototype.forEach.call(tweetsCols, function (tweetsColumn) {
        Array.prototype.forEach.call(tweetsColumn.children, function (tweet) {
            let creationTime = tweet.querySelector("header time").dateTime;
            let author = tweet.querySelector("header a").href;
            let tweetUrl = tweet.querySelector("header time a").href;
            let tweetText = tweet.querySelector("div.tweet-body").innerText;
            let tweetImgs = tweet.querySelectorAll("a.js-media-image-link")
            let tweetImgUrls = new Array()
            Array.prototype.forEach.call(tweetImgs, function (tweetImg) {
                tweetImgUrls.push(tweetImg.style.backgroundImage.slice(5).slice(0, -2).split("?")[0].slice(0, -4) + "?format=jpg&name=large")

            });
            digestMessage(tweetText)
                .then(digestHex => {
                    let data = {
                        "sha256": digestHex,
                        "bytes_b64": utf8_to_b64(tweetText),
                        "mimetype": "text/plain",
                        "source_url": tweetUrl,
                        "status": "new",
                        "tags": [
                            "tweet",
                            "scrapped",
                            "tweetdeck",
                        ],
                        "tweet_author": author,
                        "tweet_creation_time": creationTime,
                        "tweet_image_urls": tweetImgUrls
                    };

                    fetch(targetUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-API-Key': apiKey
                        },
                        body: JSON.stringify(data),
                    }).then(response => response.json())
                        .then(data => {
                            console.log('TweetDeckScrapper POST Success:', data);
                            console.log("TweetdeckScrapper done tweet call for " + tweetUrl, new Date());
                        })
                        .catch((error) => {
                            console.error('TweetDeckScrapper POST Error:', error);
                            console.log("TweetDeckScrapper done tweet scrap for " + tweetUrl, new Date());
                        });

                });
        });

    });
}, scanIntervalMs);
console.log("TweetdeckScrapper enabled with interval id " + intervalID);
