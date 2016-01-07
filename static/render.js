/**
 * Created by v on 2015/6/17.
 */
/// RENDER_OBJ
var INVALID = 0;
var VERTEXLAYOUT = 1;
var VERTEXBUFFER = 2;
var INDEXBUFFER = 3;
var TEXTURE = 4;
var TARGET = 5;
var SHADER = 6;

/// texture type
var TEXTURE_2D = 0;
var TEXTURE_CUBE = 1;

/// texture format
var TEXTURE_INVALID= 0;
var TEXTURE_RGBA8 = 1;
var TEXTURE_RGBA4 = 2;
var TEXTURE_RGB = 3;
var TEXTURE_RGB565 = 4;
var TEXTURE_A8 = 5;
var TEXTURE_DEPTH = 6;  // use for render target
var TEXTURE_PVR2 = 7;
var TEXTURE_PVR4 = 8;
var TEXTURE_ETC1 = 9;

/// clear mask
var MASKC = 0x1;
var MASKD = 0x2;
var MASKS = 0x4;

/// blend format
var BLEND_DISABLE = 0;
var BLEND_ZERO = 1;
var BLEND_ONE = 2;
var BLEND_SRC_COLOR = 3;
var BLEND_ONE_MINUS_SRC_COLOR = 4;
var BLEND_SRC_ALPHA = 5;
var BLEND_ONE_MINUS_SRC_ALPHA = 6;
var BLEND_DST_ALPHA = 7;
var BLEND_ONE_MINUS_DST_ALPHA = 8;
var BLEND_DST_COLOR = 9;
var BLEND_ONE_MINUS_DST_COLOR = 10;
var BLEND_SRC_ALPHA_SATURATE = 11;

/// uniform format
var UNIFORM_INVALID = 0;
var UNIFORM_FLOAT1 = 1;
var UNIFORM_FLOAT2 = 2;
var UNIFORM_FLOAT3 = 3;
var UNIFORM_FLOAT4 = 4;
var UNIFORM_FLOAT33 = 5;
var UNIFORM_FLOAT44 = 6;

/// DRAW_MODE {
var DRAW_TRIANGLE = 0;
var DRAW_LINE = 1;

/// CULL_MODE {
var CULL_DISABLE = 0;
var CULL_FRONT = 1;
var CULL_BACK = 2;

/// depth test func
var DEPTH_DISABLE = 0;
var DEPTH_LESS_EQUAL = 1;
var DEPTH_LESS = 2;
var DEPTH_EQUAL = 3;
var DEPTH_GREATER = 4;
var DEPTH_GREATER_EQUAL = 5;
var DEPTH_ALWAYS = 6;

var MAX_VB_SLOT = 8;
var MAX_ATTRIB = 16;
var MAX_TEXTURE = 8;
var CHANGE_INDEXBUFFER = 0x1;
var CHANGE_VERTEXBUFFER = 0x2;
var CHANGE_TEXTURE = 0x4;
var CHANGE_BLEND = 0x8;
var CHANGE_DEPTH = 0x10;
var CHANGE_CULL = 0x20;
var CHANGE_TARGET = 0x40;
var CHANGE_SCISSOR = 0x80;



