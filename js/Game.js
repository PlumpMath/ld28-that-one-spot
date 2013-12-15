define([
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/math/Vector3',
	'js/Cube',
	'js/All'
], function (
	Camera,
	CameraComponent,
	Vector3,
	Cube,
	All
) {
	'use strict';

	var goo;
	var images;
	var cubes;
	var stateHandler;
	var level;

	var mouseState = { x: null, y: null };
	var valueState = { x: 300, y: 300 };
	var targetState = { x: 200, y: 200 };
	var delta = { x: 0, y: 0 };

	function pattern1(n) {
		cubes = [];
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++) {
				cubes.push(new Cube(
					goo,
					{ x: i - n/2, y: j - n/2 },
					{ r: Math.sin(i) / 2 + 0.5, g: Math.sin(j) / 2 + 0.5, b: Math.sin(i + j) / 2 + 0.5 }
				));
			}
		}
	}

	function pattern2() {
		cubes = [];
		var image = images[level];
		image.pixels.forEach(function (pixel) {
			cubes.push(new Cube(
				goo,
				{ x: pixel.x - image.width / 2, y: pixel.y - image.height / 2 },
				{ r: pixel.r / 255, g: pixel.g / 255, b: pixel.b / 255 }
			));
		});
	}

	function removeAll() {
		cubes.forEach(function (cube) {
			cube.remove();
		});
		cubes = [];
	}

	function generateRandomTarget() {
		targetState.x = Math.floor(Math.random() * (window.screen.availWidth - 100)) + 50;
		targetState.y = Math.floor(Math.random() * (window.screen.availHeight - 100)) + 50;
	}

	function updateValue() {
		valueState.x += (mouseState.x - valueState.x) / 4;
		valueState.y += (mouseState.y - valueState.y) / 4;
	}

	function updateDelta() {
		delta.x = valueState.x - targetState.x;
		delta.y = valueState.y - targetState.y;
	}

	function closeEnough() {
		return Math.abs(valueState.x - targetState.x) + Math.abs(valueState.y - targetState.y) < 6;
	}

	function setState(state) {
		stateHandler = stateHandlers[state];
	}

	var stateHandlers = {
		beginning: function(tpf) {
			console.log('beginning');

			setState('fadein');
		},
		adjusting: function(tpf) {
			//console.log('adjusting');

			updateValue();

			updateDelta();
			cubes.forEach(function (cube) {
				cube.displace(delta);
			});

			if (closeEnough()) {
				setState('fadeaway');
			}
		},
		fadeaway: function(tpf) {
			console.log('fadeaway');

			level++;

			var all = new All(cubes.length, function() { setState('fadein'); });
			var callback = all.getCallback();

			cubes.forEach(function (cube) {
				cube.fadeAway(callback);
			});
			setState('nop');
		},
		fadein: function(tpf) {
			console.log('fadein');

			level = level || 0;
			if (level >= images.length) {
				setState('nop');
				return;
			}
			pattern2();

			generateRandomTarget();

			updateDelta();
			cubes.forEach(function (cube) {
				cube.displace(delta);
			});

			var all = new All(cubes.length, function() { setState('adjusting'); });
			var callback = all.getCallback();

			cubes.forEach(function (cube) {
				cube.fadeIn(callback);
			});
			setState('nop');
		},
		nop: function(tpf) { }
	};

	function loop(tpf) {
		stateHandler(tpf);
		TWEEN.update();
	}

	function setupLoop() {
		goo.callbacks.push(loop);
	}

	function setupMouse() {
		document.addEventListener('mousemove', function(e) {
			mouseState.x = e.clientX;
			mouseState.y = e.clientY;
		});
	}

	function setupCamera() {
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));

		cameraEntity.transformComponent.transform.translation.setd(0, 0, 20);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);

		cameraEntity.addToWorld();
	}

	function processImages(images) {
		return images.map(function (image) {
			var converted = [];

			var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;

			var con2d = canvas.getContext('2d');
			con2d.drawImage(image, 0, 0);

			var buffer = con2d.getImageData(0, 0, image.width, image.height).data;
			for (var i = 0, p = 0; i < buffer.length; i += 4, p++) {
				// filtering out magenta
				if (buffer[i] !== 255 || buffer[i + 1] !== 0 || buffer[i + 2] !== 255) {
					converted.push({
						x: p % image.width,
						y: image.height - Math.floor(p / image.width),
						r: buffer[i],
						g: buffer[i + 1],
						b: buffer[i + 2]
					});
				}
			}

			return { pixels: converted, width: image.width, height: image.height };
		});
	}

	var Game = {};

	Game.init = function(_goo, _images) {
		goo = _goo;
		images = processImages(_images);

		setState('beginning');
		setupCamera();
		setupMouse();
		setupLoop();
	};

	return Game;
});