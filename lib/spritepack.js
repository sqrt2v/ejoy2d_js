var SpriteType = {
    empty 	    : 	0,
 	picture     :   1,
   	animation 	:   2,
   	polygon 	:   3,
   	label 	    :   4,
   	panel 	    :   5,
   	anchor 	    :   6,
   	matrix 	    :   7
};

ejoy2d.spritepack = function(json, texs)  {
    this.tex = texs;
    var data = new Array();
    this.data = data;
    var namedCmp = {};
    this.namedCmp = namedCmp;
    var allMatrix = null;
    for(var i in json) {
        var v = json[i];
        var cmp = {};
        cmp.type = v[0];
        switch(cmp.type) {
        case SpriteType.label:
            cmp.id = v[1];
            cmp.color = v[2];
            cmp.width = v[3];
            cmp.height = v[4];
            cmp.align = v[5];
            cmp.size = v[6];
            cmp.edge = v[7];
            cmp.auto_scale = v[8];
            break;
        case SpriteType.panel:
            cmp.id = v[1];
            cmp.width = v[2];
            cmp.height = v[3];
            cmp.scissor = v[4];
            break;
        case SpriteType.matrix:
            allMatrix = v;
            break;
        case SpriteType.picture:
            cmp.id = v[1];
            var info = v[2];
            var rect = {};
            rect.texid = info[0];
            rect.texture_coord = [];//  = info[1].slice(0);
            for(var ti = 0; ti < 4; ++ti) {
                var idx = ti*2;
                var tc = ejoy2d.texture.texcoord(info[0], info[1][idx], info[1][idx +1]);
                rect.texture_coord[idx] = tc[0];
                rect.texture_coord[idx +1] = tc[1];
            }
            rect.screen_coord = info[2].slice(0);
            cmp.rect = [];
            cmp.n = 1;
            cmp.rect.push(rect);
            break;
        case SpriteType.animation:
            cmp.id = v[1];
            var cc = v[2];

            if(v[4]) // exported
                namedCmp[v[4]] = v[1];

            var c = new Array();
            cmp.component = c;
            for(var idx in cc)
            {
                var cmpPart = {};
                if(typeof(cc[idx]) == "number") {
                    cmpPart.id = cc[idx];
                } else {
                    cmpPart.id = cc[idx][0];
                    cmpPart.name = cc[idx][1];
                }
                c[idx] = cmpPart;
            }
            var frames = new Array();
            cmp.frame = frames;
            for(var uu in v[3]){
                var fd = v[3][uu]
                var oneFrame = new Array();
                for(var ii in fd ){
                    var f = {}
                    var f1 = fd[ii];
                    if(typeof(f1) == "number") {
                        f.component_id = f1;
                        f.t = new ejoy2d.sprite_trans();
                    } else {
                        f.component_id = f1[0];
                        f.t = new ejoy2d.sprite_trans();
                        if(typeof(f1[1]) == "number")
                            f.t.mat = new ejoy2d.matrix(allMatrix[f1[1] +1]); 
                        else
                            f.t.mat = new ejoy2d.matrix(f1[1]);
                        f.touchable = f1[2];
                    }
                    oneFrame[ii] = f;
                }
                frames[uu] = oneFrame;
            }
            var action = [];
            var a = {};
            a.start_frame =0;
            a.number = frames.length;
            action.push(a);
            cmp.action = action;

            break;
        }
        data[cmp.id] = cmp;
    }
};

ejoy2d.spritepack.prototype = {
    getDataByName: function (name) {
        return this.data[this.namedCmp[name]];
    },
    getIDByName: function (name) {
        return this.namedCmp[name];
    }
};
