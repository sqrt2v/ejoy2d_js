var ex09 =((function(){
	var x = 0;
	var y = 768;

	var geometryShaderID = 3;


	var hexagon = new Array(10);
	for(var i =0; i < 5;++i)
	{
		var r = Math.PI * 2 * i / 6
		hexagon[i*2] = Math.sin(r) * 100 + 300;
		hexagon[i*2 +1] = Math.cos(r) * 100 + 300;
	}

	var gspr;
	var turret;

	var srt = {
		offx:500*SCREEN_SCALE,
		offy:384*SCREEN_SCALE,
		scalex : 1024,
		scaley : 1024,
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
						console.log(typeof resp);
						var sp = new ejoy2d.spritepack(resp,null);
						var id = sp.getIDByName("mine");
						gspr = new ejoy2d.sprite(sp, id);
						var label = gspr.fetch("label");
						var resource = gspr.fetch("resource")
						resource.setframe(10, false);
						gspr.setframe(11, false);
						label.setText("你好，webgl");
						// turret = gspr.fetch("turret");
						//this.spr.Init();
					}
				});
            };
            img.onerror = function () {
                console.log("Failed to load image: sample.1.png");
            }
			//ejoy2d.http.get("sample.1.png",function(resp) {
			//	// console.log(resp);
			//	console.log("load texture succeed");
			//	ejoy2d.http.get("sample.json",function(resp) {
			//		if(resp != null) {
			//			console.log("get sample.json succeed");
			//			console.log(typeof resp);
			//			var sp = new ejoy2d.spritepack(resp,null);
			//			var id = sp.getIDByName("cannon");
			//			gspr = new ejoy2d.sprite(sp, id);
			//			//this.spr.Init();
			//		}
			//	});
			//});
		},
		logicFrame:function()
		{
			// if(turret)
			// {
			// 	turret.setframe(turret.frame +1, false);
			// 	// console.log("---------<>>>", gspr.frame);
			// }
			if(gspr) {
				gspr.setframe(gspr.frame +1, false);
				// console.log("---------<>>>", gspr.frame);
			}
		},
		draw:function(){
			shader.clear(0xff808080);
			if (gspr)
			{
				gspr.draw(srt);
			}
			//geometry.line(0, 0, x, y, 0xffffffff);
			//geometry.box(100,100,200,300, 0x80ff0000);
			//geometry.polygon(hexagon, 0x40ffff00);
		}
	};

})());
