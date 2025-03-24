/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"comtaqapsnform/taqa_psnform/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});