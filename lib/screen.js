/**
 * Created by v on 2015/6/21.
 */

var SCREEN_SCALE = 16;

ejoy2d.screen = ((function(){
    var trans_tmp = new Array(2);
    return {
        init_render:function(r) {
            // for ejoy2d compatibility, ejoy2d may call screen_init before screen_initrender
            /// screen_init(SCREEN.width, SCREEN.height, SCREEN.scale);
        },
        init:function(w, h, scale) {
            //console.log("ejoy screen_init:", w, h, scale);
            this.width = Math.floor(w);
            this.height = Math.floor(h);
            this.scale = scale;
            this.invw = 2.0 / SCREEN_SCALE / w;
            this.invh = -2.0 / SCREEN_SCALE / h;
            render.setviewport(0, 0, w * scale, h * scale );
        },

        trans:function(x, y) {
            trans_tmp[0] = x * this.invw;
            trans_tmp[1] = y * this.invh;
            return trans_tmp;
        },
        scissor:function(x, y, w, h) {
            y = this.height - y - h;
            if (x<0) {
                w += x;
                x = 0;
            } else if (x>this.width) {
                w=0;
                h=0;
            }
            if (y<0) {
                h += y;
                y = 0;
            } else if (y>this.height) {
                w=0;
                h=0;
            }
            if (w<=0 || h<=0) {
                w=0;
                h=0;
            }
            x *= this.scale;
            y *= this.scale;
            w *= this.scale;
            h *= this.scale;

            render.setscissor(x,y,w,h);
        },
        is_visible:function(x, y)
        {
            return x >= 0.0 && x <= 2.0 && y>=-2.0 && y<= 0.0;
        },
        is_poly_invisible:function(points, len, stride) {
            var i =0;
            // test left of x
            var invisible = true;
            for(i =0; i < len && invisible;++i)
            {
                if(points[i*stride] >= 0.0)
                    invisible = false;
            }
            if(invisible)
                return true;

            // test right of axis x
            invisible = true;
            for(i =0; i < len && invisible;++i)
            {
                if(points[i*stride] <= 2.0)
                    invisible = false;
            }
            if(invisible)
                return true;

            // test above of axis y
            invisible = true;
            for(i =0; i < len && invisible;++i)
            {
                if(points[i*stride +1] >= -2.0)
                    invisible = false;
            }
            if(invisible)
                return true;

            // test below of axis y
            invisible = true;
            for(i =0; i < len && invisible;++i)
            {
                if(points[i*stride +1] <= 0.0)
                    invisible = false;
            }
            return invisible;
        }
    };
})());
