/**
 * Created by v on 2015/6/14.
 */


var gl;
var shader;
var texture;
var render;
var material;
var renderbuffer;
var ej_screen;
var scissor;
var geometry;




var _G = {};
function init(canvas) {
    /// init gl
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for(var i =0; i < names.length; ++i) {
        try{
            gl = canvas.getContext(names[i]);
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch(e) {}
        if(gl) {
            break;
        }
    }
    if (!gl) {
        alert("Could not init WegGL,sorry :-(");
        return
    }

    /// inti ejoy2d
    shader = ejoy2d.shader;
    texture = ejoy2d.texture;
    render = ejoy2d.render;
    material = ejoy2d.material;
    renderbuffer = ejoy2d.renderbuffer;
    ej_screen = ejoy2d.screen;
    scissor = ejoy2d.scissor;
    geometry = ejoy2d.geometry;

    //render.init();

    ex05.init();
    _G.game = new ejoy2d.game(ex05);


    ////////// dealing with user input
    // closure    
    var cg = _G.game;
    var isMouseDown = false;
    var bounds = canvas.getBoundingClientRect()
    var canvasPosX = bounds.left;
    var canvasPosY = bounds.top;
    
    canvas.onmousedown = function(e){
       var posX = e.pageX - canvasPosX;
       var posY = e.pageY - canvasPosY;
       isMouseDown = true;
       //console.log("------<<<<< Mouse down at", posX, posY);
       cg.touch(0, posX, posY, InputType.TOUCH_BEGIN);
       
    };
    canvas.onmouseup = function(e) {
        var posX = e.pageX - canvasPosX;
        var posY = e.pageY - canvasPosY;
        isMouseDown = false;
        cg.touch(0, posX, posY, InputType.TOUCH_END);
    };
    canvas.onmousemove = function(e) {
        if(isMouseDown) {
            var posX = e.pageX - canvasPosX;
            var posY = e.pageY - canvasPosY;
            cg.touch(0, posX, posY, InputType.TOUCH_MOVE);
        }
    };
    /// end of user input
}

function drawScene() {
    _G.game.draw();
    shader.flush()
}

var lastTime = 0;

function update() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        _G.game.update(elapsed);
    }
    lastTime = timeNow;
}

function tick() {
    requestAnimFrame(tick);
    update();
    drawScene();
}


function webGLStart() {
    var canvas = document.getElementById("main_canvas");
    console.log("--->> begin to init cavas:", canvas);
    init(canvas);
    tick();
}
