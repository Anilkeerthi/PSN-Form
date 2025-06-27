sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/taqa/psnform/taqapsnform/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models,JSONModel) => {
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

            // Create global model with initial data
            var oUserRolesModel = new JSONModel({
                roles: {
                    roleId: "",
                    roleName: "",
                    roleDesc: ""
                },
                application: {
                    title: "My App",
                    version: "1.0.0",
                    settings: {}
                },
                shared: {
                    selectedData: null,
                    filters: {},
                    navigationData: {}
                }
            });

             // Set the global model to the core
             sap.ui.getCore().setModel(oUserRolesModel, "userRolesModel");

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

        }
    });
});