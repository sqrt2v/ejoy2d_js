/**
 * Created by v on 2015/6/17.
 */

var EJMAT_R_FACTOR = 4096.0;

ejoy2d.matrix = function(mat){
    this.m = new Int32Array(6);
    if(mat)
    {
        for(var i = 0; i < 6; ++i) {
            this.m[i] = mat[i];
        }
    }
    else
        this.identity();
};


ejoy2d.matrix.prototype = {
    mul : function(mm1, mm2) {
        var m = this.m;
        var m1 = mm1.m;
        var m2 = mm2.m;
        m[0] = (m1[0] * m2[0] + m1[1] * m2[2]) /1024;
        m[1] = (m1[0] * m2[1] + m1[1] * m2[3]) /1024;
        m[2] = (m1[2] * m2[0] + m1[3] * m2[2]) /1024;
        m[3] = (m1[2] * m2[1] + m1[3] * m2[3]) /1024;
        m[4] = (m1[4] * m2[0] + m1[5] * m2[2]) /1024 + m2[4];
        m[5] = (m1[4] * m2[1] + m1[5] * m2[3]) /1024 + m2[5];
    },
    identity : function() {
        var mat = this.m;
        mat[0] = 1024;
        mat[1] = 0;
        mat[2] = 0;
        mat[3] = 1024;
        mat[4] = 0;
        mat[5] = 0;
    },

    _inverse_scale:function(m , o) {
        var m = this.m;
        if (m[0] == 0 || m[3] == 0)
            return 1;
        o[0] = (1024 * 1024) / m[0];
        o[1] = 0;
        o[2] = 0;
        o[3] = (1024 * 1024) / m[3];
        o[4] = - (m[4] * o[0]) / 1024;
        o[5] = - (m[5] * o[3]) / 1024;
        return 0;
    },

    _inverse_rot:function(m, o) {
        var m = this.m;
        if (m[1] == 0 || m[2] == 0)
            return 1;
        o[0] = 0;
        o[1] = (1024 * 1024) / m[2];
        o[2] = (1024 * 1024) / m[1];
        o[3] = 0;
        o[4] = - (m[5] * o[2]) / 1024;
        o[5] = - (m[4] * o[1]) / 1024;
        return 0;
    },

    inverse:function(mo) {
        var m = this.m;
        var o = mo.m;
        if (m[1] == 0 && m[2] == 0) {
            return this._inverse_scale(m,o);
        }
        if (m[0] == 0 && m[3] == 0) {
            return this._inverse_rot(m,o);
        }
        var t = m[0] * m[3] - m[1] * m[2] ;
        if (t == 0)
            return 1;
        o[0] = (m[3] * (1024 * 1024) / t);
        o[1] = (-m[1] * (1024 * 1024) / t);
        o[2] = (-m[2] * (1024 * 1024) / t);
        o[3] = (m[0] * (1024 * 1024) / t);
        o[4] = -(m[4] * o[0] + m[5] * o[2]) / 1024;
        o[5] = -(m[4] * o[1] + m[5] * o[3]) / 1024;
        return 0;
    },

    i_cos_tbl : [
        1024,1023,1022,1021,1019,1016,1012,1008,1004,999,993,986,979,972,964,955,
		946,936,925,914,903,890,878,865,851,837,822,807,791,775,758,741,
		724,706,687,668,649,629,609,589,568,547,526,504,482,460,437,414,
		391,368,344,321,297,273,248,224,199,175,150,125,100,75,50,25,
		0,-25,-50,-75,-100,-125,-150,-175,-199,-224,-248,-273,-297,-321,-344,-368,
		-391,-414,-437,-460,-482,-504,-526,-547,-568,-589,-609,-629,-649,-668,-687,-706,
		-724,-741,-758,-775,-791,-807,-822,-837,-851,-865,-878,-890,-903,-914,-925,-936,
		-946,-955,-964,-972,-979,-986,-993,-999,-1004,-1008,-1012,-1016,-1019,-1021,-1022,-1023,
		-1024,-1023,-1022,-1021,-1019,-1016,-1012,-1008,-1004,-999,-993,-986,-979,-972,-964,-955,
		-946,-936,-925,-914,-903,-890,-878,-865,-851,-837,-822,-807,-791,-775,-758,-741,
		-724,-706,-687,-668,-649,-629,-609,-589,-568,-547,-526,-504,-482,-460,-437,-414,
		-391,-368,-344,-321,-297,-273,-248,-224,-199,-175,-150,-125,-100,-75,-50,-25,
		0,25,50,75,100,125,150,175,199,224,248,273,297,321,344,368,
		391,414,437,460,482,504,526,547,568,589,609,629,649,668,687,706,
		724,741,758,775,791,807,822,837,851,865,878,890,903,914,925,936,
		946,955,964,972,979,986,993,999,1004,1008,1012,1016,1019,1021,1022,1023,
    ],

// SRT to matrix

    icost:function(dd) {
        dd = Math.floor(dd) & 0xff;	// % 256
        return this.i_cos_tbl[dd];
    },

    icosd:function(d) {
        var dd = d*0.25;
        return this.icost(dd);
    },

    isind:function(d) {
        var dd = 64 - d*0.25;
        return this.icost(dd);
    },

    rot_mat:function(d) {
        if (d==0)
            return;
        var m = this.m;
        var cosd = this.icosd(d);
        var sind = this.isind(d);

        var m0_cosd = m[0] * cosd;
        var m0_sind = m[0] * sind;
        var m1_cosd = m[1] * cosd;
        var m1_sind = m[1] * sind;
        var m2_cosd = m[2] * cosd;
        var m2_sind = m[2] * sind;
        var m3_cosd = m[3] * cosd;
        var m3_sind = m[3] * sind;
        var m4_cosd = m[4] * cosd;
        var m4_sind = m[4] * sind;
        var m5_cosd = m[5] * cosd;
        var m5_sind = m[5] * sind;

        m[0] = (m0_cosd - m1_sind) /1024;
        m[1] = (m0_sind + m1_cosd) /1024;
        m[2] = (m2_cosd - m3_sind) /1024;
        m[3] = (m2_sind + m3_cosd) /1024;
        m[4] = (m4_cosd - m5_sind) /1024;
        m[5] = (m4_sind + m5_cosd) /1024;
    },

    scale_mat:function(sx, sy) {
        var m =  this.m;
        if (sx != 1024) {
            m[0] = m[0] * sx / 1024;
            m[2] = m[2] * sx / 1024;
            m[4] = m[4] * sx / 1024;
        }
        if (sy != 1024) {
            m[1] = m[1] * sy / 1024;
            m[3] = m[3] * sy / 1024;
            m[5] = m[5] * sy / 1024;
        }
    },

    srt:function(_srt) {
        if (!_srt) {
            return;
        }
        var m = this.m;
        this.scale_mat(_srt.scalex, _srt.scaley);
        this.rot_mat(_srt.rot);
        m[4] += _srt.offx;
        m[5] += _srt.offy;
    },
    sr:function(sx, sy, d) {
        var m = this.m;
        var cosd = icosd(d);
        var sind = isind(d);

        var m0_cosd = sx * cosd;
        var m0_sind = sx * sind;
        var m3_cosd = sy * cosd;
        var m3_sind = sy * sind;

        m[0] = m0_cosd /1024;
        m[1] = m0_sind /1024;
        m[2] = -m3_sind /1024;
        m[3] = m3_cosd /1024;
    },

    rs:function(sx, sy, d) {
        var m = this.m;
        var cosd = icosd(d);
        var sind = isind(d);

        var m0_cosd = sx * cosd;
        var m0_sind = sx * sind;
        var m3_cosd = sy * cosd;
        var m3_sind = sy * sind;

        m[0] = m0_cosd /1024;
        m[1] = m3_sind /1024;
        m[2] = -m0_sind /1024;
        m[3] = m3_cosd /1024;
    },




    ///////////////////// API ///////////////////
    trans:function(x, y) {
        this.m[4] += x * SCREEN_SCALE;
        this.m[5] += y * SCREEN_SCALE;
    },

    scaleAndRot:function(sx,sy,rot) {
        var sx=1024,sy=1024,r=0;
        this.rs(sx, sy, r);

        return 0;
    },
    scale:function(sx, sy) {
        if(!sy)
            sy = sx;
        this.scale_mat(this.m, sx, sy);
    },
    rot:function(r) {
        this.rot_mat(this.m, r);
    },
    clone:function() {
        var mat = new ejoy2d.matrix();
        mat.m = this.m.slice(0);
        return mat;
    },
    copyFrom : function(mat) {
        this.m = mat.m.slice(0);
    },
    tostring:function() {
        var m = this.m;
            string.format("Mat(%d,%d,%d,%d,%d,%d)",
                m[0],m[1],m[2],m[3],m[4],m[5]);
            return 1;
    },
    export : function() {
        var rlt = new Array(6);
        var m = this.m;
        for (i=0;i<6;i++) {
            rlt[i] = m[i];
        }
        return rlt;
    },
    import : function(m) {
        var mm = this.m;
        for (i=0;i<6;i++) {
            mm[i] = m[i];
        }
        return 0;
    }
    //////////////////end of API ////////////////
};

ejoy2d.matrix.IdentifyMat = new ejoy2d.matrix();

