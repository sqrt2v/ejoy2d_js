var ex01 =((function(){
	
	
	var isInited = false;

	var obj;
	var turret;
	var obj2;
	


	var srt = {
		offx:512*SCREEN_SCALE,
		offy:384*SCREEN_SCALE,
		scalex : 1024 * 1.2,
		scaley : 1024 * 1.2,
		rot: 0
	};

	//var img_src = document.getElementsByName("img_src").getAttribute(src);
	///console.log("-------------->>????aoaoao--->>", img_src);

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
						obj.ps(-100, 0, 0.5);
						
						id = sp.getIDByName("mine");
						obj2 = new ejoy2d.sprite(sp, id);

						obj2.ps(100, 0);
						obj2.ps(1.2);
						
						var resource = obj2.fetch("resource")
						resource.setframe(10, false);

						var label = obj2.fetch("label");
						var aabb = [];
						obj2.aabb(srt, true, aabb);
						var w = Math.floor(aabb[2] - aabb[0]);
						var h = Math.floor(aabb[3] - aabb[1]);
						var aabbStr = "AABB:" + w.toString() + "x" + h.toString();
						console.log("---->>> aabb:", aabbStr);
						label.setText(aabbStr);

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
				turret.setframe(turret.frame +1, false);
				obj2.setframe(obj2.frame +1, false);
			}
		},
		draw:function(){
			shader.clear(0xff808080);
			if (isInited) {
				obj.draw(srt);
				obj2.draw(srt);
			}
		}
	};

})());
