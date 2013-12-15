define(['js/All'],
function(All) {
	'use strict';

	function ImageLoader(imagePaths, onComplete) {
		var all = new All(imagePaths.length, function() { onComplete(images); });
		var callback = all.getCallback();

		var images = imagePaths.map(function (imagePath) {
			var image = new Image();
			image.src = imagePath;
			image.onload = callback;
			return image;
		});
	}

	return ImageLoader;
});
