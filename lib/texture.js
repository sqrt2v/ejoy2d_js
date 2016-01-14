/**
 * Created by v on 2015/6/16.
 */

ejoy2d.texture = (function (){
    var R = null;
    /// texture pool
    var pool = new Array();
    var texcoord_tmp = new Array(2);
    return {
        init_render: function (r) {
            R = r;
        },

        load: function (id, pixel_format, pixel_width, pixel_height, data) {
            if (id >= this.MAX_TEXTURE) {
                return "Too many texture";
            }
            var tex = pool[id];
            if (!tex) {
                tex = {};
                pool[id] = tex;
            }

            tex.fb = 0;
            tex.width = pixel_width;
            tex.height = pixel_height;
            tex.invw = 1.0 / pixel_width;
            tex.invh = 1.0 / pixel_height;
            if (!tex.id) {
                tex.id = ejoy2d.render.texture_create(pixel_width, pixel_height, pixel_format, TEXTURE_2D, 0);
            }
            if (!data) {
                return;
            }

            ejoy2d.render.texture_update(tex.id, pixel_width, pixel_height, data, 0, 0);
        },
        load_img: function (id, pixel_format, img) {
            if (id >= this.MAX_TEXTURE) {
                return "Too many texture";
            }
            
            if (!img) {
                return;
            }
            
            var tex = pool[id];
            if (!tex) {
                tex = {};
                pool[id] = tex;
            }

            tex.fb = 0;
            tex.width = img.width;
            tex.height = img.height;
            tex.invw = 1.0 / img.width;
            tex.invh = 1.0 / img.height;
            if (!tex.id) {
                tex.id = ejoy2d.render.texture_create(img.width, img.height, pixel_format, TEXTURE_2D, 0);
            }

            ejoy2d.render.texture_update_img(tex.id, img, 0, 0);
        },     
        
        texcoord: function (id, x, y) {
            if (id < 0 || id >= pool.length) {
                return [Math.floor(x), Math.floor(y)];
            }
            //console.log("------------>>> texcoord for:", id, pool.length);
            var tex = pool[id];
            if (!tex.invw) {
                // not load the texture
                texcoord_tmp[0] = Math.floor(x);
                texcoord_tmp[1] = Math.floor(y);
                return texcoord_tmp;
            }

            x *= tex.invw;
            y *= tex.invh;
            if (x > 1.0)
                x = 1.0;
            if (y > 1.0)
                y = 1.0;

            x *= 0xffff;
            y *= 0xffff;

            texcoord_tmp[0] = Math.floor(x);
            texcoord_tmp[1] = Math.floor(y);
            return texcoord_tmp;
        },
        unload: function (id) {
            if (id < 0 || id >= pool.length)
                return;
            var tex = pool[id];
            if (!tex.id)
                return;
            ejoy2d.render.release(TEXTURE, tex.id);
            if (tex.fb)
                ejoy2d.render.release(TARGET, tex.fb);
            delete tex.id;
            delete tex.fb;
        },

        glid: function (id) {
            if (id < 0 || id >= pool.length)
                return;
            var tex = pool[id];
            return tex.id;
        },
        clearall: function () {
            var i;
            for (i = 0; i < pool_count; i++) {
                this.unload(i);
            }
        },

        set_inv: function (id, invw, invh) {
            if (id < 0 || id >= pool.length)
                return;

            var tex = pool[id];
            tex.invw = invw;
            tex.invh = invh;
        },

        swap: function (ida, idb) {
            if (ida < 0 || idb < 0 || ida >= pool.length || idb >= pool.length)
                return;

            var pool = pool;
            var tex = pool[ida];
            pool[ida] = pool[idb];
            pool[idb] = tex;
        },

        size: function (id) {
            if (id < 0 || id >= pool.length)
                return;
            var tex = pool[id];
            return [tex.width, tex.height];
        },

        delete_framebuffer: function (id) {
            if (id < 0 || id >= pool.length)
                return;

            var tex = pool[id];
            if (tex.fb) {
                ejoy2d.render.release(TARGET, tex.fb);
                delete tex.fb;
            }
        },

        update: function (id, pixel_width, pixel_height, data) {
            if (id >= this.MAX_TEXTURE) {
                return "Too many texture";
            }

            if (!data) {
                return "no content";
            }
            var tex = pool[id];
            if (!tex.id) {
                return "not a valid texture";
            }
            ejoy2d.render.texture_update(tex.id, pixel_width, pixel_height, data, 0, 0);
        }
    };
})();
