define([
	'goo/renderer/Material',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/renderer/shaders/ShaderLib',
], function (
	Material,
	ShapeCreator,
	EntityUtils,
	ShaderLib
) {
	'use strict';

	var meshData = ShapeCreator.createBox();

	function Cube(goo, ownPosition, color) {
		this.material = getColMat(color.r, color.g, color.b);
		this.entity = EntityUtils.createTypicalEntity(goo.world, meshData, this.material, [ownPosition.x, ownPosition.y, 0]);
		this.updateVisibility(color.r, color.g, color.b);
		this.entity.transformComponent.transform.scale.setd(0, 0, 0);
		this.entity.addToWorld();

		this.ownPosition = ownPosition;

		var pars = {
			p1: Math.random() + 1,
			p2: Math.random() + 1,
			p3: Math.random() + 1
		};
		this.displace = getDisplacementFunction('sine', pars).bind(this);
	}

	function getDisplacementFunction(type, pars) {
		switch (type) {
			case 'sine':
				return function(delta) {
					var dx = Math.sin(delta.x / 300) * 10 * pars.p1;
					var dy = Math.sin(delta.y / 300) * 10 * pars.p2;
					var dz = Math.sin(delta.x / 300) * 10 * pars.p3;

					this.entity.transformComponent.transform.translation.setd(
						this.ownPosition.x + dx,
						this.ownPosition.y + dy,
						dz
					);

					this.entity.transformComponent.setUpdated();
				};
		}
	}

	function getColMat(r, g, b) {
		var material = Material.createMaterial(ShaderLib.uber, '');
		material.materialState.diffuse = [r, g, b, 1];
		return material;
	}

	Cube.prototype.updateVisibility = function(r, g, b) {
		this.entity.meshRendererComponent.hidden = r === 1 && g === 0 && b === 1;
	};

	Cube.prototype.setColor = function(r, g, b) {
		this.updateVisibility(r, g, b);
		this.material.materialState.diffuse = [r, g, b, 1];
	};

	Cube.prototype.fadeAway = function(callback) {
		var entity = this.entity;
		var tween = new TWEEN.Tween( { z: 0, s: 1 } )
        	.to( { z: -400, s: 0 }, 2000 )
        	.delay(Math.random() * 800 + 100)
            .easing( TWEEN.Easing.Cubic.InOut )
            .onUpdate( function () {
            	entity.transformComponent.transform.translation.data[2] = this.z;
            	entity.transformComponent.transform.scale.setd(this.s, this.s, this.s);

            	entity.transformComponent.setUpdated();
			} )
			.onComplete(callback)
            .start();
	};

	Cube.prototype.fadeIn = function(callback) {
		var entity = this.entity;
		var tween = new TWEEN.Tween( { s: 0 } )
        	.to( { s: 1 }, 2000 )
        	.delay(Math.random() * 800 + 100)
            .easing( TWEEN.Easing.Cubic.InOut )
            .onUpdate( function () {
            	entity.transformComponent.transform.scale.setd(this.s, this.s, this.s);
            	entity.transformComponent.setUpdated();
			} )
			.onComplete(callback)
            .start();
	};

	Cube.prototype.remove = function() {
		this.entity.removeFromWorld();
	};

	return Cube;
});