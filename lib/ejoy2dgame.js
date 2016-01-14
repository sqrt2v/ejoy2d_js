/**
 * Created by v on 2015/6/27.
 */

var InputType = {
    TOUCH_BEGIN : 0,
    TOUCH_END : 1,
    TOUCH_MOVE :  2
};

ejoy2d.game = function(fw) {
     _G.OS = "js";
     this.fw = fw;
     
     ejoy2d.shader.init();
     ejoy2d.screen.init(1024, 768, 1.0);

     ejoy2d.label.init();
     ejoy2d.label.load();
     this.real_time = 0.0;
     this.logic_time = 0.0;
     this.LOGIC_FRAME = 30;
     this.oneInvFrame = 1.0/30.0;
 };



ejoy2d.game.prototype = {
    exit:function(fw) {
        ejoy2d.label.unload();
    	ejoy2d.texture.exit();
    	ejoy2d.shader.unload();
    },

    setLogicFrame:function(fram_rate){
        this.LOGIC_FRAME = frameRate;
        this.oneInvFrame = 1.0/frameRate;
    },

    update:function(dt) {
        // if (this.logic_time == 0.0) {
        //     this.real_time = this.oneInvFrame;
        // } else {
        //     this.real_time += dt;
        // }
        // console.log("time:", this.logic_time, this.real_time, dt);
        // while (this.logic_time < this.real_time) {
        //     this.fw.logicFrame();
        //     this.logic_time += this.oneInvFrame;
        // }
        this.fw.logicFrame();
    },
    draw:function() {
        this.fw.draw();
        ejoy2d.shader.flush();
        ejoy2d.label.flush();
    },
    touch:function(id, x, y, status) {
        this.fw.touch(status, x, y);
    },
    gesture:function(ty, x1, y1, x2, y2, s) {
        this.fw.gesture(ty, x1, y1, x2, y2, s);
    },
    message:function(id, state, data, n) {
        this.fw.message(state, data, n);
    },
    pause:function(){
        this.fw.pause();
    },
    resume:function(){
        this.fw.resume();
    }
};
