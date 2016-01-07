
ejoy2d.geometry = (function(){
    var PROGRAM =0;
    var convert_color = function(c) {
    	var alpha = (c >> 24) & 0xff;
    	if (alpha == 0xff) {
    		return c;
    	}
    	if (alpha == 0) {
    		return c | 0xff000000;
    	}
    	var red = (c >> 16) & 0xff;
    	var green = (c >> 8) & 0xff;
    	var blue = (c) & 0xff;
    	red = red * alpha / 255;
    	green = green * alpha / 255;
    	blue = blue * alpha / 255;

    	return alpha << 24 | red << 16 | green << 8 | blue;
    };
    return {
        setprogram:function(p) {
        	PROGRAM = p;
        	return 0;
        },
        /*
          float[4] endpointer x1,y1,x2,y2
          uint32_t color
         */
        line: function(x1,y1,x2,y2,c) {
        	x1 = x1 * SCREEN_SCALE;
        	y1 = y1 * SCREEN_SCALE;
        	x2 = x2 * SCREEN_SCALE;
        	y2 = y2 * SCREEN_SCALE;
        	var color = convert_color(c);
        	var vp = new Array(4*4);
        	vp[0] = x1;
        	vp[0 +1] = y1;
        	vp[4 +0] = x2;
        	vp[4 +1] = y2;
        	if (Math.abs(x1-x2) > Math.abs(y1-y2)) {
        		vp[8] = x2;
        		vp[8+1]= y2+SCREEN_SCALE;
        		vp[12] = x1;
        		vp[12 +1] = y1+SCREEN_SCALE;
        	} else {
                vp[8] = x2+SCREEN_SCALE;
        		vp[8 +1] = y2;
        		vp[12] = x1+SCREEN_SCALE;
        		vp[12 +1] = y1;
        	}

        	for (var i=0;i<4;i++) {
            	var base = i*4;
                vp[base +2] = 0;
                vp[base +3] = 0;
        		var rlt = ejoy2d.screen.trans(vp[base +0], vp[base +1]);
          	    vp[base +0] = rlt[0];
                vp[base +1] = rlt[1];
            }
        	shader.program(PROGRAM);
        	shader.do_draw(vp, color, 0);
        	return 0;
        },
        /*
        float x,y
        float w,h
        uint32_t color
        */
        box: function(x, y, w, h, c) {
            x = x * SCREEN_SCALE;
            y = y * SCREEN_SCALE;
            w = w * SCREEN_SCALE;
            h = h * SCREEN_SCALE;
            var color = convert_color(c);
            var vp = new Array(4*4);
            vp[0] = x;
            vp[0+1] = y;
            vp[4] = x+w;
            vp[4+1] = y;
            vp[8] = x+w;
            vp[8+1] = y+h;
            vp[12] = x;
            vp[12+1] = y+h;
            for (var i=0;i<4;i++) {
                var base = i*4;
                vp[base +2] = 0;
                vp[base +3] = 0;
                var rlt = ejoy2d.screen.trans(vp[base +0], vp[base +1]);
                vp[base +0] = rlt[0];
                vp[base +1] = rlt[1];
            }
            shader.program(PROGRAM);
            //console.log("----------->>> shader:", vp);
            shader.do_draw(vp, color, 0);
        },
        /*
        table float[]
        uint32_t color
        */
        polygon:function(vs,c) {
            var color = convert_color(c);
            var n = vs.length;
            var point = n/2;
            var vb = new Array(point*4);
            for (var i=0;i<point;i++) {
                var vx = vs[i*2] * SCREEN_SCALE;
                var vy = vs[i*2+1] * SCREEN_SCALE;
                //console.log("------<>>>>>", i ,vs[i*2], vs[i*2 +1]);
                var rlt = ejoy2d.screen.trans(vx,vy);
                vb[i*4] = rlt[0];
                vb[i*4+1] = rlt[1];
                vb[i*4+2] = 0;
                vb[i*4+3] = 0;
                //console.log("--->>",i,vb[i*4], vb[i*4 +1], vb[i*4 +2], vb[i*4 +3]);
            }
            shader.program(PROGRAM);
            if (point == 4) {
                shader.draw(vb, color, 0);
            } else {
                shader.drawpolygon(point, vb, color);
            }
        }
    };
})();
