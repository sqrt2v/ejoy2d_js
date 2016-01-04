/**
 * Created by v on 2015/10/18.
 */

ejoy2d.sprite_trans = function () {
    this.color = 0xffffffff;
    this.additive = 0;
    this.program = BuiltinProgram.default;
};

ejoy2d.sprite_trans.prototype = ((function() {
    var color_mul = function(c1,c2) {
        var r1 = (c1 >> 24) & 0xff;
        var g1 = (c1 >> 16) & 0xff;
        var b1 = (c1 >> 8) & 0xff;
        var a1 = (c1) & 0xff;
        var r2 = (c2 >> 24) & 0xff;
        var g2 = (c2 >> 16) & 0xff;
        var b2 = (c2 >> 8) & 0xff;
        var a2 = c2 & 0xff;

        return (r1 * r2 /255) << 24 |
            (g1 * g2 /255) << 16 |
            (b1 * b2 /255) << 8 |
            (a1 * a2 /255) ;
    };

    var clamp =function(c) {
        return ((c) > 255 ? 255 : (c));
    };

    var color_add = function(c1, c2) {
        var r1 = (c1 >> 16) & 0xff;
        var g1 = (c1 >> 8) & 0xff;
        var b1 = (c1) & 0xff;
        var r2 = (c2 >> 16) & 0xff;
        var g2 = (c2 >> 8) & 0xff;
        var b2 = (c2) & 0xff;
        return clamp(r1+r2) << 16 |
            clamp(g1+g2) << 8 |
            clamp(b1+b2);
    };
    var log_cnt = 0;

    return {
        copyFrom : function(a){
            if(a.mat)
                this.mat = a.mat.clone();
            this.color = a.color;
            this.additive = a.additive;
            this.program = a.program;
        },
        mul: function(a, b) {
            this.copyFrom(a);
            if (!b) {
                return this;
            }
            if (!this.mat) {
                this.mat = b.mat.clone();
            } else if (b.mat) {
                this.mat.mul(this.mat, b.mat);
            }
            if (this.color == 0xffffffff) {
                this.color = b.color;
            } else if (b.color != 0xffffffff) {
                this.color = color_mul(this.color, b.color);
            }
            if (this.additive == 0) {
                this.additive = b.additive;
            } else if (b.additive != 0) {
                this.additive = color_add(this.additive, b.additive);
            }
            if (this.program == BuiltinProgram.default) {
                this.program = b.program;
            }
            return this;
        }
    };
})());
