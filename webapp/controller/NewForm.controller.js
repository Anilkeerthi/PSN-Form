sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
], (Controller, JSONModel, fioriLibrary, HorizontalLayout, VerticalLayout, Fragment, Filter, FilterOperator, MessageBox) => {
    "use strict";
 
    return Controller.extend("com.taqa.psnform.taqapsnform.controller.NewForm", {
        onInit() {
            sap.ui.core.BusyIndicator.show(0);
           
            this.oFlexibleColumnLayout = this.byId("flexibleColumnLayoutNew");
         
            var data = this.getOwnerComponent().getModel("DataModel")
            this.getView().setModel(data, "DataModel");
       
            let ListDataModel = new JSONModel();
            this.getView().setModel(ListDataModel, "ListData");
         
            this.oFlexibleColumnLayout = this.byId("flexibleColumnLayoutNew");
            this.oViewModel = new sap.ui.model.json.JSONModel({
                showExitFullScreen: false, // Initially hidden
                showFullScreen: true,
                showSearchSort: false,
                showRaiseRequest: true
            });
            this.getView().setModel(this.oViewModel, "buttonModel");
         
            this.oEmployeeSearchModel = new JSONModel({
                employees: []
            });
       
            this.getView().setModel(this.oEmployeeSearchModel, "employeeSearch");
         
            // Create a model for the required actions dropdown (renamed from eventReasons)
            this.oEventReasonsModel = new JSONModel({
                eventReasons: []
            });
            this.getView().setModel(this.oEventReasonsModel, "eventReasons");
         
            this.oFlexibleColumnLayout.attachStateChange(this.onLayoutChange, this);
           
            // Create promises for all data loading operations
            const loadPromises = [
                new Promise(resolve => {
                    this._loadTypeofChangePicklist();
                    resolve();
                }),
                new Promise(resolve => {
                    this._getPendingListDetails();
                    resolve();
                })
            ];
         
            this.oSelectedRowModel = new JSONModel();
            this.getView().setModel(this.oSelectedRowModel, "selectedRowModel");
         
            let employeeDataModel = new JSONModel({
                empData: []
            });
         
            var oSelectedEmployeeModel = new sap.ui.model.json.JSONModel({
                selectedEmployee: {}
            });
            this.getView().setModel(oSelectedEmployeeModel, "selectedEmployeeModel");
           
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteNewForm").attachPatternMatched(this._onRouteMatched, this);
           
            // Add a delay to ensure minimum busy indicator display time
            const delayPromise = new Promise(resolve => {
                setTimeout(resolve, 2000); // Show busy indicator for at least 2 seconds
            });
           
            // Wait for all operations and the delay to complete before hiding the busy indicator
            Promise.all([...loadPromises, delayPromise])
                .then(() => {
                    // Hide busy indicator after all operations are complete and minimum delay has passed
                    sap.ui.core.BusyIndicator.hide();
                })
                .catch(error => {
                    console.error("Error during initialization:", error);
                    // Ensure busy indicator is hidden even if there's an error
                    sap.ui.core.BusyIndicator.hide();
                });
 
        },
 
        _onRouteMatched: function (oEvent) {
            var sAction = oEvent.getParameter("arguments").action;
         
            if (sAction === "openFragment") {
              this.onOpenRequestDialog();
            }
          },
 
        onNavBackHome: function () {
            var route = this.getOwnerComponent().getRouter();
            route.navTo("RoutePSNForm");
        },
 
 
 
        // onNewListItemPress: function (oEvent) {
        //     var oItem = oEvent.getSource();
        //     var oCtx = oItem.getBindingContext("selectedEmployeeModel");
        //     var oModel = this.getView().getModel("selectedEmployeeModel"); // Get the correct model
        //     var sPath = oCtx.getPath(); // Get the path from the binding context
        //     var oSelectedRowData = oModel.getProperty(sPath); // Get the data using the path
        
        //     sap.ui.core.BusyIndicator.show(0);
        
        //     try {
        //         var userId = oSelectedRowData.userId; // Use userId from your model
        //         console.log(userId, typeof userId);
        
        //         // Perform operations using the userId
        //         this._getDetails(userId);
        //         this._getEducationDetails(userId);
        //         this._getLastExpDetails(userId);
        //         this._getSalaryAdjustDetails(userId);
        //         this._getApprovalDetails(userId);
        
        //         // Update the selected row data in the model (if you have one)
        //         if (!this.oSelectedRowModel) {
        //             //Create model if it does not exist.
        //             this.oSelectedRowModel = new sap.ui.model.json.JSONModel();
        //             this.getView().setModel(this.oSelectedRowModel, "selectedItemDetails");
        
        //         }
        //         this.oSelectedRowModel.setData({
        //             selectedRow: oSelectedRowData
        //         });
        
        //         console.log("Entire Model Data:", this.oSelectedRowModel.getData());
        
        //         // Set the Flexible Column Layout
        //         this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded); // Corrected fioriLibrary
        
        //         this.oViewModel.setProperty("/showSearchSort", true);
        //         this.oViewModel.setProperty("/showRaiseRequest", false);
        
        //         // Bind the selected item to the ObjectPageLayout in the mid column
        //         var oMidColumnPage = this.byId("ObjectPageLayoutNew");
        //         oMidColumnPage.bindElement({
        //             path: sPath,
        //             model: "selectedEmployeeModel" // Ensure correct model name
        //         });
        
        //     } catch (error) {
        //         console.error("Error during processing: ", error);
        //     } finally {
        //         this.getView().setBusy(false);
        //     }
        
        //     this._selectedItemContext = oCtx; // Store the binding context
        // },

        onNewListItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oCtx = oItem.getBindingContext("selectedEmployeeModel");
            var oModel = this.getView().getModel("selectedEmployeeModel"); // Get the correct model
            var sPath = oCtx.getPath(); // Get the path from the binding context
            var oSelectedRowData = oModel.getProperty(sPath); // Get the data using the path
        
            // Show busy indicator
            sap.ui.core.BusyIndicator.show(0);
        
            try {
                // Create a promise that resolves after 2 seconds
                var busyPromise = new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve();
                    }, 100); 
                });
        
                // Chain the promise with the operations
                busyPromise.then(function() {
                    var userId = oSelectedRowData.userId; // Use userId from your model
                    console.log(userId, typeof userId);
        
                    // Perform operations using the userId
                    this._getDetails(userId);
                    this._getEducationDetails(userId);
                    this._getLastExpDetails(userId);
                    this._getSalaryAdjustDetails(userId);
                    this._getApprovalDetails(userId);
        
                    // Update the selected row data in the model (if you have one)
                    if (!this.oSelectedRowModel) {
                        //Create model if it does not exist.
                        this.oSelectedRowModel = new sap.ui.model.json.JSONModel();
                        this.getView().setModel(this.oSelectedRowModel, "selectedItemDetails");
                    }
                    this.oSelectedRowModel.setData({
                        selectedRow: oSelectedRowData
                    });
        
                    console.log("Entire Model Data:", this.oSelectedRowModel.getData());
        
                    // Set the Flexible Column Layout
                    this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded); // Corrected fioriLibrary
        
                    this.oViewModel.setProperty("/showSearchSort", true);
                    this.oViewModel.setProperty("/showRaiseRequest", false);
        
                    // Bind the selected item to the ObjectPageLayout in the mid column
                    var oMidColumnPage = this.byId("ObjectPageLayoutNew");
                    oMidColumnPage.bindElement({
                        path: sPath,
                        model: "selectedEmployeeModel" // Ensure correct model name
                    });
                }.bind(this)).catch(function(error) {
                    console.error("Error during processing: ", error);
                }).finally(function() {
                    // Hide busy indicator when all operations are complete
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this));
            } catch (error) {
                console.error("Error during processing: ", error);
                // Hide busy indicator in case of error
                sap.ui.core.BusyIndicator.hide();
            }
        
            this._selectedItemContext = oCtx; // Store the binding context
        },
 


       
 
        getPath: function () {
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            return appModulePath;
        },
 
        _getPendingListDetails: function (userId) {
            var sServiceUrl = this.getPath() + "/odata/v2/cust_PositionStatusChange?recordStatus=pending&$format=JSON&$select=externalCode,effectiveStartDate,cust_TypeOfChange,cust_Justification,mdfSystemRecordStatus";
 
            var that = this;
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                   
                    let ListDataModel = that.getView().getModel("ListData");
                    ListDataModel.setData({ cust_PositionStatusChange: data.d.results });
 
                    // Log the data for verification
                    console.log("Fetched Data: ", ListDataModel.getData());
                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });
        },
 
 
 
        _getDetails: function (userId) {
            var that = this;
               let sServiceUrl = this.getPath() + "/odata/v2/User(" + userId + ")?$select=firstName,lastName,nationality,empId,userId,username,displayName,hireDate,defaultFullName,married,empInfo/jobInfoNav/employeeTypeNav/picklistLabels/optionId,empInfo/jobInfoNav/employeeTypeNav/picklistLabels/label,empInfo/jobInfoNav/employeeTypeNav/picklistLabels/locale&$format=JSON&$expand=empInfo/jobInfoNav/employeeTypeNav/picklistLabels"
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let employeeDataModel = new JSONModel(data.d);
                    that.getView().setModel(employeeDataModel, "empData")
 
 
                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });
 
        },
 
 
        _getEducationDetails: function (userId) {
            // userId = "31120";
            var that = this;
            let sServiceUrl = this.getPath() + "/odata/v2/Background_Education?$format=json&$select=userId,majorNav/picklistLabels/label,majorNav/picklistLabels/locale,majorNav/picklistLabels/optionId,sub_majorNav/picklistLabels/label,sub_majorNav/picklistLabels/locale,sub_majorNav/picklistLabels/optionId,degreeNav/picklistLabels/label,degreeNav/picklistLabels/locale,degreeNav/picklistLabels/optionId,schoolNav/picklistLabels/label,schoolNav/picklistLabels/locale,schoolNav/picklistLabels/optionId&$expand=majorNav/picklistLabels,degreeNav/picklistLabels,sub_majorNav/picklistLabels,schoolNav/picklistLabels&$filter=userId eq '"+userId+"'";
 
 
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let educationDataModel = new JSONModel(data.d);
                    that.getView().setModel(educationDataModel, "educationData")
 
 
 
                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });
 
        },
 
 
        _getApprovalDetails: function (userId) {
            var that = this;
            let sServiceUrl = this.getPath() + "/odata/v2/cust_PositionStatusChange?$expand=wfRequestNav,wfRequestNav/workflowAllowedActionListNav,wfRequestNav/wfRequestStepNav,wfRequestNav/empWfRequestNav/wfConfigNav/wfStepApproverNav/approverPositionNav,wfRequestNav/wfRequestParticipatorNav&recordStatus=pending&$filter = cust_Emp_ID eq 'userId'&$format=json";
 
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let approvalDataModel = new JSONModel(data.d);
                    that.getView().setModel(approvalDataModel, "approvalData")
                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });
 
        },
 
 
        _getLastExpDetails: function (userId) {
           
            var that = this;
            let sServiceUrl =  this.getPath() + "/odata/v2/Background_OutsideWorkExperience?$format=json&$select=startTitle,endDate,startDate,employer,yearsofexperience&$top=1&$filter=userId eq '"+userId+"'";
 
 
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let lastExpDataModel = new JSONModel(data.d);
                    that.getView().setModel(lastExpDataModel, "lastExpData")
 
 
 
                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });
 
        },
 
        _getSalaryAdjustDetails: function (userId) {
            var that = this;
            let sServiceUrl =  this.getPath() + "/odata/v2/FormHeader?$format=json&$select=dateAssigned,formLastContent/pmReviewContentDetail/summarySection/calculatedFormRating/rating,&$expand=formLastContent/pmReviewContentDetail/summarySection/calculatedFormRating&$filter=formSubjectId eq '"+userId+"' and formDataStatus eq 3";
 
 
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let SalaryAdjustDataModel = new JSONModel(data.d);
                    that.getView().setModel(SalaryAdjustDataModel, "SalaryAdjustData")
 
                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });
            // Create a promise to handle the asynchronous call
 
        },
 
        formatRecordStatusState: function (value) {
            if (value === "P") {
                return sap.ui.core.ValueState.Error; // Red for Pending
            } else if (value === "C") {
                return sap.ui.core.ValueState.Success; // Green for Completed
            }
            return sap.ui.core.ValueState.None; // Default color
        },
 
        formatMaritalStatus: function (value) {
            return value === true ? "Married" : "Unmarried";
        },
 
        formatDate: function (value) {
            if (value) {
                var timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                var hireDate = new Date(timestamp);
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd" });
                return oDateFormat.format(hireDate);
            }
            return value;
        },
 
        formatRecordStatus: function (value) {
            if (value === "P") {
                return "Pending";
            } else if (value === "C") {
                return "Completed";
            }
            return value; 
        },
 
 
        formatTenureDate: function (value) {
            if (value) {
                var timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                var hireDate = new Date(timestamp);
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd" });
                var formattedHireDate = oDateFormat.format(hireDate);
 
                var currentDate = new Date();
 
                var timeDiff = currentDate - hireDate;
 
                var diffInYears = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
                return diffInYears + " years";
            }
            return value;
        },
 
        getSelectedRowData: function () {
            return this.oSelectedRowModel.getProperty("/selectedRow");
        },

        createRatingRow: function(sId, oContext) {
            var oData = oContext.getObject();
            var sRating = "";
            var sYear = this.formatYear(oData.dateAssigned);
         
            if (oData.formLastContent && 
                oData.formLastContent.pmReviewContentDetail && 
                oData.formLastContent.pmReviewContentDetail.results && 
                oData.formLastContent.pmReviewContentDetail.results.length > 0 &&
                oData.formLastContent.pmReviewContentDetail.results[0].summarySection &&
                oData.formLastContent.pmReviewContentDetail.results[0].summarySection.calculatedFormRating) {
                
                sRating = oData.formLastContent.pmReviewContentDetail.results[0].summarySection.calculatedFormRating.rating;
            }
         
            return new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({ text: sYear }),
                    new sap.m.Text({ text: sRating || "No rating" })
                ]
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
                    name: "com.taqa.psnform.taqapsnform.view.NewRequest",
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
 
        onNewEmployeeSearch: function (oEvent) {
            var sValue = "";
 
            if (oEvent.getParameter("suggestValue") !== undefined) {
                sValue = oEvent.getParameter("suggestValue");
                console.log("Suggest value:", sValue);
            } else if (oEvent.getParameter("query") !== undefined) {
                sValue = oEvent.getParameter("query");
                console.log("Query value:", sValue);
            }
 
            this._searchTerm = sValue;
 
            if (sValue && sValue.length >= 2) {
                this._searchNewEmployees(sValue);
            } else {
                this.oEmployeeSearchModel.setProperty("/employees", []);
            }
        },
 
 
        _searchNewEmployees: function (sSearchTerm) {
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
                                hireDate: emp.hireDate || "",
                                employeeType: emp.empInfo.label || "N/A",
                                displayName: (emp.firstName || "") + " " + (emp.lastName || "")
                            };
                        });
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
        
 
        onNewSuggestionItemSelected: function (oEvent) {
            // console.log("Suggestion item selected event:", oEvent);
            // var oItem = oEvent.getParameter("listItem");
 
            // if (oItem) {

            //     var oCustomData = oItem.getCustomData().find(function (data) {
            //         return data.getKey() === "userId";
            //     });
 
            //     var sEmployeeId = oCustomData ? oCustomData.getValue() : "";
            //     this._selectedEmployeeId = sEmployeeId;

            //     var sEmployeeName = oItem.getTitle();
 
            //     var oSearchField = this.byId("idNewEmployeeSearch");
            //     if (oSearchField) {
            //         oSearchField.setValue(sEmployeeName);
            //         this.byId("idNewEmployeeList").setVisible(false);
            //     }
 
            //     console.log("Selected employee ID:", sEmployeeId, "Name:", sEmployeeName);
            // }


            console.log("Selection changed event:", oEvent);
           
            var oList = this.byId("idNewEmployeeList");
            var aSelectedItems = oList.getSelectedItems();
           
            console.log("Currently selected items:", aSelectedItems.length);
           
            var oSearchField = this.byId("idEmployeeSearch");
            if (oSearchField && aSelectedItems.length > 0) {
                oSearchField.setPlaceholder(aSelectedItems.length + " employee(s) selected");
            } else if (oSearchField) {
                oSearchField.setPlaceholder("Search Employee");
            }
           
        },
 
        _loadTypeofChangePicklist: function () {
            var oModel = this.getOwnerComponent().getModel();
 
            if (!oModel) {
                console.error("OData model not found");
                return;
            }
 
            var sPath = "/Picklist('TypeofChange')/picklistOptions";
 
            oModel.read(sPath, {
                urlParameters: {
                    "$expand": "picklistLabels",
                    "$select": "externalCode,id,picklistLabels/id,picklistLabels/optionId,picklistLabels/label,picklistLabels/locale",
                    "$filter": "picklistLabels/locale eq 'en_US'"
                },
                success: function (oData) {
                    console.log("Full OData Response:", oData);
 
                    if (oData && oData.results) {
                        var aEventReasons = oData.results.map(function (item) {
                            // Find the en_US label
                            var oLabel = item.picklistLabels.results.find(function (label) {
                                return label.locale === "en_US";
                            });
 
                            return {
                                externalCode: item.externalCode,
                                name: oLabel ? oLabel.label : item.externalCode
                            };
                        });
 
                        // Sort actions for better UX
                        aEventReasons.sort((a, b) => a.name.localeCompare(b.name));
 
                        // Update the model
                        this.oEventReasonsModel.setProperty("/eventReasons", aEventReasons);
                        console.log("Loaded required actions:", aEventReasons);
                    } else {
                        console.warn("No results found in picklist options");
                    }
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching required actions:", oError);
 
                    // More detailed error logging
                    if (oError.responseText) {
                        try {
                            var errorDetails = JSON.parse(oError.responseText);
                            console.error("Detailed Error:", errorDetails);
                        } catch (e) {
                            console.error("Error parsing error response");
                        }
                    }
                }.bind(this)
            });
        },
 
 
        onCloseDialog: function() {
            // Clear the selection
            var oList = this.byId("idNewEmployeeList");
            if (oList) {
                oList.removeSelections(true);
            }
            
            // Reset the search field
            var oSearchField = this.byId("idNewEmployeeSearch");
            if (oSearchField) {
                oSearchField.setValue("");
                oSearchField.setPlaceholder("Search Employee");
            }
            
            // Hide the list
            if (oList) {
                oList.setVisible(false);
            }
            
            // Close the dialog
            if (this._oDialog) {
                this._oDialog.close();
            } else {
                var oDialog = this.byId("idNewRequestDialog");
                if (oDialog) {
                    oDialog.close();
                }
            }
        },
 
        // onSubmit: function () {
        //     var oView = this.getView();
        //     var oSelectedRowModel = oView.getModel("selectedRowModel");
        
        //     console.log("Full Selected Row Model:", oSelectedRowModel.getData());
        
        //     var oRequestTypeSelect = this.byId("idRequestTypeNew");
        //     var oDatePicker = this.byId("idRequestDateNew");
        //     var oCommentsTextArea = this.byId("idCommentsNew");
        //     var oFileUploader = this.byId("idFileUploaderNew");
        
        //     var sRequestType = oRequestTypeSelect.getSelectedKey();
        //     var oEffectiveDate = oDatePicker.getDateValue();
        //     var sJustification = oCommentsTextArea.getValue();
        
        //     if (!sRequestType) {
        //         sap.m.MessageBox.error("Please select a Required Action");
        //         return;
        //     }
        
        //     if (!oEffectiveDate) {
        //         sap.m.MessageBox.error("Please select an effective change date");
        //         return;
        //     }
        
        //     var sExternalCode = oSelectedRowModel.getProperty("/selectedRow/externalCode");
        //     console.log("External Code:", sExternalCode);
        
        //     var that = this;
        
        //     if (!oFileUploader) {
        //         console.error("FileUploader with ID 'idFileUploaderNew' not found.");
        //         sap.m.MessageBox.error("File upload control not found.");
        //         this.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification, null); // Submit without file.
        //         return;
        //     }
        
        //     if (typeof oFileUploader.getFileObject !== "function") {
        //         console.error("oFileUploader.getFileObject is not a function. Control is not a valid FileUploader");
        //         sap.m.MessageBox.error("File upload control is invalid.");
        //         this.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification, null); // Submit without file.
        //         return;
        //     }
        
        //     var oFile = oFileUploader.getFileObject();
        
        //     if (oFile) {
        //         var reader = new FileReader();
        //         reader.onload = function (event) {
        //             var sFileContent = event.target.result.split(',')[1];
        
        //             var oAttachmentPayload = {
        //                 "__metadata": {
        //                     "uri": "Attachment"
        //                 },
        //                 "fileName": oFile.name,
        //                 "module": "GENERIC_OBJECT",
        //                 "userId": sExternalCode,
        //                 "viewable": true,
        //                 "fileContent": sFileContent
        //             };
        
        //             var sAttachmentUrl = that.getPath() + "/odata/v2/upsert";
        
        //             $.ajax({
        //                 url: sAttachmentUrl,
        //                 type: "POST",
        //                 contentType: "application/json",
        //                 data: JSON.stringify(oAttachmentPayload),
        //                 success: function (oAttachmentData) {
        //                     console.log("Attachment upload successful", oAttachmentData);
        //                     var sAttachmentId = oAttachmentData.d.results[0].attachmentId;
        //                      that.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification, sAttachmentId);
        //                 },
        //                 error: function (oAttachmentError) {
        //                     console.error("Attachment upload failed", oAttachmentError);
        //                     var sAttachmentErrorMessage = "Attachment upload failed.";
        
        //                     if (oAttachmentError.responseJSON && oAttachmentError.responseJSON.error && oAttachmentError.responseJSON.error.message) {
        //                         sAttachmentErrorMessage = oAttachmentError.responseJSON.error.message;
        //                     }
        
        //                     sap.m.MessageBox.error(sAttachmentErrorMessage, { title: "Error" });
        //                 }
        //             });
        //         };
        //         reader.readAsDataURL(oFile);
        //     } else {
        //         // this.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification,sAttachmentId);
        //     }
        // },
        
        // submitPSNForm: function (sExternalCode, oEffectiveDate, sRequestType, sJustification, sAttachmentId) {
        //     var oPayload = {
        //         "__metadata": { "uri": "cust_PositionStatusChange" },
        //         "externalCode": sExternalCode,
        //         "cust_Emp_ID": sExternalCode,
        //         "effectiveStartDate": this.convertToODataDate(new Date()),
        //         "cust_EffectiveDate": this.convertToODataDate(oEffectiveDate),
        //         "cust_TypeOfChange": sRequestType,
        //         "cust_Justification": sJustification || "No justification provided",
        //     };
        
        //     if (sAttachmentId) {
        //         oPayload.cust_AttachmentNav = {
        //             "__metadata": {
        //                 "uri": "Attachment(" + sAttachmentId + "L)"
        //             }
        //         };
        //     }
        
        //     console.log("PSN Form Payload prepared:", JSON.stringify(oPayload));
        
        //     var sUrl = this.getPath() + "/odata/v2/upsert?workflowConfirmed=true";
        
        //     $.ajax({
        //         url: sUrl,
        //         type: "POST",
        //         contentType: "application/json",
        //         data: JSON.stringify(oPayload),
        //         success: function (oData) {
        //             console.log("PSN Form Upsert successful", oData);
        //             sap.m.MessageBox.success("Workflow confirmed successfully!", {
        //                 title: "Success"
        //             });
        //         },
        //         error: function (oError) {
        //             console.error("PSN Form Upsert failed", oError);
        //             var sErrorMessage = "Workflow confirmation failed.";
        
        //             if (oError.responseJSON && oError.responseJSON.error && oError.responseJSON.error.message) {
        //                 sErrorMessage = oError.responseJSON.error.message;
        //             }
        
        //             sap.m.MessageBox.error(sErrorMessage, { title: "Error" });
        //         }
        //     });
        // },

        onSubmit: function () {
            var oView = this.getView();
            var oSelectedRowModel = oView.getModel("selectedRowModel");
            console.log("Full Selected Row Model:", oSelectedRowModel.getData());
        
            var oRequestTypeSelect = this.byId("idRequestTypeNew");
            var oDatePicker = this.byId("idRequestDateNew");
            var oCommentsTextArea = this.byId("idCommentsNew");
            var oFileUploader = this.byId("idFileUploaderNew");
        
            var sRequestType = oRequestTypeSelect.getSelectedKey();
            var oEffectiveDate = oDatePicker.getDateValue();
            var sJustification = oCommentsTextArea.getValue();
        
            if (!sRequestType) {
                sap.m.MessageBox.error("Please select a Required Action");
                return;
            }
        
            if (!oEffectiveDate) {
                sap.m.MessageBox.error("Please select an effective change date");
                return;
            }
        
            var sExternalCode = oSelectedRowModel.getData().selectedRow.userId;
            console.log("External Code:", sExternalCode);
        
            var that = this;
            var oFile = oFileUploader && oFileUploader.oFileUpload && oFileUploader.oFileUpload.files[0];
            
            if (oFile) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var sFileContent = event.target.result.split(',')[1];
        
                    var oAttachmentPayload = {
                        "__metadata": { "uri": "Attachment" },
                        "fileName": oFile.name,
                        "module": "GENERIC_OBJECT",
                        "userId": sExternalCode,
                        "viewable": true,
                        "fileContent": sFileContent
                    };
        
                    var sAttachmentUrl = that.getPath() + "/odata/v2/upsert";
        
                    $.ajax({
                        url: sAttachmentUrl + "?$format=json", // Append $format=json to the URL
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(oAttachmentPayload),
                        success: function (oAttachmentData) {
                            console.log("Attachment upload successful", oAttachmentData);
                    
                            try {
                                // Check if the response contains the expected structure
                                if (oAttachmentData && Array.isArray(oAttachmentData.d) && oAttachmentData.d.length > 0) {
                                    // Access the "key" field from the first element in the "d" array
                                    var keyContent = oAttachmentData.d[0].key;
                    
                                    if (keyContent) {
                                        // Use a regular expression to extract the attachmentId
                                        var attachmentIdMatch = keyContent.match(/Attachment\/attachmentId=(\d+)/);
                    
                                        if (attachmentIdMatch && attachmentIdMatch[1]) {
                                            var sAttachmentId = attachmentIdMatch[1]; // Captured attachmentId
                                            console.log("Extracted Attachment ID:", sAttachmentId);
                    
                                            // Proceed with the next step
                                            that.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification, sAttachmentId);
                                        } else {
                                            console.error("Failed to extract attachmentId from the 'key' field.");
                                            sap.m.MessageBox.error("Failed to extract attachmentId from the 'key' field.", { title: "Error" });
                                        }
                                    } else {
                                        console.error("The 'key' field is missing in the response.");
                                        sap.m.MessageBox.error("Invalid response format. Missing 'key' field.", { title: "Error" });
                                    }
                                } else {
                                    console.error("Invalid response format. Missing or empty 'd' array.");
                                    sap.m.MessageBox.error("Invalid response format. Missing or empty 'd' array.", { title: "Error" });
                                }
                            } catch (error) {
                                console.error("Error processing JSON response:", error);
                                sap.m.MessageBox.error("Error processing server response.", { title: "Error" });
                            }
                        },
                        error: function (oAttachmentError) {
                            console.error("Attachment upload failed", oAttachmentError);
                            var sAttachmentErrorMessage = "Attachment upload failed.";
                    
                            if (oAttachmentError.responseJSON && oAttachmentError.responseJSON.error && oAttachmentError.responseJSON.error.message) {
                                sAttachmentErrorMessage = oAttachmentError.responseJSON.error.message;
                            }
                    
                            sap.m.MessageBox.error(sAttachmentErrorMessage, { title: "Error" });
                        }
                    });
                    // $.ajax({
                    //     url: sAttachmentUrl,
                    //     type: "POST",
                    //     contentType: "application/json",
                    //     data: JSON.stringify(oAttachmentPayload),
                    //     success: function (oAttachmentData) {
                    //         console.log("Attachment upload successful", oAttachmentData);
                    
                    //         // Parse the XML response
                    //         var parser = new DOMParser();
                    //         var xmlDoc = parser.parseFromString(oAttachmentData, "text/xml");
                    
                    //         // Extract the <d:key> element
                    //         var keyElement = xmlDoc.getElementsByTagName("d:key")[0];
                    //         if (keyElement && keyElement.textContent) {
                    //             // Extract the attachmentId from the <d:key> content
                    //             var keyContent = keyElement.textContent;
                    //             var attachmentIdMatch = keyContent.match(/Attachment\/attachmentId=(\d+)/);
                    
                    //             if (attachmentIdMatch && attachmentIdMatch[1]) {
                    //                 var sAttachmentId = attachmentIdMatch[1]; // Captured attachmentId
                    //                 console.log("Extracted Attachment ID:", sAttachmentId);
                    
                    //                 // Proceed with the next step
                    //                 that.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification, sAttachmentId);
                    //             } else {
                    //                 console.error("Failed to extract attachmentId from the response.");
                    //                 sap.m.MessageBox.error("Failed to extract attachmentId from the response.", { title: "Error" });
                    //             }
                    //         } else {
                    //             console.error("No <d:key> element found in the response.");
                    //             sap.m.MessageBox.error("Invalid response format. Missing <d:key> element.", { title: "Error" });
                    //         }
                    //     },
                    //     error: function (oAttachmentError) {
                    //         console.error("Attachment upload failed", oAttachmentError);
                    //         var sAttachmentErrorMessage = "Attachment upload failed.";
                    
                    //         if (oAttachmentError.responseJSON && oAttachmentError.responseJSON.error && oAttachmentError.responseJSON.error.message) {
                    //             sAttachmentErrorMessage = oAttachmentError.responseJSON.error.message;
                    //         }
                    
                    //         sap.m.MessageBox.error(sAttachmentErrorMessage, { title: "Error" });
                    //     }
                    // });
                    
                };
                reader.readAsDataURL(oFile);
            } else {
                that.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification, null);
            }
        },
        
        submitPSNForm: function (sExternalCode, oEffectiveDate, sRequestType, sJustification, sAttachmentId) {
            var oPayload = {
                "__metadata": { "uri": "cust_PositionStatusChange" },
                "externalCode": sExternalCode,
                "cust_Emp_ID": sExternalCode,
                "effectiveStartDate": this.convertToODataDate(new Date()),
                "cust_EffectiveDate": this.convertToODataDate(oEffectiveDate),
                "cust_TypeOfChange": sRequestType,
                "cust_Justification": sJustification || "No justification provided",
            };
        
            if (sAttachmentId) {
                oPayload.cust_AttachmentNav = {
                    "__metadata": { "uri": "Attachment(" + sAttachmentId + "L)" }
                };
            }
        
            console.log("PSN Form Payload prepared:", JSON.stringify(oPayload));
            var sUrl = this.getPath() + "/odata/v2/upsert?workflowConfirmed=true";
        
            $.ajax({
                url: sUrl,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(oPayload),
                success: function (oData) {
                    console.log("PSN Form Upsert successful", oData);
                    sap.m.MessageBox.success("Workflow confirmed successfully!", { title: "Success" });
                },
                error: function (oError) {
                    console.error("PSN Form Upsert failed", oError);
                    var sErrorMessage = "Workflow confirmation failed.";
                    if (oError.responseJSON?.error?.message) {
                        sErrorMessage = oError.responseJSON.error.message;
                    }
                    sap.m.MessageBox.error(sErrorMessage, { title: "Error" });
                }
            });
        },        
        
        convertToODataDate: function (date) {
            if (!date) {
                console.warn("convertToODataDate: No date provided. Returning current date.");
                return "/Date(" + Date.now() + ")/";
            }
        
            if (date instanceof Date) {
                return "/Date(" + date.getTime() + ")/";
            }
        
            try {
                var oDate = new Date(date);
                if (isNaN(oDate.getTime())) {
                    console.error("convertToODataDate: Invalid date string:", date);
                    return "/Date(" + Date.now() + ")/";
                }
                return "/Date(" + oDate.getTime() + ")/";
            } catch (error) {
                console.error("convertToODataDate: Date conversion error:", error);
                return "/Date(" + Date.now() + ")/";
            }
        },

        //   onSubmit: function () {
        //     var oView = this.getView();
        //     var oSelectedRowModel = oView.getModel("selectedRowModel");

        //     console.log("Full Selected Row Model:", oSelectedRowModel.getData());

        //     var oRequestTypeSelect = this.byId("idRequestType");
        //     var oDatePicker = this.byId("idRequestDate");
        //     var oCommentsTextArea = this.byId("idComments");

        //     var sRequestType = oRequestTypeSelect.getSelectedKey();
        //     var oEffectiveDate = oDatePicker.getDateValue();
        //     var sJustification = oCommentsTextArea.getValue();

        //     if (!sRequestType) {
        //         sap.m.MessageBox.error("Please select a Required Action");
        //         return;
        //     }

        //     if (!oEffectiveDate) {
        //         sap.m.MessageBox.error("Please select an effective change date");
        //         return;
        //     }

        //     var sExternalCode = oSelectedRowModel.getProperty("/selectedRow/externalCode");
        //     console.log("External Code:", sExternalCode);

        //     var oPayload = {
        //         "__metadata": {
        //             "uri": "cust_PositionStatusChange"
        //         },
        //         "externalCode": sExternalCode,
        //         "effectiveStartDate": this.convertToODataDate(oEffectiveDate),
        //         "cust_TypeOfChange": sRequestType,
        //         "cust_Justification": sJustification || "No justification provided"
        //     };

        //     console.log("Payload prepared:", JSON.stringify(oPayload));

        //     var sUrl = this.getPath() + "/odata/v2/upsert?workflowConfirmed=true";

        //     $.ajax({
        //         url: sUrl,
        //         type: "POST",
        //         contentType: "application/json",
        //         data: JSON.stringify(oPayload),
        //         success: function (oData) {
        //             console.log("Upsert successful", oData);
        //             sap.m.MessageBox.success("Workflow confirmed successfully!", {
        //                 title: "Success"
        //             });
        //         },
        //         error: function (oError) {
        //             console.error("Upsert failed", oError);
        //             var sErrorMessage = "Workflow confirmation failed.";

        //             if (oError.responseJSON && oError.responseJSON.error && oError.responseJSON.error.message) {
        //                 sErrorMessage = oError.responseJSON.error.message;
        //             }

        //             sap.m.MessageBox.error(sErrorMessage, { title: "Error" });
        //         }
        //     });
        // },
      

        onSelectRequest: function () {
            // Get the selected employee ID
            // var sEmployeeId = this._selectedEmployeeId;
            // var oSearchField = this.byId("idEmployeeSearch");
            // var oDataModel = this.getView().getModel("DataModel");
            // var aEmployeeInformation = oDataModel.getProperty("/EmployeeInformation");
            // var oSelectedEmployee = this.getView().getModel("employeeSearch").getProperty(`/employees`).find(emp => emp.userId === sEmployeeId);
            // console.log(oSelectedEmployee);
        
            // if (!sEmployeeId) {
            //     sap.m.MessageToast.show("Please select an employee from the suggestions");
            //     return;
            // }
        
            // if (oSelectedEmployee) {
            //     var oSelectedEmployeeModel = this.getView().getModel("selectedEmployeeModel");
        
            //     if (!oSelectedEmployeeModel) {
            //         oSelectedEmployeeModel = new sap.ui.model.json.JSONModel({ selectedEmployee: [] });
            //         this.getView().setModel(oSelectedEmployeeModel, "selectedEmployeeModel");
            //     }
        
            //     var aExistingEmployees = oSelectedEmployeeModel.getProperty("/selectedEmployee");
        
            //     if (!Array.isArray(aExistingEmployees)) {
            //         aExistingEmployees = [];
            //     }
        
            //     var oCopiedSelectedEmployee = JSON.parse(JSON.stringify(oSelectedEmployee));
        
            //     var bExists = aExistingEmployees.some(emp => emp.userId === sEmployeeId);
            //     if (!bExists) {
            //         aExistingEmployees.push(oCopiedSelectedEmployee); // Use deep copied object
            //         oSelectedEmployeeModel.setProperty("/selectedEmployee", aExistingEmployees);
            //         console.log("Updated Model Data:", oSelectedEmployeeModel.getData());
            //     } else {
            //         sap.m.MessageToast.show("Employee is already added!");
            //     }
            // }
        
            // console.log("Submitting request for employee:", sEmployeeId);
            // sap.m.MessageToast.show("Request Submitted!");
            // this.onCloseDialog();

              // Get the list control and selected items
              var oList = this.byId("idNewEmployeeList");
              var aSelectedItems = oList.getSelectedItems();
             
              if (aSelectedItems.length === 0) {
                  sap.m.MessageToast.show("Please select at least one employee");
                  return;
              }
             
              var oSelectedEmployeeModel = this.getView().getModel("selectedEmployeeModel");
             
              if (!oSelectedEmployeeModel) {
                  oSelectedEmployeeModel = new sap.ui.model.json.JSONModel({ selectedEmployee: [] });
                  this.getView().setModel(oSelectedEmployeeModel, "selectedEmployeeModel");
              }
             
              // Make sure we have an array
              var aExistingEmployees = oSelectedEmployeeModel.getProperty("/selectedEmployee");
             
              // Explicitly check and convert to array if needed
              if (!Array.isArray(aExistingEmployees)) {
                  aExistingEmployees = [];
              }
             
              var aNewlyAddedEmployees = [];
             
              // Process each selected item
              aSelectedItems.forEach(function(oItem) {
                  // Get the user ID from the custom data
                  var oCustomData = oItem.getCustomData().find(function(data) {
                      return data.getKey() === "userId";
                  });
                 
                  if (!oCustomData) {
                      return; // Skip if no user ID found
                  }
                 
                  var sUserId = oCustomData.getValue();
                 
                  // Get the employee search model
                  var oEmployeeSearchModel = this.getView().getModel("employeeSearch");
                  var aEmployees = oEmployeeSearchModel.getProperty("/employees");
                 
                  // Find the complete employee object
                  var oSelectedEmployee = aEmployees.find(function(emp) {
                      return emp.userId === sUserId;
                  });
                 
                  if (oSelectedEmployee) {
                      // Check if employee already exists in the array to avoid duplicates
                      var bExists = false;
                     
                      // Safely check for existence
                      for (var i = 0; i < aExistingEmployees.length; i++) {
                          if (aExistingEmployees[i].userId === sUserId) {
                              bExists = true;
                              break;
                          }
                      }
                     
                      if (!bExists) {
                          aExistingEmployees.push(oSelectedEmployee);
                          aNewlyAddedEmployees.push(oSelectedEmployee);
                      }
                  }
              }, this);
             
              // Update the model with all selected employees
              oSelectedEmployeeModel.setProperty("/selectedEmployee", aExistingEmployees);
              console.log("Updated Model Data:", oSelectedEmployeeModel.getData());
             
              // Display success message and close dialog
              if (aNewlyAddedEmployees.length > 0) {
                  sap.m.MessageToast.show("Added " + aNewlyAddedEmployees.length + " employee(s) to the request!");
              } else {
                  sap.m.MessageToast.show("All selected employees were already added to the request.");
              }
             
              this.onCloseDialog();
        },
 
    });
});