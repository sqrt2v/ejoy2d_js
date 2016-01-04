/**
 * Created by v on 2015/8/20.
 */

ejoy2d = {};

ejoy2d.extend = function(target, ex) {
    var prop,
    copy;

    for(prop in ex) {
        copy = ex[prop];
        if(pc.type(copy) == "object") {
            target[prop] = pc.extend({}, copy);
        } else if(pc.type(copy) == "array") {
            target[prop] = pc.extend([], copy);
        } else {
            target[prop] = copy;
        }
    }
    return target;
};

/**
 * Return true if the Object is not undefined
 * @param {Object} o The Object to test
 * @returns {Boolean} True if the Object is not undefined
 * @function
 * @name pc.isDefined
 */
ejoy2d.isDefined= function(o) {
    var a;
    return (o !== a);
};

/**
 * Convert an array-like object into a normal array.
 * For example, this is useful for converting the arguments object into an array.
 * @param {Object} arr The array to convert
 * @return {Array} An array
 * @function
 * @name pc.makeArray
 */
ejoy2d.makeArray = function (arr) {
    var i,
    ret = [],
    length = arr.length;

    for(i = 0; i < length; ++i) {
        ret.push(arr[i]);
    }

    return ret;
};