function HotSwap(hotSwapStartCallback, executeContentSwapCallback) {

    this.init = function() {
        document.addEventListener('click', this.onHotSwapClick.bind(this));
        window.addEventListener('popstate', this.onHotSwapStateChange.bind(this));
        if (!window.location.origin) {
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
        }
    };

    this.onHotSwapClick = function(evt) {
        var node = evt.target;
        do {
            if (node === null || node.nodeName.toLowerCase() === 'a') {
                break;
            }
            node = node.parentNode;
        } while (node);
        if (node && node.href && this.isSameOriginCurrentPage(node.href) && !this.isHrefCurrentPage(node.href)) {
            // eseguo lo hot swapping solo se l'url ha la stessa origin della pagina attuale ma non è esattamente la stessa pagina
            evt.preventDefault();
            this.hotSwapUrl(node.href);
        }
    };

    this.hotSwapUrl = function(url) {
        var state = {
            scrollY: window.scrollY
        };

        window.history.replaceState(state, null, window.location.href);
        window.history.pushState(null, null, url);
        return this.onHotSwapStateChange();
    };

    this.onHotSwapStateChange = function(popStateEvt) {
        Promise.all([
            this.hotSwapLoadNewPath(popStateEvt),
            hotSwapStartCallback(),
        ]).then(function(results) {
            this.onHotSwapLoadSuccess(results[0], popStateEvt);
        }.bind(this));
    };

    this.hotSwapLoadNewPath = function(popStateEvt) {
        return new Promise(function (resolve, reject) {
            var path = window.location.pathname + window.location.search;
            var request = new XMLHttpRequest();
            request.responseType = 'document';
            request.onload = function(newPathRequestEvt) {
                resolve(newPathRequestEvt);
            };
            request.onerror = reject;
            request.open('get', path);
            request.send();
        });
    };

    this.onHotSwapLoadSuccess = function(newPathRequestEvt, popStateEvt) {
        var newContent = newPathRequestEvt.target.response;
        executeContentSwapCallback(newContent).then(function() {
            if (popStateEvt && popStateEvt.state) {
                window.scrollTo(0, popStateEvt.state.scrollY);
            } else if(this.hasUrlHashParameter(window.location.href)) {
                var element = document.getElementById(this.getUrlHashParameter(window.location.href).substr(1));
                window.scrollTo(0, element.offsetTop);
            } else {
                window.scrollTo(0, 0);
            }
        }.bind(this));
    };

    this.getUrlNoParameters = function(href) {
        var cleanHref = href;
        var firstQuestionMarkOccurrence = href.indexOf("?");
        var firstHastagOccurrence = href.indexOf("#");
        var firstParameterOccurrence = -1;
        if(firstQuestionMarkOccurrence > 0 || firstHastagOccurrence > 0) {
            if(firstQuestionMarkOccurrence > 0 && firstHastagOccurrence < 0) {
                firstParameterOccurrence = firstQuestionMarkOccurrence;
            } else if(firstQuestionMarkOccurrence < 0 && firstHastagOccurrence > 0) {
                firstParameterOccurrence = firstHastagOccurrence;
            } else {
                firstParameterOccurrence = Math.min(firstQuestionMarkOccurrence, firstHastagOccurrence);
            }
            cleanHref = cleanHref.substr(0, firstParameterOccurrence);
        }
        return cleanHref;
    };

    this.isHrefCurrentPage = function(href) {
        var currentLocation = this.getUrlNoParameters(window.location.href);
        var hrefLocation = this.getUrlNoParameters(href);
        return currentLocation == hrefLocation;
    };

    this.isSameOriginCurrentPage = function(href) {
        return href.indexOf(window.location.origin) === 0;
    };

    this.hasUrlHashParameter = function(href) {
        return href.indexOf("#") > 0;
    };

    this.getUrlHashParameter = function(href) {
        return href.substr(href.indexOf("#"));
    };
}