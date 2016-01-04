/**
 * Created by v on 2015/6/26.
 */

ejoy2d.material = function(){
    this.texture = new Array(MAX_TEXTURE_CHANNEL);
    this.uniform_enable = new Array(MAX_UNIFORM);
};
ejoy2d.material.prototype = {
    init:function(RS,prog) {
        this.p = p;
    },
    apply:function(RS, prog) {
        var p = this.p;
        if (p != RS.program[prog])
            return;
        if (p.material == m) {
            return;
        }
        p.material = m;
        p.reset_uniform = true;
        for (var i=0;i< p.uniform_number;i++) {
            if (m.uniform_enable[i]) {
                var u = p.uniform[i];
                if (u.loc != null) {
                    render.shader_setuniform(u.loc, u.type, this.uniform, u.offset);
                }
            }
        }
        for (var i=0;i< p.texture_number;i++) {
            var tex = this.texture[i];
            if (tex) {
                var glid = texture.glid(tex);
                if (glid) {
                    shader.texture(glid, i);
                }
            }
        }
    },

    ///////////////////////////////////
    /////////////// API ///////////////
    setuniform:function(index, n, v) {
        var p = this.p;
        console.assert(index >= 0 && index < p.uniform_number);
        var u = p.uniform[index];
        if (shader.uniformsize(u.type) != n) {
            return true;
        }
        var offset = u.uniform;
        for(var i =0; i < n;++i) {
            this.uniform[offset +i] = v[i];
        }
        this.uniform_enable[index] = true;
        return false;
    },
    settexture:function(channel, texture) {
        if (channel >= MAX_TEXTURE_CHANNEL) {
            return true;
        }
        this.texture[channel] = texture;
        return false;
    }
    /////////// end of API ////////////////
    ///////////////////////////////////////
};