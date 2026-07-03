"use strict";

exports.last = function(a) {
    return a[a.length - 1];
};


/** @param {string} string */
exports.stringReverse = function(string) {
    return string.split("").reverse().join("");
};

exports.stringRepeat = function (string, count) {
    var result = '';
    while (count > 0) {
        if (count & 1)
            result += string;

        if (count >>= 1)
            string += string;
    }
    return result;
};

var trimBeginRegexp = /^\s\s*/;
var trimEndRegexp = /\s\s*$/;

exports.stringTrimLeft = function (string) {
    return string.replace(trimBeginRegexp, '');
};

exports.stringTrimRight = function (string) {
    return string.replace(trimEndRegexp, '');
};
/**
 * @template T
 * @param {T} obj
 * @return {T}
 */
exports.copyObject = function(obj) {
    /** @type Object*/
    var copy = {};
    for (var key in obj) {
        copy[key] = obj[key];
    }
    return copy;
};

exports.copyArray = function(array){
    var copy = [];
    for (var i=0, l=array.length; i<l; i++) {
        if (array[i] && typeof array[i] == "object")
            copy[i] = this.copyObject(array[i]);
        else
            copy[i] = array[i];
    }
    return copy;
};

exports.deepCopy = require("./deep_copy").deepCopy;

exports.arrayToMap = function(arr) {
    var map = {};
    for (var i=0; i<arr.length; i++) {
        map[arr[i]] = 1;
    }
    return map;

};

exports.createMap = function(props) {
    var map = Object.create(null);
    for (var i in props) {
        map[i] = props[i];
    }
    return map;
};

/*
 * splice out of 'array' anything that === 'value'
 */
exports.arrayRemove = function(array, value) {
  for (var i = 0; i <= array.length; i++) {
    if (value === array[i]) {
      array.splice(i, 1);
    }
  }
};

exports.escapeRegExp = function(str) {
    return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
};

exports.escapeHTML = function(str) {
    return ("" + str).replace(/&/g, "&#38;").replace(/"/g, "&#34;").replace(/'/g, "&#39;").replace(/</g, "&#60;");
};

exports.getMatchOffsets = function(string, regExp) {
    var matches = [];

    string.replace(regExp, function(str) {
        matches.push({
            offset: arguments[arguments.length-2],
            length: str.length
        });
    });

    return matches;
};

/* deprecated */
exports.deferredCall = function(fcn) {
    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };

    var deferred = function(timeout) {
        deferred.cancel();
        timer = setTimeout(callback, timeout || 0);
        return deferred;
    };

    deferred.schedule = deferred;

    deferred.call = function() {
        this.cancel();
        fcn();
        return deferred;
    };

    deferred.cancel = function() {
        clearTimeout(timer);
        timer = null;
        return deferred;
    };

    deferred.isPending = function() {
        return timer;
    };

    return deferred;
};

/**
 * @param {number} [defaultTimeout]
 */
exports.delayedCall = function(fcn, defaultTimeout) {
    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };
    /**
     * @param {number} [timeout]
     */
    var _self = function(timeout) {
        if (timer == null)
            timer = setTimeout(callback, timeout || defaultTimeout);
    };
    /**
     * @param {number} [timeout]
     */
    _self.delay = function(timeout) {
        timer && clearTimeout(timer);
        timer = setTimeout(callback, timeout || defaultTimeout);
    };
    _self.schedule = _self;

    _self.call = function() {
        this.cancel();
        fcn();
    };

    _self.cancel = function() {
        timer && clearTimeout(timer);
        timer = null;
    };

    _self.isPending = function() {
        return timer;
    };

    return _self;
};

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
exports.sleep = function(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
};

exports.supportsLookbehind = function () {
    try {
        new RegExp('(?<=.)');
    } catch (e) {
        return false;
    }
    return true;
};

exports.skipEmptyMatch = function(line, last, supportsUnicodeFlag) {
    return supportsUnicodeFlag && line.codePointAt(last) > 0xffff ? 2 : 1;
};

/*global Intl*/
var graphemeSegmenter;
function getSegmenter() {
    if (graphemeSegmenter === undefined) {
        graphemeSegmenter = typeof Intl == "object" && Intl["Segmenter"]
            ? new Intl["Segmenter"](undefined, {granularity: "grapheme"}) : null;
    }
    return graphemeSegmenter;
}

/**
 * Returns the [start, end) code unit offsets of the grapheme cluster containing
 * `column`, or null if `Intl.Segmenter` is unavailable or `column` is outside the text.
 * @param {string} text
 * @param {number} column
 * @returns {{start: number, end: number} | null}
 */
exports.getGraphemeCluster = function(text, column) {
    var segmenter = getSegmenter();
    if (!segmenter) return null;
    var segment = segmenter.segment(text).containing(column);
    if (!segment) return null;
    return {start: segment.index, end: segment.index + segment.segment.length};
};

/**
 * Returns the grapheme cluster boundaries of `text` as code unit offsets,
 * including 0 and text.length. Falls back to surrogate pair boundaries
 * when `Intl.Segmenter` is unavailable.
 * @param {string} text
 * @returns {number[]}
 */
exports.getGraphemeBoundaries = function(text) {
    var boundaries = [0];
    var segmenter = getSegmenter();
    if (segmenter) {
        var iterator = segmenter.segment(text)[Symbol.iterator]();
        var step;
        while (!(step = iterator.next()).done)
            boundaries.push(step.value.index + step.value.segment.length);
    } else {
        for (var i = 0; i < text.length; i++) {
            if (/[\uD800-\uDBFF]/.test(text.charAt(i)) && /[\uDC00-\uDFFF]/.test(text.charAt(i + 1)))
                i++;
            boundaries.push(i + 1);
        }
    }
    return boundaries;
};
