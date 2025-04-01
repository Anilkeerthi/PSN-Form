sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
  
], (Controller, JSONModel, fioriLibrary, HorizontalLayout, VerticalLayout,BusyIndicator,Filter, FilterOperator, MessageBox ,MessageToast, Fragment) => {
    "use strict";

    return Controller.extend("com.taqa.psnform.taqapsnform.controller.PSNForm", {
        // onInit() {

          
        //     this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");

        //     var data = this.getOwnerComponent().getModel("DataModel")
        //     this.getView().setModel(data, "DataModel");
        //     let ListDataModel = new JSONModel();
        //     this.getView().setModel(ListDataModel, "ListData");

        //     this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
        //     this.oViewModel = new sap.ui.model.json.JSONModel({
        //         showExitFullScreen: false, // Initially hidden
        //         showFullScreen: true,
        //         showSearchSort: false,
        //         showRaiseRequest: true
        //     });
        //     this.getView().setModel(this.oViewModel, "buttonModel");

        //     // Create a model for employee search suggestions
        //     this.oEmployeeSearchModel = new JSONModel({
        //         employees: []
        //     });
        //     this.getView().setModel(this.oEmployeeSearchModel, "employeeSearch");

        //     this.changeApprovalModel = new JSONModel({ employees: [] });
        //     this.getView().setModel(this.changeApprovalModel, "changeApproval");



        //     // Create a model for the required actions dropdown (renamed from eventReasons)
        //     this.oEventReasonsModel = new JSONModel({
        //         eventReasons: []
        //     });
        //     this.getView().setModel(this.oEventReasonsModel, "eventReasons");

        //     this.oFlexibleColumnLayout.attachStateChange(this.onLayoutChange, this);

        //     this._loadTypeofChangePicklist();
        //     this._getPendingListDetails();
        //     this._selectedEmployeeId = "";
        //     this._selectedItemContext = null;

        //     this.oSelectedRowModel = new JSONModel();
        //     this.getView().setModel(this.oSelectedRowModel, "selectedRowModel");

        //     let employeeDataModel = new JSONModel({
        //         empData: []
        //     });


        //     var oSelectedEmployeeModel = new sap.ui.model.json.JSONModel({
        //         selectedEmployee: {}
        //     });

        //     this.getView().setModel(oSelectedEmployeeModel, "selectedEmployeeModel");
         
           
        // },

        onInit() {
            // Show busy indicator when application starts
            sap.ui.core.BusyIndicator.show(0);
            
            this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
        
            var data = this.getOwnerComponent().getModel("DataModel")
            this.getView().setModel(data, "DataModel");
            let ListDataModel = new JSONModel();
            this.getView().setModel(ListDataModel, "ListData");
        
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
        
            this.changeApprovalModel = new JSONModel({ employees: [] });
            this.getView().setModel(this.changeApprovalModel, "changeApproval");
        
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
            
            this._selectedEmployeeId = "";
            this._selectedItemContext = null;
        
            this.oSelectedRowModel = new JSONModel();
            this.getView().setModel(this.oSelectedRowModel, "selectedRowModel");
        
            let employeeDataModel = new JSONModel({
                empData: []
            });
        
            var oSelectedEmployeeModel = new sap.ui.model.json.JSONModel({
                selectedEmployee: {}
            });
        
            this.getView().setModel(oSelectedEmployeeModel, "selectedEmployeeModel");
            
            // Add a delay to ensure minimum busy indicator display time
            const delayPromise = new Promise(resolve => {
                setTimeout(resolve, 1000); // Show busy indicator for at least 2 seconds
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

        onNewRequestDialog: function () {
            var route = this.getOwnerComponent().getRouter();
            route.navTo("RouteNewForm", {action: "openFragment" });
           
        },

        // onListItemPress: function (oEvent) {
           
        //     var oItem = oEvent.getSource();
        //     var oModel = this.getView().getModel("ListData");
        //     var sPath = oItem.getBindingContextPath();
        //     var oSelectedRowData = oModel.getProperty(sPath);

        //     // Set the view's busy property
        //     this.getView().setBusy(true);

        //     // Get the userId from the selected row data
        //     var userId = oSelectedRowData.externalCode;
        //     console.log(userId, typeof userId);

        //     try {
        //         // Perform operations
        //         this._getDetails(userId);
        //         this._getEducationDetails(userId);
        //         this._getLastExpDetails(userId);
        //         this._getSalaryAdjustDetails(userId);
        //         this._getApprovalDetails(userId);

        //         // Clear existing data and set new data
        //         this.oSelectedRowModel.setData({
        //             selectedRow: oSelectedRowData
        //         });

        //         console.log("Entire Model Data:", this.oSelectedRowModel.getData());

        //         // Set the Flexible Column Layout
        //         this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
        //         this.oViewModel.setProperty("/showSearchSort", true);
        //         this.oViewModel.setProperty("/showRaiseRequest", false);

        //         // Bind the selected item to the ObjectPageLayout in the mid column
        //         var oMidColumnPage = this.byId("ObjectPageLayout");
        //         oMidColumnPage.bindElement({
        //             path: sPath,
        //             model: "ListData"
        //         });
        //     } catch (error) {
        //         console.error("Error during processing: ", error);
        //     } finally {
        //         this.getView().setBusy(false);
        //     }
        //     this._selectedItemContext = oEvent.getSource().getBindingContext("ListData");
        // },

        onListItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oModel = this.getView().getModel("ListData");
            var sPath = oItem.getBindingContextPath();
            var oSelectedRowData = oModel.getProperty(sPath);
        
            // Show the global busy indicator
            sap.ui.core.BusyIndicator.show(0);
        
            // Get the userId from the selected row data
            var userId = oSelectedRowData.externalCode;
            console.log(userId, typeof userId);
        
            try {
                // Create a promise that resolves after 2 seconds
                var busyPromise = new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve();
                    }, 100); 
                });
        
                // Chain the promise with the operations
                busyPromise.then(function() {
                    // Perform operations
                    this._getDetails(userId);
                    this._getEducationDetails(userId);
                    this._getLastExpDetails(userId);
                    this._getSalaryAdjustDetails(userId);
                    this._getApprovalDetails(userId);
        
                    // Clear existing data and set new data
                    this.oSelectedRowModel.setData({
                        selectedRow: oSelectedRowData
                    });
        
                    console.log("Entire Model Data:", this.oSelectedRowModel.getData());
        
                    // Set the Flexible Column Layout
                    this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
                    this.oViewModel.setProperty("/showSearchSort", true);
                    this.oViewModel.setProperty("/showRaiseRequest", false);
        
                    // Bind the selected item to the ObjectPageLayout in the mid column
                    var oMidColumnPage = this.byId("ObjectPageLayout");
                    oMidColumnPage.bindElement({
                        path: sPath,
                        model: "ListData"
                    });
                }.bind(this)).catch(function(error) {
                    console.error("Error during processing: ", error);
                }).finally(function() {
                    // Hide the global busy indicator
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this));
            } catch (error) {
                console.error("Error during processing: ", error);
                // Hide the global busy indicator in case of error
                sap.ui.core.BusyIndicator.hide();
            }
            
            this._selectedItemContext = oEvent.getSource().getBindingContext("ListData");
            this._bSortAscending = true;
        },

        onSearchIconPress: function () {
            var oSearchField = this.getView().byId("idSearchField");
            var bSearchFieldVisible = oSearchField.getVisible();
        
            // Toggle search field visibility
            oSearchField.setVisible(!bSearchFieldVisible);
        
            // If making the search field visible, focus on it
            if (!bSearchFieldVisible) {
                oSearchField.focus();
            }
        },
        
        onSearch: function (oEvent) {
            // Get the search query from the SearchField
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue"); // Use either "query" or "newValue"
       
            // Get the List control
            var oList = this.byId("idList");
       
            // Get the binding for the List items
            var oBinding = oList.getBinding("items");
       
            // Define the filter (e.g., search by "externalCode" or "cust_TypeOfChange")
            if (sQuery && sQuery.length > 0) {
                var oFilter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("externalCode", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("cust_TypeOfChange", sap.ui.model.FilterOperator.Contains, sQuery)
                ], false); // Combine filters with OR logic
       
                // Apply the filter to the binding
                oBinding.filter(oFilter);
            } else {
                // If the search query is empty, clear the filter
                oBinding.filter([]);
            }
        },
       
        onSortIconPress: function () {
            var oList = this.getView().byId("page2").getContent()[0]; // Assuming your List is the first content element
            var oBinding = oList.getBinding("items");
            var bSortAscending = this._bSortAscending; // Get the current sort order
        
            var oSorter = new sap.ui.model.Sorter("externalCode", !bSortAscending); // Sort by externalCode, you can change to any property
        
            oBinding.sort(oSorter);
        
            this._bSortAscending = !bSortAscending; // Toggle sort order
        },

        onOpenMoreActionsMenu: function (oEvent) {
            // Create the menu if it doesn't already exist
            if (!this._oMoreActionsMenu) {
                this._oMoreActionsMenu = new sap.m.Menu({
                    items: [
                        new sap.m.MenuItem({
                            text: "Return",
                            icon: "sap-icon://nav-back",
                            press: this.onReturn.bind(this)
                        }),
                        new sap.m.MenuItem({
                            text: "Withdraw",
                            icon: "sap-icon://delete",
                            press: this.onWithdraw.bind(this)
                        }),
                        new sap.m.MenuItem({
                            text: "Delegate",
                            icon: "sap-icon://user-edit",
                            press: this.onToggleFooter.bind(this)
                        })
                    ]
                });
            }
 
            // Open the menu at the position of the button
            this._oMoreActionsMenu.openBy(oEvent.getSource());
        },

        onToggleFooter: function () {
            sap.m.MessageToast.show("Delegate action triggered");
 
        },

        getPath: function () {
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            return appModulePath;
        },

        _getPendingListDetails: function(userId) {
            //userId = "31120";
            var sServiceUrl = this.getPath() + "/odata/v2/cust_PositionStatusChange?recordStatus=pending&$format=JSON&$select=externalCode,effectiveStartDate,cust_TypeOfChange,cust_Justification,wfRequestNav/wfRequestId,wfRequestNav/totalSteps,wfRequestNav/currentStepNum,wfRequestNav/status,wfRequestNav/wfRequestStepNav/stepNum,wfRequestNav/wfRequestStepNav/wfRequestStepId,wfRequestNav/wfRequestStepNav/status,wfRequestNav/wfRequestStepNav/positionNav/code,wfRequestNav/wfRequestStepNav/positionNav/externalName_en_US&$expand=wfRequestNav/wfRequestStepNav/positionNav";

            var that = this;
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function(data) {
                    // Set the fetched data into the JSON Model
                    let ListDataModel = that.getView().getModel("ListData");
                    ListDataModel.setData({ cust_PositionStatusChange: data.d.results });

                    // Log the data for verification
                    console.log("Fetched Data: ", ListDataModel.getData());
                },
                error: function(e) {
                    MessageToast.show("Server Send Error");
                }
            });
        },



        _getDetails: function (userId) {
            // userId = "31120";
            // Construct the complete URL
            var that = this;
            let sServiceUrl = this.getPath() + "/odata/v2/User(" + userId + ")?$select=firstName,lastName,nationality,empId,userId,username,displayName,hireDate,defaultFullName,married,empInfo/jobInfoNav/employmentTypeNav/picklistLabels/optionId,empInfo/jobInfoNav/employmentTypeNav/picklistLabels/locale,empInfo/jobInfoNav/employmentTypeNav/picklistLabels/label&$format=JSON&$expand=empInfo/jobInfoNav,empInfo/jobInfoNav/employmentTypeNav/picklistLabels";


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
            var that = this;
           // userId = "31120";
            let sServiceUrl = this.getPath() + "/odata/v2/Background_Education?$format=json&$select=userId,majorNav/picklistLabels/label,majorNav/picklistLabels/locale,majorNav/picklistLabels/optionId,sub_majorNav/picklistLabels/label,sub_majorNav/picklistLabels/locale,sub_majorNav/picklistLabels/optionId,degreeNav/picklistLabels/label,degreeNav/picklistLabels/locale,degreeNav/picklistLabels/optionId,schoolNav/picklistLabels/label,schoolNav/picklistLabels/locale,schoolNav/picklistLabels/optionId&$expand=majorNav/picklistLabels,degreeNav/picklistLabels,sub_majorNav/picklistLabels,schoolNav/picklistLabels&$filter=userId eq '"+userId+"'";


            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let educationDataModel = new JSONModel(data.d);
                    that.getView().setModel(educationDataModel, "educationData");


                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });

        },


        _getApprovalDetails: function (userId) {
           // userId = "31120";
            var that = this;
            let sServiceUrl1 = this.getPath() + "/odata/v2/EmpJob?$format=JSON&$select=userId,position,jobTitle,userNav/displayName&$expand=userNav&$filter=(position eq 21000885 or position eq 21000902 or position eq 22000551) and userNav/firstName ne null";
            $.ajax({
                url: sServiceUrl1,
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
            //userId = "31844";
            // Construct the complete URL
            var that = this;
            let sServiceUrl = this.getPath() + "/odata/v2/Background_OutsideWorkExperience?$format=json&$select=startTitle,endDate,startDate,employer,yearsofexperience&$top=1&$filter=userId eq '"+userId+"'";


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
          //  userId = "31288";
            var that = this;
            let sServiceUrl = this.getPath() + "/odata/v2/FormHeader?$format=json&$select=dateAssigned,formLastContent/pmReviewContentDetail/summarySection/calculatedFormRating/rating,&$expand=formLastContent/pmReviewContentDetail/summarySection/calculatedFormRating&$filter=formSubjectId eq '"+userId+"' and formDataStatus eq 3";


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


        
        getApproverNames: function(positionCode) {
            var approvalData = this.getView().getModel("approvalData");
            var approverNames = []; // Array to collect matching approver names
        
            if (approvalData && approvalData.getProperty("/results") && positionCode) {
                var approvers = approvalData.getProperty("/results");
                // Iterate through all approvers
                approvers.forEach(function(approver) {
                    if (approver.position === positionCode && approver.userNav && approver.userNav.displayName) {
                        approverNames.push(approver.userNav.displayName); // Add matching approver name to the array
                    }
                });
            }
            return approverNames; // Return the array of approver names
        },
           

        formatRecordStatusState: function (value) {
            if (value === "PENDING") {
                return sap.ui.core.ValueState.Warning; 
            } else if (value === "COMPLETED") {
                return sap.ui.core.ValueState.Success;
            }
            return sap.ui.core.ValueState.None;
        },
        

        formatMaritalStatus: function (value) {
            return value === true ? "Married" : "Unmarried";
        },

        formatDate: function (value) {
            if (value) {
                var timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                var hireDate = new Date(timestamp);
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyy-MM-dd"});
                return oDateFormat.format(hireDate);
            }
            return value;
        },

        formatYear: function (value) {
            if (value) {
                var timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                var hireDate = new Date(timestamp);
                return hireDate.getFullYear();
            }
            return value;
        },




        
        formatTenureDate: function (value) {
            if (value) {
                var timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                var hireDate = new Date(timestamp);  
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyy-MM-dd"});
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

        onOpenChangeApprovalDialog: function () {
            var oView = this.getView();

            // Check if the dialog already exists
            if (!this._oRequestDialog) {
                // Directly create the fragment using sap.ui.xmlfragment
                this._oRequestDialog = sap.ui.xmlfragment(
                    oView.getId(), // ID for the fragment
                    "com.taqa.psnform.taqapsnform.view.PSNRequest", // Fragment name (namespace)
                    this // Controller for the fragment
                );

                // Add the dialog as a dependent to the view
                oView.addDependent(this._oRequestDialog);

                // Initialize the employee search model if not already initialized
                if (!this.oEmployeeSearchModel) {
                    this.oEmployeeSearchModel = new sap.ui.model.json.JSONModel();
                }

                // Set the data for the employee search model
                this.oEmployeeSearchModel.setData({
                    employees: []
                });

                // Open the dialog
                this._oRequestDialog.open();
            } else {
                // If the dialog already exists, just open it
                this._oRequestDialog.open();
            }
        },

        onEmployeeSearch: function (oEvent) {
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
                this._searchEmployees(sValue);
            } else {
                this.oEmployeeSearchModel.setProperty("/employees", []);
            }
        },

       
        _searchEmployees: function (sSearchTerm) {
            console.log("Searching for employees with term:", sSearchTerm);

            var oModel = this.getOwnerComponent().getModel();

            if (!oModel) {
                console.error("OData model not found");
                return;
            }

            var sSearchLower = sSearchTerm.toLowerCase();

            var sFilter = "tolower(username) like '%" + sSearchLower + "%' or " +
                "tolower(firstName) like '%" + sSearchLower + "%' or " +
                "tolower(lastName) like '%" + sSearchLower + "%' or " +
                "tolower(userId) like '%" + sSearchLower + "%'";

            oModel.read("/User", {
                urlParameters: {
                    "$top": "10",
                    "$filter": sFilter,
                    "$select": "username,userId,firstName,lastName"
                },
                success: function (data) {
                    console.log("Search results:", data);
                    if (data && data.results) {
                        
                        var aEmployees = data.results.map(function (emp) {
                            return {
                                userId: emp.userId || "",
                                firstName: emp.firstName || "",
                                lastName: emp.lastName || "",
                                username: emp.username || "",
                                displayName: (emp.firstName || "") + " " + (emp.lastName || "") + " (" + emp.userId + ")"
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

        onSuggestionItemSelected: function (oEvent) {
            console.log("Suggestion item selected event:", oEvent);
            var oItem = oEvent.getParameter("listItem");

            if (oItem) {
            
                var oCustomData = oItem.getCustomData().find(function (data) {
                    return data.getKey() === "userId";
                });

                var sEmployeeId = oCustomData ? oCustomData.getValue() : "";
                this._selectedEmployeeId = sEmployeeId;

                var sEmployeeName = oItem.getTitle();

                var oSearchField = this.byId("idEmployeeSearch");
                if (oSearchField) {
                    oSearchField.setValue(sEmployeeName);
                  
                    this.byId("idEmployeeList").setVisible(false);
                }

                console.log("Selected employee ID:", sEmployeeId, "Name:", sEmployeeName);
            }
        },
   


        onReject: function () {
            if (!this._oRejectDialog) {
                this._oRejectDialog = sap.ui.xmlfragment(
                    "com.taqa.psnform.taqapsnform.view.Reject", // Replace with your fragment path
                    this
                );
                this.getView().addDependent(this._oRejectDialog);
            }
            
            this._oRejectDialog.open();
        },
        

        onRejectRequest: function () {
          
                    var wfRequestId = this._currentWfRequestId || "defaultRequestId";
                    
                    this._rejectWfRequestWithComment(wfRequestId);
                    this._oRejectDialog.close();
              
        },

        onCloseRejectDialog: function () {
            if (this._oRejectDialog) {
                this._oRejectDialog.close();
            }
        },

        onAccept: function () {
            MessageBox.confirm("Are you sure you want to approve?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        this.onApproveWfRequest();
                        MessageToast.show("Approval Request Submitted!");
                    }
                }.bind(this) // Bind the controller's 'this' context
            });
        },
        
        onReturn: function () {
            sap.m.MessageBox.confirm("Are you sure you want to return?", {
                title: "Confirm Return",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === sap.m.MessageBox.Action.YES) {
                        this.onSendbackWfRequest();
                        console.log("User confirmed Return.");
                        sap.m.MessageToast.show("Returning...");
                        // Add your Return logic here
                    }
                }.bind(this) // Bind the controller's 'this' context
            });
        },
        
        onWithdraw: function () {
            sap.m.MessageBox.confirm("Are you sure you want to withdraw?", {
                title: "Confirm Withdraw",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === sap.m.MessageBox.Action.YES) {
                        this.onWithdrawWfRequest();
                        console.log("User confirmed Withdraw.");
                        sap.m.MessageToast.show("Withdrawing...");
                    }
                }.bind(this) // Bind the controller's 'this' context
            });
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
                            var oLabel = item.picklistLabels.results.find(function (label) {
                                return label.locale === "en_US";
                            });

                            return {
                                externalCode: item.externalCode,
                                name: oLabel ? oLabel.label : item.externalCode
                            };
                        });
                        aEventReasons.sort((a, b) => a.name.localeCompare(b.name));
                        this.oEventReasonsModel.setProperty("/eventReasons", aEventReasons);
                        console.log("Loaded required actions:", aEventReasons);
                    } else {
                        console.warn("No results found in picklist options");
                    }
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching required actions:", oError);
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


        onCloseDialog: function () {
            if (this._oRequestDialog) {
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

        onChangeApprover: function () {
            if (!this._selectedItemContext) {
                sap.m.MessageBox.error("Please select an item from the list.");
                return;
            }
        
            let wfRequestId = this._selectedItemContext.getProperty("wfRequestNav/results/0/wfRequestId");
            let wfRequestStepId = this._selectedItemContext.getProperty("wfRequestNav/results/0/wfRequestStepNav/results/0/wfRequestStepId");
            let userId = this._selectedEmployeeId;
        
            if (!wfRequestId || !wfRequestStepId || !userId) {
                sap.m.MessageBox.error("Please provide all required fields.");
                return;
            }
        
            $.ajax({
                url: this.getPath() + `/odata/v2/changeWfRequestApprover?wfRequestId=${wfRequestId}L&wfRequestStepId=${wfRequestStepId}L&updateToUserId='${userId}'&editTransaction='NO_EDIT'`,
                type: "POST",
                success: function (data, textStatus, jqXHR) {
                    sap.m.MessageToast.show("Approver changed successfully.");
                    this._getPendingListDetails();
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    let errorMessage = "Error changing approver: " + errorThrown;
        
                    // Parse error response (JSON or XML)
                    if (jqXHR.responseJSON && jqXHR.responseJSON.error && jqXHR.responseJSON.error.message && jqXHR.responseJSON.error.message.value) {
                        errorMessage = "Error changing approver: " + jqXHR.responseJSON.error.message.value;
                    } else if (jqXHR.responseXML) {
                        try {
                            const xmlDoc = jqXHR.responseXML;
                            const messageElement = xmlDoc.querySelector("message");
                            if (messageElement) {
                                errorMessage = "Error changing approver: " + messageElement.textContent;
                            }
                        } catch (xmlParseError) {
                            console.error("Error parsing XML response:", xmlParseError);
                        }
                    } else if (jqXHR.responseText) {
                        errorMessage = "Error changing approver: " + jqXHR.responseText;
                    }
        
                    sap.m.MessageBox.error(errorMessage, {
                        title: "Error",
                        details: jqXHR.responseText
                    });
                    console.error("Error changing approver:", textStatus, errorThrown, jqXHR);
                }.bind(this)
            });
        },


        onApproveWfRequest: function () {
            if (!this._selectedItemContext) {
                sap.m.MessageBox.error("Please select an item from the list.");
                return;
            }
        
            let wfRequestId = this._selectedItemContext.getProperty("wfRequestNav/results/0/wfRequestId");
        
            if (!wfRequestId) {
                sap.m.MessageBox.error("WF Request ID is missing.");
                return;
            }
        
            $.ajax({
                url: this.getPath() + `/odata/v2/approveWfRequest?wfRequestId=${wfRequestId}L`,
                type: "POST",
                success: function (data, textStatus, jqXHR) {
                    sap.m.MessageToast.show("Workflow request approved successfully.");
                    this._getPendingListDetails(); // Refresh the list
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    let errorMessage = "Error approving workflow request: " + errorThrown;
        
                    // Attempt to parse the error message from the response (JSON or XML)
                    if (jqXHR.responseJSON && jqXHR.responseJSON.error && jqXHR.responseJSON.error.message && jqXHR.responseJSON.error.message.value) {
                        errorMessage = "Error approving workflow request: " + jqXHR.responseJSON.error.message.value;
                    } else if (jqXHR.responseXML) {
                        try {
                            const xmlDoc = jqXHR.responseXML;
                            const messageElement = xmlDoc.querySelector("message");
                            if (messageElement) {
                                errorMessage = "Error approving workflow request: " + messageElement.textContent;
                            }
                        } catch (xmlParseError) {
                            console.error("Error parsing XML response:", xmlParseError);
                        
                        }
                    } else if (jqXHR.responseText) {
                        errorMessage = "Error approving workflow request: " + jqXHR.responseText;
                    }
        
                    sap.m.MessageBox.error(errorMessage, {
                        title: "Error",
                        details: jqXHR.responseText 
                    });
                    console.error("Error approving workflow request:", textStatus, errorThrown, jqXHR);
                }.bind(this)
            });
        },

        onRejectWfRequest: function () {
            if (!this._selectedItemContext) {
                MessageBox.error("Please select an item from the list.");
                return;
            }

            let wfRequestId = this._selectedItemContext.getProperty("wfRequestNav/results/0/wfRequestId");

            if (!wfRequestId) {
                MessageBox.error("WF Request ID is missing.");
                return;
            }

            this._showRejectDialog(wfRequestId);
        },

        _showRejectDialog: function (wfRequestId) {
            let that = this;
            Fragment.load({
                name: "com.taqa.psnform.taqapsnform.view.Reject",
                controller: this,
                id: "rejectFragment" // Give the fragment an ID, if needed.
            }).then(function (oDialog) {
                that._oRejectDialog = oDialog;
                that.getView().addDependent(that._oRejectDialog);
                that._oRejectDialog.open();
                that._wfRequestIdForRejection = wfRequestId; // Store wfRequestId
            });
        },

        onRejectRequest: function () {
            let oReasonTextArea = Fragment.byId("rejectFragment", "idRejectReason"); // Use fragment ID
            console.log("TextArea Element:", oReasonTextArea);

            if (oReasonTextArea) {
                let sReason = oReasonTextArea.getValue();
                if (sReason) {
                    MessageToast.show("Request rejected with reason: " + sReason);
                    this._rejectWfRequestWithComment(this._wfRequestIdForRejection, sReason); // Use stored wfRequestId
                    this.onCloseRejectDialog();
                } else {
                    MessageToast.show("Please enter a rejection reason.");
                }
            } else {
                console.error("TextArea with ID 'idRejectReason' not found.");
                MessageToast.show("Error: Rejection reason input not found.");
            }
        },

        onCloseRejectDialog: function () {
            if (this._oRejectDialog) {
                this._oRejectDialog.close();
                this._oRejectDialog.destroy();
                this._oRejectDialog = null;
                this._wfRequestIdForRejection = null; // Clear wfRequestId
            }
        },

        _rejectWfRequestWithComment: function (wfRequestId, comment) {
            let oReasonTextArea = Fragment.byId("rejectFragment", "idRejectReason");
            console.log("TextArea Element:", oReasonTextArea);
        
            if (oReasonTextArea) {
                let sReason = oReasonTextArea.getValue();
                if (sReason) {
                    sap.m.MessageToast.show("Request rejected with reason: " + sReason);
        
                    if (!this._selectedItemContext) {
                        sap.m.MessageBox.error("Please select an item from the list.");
                        return;
                    }
        
                    let wfRequestId = this._selectedItemContext.getProperty("wfRequestNav/results/0/wfRequestId");
        
                    if (!wfRequestId) {
                        sap.m.MessageBox.error("WF Request ID is missing.");
                        return;
                    }
        
                    sap.ui.core.BusyIndicator.show();
        
                    let url = sReason ?
                        `/odata/v2/commentWfRequest?wfRequestId=${wfRequestId}L&comment='${encodeURIComponent(sReason)}'` :
                        `/odata/v2/rejectWfRequest?wfRequestId=${wfRequestId}L`;
        
                    console.log("URL:", url);
        
                    $.ajax({
                        url: url,
                        type: "POST",
                        success: function (data, textStatus, jqXHR) {
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageToast.show("Workflow request rejected successfully.");
                            this._getPendingListDetails();
                            this.onCloseRejectDialog();
                        }.bind(this),
                        error: function (jqXHR, textStatus, errorThrown) {
                            sap.ui.core.BusyIndicator.hide();
                            let errorMessage = "Error rejecting workflow request: " + errorThrown;
        
                            // Parse error response (JSON or XML)
                            if (jqXHR.responseJSON && jqXHR.responseJSON.error && jqXHR.responseJSON.error.message && jqXHR.responseJSON.error.message.value) {
                                errorMessage = "Error rejecting workflow request: " + jqXHR.responseJSON.error.message.value;
                            } else if (jqXHR.responseXML) {
                                try {
                                    const xmlDoc = jqXHR.responseXML;
                                    const messageElement = xmlDoc.querySelector("message");
                                    if (messageElement) {
                                        errorMessage = "Error rejecting workflow request: " + messageElement.textContent;
                                    }
                                } catch (xmlParseError) {
                                    console.error("Error parsing XML response:", xmlParseError);
                                }
                            } else if (jqXHR.responseText) {
                                errorMessage = "Error rejecting workflow request: " + jqXHR.responseText;
                            }
        
                            sap.m.MessageBox.error(errorMessage, {
                                title: "Error",
                                details: jqXHR.responseText
                            });
                            console.error("Error rejecting workflow request:", textStatus, errorThrown, jqXHR);
                            this.onCloseRejectDialog();
                        }.bind(this)
                    });
                } else {
                    sap.m.MessageToast.show("Please enter a rejection reason.");
                }
            } else {
                console.error("TextArea with ID 'idRejectReason' not found.");
                sap.m.MessageToast.show("Error: Rejection reason input not found.");
            }
        },
        
        onSendbackWfRequest: function () {
            if (!this._selectedItemContext) {
                sap.m.MessageBox.error("Please select an item from the list.");
                return;
            }
        
            let wfRequestId = this._selectedItemContext.getProperty("wfRequestNav/results/0/wfRequestId");
        
            if (!wfRequestId) {
                sap.m.MessageBox.error("WF Request ID is missing.");
                return;
            }
        
            $.ajax({
                url: this.getPath() + `/odata/v2/sendbackWfRequest?wfRequestId=${wfRequestId}L`,
                type: "POST",
                success: function (data, textStatus, jqXHR) {
                    sap.m.MessageToast.show("Workflow request sent back successfully.");
                    this._getPendingListDetails();
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    let errorMessage = "Error sending back workflow request: " + errorThrown;
        
                    // Parse error response (JSON or XML)
                    if (jqXHR.responseJSON && jqXHR.responseJSON.error && jqXHR.responseJSON.error.message && jqXHR.responseJSON.error.message.value) {
                        errorMessage = "Error sending back workflow request: " + jqXHR.responseJSON.error.message.value;
                    } else if (jqXHR.responseXML) {
                        try {
                            const xmlDoc = jqXHR.responseXML;
                            const messageElement = xmlDoc.querySelector("message");
                            if (messageElement) {
                                errorMessage = "Error sending back workflow request: " + messageElement.textContent;
                            }
                        } catch (xmlParseError) {
                            console.error("Error parsing XML response:", xmlParseError);
                        }
                    } else if (jqXHR.responseText) {
                        errorMessage = "Error sending back workflow request: " + jqXHR.responseText;
                    }
        
                    sap.m.MessageBox.error(errorMessage, {
                        title: "Error",
                        details: jqXHR.responseText
                    });
                    console.error("Error sending back workflow request:", textStatus, errorThrown, jqXHR);
                }.bind(this)
            });
        },
        
        onWithdrawWfRequest: function () {
            if (!this._selectedItemContext) {
                sap.m.MessageBox.error("Please select an item from the list.");
                return;
            }
        
            let wfRequestId = this._selectedItemContext.getProperty("wfRequestNav/results/0/wfRequestId");
        
            if (!wfRequestId) {
                sap.m.MessageBox.error("WF Request ID is missing.");
                return;
            }
        
            $.ajax({
                url: this.getPath() + `/odata/v2/withdrawWfRequest?wfRequestId=${wfRequestId}L`,
                type: "POST",
                success: function (data, textStatus, jqXHR) {
                    sap.m.MessageToast.show("Workflow request withdrawn successfully.");
                    this._getPendingListDetails();
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    let errorMessage = "Error withdrawing workflow request: " + errorThrown;
        
                    // Parse error response (JSON or XML)
                    if (jqXHR.responseJSON && jqXHR.responseJSON.error && jqXHR.responseJSON.error.message && jqXHR.responseJSON.error.message.value) {
                        errorMessage = "Error withdrawing workflow request: " + jqXHR.responseJSON.error.message.value;
                    } else if (jqXHR.responseXML) {
                        try {
                            const xmlDoc = jqXHR.responseXML;
                            const messageElement = xmlDoc.querySelector("message");
                            if (messageElement) {
                                errorMessage = "Error withdrawing workflow request: " + messageElement.textContent;
                            }
                        } catch (xmlParseError) {
                            console.error("Error parsing XML response:", xmlParseError);
                        }
                    } else if (jqXHR.responseText) {
                        errorMessage = "Error withdrawing workflow request: " + jqXHR.responseText;
                    }
        
                    sap.m.MessageBox.error(errorMessage, {
                        title: "Error",
                        details: jqXHR.responseText
                    });
                    console.error("Error withdrawing workflow request:", textStatus, errorThrown, jqXHR);
                }.bind(this)
            });
        },


        // onSubmit: function () {
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


        convertToODataDate: function (dateString) {
            if (!dateString) return "/Date(" + Date.now() + ")/";

            try {
                var oDate = new Date(dateString);
                return "/Date(" + oDate.getTime() + ")/";
            } catch (error) {
                console.error("Date conversion error:", error);
                return "/Date(" + Date.now() + ")/";
            }
        },

        onNewButtonPress: function () {


            if (!this._oNewRequestDialog) {
                var oView = this.getView();

                Fragment.load({
                    id: oView.getId(), 
                    name: "com.taqa.psnform.taqapsnform.view.New",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oNewRequestDialog = oDialog;
                    this._oNewRequestDialog.open();
                }.bind(this));
            } else {
                // If already created, just open it
                this._oNewRequestDialog.open();
            }
        },

        onCloseNewDialog: function () {
            if (this._oNewRequestDialog) {
                this._oNewRequestDialog.close();
            }


        }


    });
});