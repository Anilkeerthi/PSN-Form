sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, fioriLibrary, HorizontalLayout, VerticalLayout, Fragment, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("com.taqa.psnform.taqapsnform.controller.PSNForm", {
        onInit() {
            this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");

            var data = this.getOwnerComponent().getModel("DataModel")
            this.getView().setModel(data, "DataModel");

            this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
            this.oViewModel = new sap.ui.model.json.JSONModel({
                showExitFullScreen: false, // Initially hidden
                showFullScreen: true,
                showSearchSort: false,
                showRaiseRequest: true
            });
            this.getView().setModel(this.oViewModel, "buttonModel");

            // Create a model for employee search suggestions
            this.oEmployeeSearchModel = new JSONModel({
                employees: []
            });
            this.getView().setModel(this.oEmployeeSearchModel, "employeeSearch");


             // Create a model for event reasons dropdown
             this.oEventReasonsModel = new JSONModel({
                eventReasons: []
            });
            this.getView().setModel(this.oEventReasonsModel, "eventReasons");

            this.oFlexibleColumnLayout.attachStateChange(this.onLayoutChange, this);

            this._loadTypeofChangePicklist();
        },

        onListItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oCtx = oItem.getBindingContext("DataModel");
            this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

            this.oViewModel.setProperty("/showSearchSort", true);
            this.oViewModel.setProperty("/showRaiseRequest", false);

            // Bind the selected item to the ObjectPageLayout in mid column
            var oMidColumnPage = this.byId("ObjectPageLayout");
            oMidColumnPage.bindElement({
                path: oCtx.getPath(),
                model: "DataModel"
            });
        },




        handleFullScreen: function () {
            this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.MidColumnFullScreen);
            this.oViewModel.setProperty("/showExitFullScreen", true);
            this.oViewModel.setProperty("/showFullScreen", false);  
        },

        handleExitFullScreen: function () {
            this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
            this.oViewModel.setProperty("/showExitFullScreen", false);
            this.oViewModel.setProperty("/showFullScreen", true);  
        },

        handleClose: function () {
            this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.OneColumn);
            this.oViewModel.setProperty("/showExitFullScreen", false);
            this.oViewModel.setProperty("/showFullScreen", true); 

            this.oViewModel.setProperty("/showSearchSort", false);
            this.oViewModel.setProperty("/showRaiseRequest", true);
        },

        onLayoutChange: function (oEvent) {
            var sLayout = oEvent.getParameter("layout");
            var isFullScreen = sLayout === fioriLibrary.LayoutType.MidColumnFullScreen;

            var isExpanded = sLayout === fioriLibrary.LayoutType.OneColumn;
            var isCollapsed = sLayout === fioriLibrary.LayoutType.TwoColumnsMidExpanded ||
                sLayout === fioriLibrary.LayoutType.MidColumnFullScreen;

            this.oViewModel.setProperty("/showSearchSort", isCollapsed);
            this.oViewModel.setProperty("/showRaiseRequest", isExpanded);

            this.oViewModel.setProperty("/showExitFullScreen", isFullScreen);
            this.oViewModel.setProperty("/showFullScreen", !isFullScreen);
        },

        onSearchIconPress: function () {
            var oSearchField = this.byId("idSearchField");
            var oSearchButton = this.byId("idSearchButton");

            oSearchField.setVisible(true); 
            oSearchButton.setVisible(false); 
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            if (sQuery) {
                // Perform search logic here
                console.log("Search:", sQuery);
            }
        },



        onOpenRequestDialog: function () {
            var oView = this.getView();

            // Load the fragment only once
            if (!this._oRequestDialog) {
                Fragment.load({
                    id: oView.getId(), // Ensures unique ID
                    name: "com.taqa.psnform.taqapsnform.view.PSNRequest", 
                    controller: this // Use the same controller
                }).then(function (oDialog) {
                    this._oRequestDialog = oDialog;
                    oView.addDependent(this._oRequestDialog);

                    // Initialize the suggestions model
                    this.oEmployeeSearchModel.setData({
                        employees: []
                    });

                    this._oRequestDialog.open();
                }.bind(this));
            } else {
                this._oRequestDialog.open();
            }
        },

        onEmployeeSearch: function (oEvent) {
            var sValue = "";

            // Handle both search and suggest events
            if (oEvent.getParameter("suggestValue") !== undefined) {
                sValue = oEvent.getParameter("suggestValue");
                console.log("Suggest value:", sValue);
            } else if (oEvent.getParameter("query") !== undefined) {
                sValue = oEvent.getParameter("query");
                console.log("Query value:", sValue);
            }

            // Store the search term for later use
            this._searchTerm = sValue;

            if (sValue && sValue.length >= 2) {
                this._searchEmployees(sValue);
            } else {
                // Clear suggestions if search term is too short
                this.oEmployeeSearchModel.setProperty("/employees", []);
            }
        },


        _searchEmployees: function (sSearchTerm) {
            console.log("Searching for employees with term:", sSearchTerm);
        
            // Get OData model
            var oModel = this.getOwnerComponent().getModel();
        
            if (!oModel) {
                console.error("OData model not found");
                return;
            }
        
            // Create the search term
            var sSearchLower = sSearchTerm.toLowerCase();
            
            // Create the filter string for the OData query
            var sFilter = "tolower(username) like '%" + sSearchLower + "%' or " +
                "tolower(firstName) like '%" + sSearchLower + "%' or " +
                "tolower(lastName) like '%" + sSearchLower + "%' or " +
                "tolower(userId) like '%" + sSearchLower + "%'";
        
            // Use the OData model to read data
            oModel.read("/User", {
                urlParameters: {
                    "$top": "10",
                    "$filter": sFilter,
                    "$select": "username,userId,firstName,lastName"
                },
                success: function (data) {
                    console.log("Search results:", data);
                    if (data && data.results) {
                        // Format the results
                        var aEmployees = data.results.map(function (emp) {
                            return {
                                userId: emp.userId || "",
                                firstName: emp.firstName || "",
                                lastName: emp.lastName || "",
                                username: emp.username || "",
                                displayName: (emp.firstName || "") + " " + (emp.lastName || "") + " (" + emp.userId + ")"
                            };
                        });
        
                        // Update the model
                        this.oEmployeeSearchModel.setProperty("/employees", aEmployees);
                        console.log("Updated employee suggestions:", aEmployees);
                    }
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching employee data:", oError);
                    this.oEmployeeSearchModel.setProperty("/employees", []);
                }.bind(this)
            });
        },

        onSuggestionItemSelected: function (oEvent) {
            console.log("Suggestion item selected event:", oEvent);
            var oItem = oEvent.getParameter("listItem"); // Get the selected list item

            if (oItem) {
                // Get the employee ID from custom data
                var oCustomData = oItem.getCustomData().find(function (data) {
                    return data.getKey() === "userId";
                });

                var sEmployeeId = oCustomData ? oCustomData.getValue() : "";
                this._selectedEmployeeId = sEmployeeId;

                // Get the employee name from the title of the item
                var sEmployeeName = oItem.getTitle();

                // Set the value in the search field
                var oSearchField = this.byId("idEmployeeSearch");
                if (oSearchField) {
                    oSearchField.setValue(sEmployeeName);
                    // Hide the list after selection
                    this.byId("idEmployeeList").setVisible(false);
                }

                console.log("Selected employee ID:", sEmployeeId, "Name:", sEmployeeName);
            }
        },


        // Function to load picklist options for TypeofChange
        _loadTypeofChangePicklist: function() {
            var oModel = this.getOwnerComponent().getModel();
            
            if (!oModel) {
                console.error("OData model not found");
                return;
            }
            
            // Use the specific URL pattern for accessing picklistOptions
            var sPath = "/Picklist('TypeofChange')/picklistOptions";
            
            oModel.read(sPath, {
                urlParameters: {
                    "$expand": "picklistLabels",
                    "$select": "externalCode,id,picklistLabels/id,picklistLabels/optionId,picklistLabels/label,picklistLabels/locale",
                    "$filter": "picklistLabels/locale eq 'en_US'"
                },
                success: function(oData) {
                    if (oData && oData.results) {
                        // Format the results for the dropdown
                        var aEventReasons = oData.results.map(function(item) {
                            // Find the en_US label
                            var oLabel = item.picklistLabels.results.find(function(label) {
                                return label.locale === "en_US";
                            });
                            
                            return {
                                externalCode: item.externalCode,
                                label: oLabel ? oLabel.label : ""
                            };
                        });
                        
                        // Sort actions for better UX
                        aEventReasons.sort(function(a, b) {
                            // Sort numerically if labels start with numbers (like "1 Promotion")
                            if (!isNaN(a.label.charAt(0)) && !isNaN(b.label.charAt(0))) {
                                return parseInt(a.label.charAt(0)) - parseInt(b.label.charAt(0));
                            }
                            // Otherwise sort alphabetically
                            return a.label.localeCompare(b.label);
                        });
                        
                        // Update the model
                        this.oEventReasonsModel.setProperty("/eventReasons", aEventReasons);
                        console.log("Loaded required actions:", aEventReasons);
                    }
                }.bind(this),
                error: function(oError) {
                    console.error("Error fetching required actions:", oError);
                }.bind(this)
            });
        },


        onCloseDialog: function () {
            if (this._oRequestDialog) {
                // Reset the search field
                var oSearchField = this.byId("idEmployeeSearch");
                if (oSearchField) {
                    oSearchField.setValue("");
                }

                this.oEmployeeSearchModel.setProperty("/employees", []);

                // Clear selected employee
                this._selectedEmployeeId = null;

                this._oRequestDialog.close();
            }
        },

        onSelectRequest: function () {
            // Get the selected employee ID
            var sEmployeeId = this._selectedEmployeeId;
            var oSearchField = this.byId("idEmployeeSearch");
            // var sRequestType = this.byId("idRequestType").getSelectedKey();
            // var oDatePicker = this.byId("idRequestDate");
            //var oDate = oDatePicker.getDateValue();
            var oDataModel = this.getView().getModel("DataModel");
            var aEmployeeInformation = oDataModel.getProperty("/EmployeeInformation");
            var oSelectedEmployee = this.getView().getModel("employeeSearch").getProperty(`/employees`).find(emp => emp.userId === sEmployeeId);

            if (!sEmployeeId) {
                sap.m.MessageToast.show("Please select an employee from the suggestions");
                return;
            }


            if (oSelectedEmployee) {
                // Remove if the employee already exists in the list
                aEmployeeInformation = aEmployeeInformation.filter(emp => emp["Employee #"] !== sEmployeeId);
        
                // Add the selected employee to the top of the list
                aEmployeeInformation.unshift({
                    "Employee Name": oSelectedEmployee.firstName + " " + oSelectedEmployee.lastName,
                    "Employee #": oSelectedEmployee.userId,
                    "Nationality": oSelectedEmployee.nationality,
                    "Employment Type": oSelectedEmployee.employmentType
                });
        
                oDataModel.setProperty("/EmployeeInformation", aEmployeeInformation);
                sap.m.MessageToast.show("Employee updated to the top of the list!");
            }

            // if (!oDate) {
            //     sap.m.MessageToast.show("Please select an effective date");
            //     return;
            // }

            // Here you would typically send the request to your backend
            console.log("Submitting request for employee:", sEmployeeId);
            // console.log("Submitting request for employee:", sEmployeeId, "Type:", sRequestType, "Date:", oDate);

            sap.m.MessageToast.show("Request Submitted!");
            this.onCloseDialog();
        },


        // onSubmitTypeOfChange: function() {
        //     // Get values from the form
        //     var oRequestType = this.byId("idRequestType");
        //     var oDatePicker = this.byId("idRequestDate");
        //     var oJustification = this.byId("idComments");
            
        //     // Get the employee ID
        //     var sEmployeeId = this._selectedEmployeeId;
            
        //     // Validate required fields
        //     if (!sEmployeeId) {
        //         sap.m.MessageToast.show("Please select an employee first");
        //         return;
        //     }
            
        //     if (!oRequestType.getSelectedKey()) {
        //         sap.m.MessageToast.show("Please select a Required Action");
        //         return;
        //     }
            
        //     if (!oDatePicker.getDateValue()) {
        //         sap.m.MessageToast.show("Please select a Change Effective date");
        //         return;
        //     }
            
        //     // Convert the date to the format needed for the payload
        //     var oDate = oDatePicker.getDateValue();
        //     var iTimestamp = oDate.getTime();
            
        //     // Prepare the payload
        //     var oPayload = {
        //         "__metadata": {"uri": "cust_PositionStatusChange"},
        //         "externalCode": sEmployeeId,
        //         "effectiveStartDate": "/Date(" + iTimestamp + ")/",
        //         "cust_TypeOfChange": oRequestType.getSelectedKey(),
        //         "cust_Justification": oJustification.getValue() || ""
        //     };
            
        //     // Get the OData model
        //     var oModel = this.getOwnerComponent().getModel();
            
        //     // Show loading indicator
        //     sap.ui.core.BusyIndicator.show(0);
            
        //     // Make the OData call
        //     oModel.create("/upsert?workflowConfirmed=true", oPayload, {
        //         success: function(oData, response) {
        //             sap.ui.core.BusyIndicator.hide();
                    
        //             // Check HTTP status code
        //             var iStatusCode = response.statusCode;
        //             if (iStatusCode >= 200 && iStatusCode < 300) {
        //                 sap.m.MessageBox.success("Request submitted successfully", {
        //                     onClose: function() {
        //                         // Reset form after successful submission
        //                         this._resetTypeOfChangeForm();
        //                         // Close dialog if open
        //                         if (this._oRequestDialog && this._oRequestDialog.isOpen()) {
        //                             this._oRequestDialog.close();
        //                         }
        //                     }.bind(this)
        //                 });
        //             } else {
        //                 sap.m.MessageBox.error("Unexpected response: " + iStatusCode);
        //             }
        //         }.bind(this),
        //         error: function(oError) {
        //             sap.ui.core.BusyIndicator.hide();
                    
        //             // Extract error message from response if available
        //             var sErrorMessage = "An error occurred while submitting the request";
        //             if (oError.responseText) {
        //                 try {
        //                     var oErrorResponse = JSON.parse(oError.responseText);
        //                     if (oErrorResponse.error && oErrorResponse.error.message) {
        //                         sErrorMessage = oErrorResponse.error.message.value || sErrorMessage;
        //                     }
        //                 } catch (e) {
        //                     // If JSON parsing fails, use the default message
        //                 }
        //             }
                    
        //             sap.m.MessageBox.error(sErrorMessage);
        //         }.bind(this)
        //     });
        // },
        
        // // Helper method to reset the form fields
        // _resetTypeOfChangeForm: function() {
        //     var oRequestType = this.byId("idRequestType");
        //     var oDatePicker = this.byId("idRequestDate");
        //     var oJustification = this.byId("idComments");
        //     var oFileUploader = this.byId("idFileUploader");
            
        //     // Reset fields
        //     if (oRequestType) oRequestType.setSelectedKey("");
        //     if (oDatePicker) oDatePicker.setValue("");
        //     if (oJustification) oJustification.setValue("");
        //     if (oFileUploader) oFileUploader.setValue("");
        // }


    });
});