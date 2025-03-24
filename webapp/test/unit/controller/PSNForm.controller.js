/*global QUnit*/

sap.ui.define([
	"comtaqapsnform/taqa_psnform/controller/PSNForm.controller"
], function (Controller) {
	"use strict";

	QUnit.module("PSNForm Controller");

	QUnit.test("I should test the PSNForm controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
