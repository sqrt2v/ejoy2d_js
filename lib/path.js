/**
 * Created by v on 2015/8/20.
 */
ejoy2d.path = function () {
    return {
        /**
         * The character that separates path segments
         * @name ejoy2d.path.delimiter
         */
        delimiter: "/",
        /**
         * Join two sections of file path together, insert a delimiter if needed.
         * @param {String} one First part of path to join
         * @param {String} two Second part of path to join
         * @function
         * @name ejoy2d.path.join
         */
        /*
         join: function(one, two) {
            if(two[0] === ejoy2d.path.delimiter) {
                return two;
            }

            if(one && two && one[one.length - 1] !== ejoy2d.path.delimiter && two[0] !== ejoy2d.path.delimiter) {
                return one + ejoy2d.path.delimiter + two;
            }
            else {
                return one + two;
            }
        },
        */
        join: function () {
            var index;
            var num = arguments.length;
            var result = arguments[0];

            for(index = 0; index < num - 1; ++index) {
                var one = arguments[index];
                var two = arguments[index+1];
                if(!ejoy2d.isDefined(one) || !ejoy2d.isDefined(two)) {
                    throw new Error("undefined argument to ejoy2d.path.join");
                }
                if(two[0] === ejoy2d.path.delimiter) {
                    result = two;
                    continue;
                }

                if(one && two && one[one.length - 1] !== ejoy2d.path.delimiter && two[0] !== ejoy2d.path.delimiter) {
                    result += (ejoy2d.path.delimiter + two);
                } else {
                    result += (two);
                }
            }

            return result;
        },

        /**
        * @function
        * @name ejoy2d.path.split
        * @description Split the pathname path into a pair [head, tail] where tail is the final part of the path
        * after the last delimiter and head is everything leading up to that. tail will never contain a slash
        */
        split: function (path) {
            var parts = path.split(ejoy2d.path.delimiter);
            var tail = parts.slice(parts.length-1)[0];
            var head = parts.slice(0,parts.length-1).join(ejoy2d.path.delimiter);
            return [head, tail];
        },

        /**
        * @function
        * @name ejoy2d.path.getBasename
        * @description Return the basename of the path. That is the second element of the pair returned by
        * passing path into {@link ejoy2d.path.split}.
        * @example
        * ejoy2d.path.getBasename("/path/to/file.txt"); // returns "path.txt"
        * ejoy2d.path.getBasename("/path/to/dir"); // returns "dir"
        * @returns {String} The basename
        */
        getBasename: function(path) {
            return ejoy2d.path.split(path)[1];
        },

        /**
         * Get the directory name from the path. This is everything up to the final instance of ejoy2d.path.delimiter
         * @param {String} path The path to get the directory from
         * @function
         * @name ejoy2d.path.getDirectory
         */
        getDirectory: function(path) {
            var parts = path.split(ejoy2d.path.delimiter);
            return parts.slice(0,parts.length-1).join(ejoy2d.path.delimiter);
        },

        getExtension: function (path) {
            var ext = path.split(".").pop();
            if (ext !== path) {
                return "." + ext;
            } else {
                return "";
            }
        },

        isRelativePath: function (s) {
            return s.charAt(0) !== "/" && s.match(/:\/\//) === null;
        },

        extractPath: function (s) {
            var path = ".",
            parts = s.split("/"),
            i = 0;

            if (parts.length > 1) {
                if (ejoy2d.path.isRelativePath(s) === false) {
                    path = "";
                }
                for (i = 0; i < parts.length - 1; ++i) {
                    path += "/" + parts[i];
                }
            }
            return path;
        }
    };
} ();