ejoy2d.render =(function() {
    function RenderState(){
        this.indexbuffer =0;
        this.target =0;
        this.blend_src =0;
        this.blend_dst =0;
        this.depth = 0;
        this.cull =0;
        this.depthmask =0;
        this.scissor = false;
        this.texture = new Array();
    };
    var _R = {
        name:'render',

    };
    function AttribLayout (){
        this.vbslot = 0;
        this.size = 0;
        this.type = 0;
        this.normalized = false;
        this.offset =0;
    };
    function ShaderType() {
        glid = null;
        this.n = 0;
        this.a = new Array(MAX_ATTRIB);
        for(var i =0; i < MAX_ATTRIB; ++i) {
            this.a[i] = new AttribLayout();
        }
        this.texture_n;
        this.texture_uniform = new Array();
    };




    var gl_draw_mode;
    var gl_tex_mode;
    var gl_blend_func;
    var gl_depth_func;

    return {
        bind_texture: function (tex, slice) {
            var type;
            var target;
            if (tex.type == TEXTURE_2D) {
                type = gl.TEXTURE_2D;
                target = gl.TEXTURE_2D;
            } else {
                type = gl.TEXTURE_CUBE_MAP;
                target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + slice;
            }
            gl.activeTexture(gl.TEXTURE7);
            _R.changeflag |= CHANGE_TEXTURE;
            _R.last.texture[7] = null; // use last texture slot
            gl.bindTexture(type, tex.glid);
            return [type, target];
        },
        texture_format: function (tex, pf, pt) {
            var format;
            var itype;
            switch (tex.format) {
                case TEXTURE_RGBA8 :
                    format = gl.RGBA;
                    itype = gl.UNSIGNED_BYTE;
                    break;
                case TEXTURE_RGB :
                    format = gl.RGB;
                    itype = gl.UNSIGNED_BYTE;
                    break;
                case TEXTURE_RGBA4 :
                    format = gl.RGBA;
                    itype = gl.UNSIGNED_SHORT_4_4_4_4;
                    break;
                case TEXTURE_RGB565:
                    format = gl.RGB;
                    itype = gl.UNSIGNED_SHORT_5_6_5;
                    break;
                case TEXTURE_A8 :
                case TEXTURE_DEPTH :
                    format = gl.ALPHA;
                    itype = gl.UNSIGNED_BYTE;
                    break;
                default:
                    console.assert(0);
            }
            return [format, itype];
        },

        texture_update: function (id, width, height, pixels, slice, miplevel) {
            var tex = _R.texture[id];
            if (!tex)
                return;
            var info = this.bind_texture(tex, slice);
            var type = info[0];

            if (tex.mipmap) {
                gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            } else {
                gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(type, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(type, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

            info = this.texture_format(tex);
            gl.texImage2D(gl.TEXTURE_2D, miplevel, info[0], width, height, 0, info[0], info[1], pixels);
            
            WebGLUtils.checkGLError(gl);
        },
        texture_update_img:function(id, img, slice, miplevel) {
            var tex = _R.texture[id];
            if (!tex)
                return;
            var info = this.bind_texture(tex, slice);
            var type = info[0];

            if (tex.mipmap) {
                gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            } else {
                gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(type, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(type, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

            info = this.texture_format(tex);
            gl.texImage2D(gl.TEXTURE_2D, miplevel, info[0], info[0], info[1], img);
            
            WebGLUtils.checkGLError(gl);
        },

        texture_subupdate: function (id, pixels, x, y, w, h) {
            var tex = _R.texture[id];
            if (!tex)
                return;

            this.bind_texture(tex, 0);

            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
            var rlt = this.texture_format(tex);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, rlt[0], rlt[1], pixels);
        },

        // blend mode
        setblend: function (src, dst) {
            //console.log(_R.name);
            //console.log(_R.current);
            _R.current.blend_src = src;
            _R.current.blend_dst = dst;
            _R.changeflag |= CHANGE_BLEND;
        },

        // depth
        enabledepthmask: function (enable) {
            _R.current.depthmask = enable;
            _R.changeflag |= CHANGE_DEPTH;
        },

        // depth
        enablescissor: function (enable) {
            _R.current.scissor = enable;
            _R.changeflag |= CHANGE_SCISSOR;
        },

        setdepth: function (d) {
            _R.current.depth = d;
            _R.changeflag |= CHANGE_DEPTH;
        },

        // cull
        setcull: function (c) {
            _R.current.cull = c;
            _R.changeflag |= CHANGE_CULL;
        },

        create_rt: function (texid) {
            var tar = {};
            _R.target.add(tar);
            tar.tex = texid;
            var tex = _R.texture[texid];
            if (!tex)
                return null;
            tar.glid = gl.genFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, tar.glid);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex.glid, 0);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
                this.close_target(tar);
                return 0;
            }

            WebGLUtils.checkGLError(gl);
            return _R.target.length - 1;
        },

        target_create: function (width, height, format) {
            var tex = this.texture_create(width, height, format, TEXTURE_2D, 0);
            if (!tex)
                return null;
            this.texture_update(tex, width, height, null, 0, 0);
            var rt = this.create_rt(tex);

            gl.bindFramebuffer(gl.FRAMEBUFFER, _R.default_framebuffer);
            _R.last.target = null;
            _R.changeflag |= CHANGE_TARGET;

            if (!rt) {
                this.release(TEXTURE, tex);
            }
            WebGLUtils.checkGLError(gl);
            return rt;
        },

        target_texture: function (rt) {
            var tar = this._R.target[rt];
            if (tar) {
                return tar.tex;
            }
        },

        state_commit: function () {

            if (_R.changeflag & CHANGE_INDEXBUFFER) {
                var ib = _R.current.indexbuffer;
                if (ib != _R.last.indexbuffer) {
                    _R.last.indexbuffer = ib;
                    var b = _R.buffer[ib];
                    if (b) {
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.glid);
                        WebGLUtils.checkGLError(gl);
                    }
                }
            }


            if (_R.changeflag & CHANGE_VERTEXBUFFER) {
                this.apply_vb();
            }

            if (_R.changeflag & CHANGE_TEXTURE) {
                for (i = 0; i < MAX_TEXTURE; i++) {
                    var id = _R.current.texture[i];
                    var lastid = _R.last.texture[i];
                    if (id != lastid) {
                        _R.last.texture[i] = id;
                        var tex = _R.texture[id];
                        if (tex) {
                            //console.log("----------->>> aoaoaoaoao apply texture", tex);
                            gl.activeTexture(gl.TEXTURE0 + i);
                            gl.bindTexture(gl_tex_mode[tex.type], tex.glid);
                        }
                    }
                }
                WebGLUtils.checkGLError(gl);
            }

            if (_R.changeflag & CHANGE_TARGET) {
                var crt = _R.current.target;
                if (_R.last.target != crt) {
                    var rt = _R.default_framebuffer;
                    if (crt != 0) {
                        var tar = _R.target[crt];
                        if (tar) {
                            rt = tar.glid;
                        } else {
                            crt = 0;
                        }
                    }
                    gl.bindFramebuffer(gl.FRAMEBUFFER, rt);
                    _R.last.target = crt;
                    WebGLUtils.checkGLError(gl);
                }
            }

            if (_R.changeflag & CHANGE_BLEND) {
                if (_R.last.blend_src != _R.current.blend_src || _R.last.blend_dst != _R.current.blend_dst) {
                    if (_R.current.blend_src == BLEND_DISABLE) {
                        gl.disable(gl.BLEND);
                    } else if (_R.last.blend_src == BLEND_DISABLE) {
                        gl.enable(gl.BLEND);
                    }

                    var src = _R.current.blend_src;
                    var dst = _R.current.blend_dst;
                    gl.blendFunc(gl_blend_func[src], gl_blend_func[dst]);

                    _R.last.blend_src = src;
                    _R.last.blend_dst = dst;
                }
            }

            if (_R.changeflag & CHANGE_DEPTH) {
                if (_R.last.depth != _R.current.depth) {
                    if (_R.last.depth == DEPTH_DISABLE) {
                        gl.enable(gl.DEPTH_TEST);
                    }
                    if (_R.current.depth == DEPTH_DISABLE) {
                        gl.disable(gl.DEPTH_TEST);
                    } else {
                        gl_depthFunc(gl_depth_func[_R.current.depth]);
                    }
                    _R.last.depth = _R.current.depth;
                }
                if (_R.last.depthmask != _R.current.depthmask) {
                    gl.depthMask(_R.current.depthmask ? gl.TRUE : gl.FALSE);
                    _R.last.depthmask = _R.current.depthmask;
                }
            }

            if (_R.changeflag & CHANGE_CULL) {
                if (_R.last.cull != _R.current.cull) {
                    if (_R.last.cull == CULL_DISABLE) {
                        gl.enable(gl.CULL_FACE);
                    }
                    if (_R.current.cull == CULL_DISABLE) {
                        gl.disable(gl.CULL_FACE);
                    } else {
                        gl.cullFace(_R.current.cull == CULL_FRONT ? gl.FRONT : gl.BACK);
                    }
                    _R.last.cull = _R.current.cull;
                }
            }

            if (_R.changeflag & CHANGE_SCISSOR) {
                if (_R.last.scissor != _R.current.scissor) {
                    if (_R.current.scissor) {
                        gl.enable(gl.SCISSOR_TEST);
                    } else {
                        gl.disable(gl.SCISSOR_TEST);
                    }
                    _R.last.scissor = _R.current.scissor;
                }
            }

            _R.changeflag = 0;

            WebGLUtils.checkGLError(gl);
        },

        state_reset: function () {
            r.changeflag = ~0;
            memset(_R.last, 0, sizeof(_R.last));
            gl.disable(gl.BLEND);
            gl.disable(gl.SCISSOR_TEST);
            gl.depthMask(false);
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.bindFramebuffer(gl.FRAMEBUFFER, r.default_framebuffer);

            WebGLUtils.checkGLError(gl);
        },

        draw: function (mode, fromidx, ni) {
            this.state_commit();
            var ib = _R.current.indexbuffer;
            var buf = _R.buffer[ib];
            if (buf) {
                console.assert(fromidx + ni <= buf.n);
                var offset = fromidx;
                var type = gl.UNSIGNED_SHORT;
                if (buf.stride == 1) {
                    type = gl.UNSIGNED_BYTE;
                } else {
                    offset *= 2;
                }
                gl.drawElements(gl_draw_mode[mode], ni, type, offset);
                WebGLUtils.checkGLError(gl);
            }
        },

        clear: function (mask, c) {
            var m = 0;
            if (mask & MASKC) {
                m |= gl.COLOR_BUFFER_BIT;
                var a = ((c >> 24) & 0xff ) / 255.0;
                var r = ((c >> 16) & 0xff ) / 255.0;
                var g = ((c >> 8) & 0xff ) / 255.0;
                var b = ((c >> 0) & 0xff ) / 255.0;
                gl.clearColor(r, g, b, a);
            }
            if (mask & MASKD) {
                m |= gl.DEPTH_BUFFER_BIT;
            }
            if (mask & MASKS) {
                m |= gl.STENCIL_BUFFER_BIT;
            }
            this.state_commit();
            gl.clear(m);

            WebGLUtils.checkGLError(gl);
        },


        shader_locuniform: function (name) {
            var s = _R.shader[r.program];
            if (s) {
                var loc = gl.getUniformLocation(s.glid, name);
                WebGLUtils.checkGLError(gl);
                return loc;
            }
        },
        shader_setuniform: function (loc, format, v, offset) {
            switch (format) {
                case this.UNIFORM_FLOAT1:
                    gl.uniform1f(loc, v[offset]);
                    break;
                case this.UNIFORM_FLOAT2:
                    gl.uniform2f(loc, v[offset], v[offset +1]);
                    break;
                case this.UNIFORM_FLOAT3:
                    gl.uniform3f(loc, v[offset], v[offset +1], v[offset +2]);
                    break;
                case this.UNIFORM_FLOAT4:
                    gl.uniform4f(loc, v[offset +0], v[offset +1], v[offset +2], v[offset +3]);
                    break;
                case this.UNIFORM_FLOAT33:
                    gl.uniformMatrix3fv(loc, 1, false, v);
                    break;
                case this.UNIFORM_FLOAT44:
                    gl.uniformMatrix4fv(loc, 1, false, v);
                    break;
                default:
                    console.assert(0);
                    return;
            }
            WebGLUtils.checkGLError(gl);
        },

// what should be VERTEXBUFFER or INDEXBUFFER
        buffer_create: function (what, data, n, stride) {
            var gltype;
            switch (what) {
                case VERTEXBUFFER:
                    gltype = gl.ARRAY_BUFFER;
                    break;
                case INDEXBUFFER:
                    gltype = gl.ELEMENT_ARRAY_BUFFER;
                    break;
                default:
                    return 0;
            }
            var buf = [];
            _R.buffer.push(buf);
            buf.glid = gl.createBuffer();
            gl.bindBuffer(gltype, buf.glid);
            if (data && n > 0) {
                console.log('---------->>> buffer data in buffer_create', gltype, n, stride, gl.STATIC_DRAW);
                gl.bufferData(gltype, data, gl.STATIC_DRAW);
                buf.n = n;
            } else {
                buf.n = 0;
            }
            buf.gltype = gltype;
            buf.stride = stride;

            WebGLUtils.checkGLError(gl);
            return _R.buffer.length - 1;
        },

        buffer_update: function (id, data, n) {
            var buf = _R.buffer[id];
            gl.bindBuffer(buf.gltype, buf.glid);
            buf.n = n;
            gl.bufferData(buf.gltype, data, gl.DYNAMIC_DRAW);
            WebGLUtils.checkGLError(gl);
        },

        close_buffer: function (buf) {
            gl.deleteBuffer(buf.glid);
        },

        register_vertexlayout: function (n, attrib) {
            console.assert(n <= MAX_ATTRIB);
            var a = [];
            _R.attrib.push(a);
            a.n = n;
            a.a = attrib.slice();
            var id = _R.attrib.length - 1
            _R.attrib_layout = id;
            return id;
        },

        compile: function (source, type) {

            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                var log = gl.getShaderInfoLog(shader);
                console.log("compile failed", source, log);
                gl.deleteShader(shader);
                
               var e = new Error('dummy');
                var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
                    .replace(/^\s+at\s+/gm, '')
                    .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                    .split('\n');
                console.log(stack);
                
                return null;
            }
            return shader;
        },


        link: function (prog) {
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                var log = gl.getProgramInfoLog(prog);
                console.log("link failed", log);
                return false;
            }
            WebGLUtils.checkGLError(gl);
            return true;
        },

        compile_link: function (s, VS, FS) {
            var fs = this.compile(FS, gl.FRAGMENT_SHADER);
            if (!fs) {
                console.log("Can't compile fragment shader");
                return false;
            } else {
                gl.attachShader(s.glid, fs);
            }

            var vs = this.compile(VS, gl.VERTEX_SHADER);
            if (!vs) {
                console.log("Can't compile vertex shader");
                return false;
            } else {
                gl.attachShader(s.glid, vs);
            }


            if (_R.attrib_layout == undefined)
                return false;

            var a = _R.attrib[_R.attrib_layout];
            s.n = a.n;

            for (i = 0; i < a.n; i++) {
                var va = a.a[i];
                var al = s.a[i];
                gl.bindAttribLocation(s.glid, i, va.name);
                al.vbslot = va.vbslot;
                al.offset = va.offset;
                al.size = va.n;
                switch (va.size) {
                    case 1:
                        al.type = gl.UNSIGNED_BYTE;
                        al.normalized = true;
                        break;
                    case 2:
                        al.type = gl.UNSIGNED_SHORT;
                        al.normalized = true;
                        break;
                    case 4:
                        al.type = gl.FLOAT;
                        al.normalized = false;
                        break;
                    default:
                        return false;
                }
            }

            return this.link(s.glid);
        },

        shader_create: function (args) {
            var s = new ShaderType();
            s.glid = gl.createProgram();
            if (!this.compile_link(s, args.vs, args.fs)) {
                gl.deleteProgram(s.glid);
                return 0;
            }
            _R.shader.push(s);

            s.texture_n = args.texture;

            for (i = 0; i < s.texture_n; i++) {
                s.texture_uniform.push(gl.getUniformLocation(s.glid, args.texture_uniform[i]));
            }
            WebGLUtils.checkGLError(gl);
            return _R.shader.length - 1
        },

        close_shader: function (shader) {
            gl.deleteProgram(shader.glid);
            WebGLUtils.checkGLError(gl);
        },
        close_texture: function (tex) {
            gl.deleteTexture(tex.glid);
            WebGLUtils.checkGLError(gl);
        },
        close_target: function (tar) {
            gl.deleteFramebuffer(tar.glid);

            WebGLUtils.checkGLError(gl);
        },

        release: function (what, id) {

            switch (what) {
                case VERTEXBUFFER:
                case INDEXBUFFER:
                {
                    var buf = _R.buffer[id];
                    if (buf) {
                        this.close_buffer(buf);
                        delete _R.buffer[id];
                    }
                    break;
                }
                case SHADER:
                {
                    var shader = _R.shader[id];
                    if (shader) {
                        this.close_shader(shader);
                        delete _R.shader[id];
                    }
                    break;
                }
                case TEXTURE :
                {
                    var tex = _R.texture[id];
                    if (tex) {
                        this.close_texture(tex);
                        delete _R.texture[id];
                    }
                    break;
                }
                case TARGET :
                {
                    tar = _R.target[id];
                    if (tar) {
                        this.close_target(tar);
                        delete _R.target[id];
                    }
                    break;
                }
                default:
                    assert(0);
                    break;
            }
        },

        set: function (what, id, slot) {
            switch (what) {
                case VERTEXBUFFER:
                    console.assert(slot >= 0 && slot < MAX_VB_SLOT);
                    _R.vbslot[slot] = id;
                    _R.changeflag |= CHANGE_VERTEXBUFFER;
                    break;
                case INDEXBUFFER:
                     // console.log("--------->>>>>> set index buffer:" ,id);
                    _R.current.indexbuffer = id;
                    _R.changeflag |= CHANGE_INDEXBUFFER;
                    break;
                case VERTEXLAYOUT:
                    _R.attrib_layout = id;
                    break;
                case TEXTURE:
                    console.assert(slot >= 0 && slot < MAX_TEXTURE);
                    // console.log("-------<<<<<<<<<<<<<<<<<<<<<<<<--------- set tex:", slot, id);
                    _R.current.texture[slot] = id;
                    _R.changeflag |= CHANGE_TEXTURE;
                    break;
                case TARGET:
                    _R.current.target = id;
                    _R.changeflag |= CHANGE_TARGET;
                    break;
                default:
                    assert(0);
                    break;
            }
        },

        apply_texture_uniform: function (s) {

            for (i = 0; i < s.texture_n; i++) {
                var loc = s.texture_uniform[i];
                if (loc >= 0) {
                    gl.uniform1i(loc, i);
                }
            }
        },

        shader_bind: function (id) {
            _R.program = id;
            _R.changeflag |= CHANGE_VERTEXBUFFER;
            var s = _R.shader[id];
            // console.log("-------->>> use program", s, id);
            if (s) {
                gl.useProgram(s.glid);
                //console.log("-------->>> use program", s.glid);
                this.apply_texture_uniform(s);
            } else {
                gl.useProgram(null);
            }

            WebGLUtils.checkGLError(gl);
        },

        init: function(args) {
            gl_draw_mode = [
                gl.TRIANGLES,
                gl.LINES,
            ];
            gl_tex_mode = [
                gl.TEXTURE_2D,
                gl.TEXTURE_CUBE_MAP,
            ];
            gl_blend_func = [
                0,
                gl.ZERO,
                gl.ONE,
                gl.SRC_COLOR,
                gl.ONE_MINUS_SRC_COLOR,
                gl.SRC_ALPHA,
                gl.ONE_MINUS_SRC_ALPHA,
                gl.DST_ALPHA,
                gl.ONE_MINUS_DST_ALPHA,
                gl.DST_COLOR,
                gl.ONE_MINUS_DST_COLOR,
                gl.SRC_ALPHA_SATURATE,
            ];
            gl_depth_func = [
                0,
                gl.LEQUAL,
                gl.LESS,
                gl.EQUAL,
                gl.GREATER,
                gl.GEQUAL,
                gl.ALWAYS,
            ];

            _R.changeflag = 0;
            _R.buffer = new Array();
            _R.attrib = new Array();
            _R.target = new Array();
            _R.texture = new Array();
            _R.shader = new Array();
            _R.vbslot = new Array();

            _R.current = new RenderState();
            _R.last = new RenderState();

            _R.default_framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

            gl.disable(gl.CULL_FACE);

            WebGLUtils.checkGLError(gl);
            return _R;
        },

        render_exit: function () {
            for (i = 0; i < _R.buffer.length; ++i) {
                this.close_buffer(i);
            }
            for (i = 0; i < _R.shader.length; ++i) {
                this.close_shader(i);
            }
            for (i = 0; i < _R.texture.length; ++i) {
                this.close_texture(i);
            }
            for (i = 0; i < _R.target.length; ++i) {
                this.close_target(i);
            }
        },

        setviewport: function (x, y, width, height) {
            gl.viewport(x, y, width, height);
        },

        setscissor: function (x, y, width, height) {
            console.log("------------->>>> enable scissors", x, y, width, height)
            gl.scissor(x, y, width, height);
        },


        /// vertex buffer
        apply_vb: function () {
            var prog = _R.program;
            var s = _R.shader[prog];
            if (s) {
                var last_vb;
                var stride = 0;
                for (i = 0; i < s.n; i++) {
                    var al = s.a[i];
                    var vbidx = al.vbslot;
                    var vb = _R.vbslot[vbidx];
                    if (last_vb != vb) {
                        var buf = _R.buffer[vb];
                        if (!buf) {
                            continue;
                        }
                        gl.bindBuffer(gl.ARRAY_BUFFER, buf.glid);
                        last_vb = vb;
                        stride = buf.stride;
                    }
                    gl.enableVertexAttribArray(i);
                    //console.log("---->>", i ,al.size, al.type, al.normalized, stride, al.offset);
                    gl.vertexAttribPointer(i, al.size, al.type, al.normalized, stride, al.offset);
                }
            }

            WebGLUtils.checkGLError(gl);
        },
        calc_texture_size: function (format, width, height) {
            switch (format) {
                case TEXTURE_RGBA8 :
                    return width * height * 4;
                case TEXTURE_RGB565:
                case TEXTURE_RGBA4 :
                    return width * height * 2;
                case TEXTURE_RGB:
                    return width * height * 3;
                case TEXTURE_A8 :
                case TEXTURE_DEPTH :
                    return width * height;
                case TEXTURE_PVR2 :
                    return width * height / 4;
                case TEXTURE_PVR4 :
                case TEXTURE_ETC1 :
                    return width * height / 2;
                default:
                    return 0;
            }
        },
        texture_create: function (width, height, format, type, mipmap) {
            var tex = {};
            _R.texture.push(tex);
            tex.glid = gl.createTexture();
            tex.width = width;
            tex.height = height;
            tex.format = format;
            tex.type = type;
            // console.log("------>>>> create texture with info:", tex.glid, tex.width, tex.height, tex.format);
            console.assert(type == TEXTURE_2D || type == TEXTURE_CUBE);
            tex.mipmap = mipmap;
            var size = this.calc_texture_size(format, width, height);
            if (mipmap) {
                size += size / 3;
            }
            if (type == TEXTURE_CUBE) {
                size *= 6;
            }
            tex.memsize = size;

            WebGLUtils.checkGLError(gl);
            return _R.texture.length - 1;
        },
    };
}());
