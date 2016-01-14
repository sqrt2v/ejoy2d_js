/**
 * Created by v on 2015/6/22.
 */

ejoy2d.scissor = (function(){
    var SCISSOR_MAX = 8;
    var scissor_tmp_array = new Array(4);

    var S = {};
    S.depth = 0;
    var box = new Array(SCISSOR_MAX);
    var i =0;
    for(i =0; i < SCISSOR_MAX; ++i) {
        var b = {
            x:0,
            y:0,
            width:0,
            height:0,
        };
        box[i] = b;
    }
    S.box = box;


    S._intersection = function(b, output) {
        var newx = b.x > output[0] ? b.x : output[0];
        var newy = b.y > output[1] ? b.y : output[1];
      
        var bx = b.x + b.width;
        var by = b.y + b.height;
        var ax = output[0] + output[2];
        var ay = output[1] + output[3];
        var neww = (bx > ax ? ax : bx) - newx;
        var newh = (by > ay ? ay : by) - newy;
      
        output[0] = newx;
        output[1] = newy;
        output[2] = neww;
        output[3] = newh;
    };
    S.push = function(x, y, w, h) {
        console.assert(this.depth < SCISSOR_MAX);
        shader.flush();
        if (this.depth == 0) {
            shader.scissortest(1);
        }
      
        if (this.depth >= 1) {
            scissor_tmp_array[0] = x;
            scissor_tmp_array[1] = y;
            scissor_tmp_array[2] = w;
            scissor_tmp_array[3] = h;
            this._intersection(this.box[this.depth-1], scissor_tmp_array);
            x = scissor_tmp_array[0];
            y = scissor_tmp_array[1];
            w = scissor_tmp_array[2];
            h = scissor_tmp_array[3];                        
        }
      
        var s = this.box[this.depth++];
        s.x = x;
        s.y = y;
        s.width = w;
        s.height = h;
        ejoy2d.screen.scissor(s.x, s.y, s.width, s.height);
    };

    S.pop = function() {
        var S = this.S;
        console.assert(this.depth > 0);
        shader.flush();
        --this.depth;
        if (this.depth == 0) {
            shader.scissortest(0);
            return;
        }
        var s = this.box[this.depth-1];
        ejoy2d.screen.scissor(s.x, s.y, s.width, s.height);
    }
    return S;
}());