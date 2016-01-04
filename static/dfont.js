
ejoy2d.dfont = function (width, height) {
    this.width = width;
    this.height = height;
	this.max_line = 0;
	this.version = 0;

    this._init();
};

ejoy2d.dfont.prototype = (function(){
    var HASH_SIZE = 4096;
    var TINY_FONT = 12;

    var ListNode = function() {
        this.prev = this;
        this.next = this;
    }

    ListNode.prototype = {
        setData : function(data) {
          this.data = data;  
        },
        del: function (){
            var prev = this.prev;
            var next = this.next;
            if(next) {
                next.prev = prev;
            }
            if(prev) {
                prev.next = next;
            }
            this.prev = null;
            this.next = null;
        },
        add_after : function(p) {
            this.next = p.next;
            this.prev = p;
            if(p.next.prev)
                p.next.prev = this;
            p.next = this;
        },
        add_before : function(p) {
            this.next = p;
            this.prev = p.prev;
            if(p.prev) {
                p.prev.next = this;
            }
            p.prev = this;
        }
    };


    var HashRect = function(){
        this.next_char = new ListNode();
        this.next_char.setData(this);
        this.time = new ListNode();
        this.time.setData(this);
        // struct hash_rect * next_hash;
    	// struct list_head next_char;
    	// struct list_head time;
    	// int version;
    	// int c;
    	// int line;
    	// int font;
    	// int edge;
    	// struct dfont_rect rect;
    };
    var Line = function( start, h, space) {
        this.start_line = start;
    	this.height = h;
    	this.space = space;
    	this.head = new ListNode();
    }


    var hash = function(c, font, edge) {
    	if (edge != 0) {
    		edge = 1;
    	}
    	return (((c ^ (font * 97))<<1)|edge) % HASH_SIZE;
    };

    
    return {
        _init : function() {
            var maxLine = Math.floor(this.height / TINY_FONT);
            var maxChar = Math.floor(maxLine * this.width / TINY_FONT);
            var fl = new HashRect();
            var pre = fl;
            for(var i = 1; i < maxChar; ++i) {
                var r = new HashRect();
                pre.next_hash = r;
                pre = r;
            }
            this.freelist = fl;
            this.hash = [];
            this.time = new ListNode();
            this.line = [];
        },

        _new_line:function(height) {
            var start_line = 0;
        	if (this.max_line > 0) {
        		var lastline = this.line[this.max_line-1];
        		start_line = lastline.start_line + lastline.height;
        	}
        	if (start_line + height > this.height)
        		return -1;
        	var max = Math.floor(this.height / TINY_FONT);
        	if (this.max_line >= max)
        		return -1;
            var idx = this.max_line;
            this.max_line = this.max_line +1;
            var line = new Line(start_line, height, this.width);
        	this.line[idx] = line;
        	return idx;
        },

        _find_line: function(width, height) {
            // console.log("---->>> max line", this.max_line, width, height);
            for (var i=0; i < this.max_line; i++) {
            	var line = this.line[i];
                // console.log("---??? check line:", i, line.height, line.space);
            	if (height == line.height && width <= line.space) {
            		return i;
            	}
            }
            return this._new_line(height);
        },

        _new_node:function() {
        	if (!this.freelist)
        		return null;
        	ret = this.freelist;
        	this.freelist = ret.next_hash;
            if(!ret.rect)
                ret.rect = {};
        	return ret;
        },

        _find_space : function(line, width) {
        	var start_pos = 0;
        	var hr;
        	var max_space = 0;
            var head = line.head;
            var hr = head.next;
            while(hr != head) {
                var data = hr.data;
        		var space = data.rect.x - start_pos;
        		if (space >= width) {
        			var n = this._new_node();
        			if ( !n )
        				return null;
        			n.line = line;
                    n.rect.x = start_pos;
        			n.rect.y = line.start_line;
        			n.rect.w = width;
        			n.rect.h = line.height;

                    // add to tail of line.char
                    n.next_char.add_before(hr);
        			return n;
        		}

        		if (space > max_space) {
        			max_space = space;
        		}
        		start_pos = data.rect.x + data.rect.w;
                hr = hr.next;
        	}
        	var space = this.width - start_pos;
        	if (space < width) {
        		if (space > max_space) {
        			line.space = space;
        		} else {
        			line.space = max_space;
        		}
                console.log("--------->>> aoaooa 1111");
        		return null;
        	}
        	var n = this._new_node();
        	if (!n) {
                console.log("--------->>> aoaooa");
                return null;
            }
        		
        	n.line = line;
        	n.rect.x = start_pos;
        	n.rect.y = line.start_line;
        	n.rect.w = width;
        	n.rect.h = line.height;

            // add n to the tail of line.char
            n.next_char.add_before(head);
        	return n;
        },
        _adjust_space:function(hr) {
        	var line = this.line[hr.line];
        	if (hr.next_char.next == line.head) {
        		hr.rect.w = this.width - this.rect.x;
        	} else {
        		var next = hr.next_char.data;
        		hr.rect.w = next.rect.x - hr.rect.x;
        	}

        	if (hr.next_char.prev == line.head) {
        		hr.rect.w += hr.rect.x;
        		hr.rect.x = 0;
        	} else {
        		var prev = hr.next_char.prev.data;
        		var x = prev.rect.x + prev.rect.w;
        		hr.rect.w += hr.rect.x - x;
        		hr.rect.x = x;
        	}
        	if (hr.rect.w > line.space) {
        		line.space = hr.rect.w;
        	}
        },
        _release_char:function(c, font, edge) {
        	var h = hash(font, edge);
        	var hr = this.hash[h];
        	if (hr.c == c && hr.font == font && hr.edge == edge) {
        		this.hash[h] = hr.next_hash;
                hr.time.del();
        		this._adjust_space(hr);
        		return hr;
        	}
        	var last = hr.data;
        	hr = hr.next_hash;
        	while (hr) {
                var data = hr.data;
        		if (c == data.c && data.font == font && data.edge == edge) {
        			last.next_hash = data.next_hash;
                    hr.time.del();
        			this._adjust_space(hr);
        			return hr;
        		}
        		last = data;
        		hr = hr.next_hash;
        	}
        	console.assert(0);
        	return null;
        },
        _release_space:function(width, height) {
        	var hr, tmp;
            var hr = this.time.next;
        	while(hr != this.time) {
                var data = hr.data;
        		if (data.version == this.version)
        			continue;
        		if (data.rect.h != height) {
        			continue;
        		}
        		var ret = this._release_char(data.c, data.font, data.edge);
        		var w = data.rect.w;
        		if (w >= width) {
        			ret.rect.w = width;
        			return ret;
        		} else {
                    ret.next_char.del();
        			//list_del(&ret->next_char);
        			ret.next = this.freelist;
        			this.freelist = ret;
        		}
                hr = hr.next;
        	}
        	return null;
        },
        _insert_char:function(c, font, hr, edge) {
        	hr.c = c;
        	hr.font = font;
        	hr.edge = edge;
        	hr.version = this.version;
            hr.time.add_before(this.time);
        	var h = hash(c, font, edge);
        	hr.next_hash = this.hash[h];
        	this.hash[h] = hr;
        	return hr.rect;
        },

        _move_to_time_tail : function(hr) {
            var last = this.time.prev_time;
            last.next_time = hr;
            hr.prev_time = last;
            hr.next = this.time;
            this.time.prev_time = hr;
        },
        _move_to_time_head : function(hr) {
            var head = this.time.next_time;
            hr.next_time = head;
            head.prev_time = hr;
            hr.prev_time = this.time;
            this.time.next_time = hr;
        },


        /*-------------API----------------------*/

        lookup:function (c, font, edge) {
            
            var h = hash(c, font, edge);
            var hr = this.hash[h];
            while (hr) {
                if (hr.c == c && hr.font == font && hr.edge == edge) {
                    hr.time.del();
                    hr.time.add_before(this.time);
                    hr.version = this.version;
                    return hr.rect;
                }
                hr = hr.next_hash;
            }
            return null;
        },

        flush: function(){
            this.version++;
        },
        insert : function(c, font, width, height, edge) {
        	if (width > this.width)
        		return null;
        	var rlt = this.lookup(c, font, edge);
            console.assert(rlt == null);
        	while(true) {
        		var line = this._find_line(width, height);
        		if (line == -1)
        			break;
        		var hr = this._find_space(this.line[line], width);
        		if (hr) {
        			return this._insert_char(c ,font, hr, edge);
        		}
        	}
        	var hr = this._release_space(width, height);
        	if (hr) {
        		return this._insert_char(c, font, hr, edge);
        	}
        	return null;
        },
        remove : function(c, font, edge) {
        	var h = hash(c, font, edge);
        	var hr = this.hash[h];
        	while (hr) {
        		if (hr.c == c && data.font == font && hr.edge == edge) {
                    hr.time.del();
                    hr.time.add_after(this.time);
        			// this._move_to_time_head(hr);
        			hr.version = this.version-1;
        			return;
        		}
        		hr = hr.next_hash;
        	}
        }
    };
})();
