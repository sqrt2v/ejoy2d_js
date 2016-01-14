/**
 * Created by v on 2015/6/26.
 */
var BLEND_GL_ZERO = 0;
var BLEND_GL_ONE = 1;
var BLEND_GL_SRC_COLOR =  0x0300;
var BLEND_GL_ONE_MINUS_SRC_COLOR = 0x0301;
var BLEND_GL_SRC_ALPHA = 0x0302;
var BLEND_GL_ONE_MINUS_SRC_ALPHA = 0x0303;
var BLEND_GL_DST_ALPHA = 0x0304;
var BLEND_GL_ONE_MINUS_DST_ALPHA = 0x0305;
var BLEND_GL_DST_COLOR = 0x0306;
var BLEND_GL_ONE_MINUS_DST_COLOR = 0x0307;
var BLEND_GL_SRC_ALPHA_SATURATE = 0x0308;
ejoy2d.blendmode = {
    blendMode : function (gl_mode) {
        switch(gl_mode) {
            case BLEND_GL_ZERO:
                return BLEND_ZERO;
            case BLEND_GL_ONE:
                return BLEND_ONE;
            case BLEND_GL_SRC_COLOR:
                return BLEND_SRC_COLOR;
            case BLEND_GL_ONE_MINUS_SRC_COLOR:
                return BLEND_ONE_MINUS_SRC_COLOR;
            case BLEND_GL_SRC_ALPHA:
                return BLEND_SRC_ALPHA;
            case BLEND_GL_ONE_MINUS_SRC_ALPHA:
                return BLEND_ONE_MINUS_SRC_ALPHA;
            case BLEND_GL_DST_ALPHA:
                return BLEND_DST_ALPHA;
            case BLEND_GL_ONE_MINUS_DST_ALPHA:
                return BLEND_ONE_MINUS_DST_ALPHA;
            case BLEND_GL_DST_COLOR:
                return BLEND_DST_COLOR;
            case BLEND_GL_ONE_MINUS_DST_COLOR:
                return BLEND_ONE_MINUS_DST_COLOR;
            case BLEND_GL_SRC_ALPHA_SATURATE:
                return BLEND_SRC_ALPHA_SATURATE;
        }
        return BLEND_DISABLE;
    }
};
