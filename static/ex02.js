var ex02 =((function(){

	var isInited = false;
	var TEX_ID = 1;
	
	var vb =  [
		88, 0, 88, 45, 147, 45, 147, 0,	// texture coord
		-958, -580, -958, 860, 918, 860, 918, -580, // screen coord, 16x pixel, (0,0) is the center of screen
	]

	return {
		init:function() {
			var img = new Image();
			img.src = "sample.1.png";
			img.onload = function() {
				console.log(img.name, img.width, img.height);
				console.log("load texture succeed", typeof img);
				ejoy2d.texture.load_img(TEX_ID, TEXTURE_RGBA8, img);
				isInited = true;
            };
            img.onerror = function () {
                console.log("Failed to load image: sample.1.png");
            }
		},
		logicFrame:function()
		{
		},
		draw:function(){
			shader.clear(0xff808080);
			if (isInited) {
				ejoy2d.shader.draw(TEX_ID, vb)
			}
		}
	};

})());
