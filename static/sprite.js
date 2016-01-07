/**
 * Created by v on 2015/6/17.
 */

var ANCHOR_ID =  -1;

var SPRFLAG_INVISIBLE= 1;
var SPRFLAG_MESSAGE = 2;
var SPRFLAG_MULTIMOUNT = 4;
var SPRFLAG_FORCE_INHERIT_FRAME = 8;

var log_cnt =0;
var do_output = false;

ejoy2d.sprite = function(pack, id) {
    // var id = pack.getIDByName(name);
    if (id == ANCHOR_ID) {
        this.initAsAnchor(id);
		return;
    }
    this.init(pack, id);
    var i = 0;
    while(true) {
		var childId = this.component(i);
		if ( childId == null )
			break;
		var c = new ejoy2d.sprite(pack, childId);
		if (c != null) {
            c.name = this.childname(i);
            this.mount(i, c);
            c.update_message(pack, id, i, this.frame);
		}
         ++i;
    }
};
var tv = new Array(10); /// for tmp vertex
/// draw_child中使用的临时变量
var tmpTrans = new ejoy2d.sprite_trans() ;
var tmpMatrix = new ejoy2d.matrix();

ejoy2d.sprite.prototype = (function () {
    
    
    //////////////////// util function //////////////////////////
    /// aabb
    function poly_aabb(n, point, srt, ts, aabb) {
        var mat;
        if (!ts) {
            mat = new ejoy2d.matrix()
        } else {
            mat = ts.clone();
        }
        mat.srt(srt);
        var m = mat.m;
                
        for (var i=0;i<n;i++) {
            var x = point[i*2];
            var y = point[i*2+1];

            var xx = (x * m[0] + y * m[2]) / 1024 + m[4];
            var yy = (x * m[1] + y * m[3]) / 1024 + m[5];

            if (xx < aabb[0])
                aabb[0] = xx;
            if (xx > aabb[2])
                aabb[2] = xx;
            if (yy < aabb[1])
                aabb[1] = yy;
            if (yy > aabb[3])
                aabb[3] = yy;
        }
    };

    function quad_aabb(pic, srt, ts, aabb) {
        for (var i=0;i<pic.n;i++) {
            poly_aabb(4, pic.rect[i].screen_coord, srt, ts, aabb);
        }
    };
    function polygon_aabb(polygon, srt, ts, aabb) {
        for (var i=0;i<polygon.n;i++) {
            var poly = polygon.poly[i];
            poly_aabb(poly.n, poly.screen_coord, srt, ts, aabb);
        }
    }

    function label_aabb(label, srt, ts, aabb) {
        var point = [
            0,0,
            label.width * SCREEN_SCALE, 0,
            0, label.height * SCREEN_SCALE,
            label.width * SCREEN_SCALE, label.height * SCREEN_SCALE,
        ];
        poly_aabb(4, point, srt, ts, aabb);
    };

    function panel_aabb(panel, srt, ts, aabb) {
        var point = [
                0,0,
                panel.width * SCREEN_SCALE, 0,
                0, panel.height * SCREEN_SCALE,
                panel.width * SCREEN_SCALE, panel.height * SCREEN_SCALE,
            ];
        poly_aabb(4, point, srt, ts, aabb);
    };
    //////////////////////// end of util functions ///////////////////////////////////////
    
    return {
        //////// utils
        update_message : function(pack, parentid, componentid, frame) {
            var ani = pack.data[parentid];
            if (frame < 0 || frame >= ani.frame.length) {
                return;
            }
            var frame = ani.frame[frame];
            for (var i =0; i < frame.length; i++) {
                if (frame[i].component_id == componentid && frame[i].touchable) {
                    this.message = true;
                    return;
                }
            }
        },
        initAsAnchor :function(id) {
            this.parent = null;
            this.t = new ejoy2d.sprite_trans();
            //this.t.color = 0xffffffff;
            //this.t.additive = 0;
            //this.t.program = BuiltinProgram.default;
            this.message = false;
            this.visible = false;	// anchor is invisible by default
            this.multimount = false;
            // this.name = null;
            this.id = ANCHOR_ID;
            this.type = SpriteType.anchor;
            this.anchor = {};
            //this.anchor.ps = null;
            // this.data.anchor->pic = NULL;
            this.s = {}
            this.s.mat = new ejoy2d.matrix();
            this.anchor.mat = this.s.mat
            // this.material = NULL;
        },
    
    
        drawquad:function(picture, srt,  arg) {
            // console.log("--->> draw child");
            var tmp = new ejoy2d.matrix();
            var vb = new Array(16);
            if (!arg.mat) {
                tmp.identity();
            } else {
                tmp = arg.mat;
            }
            tmp.srt(srt);
            var m = tmp.m;
    
            var i =0, j =0;
            for (i=0;i< picture.n;i++) {
                var q = picture.rect[i];
                var glid = ejoy2d.texture.glid(q.texid);
                if (glid == undefined)
                    continue;
                ejoy2d.shader.texture(glid, 0);
                for (j=0;j<4;j++) {
                    var xx = q.screen_coord[j*2+0];
                    var yy = q.screen_coord[j*2+1];
    
                    var vx = (xx * m[0] + yy * m[2]) / 1024 + m[4];
                    var vy = (xx * m[1] + yy * m[3]) / 1024 + m[5];
                    var tx = q.texture_coord[j*2+0];
                    var ty = q.texture_coord[j*2+1];
    
                    var tp = ejoy2d.screen.trans(vx, vy);
                    vx = tp[0];
                    vy = tp[1];
                    vb[j*4+0] = vx; // xx/1024/2 + 0.8;
                    vb[j*4+1] = vy; // yy/1024/2 - 0.8;
                    vb[j*4+2] = tx;
                    vb[j*4+3] = ty;
                }
                ejoy2d.shader.do_draw(vb, arg.color, arg.additive);
            }
        },
        drawpolygon : function(poly, srt, arg) {
            var matrix = ejoy2d.matrix;
            var texture = ejoy2d.texture;
            var shader = ejoy2d.shader;
            var tmp;
    
            if ( !arg.mat) {
                tmp = new ejoy2d.matrix();
            } else {
                tmp = arg.mat.clone();
            }
            tmp.srt(srt);
            var m = tmp.m;
            var i =0, j =0;
            for (i=0;i<poly.n;i++) {
                var p = poly.poly[i];
                var glid = texture.glid(p.texid);
                if (!glid)
                    continue;
                shader.texture(glid, 0);
                var pn = p.n;
    
                for (j=0;j<pn;j++) {
                    var xx = p.screen_coord[j*2+0];
                    var yy = p.screen_coord[j*2+1];
    
    
                    var vx = (xx * m[0] + yy * m[2]) / 1024 + m[4];
                    var vy = (xx * m[1] + yy * m[3]) / 1024 + m[5];
                    var tx = p.texture_coord[j*2+0];
                    var ty = p.texture_coord[j*2+1];
    
                    vx = this.screen_trans_x(vx);
                    vy = this.screen_trans_y(vy);
    
                    tv[j*4 +0] = vx;
                    tv[j*4 +1] = vy;
                    tv[j*4 +2] = tx;
                    tv[j*4 +3] = ty;
                }
                shader.drawpolygon(pn, tv, arg.color, arg.additive);
            }
        },
    
        init : function ( pack, id) {
            // this.parent = null;
            this.t = new ejoy2d.sprite_trans();
            // this.t.mat = null;
            // this.name = null;
            // this.t.color = 0xffffffff;
            // this.t.additive = 0;
            // this.t.program = BuiltinProgram.default;
            this.message = false;
            this.visible = true;
            this.multimount = false;
        
            this.id = id;
            this.mat = new ejoy2d.matrix();
            var pd = pack.data[id];
            this.type = pd.type;
            this.material = null;
            this.s = {};
            this.data = {};
            if (this.type == SpriteType.animation) {
                var ani = pack.data[id];
                this.s.ani = ani;
                this.frame = 0;
                this.action(null);
                this.data.children = new Array(ani.component.length);
            } else {
                if(this.type == SpriteType.picture)
                    this.s.pic = pd;
                else if(this.type == SpriteType.label)
                    this.s.label = pd;
                else if(this.type == SpriteType.panel){
                    this.s.panel = pd;
                    this.data.scissor = pd.scissor;
                }
                this.start_frame = 0;
                this.total_frame = 0;
                this.frame = 0;
                this.data = {};
            }
        },
    
        action:function(act) {
            if (this.type != SpriteType.animation) {
                return -1;
            }
            var ani = this.s.ani;
            if (!act) {
                this.start_frame = ani.action[0].start_frame;
                this.total_frame = ani.action[0].number;
                this.frame = 0;
                return this.total_frame;
            } else {
                for (var i=0;i<ani.action.length;i++) {
                    var name = ani.action[i].name;
                    if (name) {
                        if (name == act) {
                            this.start_frame = ani.action[i].start_frame;
                            this.total_frame = ani.action[i].number;
                            this.frame = 0;
                            return this.total_frame;
                        }
                    }
                }
                return -1;
            }
        },
        ////////////////////// static function
        mount:function(index, child) {
            console.assert(this.type == SpriteType.animation);
            var ani = this.s.ani;
            console.assert(index >= 0 && index < ani.component.length);
            var oldc = this.data.children[index];
            if (oldc) {
                delete oldc.parent;
                delete oldc.name;
            }
            this.data.children[index] = child;
            if (child) {
                console.assert(child.parent == null);
                if (!child.multimount) {
                    child.name = ani.component[index].name;
                    child.parent = this;
                }
                if (oldc && oldc.type == SpriteType.anchor)
                    child.message = oldc.message;
            }
        },
        real_frame:function() {
            if (this.type != SpriteType.animation) {
                return 0;
            }
    
            var f = this.frame % this.total_frame;
    
            if (f < 0) {
                f += this.total_frame;
            }
            return f;
        },
        child : function(childname) {
            if (this.type != SpriteType.animation)
                return -1;
            var ani = this.s.ani;
            for (var i=0; i < ani.component.length; i++) {
                var name = ani.component[i].name;
                if (name && name == childname) {
                    return i;
                }
            }
            return -1;
        },
    
        component:function(index) {
            if (this.type != SpriteType.animation) {
                return null;
            }
            var ani = this.s.ani;
            if (index < 0 || index >= ani.component.length) {
                return null;
            }
            return ani.component[index].id;
        },
    
        childname:function(index) {
            if (this.type != SpriteType.animation)
                return undefined;
            var ani = this.s.ani;
            if (index < 0 || index >= ani.component.length)
                return undefined;
            return ani.component[index].name;
        },
    
        mat_mul:function(a, b, tmp) {
            if (!b)
                return a;
            if (!a)
                return b;
            tmp.mul(a , b);
            return tmp;
        },
    
        switch_program:function (t, def, m) {
            var prog = t.program;
            if (prog == BuiltinProgram.default) {
                prog = def;
            }
            ejoy2d.shader.program(prog, m);
        },
    
        set_scissor:function(p, srt, arg) {
            var matrix = ejoy2d.matrix;
            var  tmp;
            if ( !arg.mat) {
                tmp = new ejoy2d.matrix();
            } else {
                tmp = arg.mat.clone();
            }
            tmp.srt(srt);
            var m = tmp.m;
            var x = [0, p.width * SCREEN_SCALE, p.width * SCREEN_SCALE, 0 ];
            var y = [0, 0, p.height * SCREEN_SCALE, p.height * SCREEN_SCALE ];
            var minx = (x[0] * m[0] + y[0] * m[2]) / 1024 + m[4];
            var miny = (x[0] * m[1] + y[0] * m[3]) / 1024 + m[5];
            var maxx = minx;
            var maxy = miny;
            for (i=1;i<4;i++) {
                vx = (x[i] * m[0] + y[i] * m[2]) / 1024 + m[4];
                vy = (x[i] * m[1] + y[i] * m[3]) / 1024 + m[5];
                if (vx<minx) {
                    minx = vx;
                } else if (vx > maxx) {
                    maxx = vx;
                }
                if (vy<miny) {
                    miny = vy;
                } else if (vy > maxy) {
                    maxy = vy;
                }
            }
            minx /= SCREEN_SCALE;
            miny /= SCREEN_SCALE;
            maxx /= SCREEN_SCALE;
            maxy /= SCREEN_SCALE;
            ejoy2d.scissor.push(minx,miny,maxx-minx,maxy-miny);
        },
    
        anchor_update:function(srt, arg) {
            var r = this.s.mat;
            if (!arg.mat) {
                r.identity();
            } else {
                r = arg.mat.clone();
            }
            r.srt(srt);
        },
    
        label_pos:function(m, l, pos) {
            var c_x = l.width * SCREEN_SCALE / 2.0;
            var c_y = l.height * SCREEN_SCALE / 2.0;
            pos[0] = Math.floor(((c_x * m[0] + c_y * m[2]) / 1024 + m[4])/SCREEN_SCALE);
            pos[1] = Math.floor(((c_x * m[1] + c_y * m[3]) / 1024 + m[5])/SCREEN_SCALE);
        },
    
        picture_pos:function(m, picture, pos) {
            var max_x = Number.MIN_VALUE;
            var max_y = Number.MIN_VALUE;
            var min_x = Number.MAX_VALUE;
            var min_y = Number.MAX_VALUE;
            for (i=0;i<picture.n;i++) {
                var q = picture.rect[i];
                for (j=0;j<4;j++) {
                    var xx = q.screen_coord[j*2+0];
                    var yy = q.screen_coord[j*2+1];
    
                    if (xx > max_x) max_x = xx;
                    if (yy > max_y) max_y = yy;
                    if (xx < min_x) min_x = xx;
                    if (yy < min_y) min_y = yy;
                }
            }
    
            var c_x = (max_x + min_x) / 2.0;
            var c_y = (max_y + min_y) / 2.0;
            pos[0] = Math.floor(((c_x * m[0] + c_y * m[2]) / 1024 + m[4])/SCREEN_SCALE);
            pos[1] = Math.floor(((c_x * m[1] + c_y * m[3]) / 1024 + m[5])/SCREEN_SCALE);
        },
    
        drawparticle:function(ps, pic, srt) {
            var n = ps.particleCount;
            var old_m = this.t.mat;
            var old_c = this.t.color;
    
            shader.blend(ps.config.srcBlend, ps.config.dstBlend);
            for (i=0;i<n;i++) {
                var p = ps.particles[i];
                var mat = ps.matrix[i];
                var color = p.color_val;
    
                this.t.mat = mat;
                this.t.color = color;
                this.drawquad(pic, null, this.t);
            }
            shader.defaultblend();
    
            this.t.mat = old_m;
            this.t.color = old_c;
        },
    
    
        draw_child:function(srt, ts, material) {
            var tmpTrans = new ejoy2d.sprite_trans();
            // mat.make_identity();
            // tmpTrans.mat = mat;
            //tmpTrans.mat.make_identity(do_output);
            if(do_output)
            {
                console.log(this.t)
                console.log(tmpTrans)
            }
            
            var t = tmpTrans.mul(this.t, ts, do_output);

            if(do_output) {
                do_output = false;
                console.log("---->>>> output 1111", this.t, ts, this.type);
            }
            
            if (this.material) {
                material = this.material;
            }
            switch (this.type) {
                case SpriteType.picture:
                    this.switch_program(t, BuiltinProgram.picture, material);
                    this.drawquad(this.s.pic, srt, t);
                    return 0;
                case SpriteType.polygon:
                    this.switch_program(t, BuiltinProgram.picture, material);
                    this.drawpolygon(this.s.poly, srt, t);
                    return 0;
                case SpriteType.label:
                    if (this.data.rich_text) {
                        t.program = BuiltinProgram.default;    // label never set user defined program
                        this.switch_program(t,
                            this.s.label.edge ? BuiltinProgram.textEdge : BuiltinProgram.text,
                            material);
                        ejoy2d.label.draw(this.data.rich_text, this.s.label, srt, t);
                    }
                    return 0;
                case SpriteType.anchor:
                    if (this.data.anchor.ps){
                        this.switch_program(t, BuiltinProgram.picture, material);
                        this.drawparticle(this.data.anchor.ps, this.data.anchor.pic, srt);
                    }
                    this.anchor_update( srt, t);
                    return 0;
                case SpriteType.animation:
                    break;
                case SpriteType.panel:
                    if (this.data.scissor) {
                        // enable scissor
                        this.set_scissor(this.s.panel, srt, t);
                        return 1;
                    } else {
                        return 0;
                    }
                default:
                    // todo : invalid type
                    return 0;
            }
    
            // draw animation
            var ani = this.s.ani;
            var fi = this.real_frame() + this.start_frame;
            var frame = ani.frame[fi];
    
            var scissor = 0;
            for (var i=0;i< frame.length;i++) {
                var f = frame[i];
                var index = f.component_id;
                var child = this.data.children[index];
                if ((!child) || (!child.visible)) {
                    continue;
                }
                var tmp2 = new ejoy2d.sprite_trans();
                if(index == 19 && log_cnt <1) {
                    console.log("---->>> frame:", f);
                    log_cnt ++;
                    do_output = true;  
                }
                var ct = tmp2.mul(f.t, t);
                scissor += child.draw_child(srt, ct, material);
            }
            for (var i=0;i<scissor;i++) {
                ejoy2d.scissor.pop();
            }
            return 0;
        },
    
        child_visible:function(childname) {
            var ani = this.s.ani;
            var frame = this.real_frame() + this.start_frame;
            var f = ani.frame[frame];
            for(var i =0; i < f.length; ++i ) {
                var pp = f[i];
                var index = pp.component_id;
                var child = this.data.children[index];
                if (child.name && childname == child.name) {
                    return true;
                }
            }
            return false;
        },
    
        draw:function(srt) {
            if (this.visible) {
                this.draw_child(srt);
            }
        },
    
        draw_as_child:function(srt, mat, color) {
            if (this.visible) {
                var st= {};
                st.mat = mat.clone();
                st.color = color;
                st.additive = 0;
                st.program = BuiltinProgram.default;
                this.draw_child(srt, st);
            }
        },
    
        pos:function(srt, m, pos) {
            var matrix = ejoy2d.matrix;
            var temp = new ejoy2d.matrix();
            var t = this.mat_mul(s.t.mat, m, temp);
                t.srt(srt);
            switch (this.type) {
                case SpriteType.picture:
                    this.picture_pos(t.m, this.s.pic, pos);
                    return 0;
                case SpriteType.label:
                    this.label_pos(t.m, this.s.label, pos);
                    return 0;
                case SpriteType.animation:
                case SpriteType.panel:
                    pos[0] = t.m[4] / SCREEN_SCALE;
                    pos[1] = t.m[5] / SCREEN_SCALE;
                    return 0;
                default:
                    return 1;
            }
    
        },
    
        matrix:function(mat) {
            var parent = this.parent;
            if (parent) {
                console.assert(parent.type == SpriteType.animation);
                parent.matrix(mat);
                var matrix = ejoy2d.matrix;
                var tmp = new ejoy2d.matrix();
                var parent_mat = parent.t.mat;
    
                var child_mat = null;
                var ani = parent.s.ani;
                var fid = parent.real_frame() + parent.start_frame;
                var frame = ani.frame[fid];
                var i =0;
                for (i=0;i < frame.length;i++) {
                    var pp = frame[i];
                    var index = pp.component_id;
                    var child = parent.data.children[index];
                    if (child == this) {
                        child_mat = pp.t.mat;
                        break;
                    }
                }
                if ( (!parent_mat) && (!child_mat))
                    return;
    
                if (parent_mat) {
                    tmp.mul(parent_mat, mat);
                } else {
                    tmp = mat.clone();
                }
    
                if (child_mat) {
                    mat.mul(child_mat, tmp);
                } else {
                    mat.copy(tmp);
                }
            } else {
                mat.identity();
            }
        },

        /************************ aabb *******************************/    
        child_aabb:function(srt, mat, aabb) {
            var temp = new ejoy2d.matrix();
            var t = this.mat_mul(this.t.mat, mat, temp);
            switch (this.type) {
                case SpriteType.picture:
                    quad_aabb(this.s.pic, srt, t, aabb);
                    return 0;
                case SpriteType.polygon:
                    polygon_aabb(this.s.poly, srt, t, aabb);
                    return 0;
                case SpriteType.label:
                    label_aabb(this.s.label, srt, t, aabb);
                    return 0;
                case SpriteType.animation:
                    break;
                case SpriteType.panel:
                    panel_aabb(this.s.panel, srt, t, aabb);
                    return this.data.scissor;
                default:
                    // todo : invalid type
                    return 0;
            }
            // draw animation
            var ani = this.s.ani;
            var frame = this.real_frame() + this.start_frame;
            var pf = ani.frame[frame];
            for (var i=0; i<pf.length; i++) {
                var pp = pf[i];
                var index = pp.component_id;
                var child = this.data.children[index];
                if ( (!child) || (!child.visible)) {
                    continue;
                }
                var temp2 = new ejoy2d.matrix();
                var ct = this.mat_mul(pp.t.mat, t, temp2);
                if (child.child_aabb(srt, ct, aabb))
                    break;
            }
            return 0;
        },
    
        aabb:function(srt, world_space, aabb) {
            if (this.visible) {
                var tmp = new ejoy2d.matrix();
                if (world_space) {
                    this.matrix(tmp);
                }
                aabb[0] = Number.MAX_VALUE;
                aabb[1] = Number.MAX_VALUE;
                aabb[2] = Number.MIN_VALUE;
                aabb[3] = Number.MIN_VALUE;
    
                this.child_aabb(srt, tmp, aabb);
                for (var i=0;i<4;i++)
                    aabb[i] /= SCREEN_SCALE;
            } else {
                for (var i=0;i<4;i++)
                    aabb[i] = 0;
            }
        },
    
        // test
        test_quad:function(pic, x, y) {
            var p;
            for (p=0;p<pic.n;p++) {
                var pq = pic.rect[p];
                var maxx,maxy,minx,miny;
                minx= maxx = pq.screen_coord[0];
                miny= maxy = pq.screen_coord[1];
                for (var i=2;i<8;i+=2) {
                    var x = pq.screen_coord[i];
                    var y = pq.screen_coord[i+1];
                    if (x<minx)
                        minx = x;
                    else if (x>maxx)
                        maxx = x;
                    if (y<miny)
                        miny = y;
                    else if (y>maxy)
                        maxy = y;
                }
                if (x>=minx && x<=maxx && y>=miny && y<=maxy)
                    return true;
            }
            return false;
        },
    
        test_polygon:function(poly,  x, y) {
            var p =0, i =0;
            for (p=0;p<poly.n;p++) {
                var pp = poly.poly[p];
                var maxx,maxy,minx,miny;
                minx= maxx = pp.screen_coord[0];
                miny= maxy = pp.screen_coord[1];
                for (i=1;i<pp.n;i++) {
                    var x = pp.screen_coord[i*2+0];
                    var y = pp.screen_coord[i*2+1];
                    if (x<minx)
                        minx = x;
                    else if (x>maxx)
                        maxx = x;
                    if (y<miny)
                        miny = y;
                    else if (y>maxy)
                        maxy = y;
                }
                if (x>=minx && x<=maxx && y>=miny && y<=maxy) {
                    return true;
                }
            }
            return false;
        },
    
        test_label:function(label, x, y) {
            x /= SCREEN_SCALE;
            y /= SCREEN_SCALE;
            return x>=0 && x<label.width && y>=0 && y<label.height;
        },
    
        test_panel:function(panel, x, y) {
            x /= SCREEN_SCALE;
            y /= SCREEN_SCALE;
            return x>=0 && x<panel.width && y>=0 && y<panel.height;
        },
    
        check_child:function(srt, t, pf, i, x, y) {
            var pp = pf[i];
            var index = pp.component_id;
            var child = this.data.children[index];
            if ( (!child) || (!child.visible)) {
                return [false, null];
            }
            var temp2 = new ejoy2d.matrix();
            var ct = this.mat_mul(pp.t.mat, t, temp2);
            return child.test_child(srt, ct, x, y);
        },
    
        /*
        return 1 : test succ
        0 : test failed, but *touch capture the message
        */
        test_animation:function(srt, t, x, y) {
            var ani = this.s.ani;
            var fid = this.real_frame() + this.start_frame;
            var frame = ani.frame[fid];
            var start = frame.length -1;
            do {
                var scissor = -1;
                // find scissor and check it first
                var i =0;
                for (i=start;i>=0;i--) {
                    var pp = frame[i];
                    var index = pp.component_id;
                    var c = this.data.children[index];
                    if ( (!c) || (!c.visible)) {
                        continue;
                    }
                    if (c.type == SpriteType.panel && c.data.scissor) {
                        scissor = i;
                        break;
                    }
                }
                if (scissor >=0) {
                    var tmp = this.check_child(srt, t, frame, scissor, x, y);
                    if (!tmp) {
                        start = scissor - 1;
                        continue;
                    }
                } else {
                    scissor = 0;
                }
                for (i=start;i>=scissor;i--) {
                    var rlt = this.check_child(srt, t,  frame, i, x, y);
                    if (rlt[0])
                        return rlt;
                }
                start = scissor - 1;
            } while(start >= 0);
            return [false, null];
        },
    
        test_child:function(srt, ts, x, y) {
            var temp = new ejoy2d.matrix();
            var t = this.mat_mul(this.t.mat, ts, temp);
            if (this.type == SpriteType.animation) {
                var rlt = this.test_animation(srt, t, x, y);
                if (rlt[0]) {
                    return rlt;
                } else if (rlt[1]) {
                    if (this.message) {
                        rlt[1] = this;
                        rlt[0] = true;
                        return rlt;
                    } else {
                        rlt[0] = false;
                        return rlt;
                    }
                }
            }
            var rlt= [false, null];
            var mat;
            if (!t) {
                mat = new ejoy2d.matrix();
            } else {
                mat = t.clone();
            }
            mat.srt(srt);
            var imat = new ejoy2d.matrix();
            if (mat.inverse(imat)) {
                // invalid matrix
                rlt[0] = false;
                rlt[1] = null;
                return rlt;
            }
    
            var m = imat.m;
            var xx = (x * m[0] + y * m[2]) / 1024 + m[4];
            var yy = (x * m[1] + y * m[3]) / 1024 + m[5];
    
            var  tmp = this;
            switch (this.type) {
                case SpriteType.picture:
                    rlt[0] = this.test_quad(this.s.pic, xx, yy);
                    break;
                case SpriteType.polygon:
                    rlt[0] = this.test_polygon(this.s.poly, xx, yy);
                    break;
                case SpriteType.label:
                    rlt[0] = this.test_label(this.s.label, xx, yy);
                    break;
                case SpriteType.panel:
                    rlt[0] = this.test_panel(this.s.panel, xx, yy);
                    break;
                case SpriteType.anchor:
                    rlt[0] = false;
                    return rlt;
            }
            
            if (rlt[0]) {
                rlt[1] = tmp;
                rlt[0] = this.message;
            } else {
                rlt[1] = null;
            }
            return rlt;
        },
    
        test:function(x, y, srt) {
            var rlt = this.test_child(srt, null, x, y);
            if (rlt[0]) {
                return rlt[1];
            }
            if (rlt[1]) {
                return this;
            }
            return null;
        },
    
        _propagate_frame : function(i, force_child) {
            var child = this.data.children[i];
            if ( (!child) || child.type != SpriteType.animation) {
                return false;
            }
            if (child.flags & SPRFLAG_FORCE_INHERIT_FRAME) {
                return true;
            }
            var ani = this.s.ani;
            if (ani.component[i].id == ANCHOR_ID) {
                return false;
            }
            if (force_child) {
                return true;
            }
            if ( !ani.component[i].name ) {
                return true;
            }
            return false;
        },
        setframe:function(frame, force_child) {
            if (this.type != SpriteType.animation)
                return 0;
            this.frame = frame;
            var total_frame = this.total_frame;
            var ani = this.s.ani;
            for (var i=0; i<ani.component.length; i++) {
                if (this._propagate_frame(i, force_child)) {
                    var t = this.data.children[i].setframe(frame, force_child);
                    if (t > total_frame) {
                        total_frame = t;
                    }
                }
            }
            return total_frame;
        },
    
        fetch : function(name) {
            var idx = this.child(name);
            if(idx >= 0)
            {
                return this.data.children[idx];
            }
        },
    
        ////// get/set
        setText : function(text) {
            var r = {};
            this.data.rich_text = r;
            r.text = text;
            r.fields = new Array();
            for(var i = 0; i < 1; ++i) {
                var f = {};
                r.fields[i] = f;
            }
        },
        
        enableScissor : function(enable) {
            console.assert(this.type == SpriteType.panel);
            this.data.scissor = enable;
        },
    
        char_size : function(char_sizes, txt) {
            console.assert(this.type == SpriteType.label);
            char_sizes[0] = this.s.label.width;
            char_sizes[1] = this.s.label.height;
    
            var rlt;
            var idx =2;
            for(var i =0; i < txt.length; ++i) {
                rlt = ejoy2d.label.char_size(this.s.label, txt.charAt(i));
                char_sizes[idx] = rlt[0];
                char_sizes[idx +1] = rlt[1];
                idx +=2;
            }
        },
        /**************************** transform ************************************/
        ps : function(arg1, arg2, arg3) {
            console.assert(arg1 != undefined);
            var m = this.mat;
            if(!this.t.mat) {
                m.identity();
                this.t.mat = m;
            }
            var mat = m.m;
            if(arg3==undefined) {
                if(arg2 == undefined){
                    var scale = Math.round(arg1 * 1024);
                    mat[0] = scale;
                    mat[1] = 0;
                    mat[2] = 0;
                    mat[3] = scale;
                }
                else {
                    var tx = arg1 * SCREEN_SCALE;
                    var ty = arg2 * SCREEN_SCALE;
                    mat[4] = tx;
                    mat[5] = ty;
                }
            }
            else {
                var tx = arg1 *SCREEN_SCALE;
                var ty = arg2 *SCREEN_SCALE;
                var scale = arg3 *1024;
                mat[0] = scale;
                mat[1] = 0;
                mat[2] = 0;
                mat[3] = scale;
                mat[4] = tx;
                mat[5] = ty;
            }
        },
        sr : function(arg1, arg2, arg3) {
            var m = this.mat;
            if(!this.t.mat) {
                m.identity();
                this.t.mat = m;
            }
            var sx = 1024, sy = 1024, rot = 0;
            if(arg3==undefined) {
                if(arg2 == undefined){
                    rot = arg1 * EJMAT_R_FACTOR / 360.0;
                }
                else {
                    sx = arg1 * 1024;
                    sy = arg2 * 1024;
                }
            }
            else {
                sx = arg1 * 1024;
                sy = arg2 * 1024;
                rot = arg3 * EJMAT_R_FACTOR / 360.0;
            }
            m.sr(sx, sy, rot);
        },
        
        /************************* end of transform ********************************/
    
        // --------------------- API -----------------------///
        // ------------------ end of API -----------------////
    };
})();


