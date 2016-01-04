/**
 * Created by v on 2015/6/18.
 */

var MAX_COMMBINE = 1024;
ejoy2d.renderbuffer = function(){
    this.object = 0;
    this.texid = 0;
    this.vbid = 0;
    this.quad = new ArrayBuffer(MAX_COMMBINE);
    this.vb = new Float32Array(this.quad);
    this.uv = new Uint16Array(this.quad);
    this.color = new Uint8Array(this.quad);
    this.init();
};
ejoy2d.renderbuffer.prototype = {
    // init_render:function(r) {
    // },
    add:function(vb, color, additive) {
        if (this.object >= MAX_COMMBINE) {
            return true;
        }
        var idx = this.object*4;
        var pidx = idx * 5;
        var tidx = idx*10 + 4;
        var cidx = idx*20 + 12;
        for (var i=0;i<4;i++) {
            var ii = i*4;
            this.vb[pidx] = vb[ii];
            this.vb[pidx+1] = vb[ii + 1];
            pidx +=5;

            this.uv[tidx] = vb[ii + 2];
            this.uv[tidx+1] = vb[ii + 3];
            tidx +=10;
            //console.log("--->>> let's see ", i,  vb[ii], vb[ii +1])
            this.color[cidx] = (color >> 16) & 0xff;
            this.color[cidx +1] = (color >> 8) & 0xff;
            this.color[cidx +2] = (color) & 0xff;
            this.color[cidx +3] = (color >> 24) & 0xff;
            this.color[cidx +4] = (additive >> 16) & 0xff;
            this.color[cidx +5] = (additive >> 8) & 0xff;
            this.color[cidx +6] = (additive) & 0xff;
            this.color[cidx +7] = (additive >> 24) & 0xff;
            cidx +=20;
        }
        this.object = this.object +1;
        // console.log("--------??? aoaoao cur index buffer object:", this.object);
        if (this.object >= MAX_COMMBINE) {
            return true;
        }
        return false;
    },

    _update_tex:function(id) {
        if (this.object == 0) {
            this.texid = id;
        } else if (this.texid != id) {
            return true;
        }
        return false;
    },

    _drawquad:function(picture, arg) {
        var tmp;
        var vb = new Array(16);
        var i,j=0;
        if (!arg.mat) {
            tmp = new ejoy2d.matrix();
        } else {
            tmp = arg.mat.clone();
        }
        var m = tmp.m;
        var object = this.object;
        for (i=0;i<picture.n;i++) {
            var q = picture.rect[i];
            if (this._update_tex(q.texid)) {
                this.object = object;
                return -1;
            }
            for (j=0;j<4;j++) {
                var xx = q.screen_coord[j*2+0];
                var yy = q.screen_coord[j*2+1];
                vb[j*4 +0] = (xx * m[0] + yy * m[2]) / 1024 + m[4];
                vb[j*4 +1] = (xx * m[1] + yy * m[3]) / 1024 + m[5];
                vb[j*4 +2] = q.texture_coord[j*2+0];
                vb[j*4 +3] = q.texture_coord[j*2+1];
            }
            if (this.add(vb, arg.color, arg.additive)) {
                return 1;
            }
        }
        return 0;
    },
    _polygon_quad:function(vbp, color, additive, max, index) {
        var vb = new Array[4*4];
        var i =0;
        // first point
        for(i =0; i < 4;++i)
        {
            vb[i] = vbp[i]
        }
        for (i=1;i<4;i++) {
            var pointIdx = i + index;
            pointIdx = (pointIdx <= max) ? pointIdx : max;
            for(t =0; t < 4;++t)
            {
                vb[i*4+t] = vbp[pointIdx*4 +t];
            }
        }
        return this.add(vb, color, additive);
    },

    _add_polygon: function(n, vb, color, additive) {
        var i = 0;
        --n;
        do {
            if (this._polygon_quad(vb, color, additive, n, i)) {
                return 1;
            }
            i+=2;
        } while (i<n-1);
        return 0;
    },

    _drawpolygon:function(poly, arg) {
        var tmp;
        var i,j;
        if (!arg.mat) {
           tmp = new ejoy2d.matrix();
        } else {
            tmp = arg.mat.clone();
        }
        var m = tmp.m;
        var object = this.object;
        for (i=0;i<poly.n;i++) {
            var p = poly.poly[i];
            if (this._update_tex(p.texid)) {
                this.object = object;
                return -1;
            }

            var pn = p.n;

            var vb = new Array(pn*4);

            for (j=0;j<pn;j++) {
                var xx = p.screen_coord[j*2+0];
                var yy = p.screen_coord[j*2+1];

                vb[j*4].vx = (xx * m[0] + yy * m[2]) / 1024 + m[4];
                vb[j*4+1] = (xx * m[1] + yy * m[3]) / 1024 + m[5];
                vb[j*4+2] = p.texture_coord[j*2+0];
                vb[j*4+3] = p.texture_coord[j*2+1];
            }
            if (this._add_polygon(pn, vb, arg.color, arg.additive)) {
                this.object = object;
                return 1;
            }
        }
        return 0;
    },

    _anchor_update:function(s, arg) {
        var r = s.s.mat;
        if (arg.mat == NULL) {
            r.identity();
        } else {
            r = arg.mat.clone();
        }
    },

    _drawsprite:function(s, ts) {
        var temp = {};
        var temp_matrix = new ejoy2d.matrix();
        var t = sprite_trans_mul(s.t, ts, temp, temp_matrix);
        switch (s.type) {
            case TYPE_PICTURE:
                return this._drawquad(s.s.pic, t);
            case TYPE_POLYGON:
                return this._drawpolygon(rb, s.s.poly, t);
            case TYPE_ANIMATION: {
                var ani = s.s.ani;
                var frame = s.frame % s.total_frame;
                if (frame < 0) {
                    frame += s.total_frame;
                }
                frame += s.start_frame;
                var pf = ani.frame[frame];
                for (i=0;i<pf.n;i++) {
                    var pp = p.part[i];
                    var index = pp.component_id;
                    var child = s.data.children[index];
                    if ( (!child) || (!child.visible)) {
                        continue;
                    }
                    var temp2= {};
                    var temp_matrix2 = new ejoy2d.matrix();
                    var ct = sprite.trans_mul(pp.t, t, temp2, temp_matrix2);
                    var r = this._drawsprite(child, ct);
                    if (r)
                        return r;
                }
                return 0;
            }
            case TYPE_LABEL:
                if (s.data.rich_text) {
                    // don't support draw label to renderbuffer
                    return -1;
                }
                return 0;
            case TYPE_ANCHOR:
                if (s.data.anchor.ps){
                    return -1;
                }
                this._anchor_update(s, t);
                return 0;
            case TYPE_panel:
                if (s.data.scissor) {
                    return -1;
                } else {
                    return 0;
                }
        }
        return -1;
    },

    drawsprite:function(s) {
        if (s.visible) {
            return this._drawsprite(s, null);
        }
        return 0;
    },



    unload:function() {
        if (this.vbid) {
            render.release(VERTEXBUFFER, this.vbid);
            this.vbid = 0;
        }
    },


    init:function() {
        this.object = 0;
        this.texid = 0;
        this.vbid = 0;
    },
    clear:function() {
        this.object = 0;
    },

    ////////////////////////////////////
    /*         api                    */
    ///////////////////////////////////
    delbuffer:function() {
        this.unload();
    },
    upload:function() {
        if (this.vbid == 0) {
            this.vbid = render.buffer_create(VERTEXBUFFER, this.vb, this.object * 4, 4*2 + 2*2 + 4 +4);
        } else {
            render.buffer_update(this.vbid, this.vb, this.object * 4);
        }
    },
    addsprite:function(spr){
        this.drawsprite(spr);
    },
    drawbuffer:function(x, y, scale) {
        shader.drawbuffer(this, x * SCREEN_SCALE, y * SCREEN_SCALE, scale);
    }
    ////////////// end of api  ////////////////////
};
