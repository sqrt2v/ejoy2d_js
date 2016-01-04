/**
 * Created by v on 2015/12/9.
 */


ejoy2d.rich_text = (function(){
    function is_ASCII_DBC_punct(unicode) {
        if(!unicode) return false;
        // ! to /
        if(unicode >= 33 && unicode <= 47) return true;
        // : to @
        if(unicode >= 58 && unicode <= 64) return true;
        // [ to `
        if(unicode >= 91 && unicode <= 96) return true;
        // { to ~
        if(unicode >= 123 && unicode <= 126) return true;

		return false;
    }


    function is_ASCII_SBC_punct(unicode)
    {
        return is_ASCII_DBC_punct(unicode-65248);
    }

	function is_JP_punct(unicode) {
		if (unicode) return false;
		if(unicode >= 65377 && unicode <= 65381) return true;
		if(unicode == 0x3002 || unicode == 0x3001 || unicode == 0x300C ||
			unicode == 0x300D || unicode == 0x30FB)
			return true;
		return false;
	}

    function is_punct(unicode) {
    	if(unicode) return false;
        if(is_ASCII_DBC_punct(unicode)) return true;
        if(is_ASCII_SBC_punct(unicode)) return true;
        if(is_JP_punct(unicode)) return true;
        return false;
    }



    function is_ascii(unicode) {
	    if (!unicode) return false;
	    if(unicode >= 33 && unicode <= 126) return true;
	    var shift = unicode-65248;
	    if (shift >= 33 && shift <= 126) return true;
	    return false;
    }



    function is_alnum(unicode) {
	    if(!unicode)
            return false;
    	return is_ascii(unicode) && !is_punct(unicode);
    }

    var char_sizes = [];
    function char_width(idx)
    {
        return char_sizes[idx]
    }

    function char_height(idx)
    {
        return char_sizes[idx+1]
    }

    var gap = 4;

    var CTL_CODE_POP=0;
    var CTL_CODE_COLOR=1;
    var CTL_CODE_LINEFEED=2;

    var TAG_REG = /#\[\w+\]/;
    var TAG_REG_G = /#\[\w+\]/g;

    var operates = {
        yellow	: { val : 0xFFFFFF00, type : "color" },
        red : { val : 0xFFFF0000,  type : "color" },
        blue : { val : 0xFF0000FF, type : "color" },
        green : { val:0xFF00FF00, type:"color" },
        stop : { type : CTL_CODE_POP },
        lf : { type:CTL_CODE_LINEFEED }
    };

    function _locate_alnum(sizes, anchor) {
        var start = anchor;
        var forward_len = sizes[start];
        while (sizes[start-gap+3]) {
            if(start-gap < 3 || !is_alnum(sizes[start-gap+3]))
                break;
            start = start - gap;
            forward_len = forward_len + sizes[start];
        }
        var stop = anchor;
        var backward_len = 0;
        while(sizes[stop+gap+3]) {
            if(!is_alnum(sizes[stop+gap+3]))
                break;
            stop = stop + gap;
            backward_len = backward_len + sizes[stop]
        }
        return [forward_len, start, stop, backward_len];
    }



    function _add_linefeed(fields, pos, offset) {
        var field = [false, false, false, false];
        field[1] = pos - 1;  // zero base index
        field[2] = pos - 1;
        field[3] = CTL_CODE_LINEFEED;
        if(offset)
            field[4] = Math.round(offset);
        else
            field[4] = 1000;
        fields.push(field);
    }

    var layout_rlt = [];
    function _layout(label, txt, fields) {
        // print(txt)
        // {label_width, label_height, char_width_1, char_width_1, unicode_len_1, unicode_1...}
        var size_cnt = label.size(char_sizes, txt);

        var width = char_sizes[0];
        var line_width = 0;
        var ignore_next =0, extra_len = 0;
        var max_width =0, max_height =0, line_max_height =0;
        for(var i=2; i < size_cnt; i += gap) {
            var idx = i;
            if(ignore_next == 0)
                line_width = line_width + 1;
            else
                ignore_next = ignore_next-1;

            if(extra_len > 0) {
                line_width = line_width + extra_len;
                extra_len = 0
            }
            // reset if \n
            if (txt.charCodeAt(idx) == 10){
                max_height = max_height + char_height(idx);
                line_width = 0
            }

            line_max_height = char_height(idx) > line_max_height ? char_height(idx) : line_max_height;

            if(line_width >= width) {
                max_width = line_width > max_width ? line_width : max_width;
                max_height = max_height + line_max_height;
                line_max_height = 0;

                var pos = (idx+1) / gap;
                var next_unicode = str.charCodeAt(idx+gap);
                // make sure punctation does not stand at line head
                if (is_punct(next_unicode)) {
                    line_width = line_width + char_width(idx+gap);
                    pos = pos + 1;
                    next_unicode = txt.charCodeAt(idx+gap+gap);
                    ignore_next = ignore_next + 1
                }


                if (next_unicode && next_unicode != 10){
                    if (ignore_next > 0 || !is_alnum(txt.charCodeAt(idx))) {
                        _add_linefeed(fields, pos)
                    } else {
                        var info = _locate_alnum(char_sizes, idx);
                        var forward_len = info[0];
                        var start = info[1];
                        var stop = info[2];
                        var backward_len = info[3];
                        var scale;
                        if(stop == idx+gap && !is_punct(char_unicode(stop+gap))){
                            ignore_next = ignore_next+1;
                            scale = line_width * 1000 / (line_width + char_width(stop));
                            scale = scale >= 970? scale : 1000;
                            line_width = line_width + char_width(stop);
                            _add_linefeed(fields, pos+1, scale)
                        }
                        else {
                            scale = width * 1000 / (line_width - forward_len);
                            // local scale = line_width * 1000 / (line_width - forward_len)
                            if(scale <= 1250 && scale > 0)
                            {
                                extra_len = forward_len;
                                line_width = line_width - extra_len;
                                _add_linefeed(fields, ((start+1) / gap)-1, scale)
                            }

                            else
                            {
                                _add_linefeed(fields, pos)
                            }
                        }
                    }
                    // print("............delta:", line_width, line_width - width, char_width(idx), ignore_next)
                    line_width = 0
                }
            }
        }
        if(line_width < width && line_width > 0)
            max_height = max_height + line_max_height;

        max_width = max_width == 0?line_width : max_width;
        layout_rlt[0] = max_width;
        layout_rlt[1] = max_height;
        return layout_rlt;
    }


    function _post_format(label, txt, fields) {
        var lr = _layout(label, txt, fields);
        return [txt, fields, lr[0], lr[1]];
    }

    return {
        init_operators : function(ops) {
            for(var k in ops){
                operates[k] = ops[k]
            }
        },
        is_rich : function(str) {
            return str.search(TAG_REG) != -1;
        },
        format : function(label, txt) {
            var fields = [];
            var pos_pieces = [];
            var tags = text.match(TAG_REG_G);
            if(!tags)
                return _post_format(label, txt, fields);

            var s=0;
            var e=0;
            var pos_cnt = 0;
            var tag_cnt = tags.length;
            var i =0;
            for(i =0; i < tag_len; ++i ) {
                s = txt.search(TAG_REG);
                var tag = tags[i];
                e = s + tag.length -1;
                tag = tag.substr(2, tag.length -3);
                if (!operates[tag]) {
                    txt = text.replace(TAG_REG, "");
                }
                else {
                    var pos = s;
                    pos_cnt = pos_cnt+1;
                    pos_pieces[pos_cnt] = pos;

                    pos_cnt = pos_cnt+1;
                    pos_pieces[pos_cnt] = tag;

                    txt = txt.replace(TAG_REG, "");
                }
            }

            var count = pos_cnt / 2;
            var last_field = null;
            var tlen = txt.length;
            var field = null;
            for(i=1; i < count; ++i) {
                pos = pos_pieces[2*i-1];
                tag = pos_pieces[2*i];
                var ope = operates[tag];
                if (ope.type == "color") {
                    field = [false, false, false, false];
                    field[1] = pos;
                    field[2] = i==count ? tlen : pos_pieces[2*(i+1)-1]-1;
                    field[3] = CTL_CODE_COLOR;
                    field[4] = ope.val;
                    fields.add(field);
                    last_field = field;
                }
                else if(ope.type == CTL_CODE_POP) {
                    last_field = null;
                }
                else if(ope.type == CTL_CODE_LINEFEED){
                    field = [false, false, false, false];
                    field[1] = pos;
                    field[2] = pos;
                    field[3] = ope.type;
                    field[4] = ope.val;
                    fields.push(field);

                    if(last_field) {
                        var field_restore = [false, false, false];
                        field_restore[1] = pos;
                        field_restore[2] = i==count? tlen : pos_pieces[2*(i+1)-1]-1;
                        field_restore[3] = last_field[3];
                        field_restore[4] = last_field[4];
                        fields.push(field_restore);
                        last_field = field_restore;
                    }
                }
            }
            return _post_format(label, txt, fields);
        }
    };
})();