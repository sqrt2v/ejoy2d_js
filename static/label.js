
ejoy2d.label = (function() {

    var TEX_WIDTH = 512;
    var TEX_HEIGHT = 512;
    var TEX_FMT = TEXTURE_A8;
    var FONT_SIZE = 31;
    
    var LABEL_ALIGN_LEFT = 0;
    var LABEL_ALIGN_RIGHT = 1;
    var LABEL_ALIGN_CENTER = 2;

    var dfont = null;
    var tex = null;
    var font_ctx = {};

    var log_cnt = 1;

    var newLineChar = "\n".charCodeAt(0);

    function font_create(size, ctx) {
        if( !ctx.font) {
            var textCtx =document.getElementById("textCanvas").getContext("2d");
            ctx.font = textCtx;
            ctx.size = size;

            textCtx.font = size.toString() + "px monospace";
            textCtx.textAlign = "center";
            textCtx.textBaseline = "middle";
            textCtx.fillStyle = "black";
        }
        // textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
        // textCtx.fillText(text, width / 2, height / 2);
    };
    function font_size(chr, ctx) {
        var m = ctx.font.measureText(chr);
        ctx.w = Math.ceil(m.width);
        ctx.h = ctx.size;
        return ctx;
    };
    function font_glyph(chr, buffer, ctx) {
        var textCtx = ctx.font;
        var w = textCtx.canvas.width;
        var h = textCtx.canvas.height;
        textCtx.clearRect(0, 0, w, h);
        textCtx.fillText(chr, w / 2, w / 2);
        var sx = w/2 - Math.floor(ctx.w/2);
        var sy = h/2 - Math.floor(ctx.h/2);
        var img = textCtx.getImageData(sx, sy, ctx.w, ctx.h);
        var len = ctx.w*ctx.h;
        for(var i =0; i < len; ++i ) {
            buffer[i] = img.data[i*4 + 3];
        }
    };
    function font_release(ctx) {
        // ctx.font = undefined;
    };

    function set_point(v, idx, m, xx, yy, tx, ty) {
        var vx = (xx * m[0] + yy * m[2]) / 1024 + m[4];
        var vy = (xx * m[1] + yy * m[3]) / 1024 + m[5];
        var tmp = ejoy2d.screen.trans(vx, vy);
        
        // if(log_cnt <= 1)
        //     console.log("----xx, yy", xx, yy," -- ", vx, vy, m)

        v[idx +0] = tmp[0];
        v[idx +1] = tmp[1];

        v[idx +2] = Math.floor(tx * (65535.0/TEX_WIDTH));
        v[idx +3] = Math.floor(ty * (65535.0/TEX_HEIGHT));
        ///console.log("--->>>", v[idx +0], v[idx +1], v[idx +2], v[idx +3]);
    };

    var vb = new Array(14);
    function draw_rect(rect, size, mat, color, additive) {
        // if(log_cnt <= 1)
        //     console.log("-------->>>> draw rect: ---->>>>>>>", rect);
        
    	var w = (rect.w -1) * size / FONT_SIZE ;
    	var h = (rect.h -1) * size / FONT_SIZE ;

        var m = mat.m;
    	set_point(vb, 0,   m, 0,               0,              rect.x,             rect.y);
    	set_point(vb, 4,   m, w*SCREEN_SCALE,  0,              rect.x+rect.w-1,    rect.y);
    	set_point(vb, 8,   m, w*SCREEN_SCALE,  h*SCREEN_SCALE, rect.x+rect.w-1,    rect.y+rect.h-1);
    	set_point(vb, 12,  m, 0,               h*SCREEN_SCALE, rect.x,             rect.y+rect.h-1);

        // console.log("--------->>> begin draw:");
    	ejoy2d.shader.do_draw(vb, color, additive);
    };

    var glyph_buff = new Uint8Array(50*50);
    function gen_char(unicode, chr, size, edge) {
        // todo : use large size when size is large
        var ctx = font_ctx;
        font_create(FONT_SIZE, font_ctx);
        if (!ctx.font) {
            return null;
        }

        font_size(chr,font_ctx);
        var rect = dfont.insert(unicode, FONT_SIZE, ctx.w+1, ctx.h+1, edge);
        if (!rect) {
            dfont.flush();
            rect = dfont.insert(unicode, FONT_SIZE, ctx.w+1, ctx.h+1, edge);
            if (!rect) {
                font_release(font_ctx);
                return null;
            }
        }
        ctx.w = rect.w;
        ctx.h = rect.h;
        //var bf_sz = ctx.w * ctx.h;
        if (edge) {
            // var tmp = new Array(bf_sz);
            // font_glyph(chr, tmp);
            // gen_outline(ctx.w, ctx.h, tmp, buffer);
        } else {
            font_glyph(chr, glyph_buff, font_ctx);
        }
        // write_pgm(unicode, ctx.w, ctx.h, buffer);
        font_release(font_ctx);
        ejoy2d.render.texture_subupdate(tex, glyph_buff, rect.x, rect.y, rect.w, rect.h);
        return rect;
    }


    function draw_size(unicode, chr, size, edge) {
    	var rect = dfont.lookup(unicode, FONT_SIZE ,edge);
    	if (!rect) {
    		rect = gen_char(unicode, chr, size, edge);
    	}
    	if (rect) {
    		return (rect.w -1) * size / FONT_SIZE;
    	}
    	return 0;
    };
    function draw_height( unicode, chr, size, edge) {
    	var rect = dfont.lookup(unicode, FONT_SIZE, edge);
    	if (!rect) {
    		rect = gen_char(unicode, chr, size, edge);
    	}
    	if (rect) {
    		return rect.h * size / FONT_SIZE;
    	}
    	return 0;
    };

    function get_char_size(unicode, size, edge) {
    	var rect = dfont.lookup(unicode, FONT_SIZE, edge);
    	var ctx = {};
    	font_create(FONT_SIZE, ctx);
    	if ( !ctx.font) {
    		ctx.w = 0;
    		ctx.h = 0;
    		return ctx;
    	}

    	if ( !rect ) {
    		font_size(unicode, ctx);
    		//see gen_char
    		ctx.w += 1;
    		ctx.h += 1;
    		ctx.w = (ctx.w -1) * size / FONT_SIZE;
    		ctx.h = ctx.h * size / FONT_SIZE;
    	} else {
    		ctx.w = (rect.w -1) * size / FONT_SIZE;
    		ctx.h = rect.h * size / FONT_SIZE;
    	}
    	// font_release should not reset ctx.w/ctx.h
    	font_release(ctx);
    	return ctx;
    };

    var mc = 0;
    function draw_utf8(unicode, cx, cy, size, srt, color, arg, edge) {
    	var rect = dfont.lookup(unicode, FONT_SIZE, edge);
        // if(log_cnt <= 1)
        //     console.log("--->>> draw_utf8 cx cy\t", unicode, cx, cy);
    	if ( !rect ) {
    		return 0;
    	}
        var mat1 = new ejoy2d.matrix([1024, 0, 0, 1024, cx*SCREEN_SCALE, cy*SCREEN_SCALE]);
    	var m;
    	if (arg.mat) {
    		m = new ejoy2d.matrix();
    		m.mul(mat1, arg.mat);
    	} else {
    		m = mat1;
    	}
        // m = mat1;
        m.srt(srt);

        draw_rect(rect, size, m, color, arg.additive);

    	return (rect.w-1) * size / FONT_SIZE ;
    };

    function get_rich_field_color(rich, idx) {
      for (var i=0; i < rich.count; i++) {
        var field = rich.fields[i];
        if (idx >= field.start && idx <= field.end && field.type	== RL_COLOR) {
          return field.color;
        }
      }
      return 0;
    };
    function get_rich_filed_lf(rich, idx, offset) {
        return null;
    	// for (var i=0; i< rich.fields.length; i++) {
    	// 	var field = rich.fields[i];
    	// 	if (idx==field.start && idx==field.end && field.type== RL_LINEFEED) {
    	// 		 return field.val / 1000.0;
        //     }
    	// }
    };

    function draw_line(rich, l, srt, arg, color, cy, w, start, end, pre_char_cnt, space_scale) {
        var str = rich.text;
        var cx = 0;
        var size = l.size;
        if (l.auto_scale != 0 && w > l.width)
        {
            var scale = l.width * 1.0/w;
            size = scale * size;
            cy = cy + (l.size - size) / 2;
            w = l.width;
        }
        l.space_w = 0.0;
        l.align = LABEL_ALIGN_LEFT;
        switch (l.align) {
            case LABEL_ALIGN_LEFT:
                cx = 0.0;
                break;
            case LABEL_ALIGN_RIGHT:
                cx = l.width - w;
                break;
            case LABEL_ALIGN_CENTER:
                cx = (l.width - w)/2;
                break;
        }

        var char_cnt = 0;
        for (var j=start; j<end; ++j) {
            char_cnt++;
    		var unicode = str.charCodeAt(j);
            var chr = str.charAt(j);
            if(unicode != newLineChar) {
                var field_color = get_rich_field_color(rich, pre_char_cnt+char_cnt);
                if (field_color == 0) {
                    field_color = color;
                } else {
                    field_color = color_mul(field_color,  color | 0xffffff);
                }
                cx+=(draw_utf8(unicode, cx, cy, size, srt, field_color, arg, l.edge) + l.space_w)*space_scale;
            }
        }
        pre_char_cnt += char_cnt;
        return pre_char_cnt;
    };

    function color_mul(c1, c2) {
    	var r1 = (c1 >> 24) & 0xff;
    	var g1 = (c1 >> 16) & 0xff;
    	var b1 = (c1 >> 8) & 0xff;
    	var a1 = (c1) & 0xff;
    	var r2 = (c2 >> 24) & 0xff;
    	var g2 = (c2 >> 16) & 0xff;
    	var b2 = (c2 >> 8) & 0xff;
    	var a2 = c2 & 0xff;

    	return (Math.floor(r1 * r2 /255)) << 24 |
    		(Math.floor(g1 * g2 /255)) << 16 |
    		(Math.floor(b1 * b2 /255)) << 8 |
    		(Math.floor(a1 * a2 /255));
    }

    var char_size_rlt = [];


    return {
        init : function() {
            ejoy2d.label.load();
        },
        load : function() {
            if( dfont) return;

            dfont = new ejoy2d.dfont(TEX_WIDTH, TEX_HEIGHT);
            tex = ejoy2d.render.texture_create(TEX_WIDTH, TEX_HEIGHT, TEX_FMT, TEXTURE_2D, 0);
            ejoy2d.render.texture_update(tex, TEX_WIDTH, TEX_HEIGHT, null, 0, 0);
        },
        flush : function() {
            if(dfont) {
                dfont.flush();
            }
        },
        unload:function() {
            ejoy2d.render.release(TEXTURE, tex);
            dfont.release();
            dfont = null;
        },
        draw :function (rich, l, srt, arg) {
            if(mc < 400) {
                if(mc % 97 == 0) {
                    console.log("---->>>", arg);
                }
                mc ++;
            }
        
        	ejoy2d.shader.texture(tex, 0);
            var color = ejoy2d.label.get_color(l, arg);
            var str = rich.text;

        	var ch = 0, w = 0, cy = 0, pre = 0, char_cnt = 0, idx = 0;
        	for (var i=0; i < str.length; ++i) {
                var unicode = str.charCodeAt(i);
                var chr = str.charAt(i);
        		w += draw_size(unicode, chr, l.size, l.edge) + l.space_w;
        		if (ch == 0) {
                	ch = draw_height(unicode, chr, l.size, l.edge) + l.space_h;
        		}
        		var space_scale=1.0;
        		var lf = get_rich_filed_lf(rich, idx, space_scale);
        		if(((!l.auto_scale) && lf) || unicode == newLineChar) {
                    char_cnt = draw_line(rich, l, srt, arg, color, cy, w, pre, i, char_cnt, space_scale);
                    cy += ch;
                    pre = i;
                    w = 0;
                    ch = 0;
        		}
        		idx++;
        	}
        	draw_line(rich, l, srt, arg, color, cy, w, pre, i, char_cnt, 1.0);
            // if(log_cnt <= 1)
            // {
            //     console.log("-------->>> label.draw --------->>> end",rich.text);
            //     log_cnt ++;
            // }
        },
        char_size : function(l, chr) {
        	var ct = get_char_size(chr, l.size, l.edge);
        	char_size_rlt[0] = ct.w + l.space_w; // width
        	char_size_rlt[1] = ct.h + l.space_h; // height
        	return len;
        },
        size : function(str, l, width, height) {
        	var w=0, max_w=0, h=0, max_h=0;
        	for (var i=0; i < str.length; ++i) {
                var char_code = str.charCodeAt(i);
                var ct = get_char_size(char_code, l.size, l.edge);
        		w += ct.w + l.space_w;
        		if (h==0) {
        			h = ct.h + l.space_h;
        		}
        		if(( (!l.auto_scale) && w > l.width) || char_code == newLineChar) {
        			max_h += h;
        			h = 0;
        			if (w > max_w) max_w = w;
        			w = 0;
        		}
        	}
        	max_h += h;
        	if (w > max_w) max_w = w;
            if (l.auto_scale > 0 && max_w > l.width)
                max_w = l.width;

        	char_size_rlt[0] = max_w;
        	char_size_rlt[1] = max_h;
        },
        get_color:function( l, arg) {
            var color;
        	if (arg.color == 0xffffffff) {
        		color = l.color;
        	}
        	else if (l.color == 0xffffffff){
        		color = arg.color;
        	} else {
        		color = color_mul(l.color, arg.color);
        	}
            return color;
        }

    };
})();
