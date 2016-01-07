/**
 * Created by v on 2015/6/15.
 */

var BuiltinProgram = {
    default : -1,
    picture : 0,
    renderbuffer : 1,
    text : 2,
    textEdge : 3,
    geometry : 4,
};

ejoy2d.shader = (function(){

var geoVS = "\
	precision lowp float;\
	attribute vec4 position;\
	attribute vec2 texcoord;\
	attribute vec4 color;\
	varying vec4 v_color;\
	varying vec2 v_texcoord;\
	void main() {\
		gl_Position = position + vec4(-1.0, 1.0, 0.0,0.0);\
		v_color = color;\
		v_texcoord = texcoord;\
	}";
var geoFS ="\
	precision highp float;\
	varying vec2 v_texcoord;\
	varying vec4 v_color;\
	uniform sampler2D texture0;\
	void main() {\
		gl_FragColor = texture2D(texture0, v_texcoord);\
	}";


var spriteFS = "\
	precision highp float;\
	varying vec2 v_texcoord;\
	varying vec4 v_color;\
	varying vec4 v_additive;\
	uniform sampler2D texture0;\
	void main() {\
		gl_FragColor = texture2D(texture0, v_texcoord);\
	}";

var spriteVS = "\
        precision lowp float;\
		attribute vec4 position;\
		attribute vec2 texcoord;\
		attribute vec4 color;\
		attribute vec4 additive;\
		varying vec2 v_texcoord;\
		varying vec4 v_color;\
		varying vec4 v_additive;\
		void main() {\
			gl_Position = position + vec4(-1.0,1.0,0,0);\
			v_texcoord = texcoord;\
			v_color = color;\
			v_additive = additive;\
		}";


var textFS = "\
        precision highp float;\
		varying vec2 v_texcoord;\
		varying vec4 v_color;\
		varying vec4 v_additive;\
		uniform sampler2D texture0;\
		void main() {\
            gl_FragColor = texture2D(texture0, v_texcoord);\
		}";
        
            // float c = texture2D(texture0, v_texcoord).r;\
			// float alpha = clamp(c, 0.0, 0.5) * 2.0;\
			// gl_FragColor.xyz = (v_color.xyz + v_additive.xyz) * alpha;\
			// gl_FragColor.w = alpha;\
			// gl_FragColor *= v_color.w;\

    
    var MAX_UNIFORM = 16;
    var MAX_TEXTURE_CHANNEL = 8;

    var MAX_COMMBINE = 512;
    var MAX_PROGRAM = 8;
    var ATTRIB_VERTEX = 0;
    var ATTRIB_TEXTCOORD = 1;
    var ATTRIB_COLOR = 2;

    var _RS = null;
    return {
        init: function () {
            if (_RS) return;

            var rs = {
                current_program: null,
                blendchange: 0,
                object: 0,
                tex : []
            };
            rs.program = [];
            for (i = 0; i < MAX_PROGRAM; ++i) {
                rs.program[i] = {};
            }

            var renderInitArgs = {};
            renderInitArgs.max_buffer = 128;
            renderInitArgs.max_layout = 4;
            renderInitArgs.max_target = 128;
            renderInitArgs.max_texture = 256;
            renderInitArgs.max_shader = MAX_PROGRAM;

            rs.R = render.init(renderInitArgs);
            texture.init_render(rs.R);
            // ejoy2d.screen.init_render(rs.R);
            //label.init_render(rs.R);
            //sprite.init_render(rs.R);
            ///renderbuffer.init_render(rs.R);

            render.setblend(BLEND_ONE, BLEND_ONE_MINUS_SRC_ALPHA);

            rs.index_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rs.index_buffer);

            var idxs = new Uint16Array(6 *MAX_COMMBINE);
            for (i = 0; i < MAX_COMMBINE; i++) {
                idxs[i * 6] = i * 4;
                idxs[i * 6 + 1] = i * 4 + 1;
                idxs[i * 6 + 2] = i * 4 + 2;
                idxs[i * 6 + 3] = i * 4;
                idxs[i * 6 + 4] = i * 4 + 2;
                idxs[i * 6 + 5] = i * 4 + 3;
            }

            rs.index_buffer = render.buffer_create(INDEXBUFFER, idxs, 6 * MAX_COMMBINE, 2);
            rs.vertex_buffer = render.buffer_create(VERTEXBUFFER, null,  4 * MAX_COMMBINE, 2*4 + 2*2 + 4 +4);

            var va = [
                { name: "position", vbslot : 0, n : 2, size: 4, offset : 0 },
                { name: "texcoord", vbslot : 0, n : 2, size: 2, offset : 8 },
                { name: "color",    vbslot : 0, n : 4, size: 1, offset : 12 },
                { name: "additive", vbslot : 0, n : 4, size: 1, offset : 16 },
            ];
            rs.layout = render.register_vertexlayout(4, va);
            rs.vb = new ejoy2d.renderbuffer();
            render.set(VERTEXLAYOUT, rs.layout, 0);
            render.set(INDEXBUFFER, rs.index_buffer, 0);
            render.set(VERTEXBUFFER, rs.vertex_buffer, 0);

            _RS = rs;
            
            ejoy2d.shader.load(BuiltinProgram.geometry, geoFS, geoVS);
	        ejoy2d.shader.load(BuiltinProgram.picture, spriteFS, spriteVS);
            ejoy2d.shader.load(BuiltinProgram.text, textFS, spriteVS);
            
        },
        reset:function() {
            render.state_reset();
            render.setblend(BLEND_ONE, BLEND_ONE_MINUS_SRC_ALPHA);
            if (_RS.current_program != -1) {
                render.shader_bind(_RS.program[_RS.current_program].prog);
            }
            render.set(VERTEXLAYOUT, rs.layout, 0);
            render.set(TEXTURE, _RS.tex[0], 0);
            render.set(INDEXBUFFER, _RS.index_buffer,0);
            render.set(VERTEXBUFFER, _RS.vertex_buffer,0);
        },

        program_init: function (p, fs, vs, texUniformNames) {
            var args = {};
            args.vs = vs;
            args.fs = fs;
            args.texture = texture;
            args.texture_uniform = texUniformNames;
            p.prog = render.shader_create(args);
            render.shader_bind(p.prog);
            render.shader_bind(0);
        },



        renderbuffer_commit:function(rb) {
            render.draw(DRAW_TRIANGLE, 0, 6 * rb.object);
        },

        rs_commit: function() {
            var rb = _RS.vb;
            if (rb.object == 0)
                return;
            render.buffer_update(_RS.vertex_buffer, rb.quad, 4 * rb.object);
            this.renderbuffer_commit(rb);

            rb.object = 0;
        },

        drawbuffer : function(rb, tx, ty, scale) {
           this.rs_commit();

            var glid = texture.glid(rb.texid);
            if (!glid)
                return;
            this.texture(glid, 0);
            render.set(VERTEXBUFFER, rb.vbid, 0);

            var transed = ejoy2d.screen.trans(scale,scale);
            var sx = transed[0];
            var sy = transed[1];
            transed = ejoy2d.screen.trans(tx, ty);
            var tx = transed[0];
            var ty = transed[1];
            var v = [sx, sy, tx, ty];
            // we should call shader_adduniform to add "st" uniform first
            this.setuniform(PROGRAM_RENDERBUFFER, 0, UNIFORM_FLOAT4, v);

            this.program(PROGRAM_RENDERBUFFER);

            this.renderbuffer_commit(rb);

            render.set(VERTEXBUFFER, _RS.vertex_buffer, 0);
        },

        texture: function (id, channel) {
            console.assert(channel < MAX_TEXTURE_CHANNEL);
            var ts = _RS.tex;
            if (ts[channel] != id) {
                this.rs_commit();
                ts[channel] = id;
                render.set(TEXTURE, id, channel);
            }
        },
        apply_uniform: function(p) {
            for (var i=0;i<p.uniform_number;i++) {
                if (p.uniform_change[i]) {
                    var u = p.uniform[i];
                    if (u.loc >=0) 
                        render.shader_setuniform(u.loc, u.type, p.uniform_value, u.offset);
                }
            }
            p.reset_uniform = false;
        },

        program: function (n, m) {
            var p = _RS.program[n];
            if (_RS.current_program != n || p.reset_uniform || m) {
                this.rs_commit();
            }
            if (_RS.current_program != n) {
                _RS.current_program = n;
                render.shader_bind(p.prog);
                delete p.material;
                this.apply_uniform(p);
            } else if (p.reset_uniform) {
                this.apply_uniform(p);
            }
            if (m) {
                m.apply(_RS, n);
            }
        },

        mask: function (x, y) {
            var rs = _RS;
            var p = rs.program[rs.current_program];
            if (!p || p.mask == null)
                return;
            if (p.arg_mask_x == x && p.arg_mask_y == y)
                return;
            p.arg_mask_x = x;
            p.arg_mask_y = y;
            gl.uniform2f(p.mask, x, y);
        },

        do_draw: function (vb, color, additive) {
            if (_RS.vb.add(vb, color, additive)) {
                this.rs_commit();
            }
        },

        draw_quad: function (vbp, color, max, index) {
            var vb = new Array(16);
            var i = 0;
            /// first point
            for (i = 0; i < 4; ++i) {
                vb[i] = vbp[i]
            }

            /// other vertex
            for (i = 1; i < 4; i++) {
                var j = i + index;
                var n = (j <= max) ? j : max;
                for (var u = 0; u < 4; ++u) {
                    vb[u + i * 4] = vbp[n * 4 + u];
                }
            }
            this.do_draw(vb, color);
        },


        drawpolygon: function (n, vb, color, additive) {
            var i = 0;
            --n;
            do {
                this.draw_quad(vb, color, n, i);
                i += 2;
            } while (i < n - 1);
        },

        flush: function () {
            this.rs_commit();
        },

        defaultblend: function () {
            var rs = _RS;
            if (rs.blendchange) {
                this.rs_commit();
                rs.blendchange = false;
                render.setblend(BLEND_ONE, BLEND_ONE_MINUS_SRC_ALPHA);
            }
        },
        scissortest:function(enable) {
            render.enablescissor(enable);
        },
        uniformsize:function(t) {
            var n = 0;
            switch(t) {
            case UNIFORM_INVALID:
                n = 0;
                break;
            case UNIFORM_FLOAT1:
                n = 1;
                break;
            case UNIFORM_FLOAT2:
                n = 2;
                break;
            case UNIFORM_FLOAT3:
                n = 3;
                break;
            case UNIFORM_FLOAT4:
                n = 4;
                break;
            case UNIFORM_FLOAT33:
                n = 9;
                break;
            case UNIFORM_FLOAT44:
                n = 16;
                break;
            }
            return n;
        },
        setuniform:function(prog, index, t, v) {
            this.rs_commit();
            var p = _RS.program[prog];
            console.assert(index >= 0 && index < p.uniform_number);
            var u = p.uniform[index];
            console.assert(t == u.type);
            var n = this.uniformsize(t);
            var offset = u.offset;
            for(var i = 0; i < n; ++i) {
                p.uniform_value[offset +i] = v[i];
            }
            p.reset_uniform = true;
            p.uniform_change[index] = true;
        },

        adduniform:function(prog, name, t) {
            // reset current_program
            console.assert(prog >=0 && prog < MAX_PROGRAM);
            this.program(prog);
            var p = _RS.program[prog];
            console.assert(p.uniform_number < MAX_UNIFORM);
            var loc = render.shader_locuniform(name);
            var index = p.uniform_number++;
            var u = p.uniform[index];
            u.loc = loc;
            u.type = t;
            if (index == 0) {
                u.offset = 0;
            } else {
                var lu = p.uniform[index-1];
                u.offset = lu.offset + this.uniformsize(lu.type);
            }
            if (loc < 0)
                return -1;
            return index;
        },
        //////////////////////////////////////////////
        /////////////////// API //////////////////////
        load: function (prog, fs, vs, texture, texUniformNames) {
            if(!texture) {
                texture = 0;
                texUniformNames = new Array();
            }
            var rs = _RS;
            console.assert(prog >= 0 && prog < MAX_PROGRAM);
            var p = rs.program[prog];
            if(p.prog){
                render.release(SHADER, p.prog);
                p.prog = 0;
            }
            this.program_init(p, fs, vs, texUniformNames);
            p.texture_number = texture;
            _RS.current_program = -1;
        },

        unload: function () {
            if (_RS == NULL) {
                return;
            }

            texture.initrender();
            ejoy2d.screen.initrender();
            //label.initrender();
            sprite.initrender();
            renderbuffer.initrender();

            render.exit();
            _RS = null;
        },
        blend: function (m1, m2) {
            if((!m1) || (!m2))
            {
                this.defaultblend();
            }
            if (m1 != BLEND_GL_ONE || m2 != BLEND_GL_ONE_MINUS_SRC_ALPHA) {
                this.rs_commit();
                _RS.blendchange = true;
                var src = blendmode.blend_mode(m1);
                var dst = blendmode.blend_mode(m2);
                render.setblend(src, dst);
            }
        },
        /*
         int texture
         table float[16]
         uint32_t color
         uint32_t additive
         */
        draw:function(tex, vb, color, additive) {
            var texid = texture.glid(tex);
            if (texid == undefined) {
                return false;
            }
            if(color == undefined) {
                color = 0xffffffff;
            }
            if( additive == undefined) {
                additive = 0;
            }
            this.program(BuiltinProgram.picture, null);
            this.texture(texid, 0);

            var cnt = vb.length/4;
            var vbb = [];
            for (var i=0;i<cnt;i++) {
                var idx = i*2;
                var tx = vb[idx];
                var ty = vb[idx +1];
                var vx = vb[idx + cnt*2];
                var vy = vb[idx + cnt*2 +1];
                var tmp = ejoy2d.screen.trans(vx,vy);
                var idx2 = i*4;
                vbb[idx2] = tmp[0] + 1.0;
                vbb[idx2 +1] = tmp[1] - 1.0;

                tmp = texture.texcoord(tex, tx, ty);
                vbb[idx2 +2] = tmp[0];
                vbb[idx2 +3] = tmp[1];
            }
            if (cnt == 4) {
                this.do_draw(vbb, color, additive);
            } else {
                this.drawpolygon(cnt, vbb, color, additive);
            }
            return false;
        },
        clear : function(argb) {
            if(!argb) {
                argb = 0xff000000;
            }
            render.clear(MASKC, argb);
        },
        version:function() {
            return render.version();
        },
        uniform_bind:function(prog, uniforms) {
            for (i=0;i<uniforms.length;i++) {
                var u = uniforms[i];
                var name = u.name;
                var t = u.type;
                var loc = this.adduniform(prog, name, t);
                if (loc != i) {
                    Console.error("!Warning : Invalid uniform location %s", name);
                }
            }
        },
        uniform_set:function(prog, index, t, values) {
            var n = shader.uniformsize(t);
            if (n == 0) {
               Console.error("Invalid uniform format %d", t);
            }
            var cnt = values.length;
            if (cnt != n) {
                Console.error("Need float %d, only %d passed", n, cnt);
            }
            this.setuniform(prog, index, t, values);
            return 0;
        },
        shader_texture:function(texid, channel) {
            var id = 0;
            if (texid) {
                id = texture.glid(texid);
            }
            if(!channel) {
                channel = 0;
            }
            this.texture(id, channel);
            return 0;
        }
        ///////////////end of api////////////////////
        ////////////////////////////////////////////
    };

})();
