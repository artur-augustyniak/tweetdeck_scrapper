TweetDeckScrapper
------------------

If Twitter banned you from obtaining any kind of their api key, because WTF(?)

- Set up junk twitter account and junk browser instance (we will deactivate CSP)
- Login to https://tweetdeck.twitter.com/
- Set up your sources search columns etc
- Deactivate CSP in your browser (I use chrome and https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden)
- Tweak TweetDeckScrapper.js for your needs (i use api key at my backend)
- Run TweetDeckScrapper.js, you can runt it from devtools console, I use tampermonkey

Your server need to send proper Access-Control-Allow-Origin: * or Access-Control-Allow-Origin: https://tweetdeck.twitter.com/


