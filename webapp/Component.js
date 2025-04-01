sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/taqa/psnform/taqapsnform/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.taqa.psnform.taqapsnform.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            this.setModel(models.createUserModel(), "userModel");
        }
    });
});