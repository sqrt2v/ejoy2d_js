var ex04 =((function(){
	
	
	var isInited = false;

	var obj;

	var srt = {
		offx:512*SCREEN_SCALE,
		offy:384*SCREEN_SCALE,
		scalex : 1024 * 1.2,
		scaley : 1024 * 1.2,
		rot: 0
	};
    
    var scissor = false;

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
						
						var id = sp.getIDByName("mine");
						obj = new ejoy2d.sprite(sp, id);

						//obj.ps(100, 0);
						//obj.ps(1.2);
						
						var resource = obj.fetch("resource")
						resource.setframe(10, false);
						isInited = true;
					}
				});
            };
            img.onerror = function () {
                console.log("Failed to load image: sample.1.png");
            }
		},
		logicFrame:function()
		{
			if(isInited) {
				obj.setframe(obj.frame +1, false);
			}
		},
		draw:function(){
			shader.clear(0xff808080);
			if (isInited) {
				obj.draw(srt);
			}
		},
        touch:function(what, x, y) {
            //console.log("---->>> aoaoao touch:", what, x, y);
            if(what == InputType.TOUCH_END) {
                var touched = obj.test(x*SCREEN_SCALE, y*SCREEN_SCALE, srt);
                if(touched) {
                    if(touched.name == "label") {
                        touched.setText("Touch label");
                    }
                    if(touched.name == "panel") {
                        scissor = !scissor;
                        touched.enableScissor(scissor);
                        var label = obj.fetch("label");
                        label.setText(scissor?"Set Scissor":"Clear Scor");
                    } 
                }
                else
                {
                    var label = obj.fetch("label");
                    label.setText("Not Hit");
                }

            }
        }
	};

})());
