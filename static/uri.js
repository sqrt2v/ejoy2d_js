/**
 * Created by v on 2015/8/20.
 */

ejoy2d.URI = function (uri) {
    // See http://tools.ietf.org/html/rfc2396#appendix-B for details of RegExp
    var re = /^(([^:\/?\#]+):)?(\/\/([^\/?\#]*))?([^?\#]*)(\?([^\#]*))?(\#(.*))?/,
    result = uri.match(re);

    /**
     * @name pc.URI#scheme
     * @description The scheme. (e.g. http)
     */
    this.scheme = result[2];

    /**
     * @name pc.URI#authority
     * @description The authority. (e.g. www.example.com)
     */
    this.authority = result[4];

    /**
     * @name pc.URI#path
     * @description The path. (e.g. /users/example)
     */
    this.path = result[5];

    /**
     * @name pc.URI#query
     * @description The query, the section after a ?. (e.g. search=value)
     */
    this.query = result[7];

    /**
     * @name pc.URI#fragment
     * @description The fragment, the section after a #
     */
    this.fragment = result[9];

    /**
     * @function
     * @name pc.URI#toString
     * @description Convert URI back to string
     */
    this.toString = function () {
        var s = "";

        if (this.scheme) {
            s += this.scheme + ":";
        }

        if (this.authority) {
            s += "//" + this.authority;
        }

        s += this.path;

        if (this.query) {
            s += "?" + this.query;
        }

        if (this.fragment) {
            s += "#" + this.fragment;
        }

        return s;
    };

    /**
     * @function
     * @name pc.URI#getQuery
     * @description Returns the query parameters as an Object
     * @example
     * <code><pre lang="javascript">
     * var s = "http://example.com?a=1&b=2&c=3
     * var uri = new pc.URI(s);
     * var q = uri.getQuery();
     * console.log(q.a); // logs "1"
     * console.log(q.b); // logs "2"
     * console.log(q.c); // logs "3"
     * </code></pre>
     */
    this.getQuery = function () {
        var vars;
        var pair;
        var result = {};

        if (this.query) {
            vars = decodeURIComponent(this.query).split("&");
            vars.forEach(function (item, index, arr) {
                pair = item.split("=");
                result[pair[0]] = pair[1];
            }, this);
        }

        return result;
    };

    /**
     * @function
     * @name pc.URI#setQuery
     * @description Set the query section of the URI from a Object
     * @param {Object} params Key-Value pairs to encode into the query string
     * @example
     * var s = "http://example.com";
     * var uri = new pc.URI(s);
     * uri.setQuery({"a":1,"b":2});
     * console.log(uri.toString()); // logs "http://example.com?a=1&b=2
     */
    this.setQuery = function (params) {
        q = "";
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                if (q !== "") {
                    q += "&";
                }
                q += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
            }
        }

        this.query = q;
    };
};