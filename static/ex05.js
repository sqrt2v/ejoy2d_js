var ex05 =((function(){
	
	var isInited = false;
	var obj;
    var turret;
    var frame = 0;
    
	var srt = {
		offx:512*SCREEN_SCALE,
		offy:384*SCREEN_SCALE,
		scalex : 1024,
		scaley : 1024,
		rot: 0
	};

	return {
		init:function() {
			//shader.load(geometryShaderID, geoFS, geoVS);
			// shader.load(BuiltinProgram.picture, spriteFS, spriteVS);
			//geometry.setprogram(geometryShaderID);
			var img = new Image();
			img.src = "sample.1.png";
			img.onload = function() {
				console.log(img.name, img.width, img.height);
				console.log("load texture succeed", typeof img);
				ejoy2d.texture.load_img(1, TEXTURE_RGBA8, img);
				ejoy2d.http.get("sample.json",function(resp) {
					if(resp != null) {
						console.log("get sample.json succeed");
						var sp = new ejoy2d.spritepack(resp,null);
						var id = sp.getIDByName("cannon");
						obj = new ejoy2d.sprite(sp, id);
                        turret = obj.fetch("turret");

                        var labelData ={
                            data :[
                                {
                                    type : SpriteType.label,
                                    color : 0xffffffff,
                                    width : 100,
                                    height : 100,
                                    align : 0,
                                    size : 30,
                                    edge : false,
                                    auto_scale : true,
                                }
                            ]
                        };
                        var label = new ejoy2d.sprite(labelData, 0);
                        label.setText("Hello");
                        var idx = turret.child("anchor");
                        console.log(idx);
                        turret.mount(idx, label);


						//obj.ps(100, 0);
						//obj.ps(1.2);
						isInited = true;
					}
				});
            };
            img.onerror = function () {
                console.log("Failed to load image: sample.1.png");
            }
		},
		logicFrame:function() {
			if(isInited) {
				turret.setframe(35, false);
			}
		},
		draw:function(){
			shader.clear(0xff808080);
			if (isInited) {
				obj.draw(srt);
			}
		},
        touch:function(what, x, y) {
            
            if(what == InputType.TOUCH_END) {
                frame = frame +1;
                console.log(frame)
            }
            
        }
	};

})());
