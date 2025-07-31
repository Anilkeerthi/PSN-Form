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
    "sap/m/MessageToast"
], (Controller, JSONModel, fioriLibrary, HorizontalLayout, VerticalLayout, Fragment, Filter, FilterOperator, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("com.taqa.psnform.taqapsnform.controller.NewForm", {
        onInit() {
            // sap.ui.core.BusyIndicator.show(0);

           

            //this.byId("idRequestTypeNew").setSelectedKey("");
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
            // var oUserModel = this.getOwnerComponent().getModel("UserInfo");


            // Create a model for the required actions dropdown (renamed from eventReasons)
            this.oEventReasonsModel = new JSONModel({
                eventReasons: []
            });
            this.getView().setModel(this.oEventReasonsModel, "eventReasonsModel");

            this.oFlexibleColumnLayout.attachStateChange(this.onLayoutChange, this);

            this._getEventReasons();
            this._getPendingListDetails();

            // Create promises for all data loading operations
            // const loadPromises = [
            //     new Promise(resolve => {
            //         this._loadTypeofChangePicklist();
            //         resolve();
            //     }),
            //     new Promise(resolve => {
            //         this._getPendingListDetails();
            //         resolve();
            //     })
            // ];

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

            // const delayPromise = new Promise(resolve => {
            //     setTimeout(resolve, 2000); 
            // });

            // Promise.all([...loadPromises, delayPromise])
            //     .then(() => {
            //         sap.ui.core.BusyIndicator.hide();
            //     })
            //     .catch(error => {
            //         console.error("Error during initialization:", error);
            //         sap.ui.core.BusyIndicator.hide();
            //     });

        },

        _onRouteMatched: function (oEvent) {

            var sAction = oEvent.getParameter("arguments").action;

            if (sAction === "openFragment") {
                this.onOpenRequestDialog();
            }
        },

        onNavBackHome: function () {
            sap.ui.core.BusyIndicator.show(0);
            var route = this.getOwnerComponent().getRouter();
            route.navTo("RoutePSNForm");

            setTimeout(function () {
                window.location.reload();
            }, 100);
        },

        getLabelByLocale: function (picklistLabels) {
            console.log("Picklist Labels:", picklistLabels); // Log the received picklistLabels
            if (Array.isArray(picklistLabels)) {
                const labelObject = picklistLabels.find(label => label.locale === 'en_US');
                console.log("Found Label Object:", labelObject); // Log the found label object
                return labelObject ? labelObject.label : ""; // Return the label or an empty string if not found
            }
            return ""; // Return empty string if not an array
        },

        onNewSearchIconPress: function () {
            var oSearchField = this.getView().byId("idNewSearchField");
            var bSearchFieldVisible = oSearchField.getVisible();

            oSearchField.setVisible(!bSearchFieldVisible);

            if (!bSearchFieldVisible) {
                oSearchField.focus();
            }
        },

        onNewSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oList = this.byId("idSelectedEmployeeList");

            var oBinding = oList.getBinding("items");

            if (sQuery && sQuery.length > 0) {
                var oFilter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("displayName", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("empId", sap.ui.model.FilterOperator.Contains, sQuery)
                ], false);

                oBinding.filter(oFilter);
            } else {
                oBinding.filter([]);
            }
        },

        onNewSortIconPress: function () {
            var oList = this.getView().byId("idSelectedEmployeeList");
            var oBinding = oList.getBinding("items");
            var bSortAscending = this._bSortAscending; // Get the current sort order

            var oSorter = new sap.ui.model.Sorter("displayName", !bSortAscending); // Sort by displayName, you can change to any property

            oBinding.sort(oSorter);

            this._bSortAscending = !bSortAscending; // Toggle sort order
        },


        onNewListItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oCtx = oItem.getBindingContext("selectedEmployeeModel");
            var oModel = this.getView().getModel("selectedEmployeeModel");
            var sPath = oCtx.getPath();
            var oSelectedRowData = oModel.getProperty(sPath);

            sap.ui.core.BusyIndicator.show(0);

            try {
                var userId = oSelectedRowData.userId;
                var busyPromise = new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 100);
                });
                busyPromise.then(function () {
                    var userId = oSelectedRowData.userId;
                    console.log(userId, typeof userId);

                    this._getDetails(userId);
                    this._getEducationDetails(userId);
                    this._getLastExpDetails(userId);
                    this._getSalaryAdjustDetails(userId);
                    this._getApprovalDetails(userId);

                    if (!this.oSelectedRowModel) {
                        this.oSelectedRowModel = new sap.ui.model.json.JSONModel();
                        this.getView().setModel(this.oSelectedRowModel, "selectedItemDetails");
                    }
                    this.oSelectedRowModel.setData({
                        selectedRow: oSelectedRowData
                    });

                    console.log("Entire Model Data:", this.oSelectedRowModel.getData());

                    this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);

                    this.oViewModel.setProperty("/showSearchSort", true);
                    this.oViewModel.setProperty("/showRaiseRequest", false);

                    var oMidColumnPage = this.byId("ObjectPageLayoutNew");
                    oMidColumnPage.bindElement({
                        path: sPath,
                        model: "selectedEmployeeModel"
                    });
                }.bind(this)).catch(function (error) {
                    console.error("Error during processing: ", error);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this));

                this._getDetails(userId);
            } catch (error) {
                console.error("Error during processing: ", error);
                sap.ui.core.BusyIndicator.hide();
            }

            this._selectedItemContext = oCtx;
        },


        getPath: function (destinationType) {
            let appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            let appPath = appId.replaceAll(".", "/");
            let appModulePath = jQuery.sap.getModulePath(appPath);

            if (destinationType === "SF_1") {
                return appModulePath + "/odata/v2/basic";
            } else if (destinationType === "SF_2") {
                return appModulePath + "/odata/v2/sf2";
            } else if (destinationType === "SF_OAUTH") {
                return appModulePath + "/odata/v2/oauth";
            }

            return appModulePath;
        },

        _getPendingListDetails: function (userId) {
            var sServiceUrl = this.getPath("SF_1") + "/cust_PositionStatusChange?recordStatus=pending&$format=JSON&$select=externalCode,effectiveStartDate,cust_TypeOfChange,cust_Justification,mdfSystemRecordStatus";

            var that = this;
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {

                    let ListDataModel = that.getView().getModel("ListData");
                    ListDataModel.setData({ cust_PositionStatusChange: data.d.results });

                    console.log("Fetched Data: ", ListDataModel.getData());
                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });
        },



        _getDetails: function (userId) {
            var that = this;
            //let sServiceUrl = this.getPath("SF_1") + "/User(" + userId + ")?$select=firstName,lastName,nationality,empId,userId,username,displayName,hireDate,defaultFullName,married,empInfo/jobInfoNav/employeeTypeNav/picklistLabels/optionId,empInfo/jobInfoNav/employeeTypeNav/picklistLabels/label,empInfo/jobInfoNav/employeeTypeNav/picklistLabels/locale&$format=JSON&$expand=empInfo/jobInfoNav/employeeTypeNav/picklistLabels"

            let sServiceUrl = this.getPath("SF_1") + "/PerPerson(" + userId + ")?$format=JSON&$expand=personalInfoNav,employmentNav/jobInfoNav/employmentTypeNav/picklistLabels,personalInfoNav/maritalStatusNav/picklistLabels&$select=placeOfBirth,personalInfoNav/displayName,personIdExternal,employmentNav/startDate,personalInfoNav/nationality,employmentNav/jobInfoNav/position,employmentNav/jobInfoNav/company,employmentNav/jobInfoNav/countryOfCompany,employmentNav/jobInfoNav/employmentTypeNav/picklistLabels/optionId,employmentNav/jobInfoNav/employmentTypeNav/picklistLabels/locale,employmentNav/jobInfoNav/employmentTypeNav/picklistLabels/label,personalInfoNav/maritalStatusNav/picklistLabels/optionId,personalInfoNav/maritalStatusNav/picklistLabels/locale,personalInfoNav/maritalStatusNav/picklistLabels/label";


            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let employeeDataModel = new JSONModel(data.d);
                    that.getView().setModel(employeeDataModel, "empData")
                    console.log("New Data ",employeeDataModel)
                    let nationalityCode = data.d.personalInfoNav.results[0].nationality;
                    that._getCountryName(nationalityCode);

                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });

        },

        _getCountryName: function (nationalityCode) {

            let that = this;
            
            //nationalityCode = "IND";
            let sServiceUrl = this.getPath("SF_1") + "/Country()?$select=externalName_en_US&$format=JSON&$filter=code eq '" + nationalityCode + "'";


            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let countryDetailsModel = new JSONModel(data.d.results[0]);
                    that.getView().setModel(countryDetailsModel, "countryDetailsModel")
                    console.log("GetCountry Name Data : ",countryDetailsModel);
                },
                error: function () {
                    MessageToast.show("Server Send Error");
                }
            });

        },


        _getEducationDetails: function (userId) {
            // userId = "31120";
            var that = this;
            let sServiceUrl = this.getPath("SF_1") + "/Background_Education?$format=json&$select=userId,majorNav/picklistLabels/label,majorNav/picklistLabels/locale,majorNav/picklistLabels/optionId,sub_majorNav/picklistLabels/label,sub_majorNav/picklistLabels/locale,sub_majorNav/picklistLabels/optionId,degreeNav/picklistLabels/label,degreeNav/picklistLabels/locale,degreeNav/picklistLabels/optionId,schoolNav/picklistLabels/label,schoolNav/picklistLabels/locale,schoolNav/picklistLabels/optionId&$expand=majorNav/picklistLabels,degreeNav/picklistLabels,sub_majorNav/picklistLabels,schoolNav/picklistLabels&$filter=userId eq '" + userId + "'";


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
            let sServiceUrl = this.getPath("SF_1") + "/cust_PositionStatusChange?$expand=wfRequestNav,wfRequestNav/workflowAllowedActionListNav,wfRequestNav/wfRequestStepNav,wfRequestNav/empWfRequestNav/wfConfigNav/wfStepApproverNav/approverPositionNav,wfRequestNav/wfRequestParticipatorNav&recordStatus=pending&$filter = cust_Emp_ID eq 'userId'&$format=json";

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
            let sServiceUrl = this.getPath("SF_1") + "/Background_OutsideWorkExperience?$format=json&$select=startTitle,endDate,startDate,employer,yearsofexperience&$top=1&$filter=userId eq '" + userId + "'";


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
            let sServiceUrl = this.getPath("SF_1") + "/FormHeader?$format=json&$select=dateAssigned,formLastContent/pmReviewContentDetail/summarySection/calculatedFormRating/rating,&$expand=formLastContent/pmReviewContentDetail/summarySection/calculatedFormRating&$filter=formSubjectId eq '" + userId + "' and formDataStatus eq 3";


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

        _getEventReasons: function () {
            let that = this;
            let sServiceUrl = this.getPath("SF_1") + `/FOEventReason?$select=event,externalCode,name&$format=json&$filter=externalCode like '%PSN%'`;

            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let oEventReasonsModel = new JSONModel(data.d.results);
                    that.getView().setModel(oEventReasonsModel, "eventReasonsModel");
                },
                error: function () {
                    sap.m.MessageToast.show("Failed to fetch event reasons.");
                }
            });
        },

        onEventReasonChange: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (!oSelectedItem) return;

            var oContext = oSelectedItem.getBindingContext("eventReasonsModel");
            var sCode = oContext.getProperty("externalCode"); // Example: PSN_PromotionBudgeted

            var oFileUploader = this.byId("idFileUploaderNew");
            var bIsMandatory = false;

            if (
                sCode.includes("PromotionBudgeted") ||
                sCode.includes("PromotionUnBudgeted") ||
                sCode.includes("DemotionBudgeted") ||
                sCode.includes("DemotionUnBudgeted")
            ) {
                bIsMandatory = true;
            }

            if (bIsMandatory) {
                oFileUploader.setValueState("Error");
                oFileUploader.setValueStateText("Attachment is required for this action.");
                oFileUploader.data("mandatory", true);
            } else {
                oFileUploader.setValueState("None");
                oFileUploader.setValueStateText("");
                oFileUploader.data("mandatory", false);
            }
        },



        formatRecordStatusState: function (value) {
            if (value === "P") {
                return sap.ui.core.ValueState.Error;
            } else if (value === "C") {
                return sap.ui.core.ValueState.Success;
            }
            return sap.ui.core.ValueState.None;
        },

        formatExternalCodeWithName: function (externalCode, name) {
            return name + "  -  " + externalCode;
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


        // formatTenureDate: function (value) {
        //     if (value) {
        //         var timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
        //         var hireDate = new Date(timestamp);
        //         var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd" });
        //         var formattedHireDate = oDateFormat.format(hireDate);

        //         var currentDate = new Date();

        //         var timeDiff = currentDate - hireDate;

        //         var diffInYears = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
        //         return diffInYears + " years";
        //     }
        //     return value;
        // },

        formatTenureDate: function (value) {
            if (value) {
                let timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                let hireDate = new Date(timestamp);
                let currentDate = new Date();

                let timeDiff = currentDate - hireDate;

                // Calculate years and remaining months
                let diffInYears = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
                let remainingMs = timeDiff % (1000 * 60 * 60 * 24 * 365.25);
                let diffInMonths = Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month

                // Format the result
                let result = [];
                if (diffInYears > 0) {
                    result.push(`${diffInYears} year${diffInYears !== 1 ? 's' : ''}`);
                }
                if (diffInMonths > 0) {
                    result.push(`${diffInMonths} month${diffInMonths !== 1 ? 's' : ''}`);
                }

                if (result.length === 0) {
                    return "Less than 1 month";
                } else if (result.length === 1) {
                    return result[0];
                } else {
                    return result.join(' and ');
                }
            }
            return value;
        },

        calculateTenure: function (startDate, endDate) {
            if (!startDate || !endDate) return " ";

            // Parse dates
            let startMs = parseInt(startDate.replace("/Date(", "").replace(")/", ""), 10);
            let endMs = parseInt(endDate.replace("/Date(", "").replace(")/", ""), 10);

            let diffMs = endMs - startMs;

            // Constants
            const msPerDay = 1000 * 60 * 60 * 24;
            const msPerMonth = msPerDay * 30.44;
            const msPerYear = msPerDay * 365.25;

            // Calculate
            let years = Math.floor(diffMs / msPerYear);
            let remainingMs = diffMs % msPerYear;

            let months = Math.floor(remainingMs / msPerMonth);
            remainingMs = remainingMs % msPerMonth;

            let days = Math.floor(remainingMs / msPerDay);

            // Format based on what's available
            let parts = [];
            if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
            if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
            //if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

            return parts.length > 0 ? parts.join(' and ') : "Less than 1 day";
        },


        getSelectedRowData: function () {
            return this.oSelectedRowModel.getProperty("/selectedRow");
        },

        formatYear: function (value) {
            if (value) {
                let timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                let hireDate = new Date(timestamp);
                return hireDate.getFullYear();
            }
            return value;
        },

        createRatingRow: function (sId, oContext) {
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
                console.log("Search:", sQuery);
            }
        },



        onOpenRequestDialog: function () {
            var oView = this.getView();
            if (!this._oRequestDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.taqa.psnform.taqapsnform.view.NewRequest",
                    controller: this
                }).then(function (oDialog) {
                    this._oRequestDialog = oDialog;
                    oView.addDependent(this._oRequestDialog);

                    this.oEmployeeSearchModel.setData({
                        employees: []
                    });

                    this._oRequestDialog.open();
                }.bind(this));
            } else {
                this._oRequestDialog.open();
            }
        },

        // onNewEmployeeSearch: function (oEvent) {
        //     var sValue = "";

        //     if (oEvent.getParameter("suggestValue") !== undefined) {
        //         sValue = oEvent.getParameter("suggestValue");
        //         console.log("Suggest value:", sValue);
        //     } else if (oEvent.getParameter("query") !== undefined) {
        //         sValue = oEvent.getParameter("query");
        //         console.log("Query value:", sValue);
        //     }

        //     this._searchTerm = sValue;

        //     if (sValue && sValue.length >= 2) {
        //         this._searchNewEmployees(sValue);
        //     } else {
        //         this.oEmployeeSearchModel.setProperty("/employees", []);
        //     }
        // },


        onNewEmployeeSearch: function (oEvent) {
            var sValue = "";

            if (oEvent.getParameter("suggestValue") !== undefined) {
                sValue = oEvent.getParameter("suggestValue");
            } else if (oEvent.getParameter("query") !== undefined) {
                sValue = oEvent.getParameter("query");
            }

            this._searchTerm = sValue;

            if (sValue && sValue.length >= 2) {
                var oUserModel = this.getOwnerComponent().getModel("UserInfo");
                var managerUsername = oUserModel ? oUserModel.getProperty("/managerUsername") : "";

                this._searchNewEmployees(sValue, managerUsername);
            } else {
                this.oEmployeeSearchModel.setProperty("/employees", []);
            }
        },


        // _searchNewEmployees: function (sSearchTerm) {
        //     console.log("Searching for employees with term:", sSearchTerm);

        //     var oModel = this.getOwnerComponent().getModel();

        //     if (!oModel) {
        //         console.error("OData model not found");
        //         return;
        //     }
        //     var sSearchLower = sSearchTerm.toLowerCase();
        //     var sFilter = "tolower(username) like '%" + sSearchLower + "%' or " +
        //         "tolower(firstName) like '%" + sSearchLower + "%' or " +
        //         "tolower(lastName) like '%" + sSearchLower + "%' or " +
        //         "tolower(userId) like '%" + sSearchLower + "%'";

        //     oModel.read("/User", {
        //         urlParameters: {
        //             "$top": "10",
        //             "$filter": sFilter,
        //         },
        //         success: function (data) {
        //             console.log("Search results:", data);
        //             if (data && data.results) {

        //                 var aEmployees = data.results.map(function (emp) {

        //                     return {
        //                         userId: emp.userId || "",
        //                         firstName: emp.firstName || "",
        //                         lastName: emp.lastName || "",
        //                         username: emp.username || "",
        //                         hireDate: emp.hireDate || "",
        //                         employeeType: emp.empInfo.label || "N/A",
        //                         displayName: (emp.firstName || "") + " " + (emp.lastName || "")
        //                     };
        //                 });
        //                 this.oEmployeeSearchModel.setProperty("/employees", aEmployees);
        //                 console.log("Updated employee suggestions:", aEmployees);
        //             }
        //         }.bind(this),
        //         error: function (oError) {
        //             console.error("Error fetching employee data:", oError);
        //             this.oEmployeeSearchModel.setProperty("/employees", []);
        //         }.bind(this)
        //     });
        // },


        // main search function

        // _searchNewEmployees: function (sSearchTerm) {
        //     console.log("Searching for employees with term:", sSearchTerm);

        //     var sSearchLower = sSearchTerm.toLowerCase();
        //     var sFilter = "tolower(username) like '%" + sSearchLower + "%' or " +
        //         "tolower(firstName) like '%" + sSearchLower + "%' or " +
        //         "tolower(lastName) like '%" + sSearchLower + "%' or " +
        //         "tolower(userId) like '%" + sSearchLower + "%'";

        //     // Get the base path using the updated getPath function - use the destination you need
        //     var sPath = this.getPath("SF_1"); // or this.getPath("SF_1") depending on which one you need

        //     // Construct the full URL with query parameters
        //     var sUrl = sPath + "/User";

        //     // Make the AJAX call
        //     jQuery.ajax({
        //         url: sUrl,
        //         method: "GET",
        //         headers: {
        //             "Accept": "application/json"
        //         },
        //         data: {
        //             "$top": "10",
        //             "$filter": sFilter
        //         },
        //         success: function (data) {
        //             console.log("Search results:", data);
        //             // if (data && data.results)
        //             if (data && data.d && data.d.results) {
        //                 var aEmployees = data.d.results.map(function (emp) {
        //                     return {
        //                         userId: emp.userId || "",
        //                         firstName: emp.firstName || "",
        //                         lastName: emp.lastName || "",
        //                         username: emp.username || "",
        //                         hireDate: emp.hireDate || "",
        //                         employeeType: emp.empInfo && emp.empInfo.label ? emp.empInfo.label : "N/A",
        //                         displayName: (emp.firstName || "") + " " + (emp.lastName || "")
        //                     };
        //                 });
        //                 this.oEmployeeSearchModel.setProperty("/employees", aEmployees);
        //                 console.log("Updated employee suggestions:", aEmployees);
        //             }
        //         }.bind(this),
        //         error: function (jqXHR, textStatus, errorThrown) {
        //             console.error("Error fetching employee data:", textStatus, errorThrown);
        //             this.oEmployeeSearchModel.setProperty("/employees", []);
        //         }.bind(this)
        //     });
        // },


        // updated according to username 

        // _searchNewEmployees: function(sSearchTerm) {
        //     var sSearchLower = sSearchTerm.toLowerCase();
        //     var sPath = this.getPath("SF_1");

        //     // Get username from global model
        //     var oGlobalModel = sap.ui.getCore().getModel("globalData");
        //     var managerUsername = oGlobalModel.getProperty("/managerUsername");

        //     var sFilter = "manager/username eq '" + managerUsername + "' and status eq 't' and (" +
        //         "tolower(username) like '%" + sSearchLower + "%' or " +
        //         "tolower(firstName) like '%" + sSearchLower + "%' or " +
        //         "tolower(lastName) like '%" + sSearchLower + "%' or " +
        //         "tolower(userId) like '%" + sSearchLower + "%')";

        //     jQuery.ajax({
        //         url: sPath + "/User",
        //         method: "GET",
        //         headers: {
        //             "Accept": "application/json"
        //         },
        //         data: {
        //             "$top": "10",
        //             "$format": "JSON",
        //             "$select": "username,empId,firstName,lastName,displayName,manager/userId,manager/username",
        //             "$expand": "manager",
        //             "$filter": sFilter
        //         },
        //         success: function (data) {
        //             if (data && data.d && data.d.results) {
        //                 var aEmployees = data.d.results.map(function (emp) {
        //                     return {
        //                         userId: emp.userId || "",
        //                         firstName: emp.firstName || "",
        //                         lastName: emp.lastName || "",
        //                         username: emp.username || "",
        //                         displayName: emp.displayName || "",
        //                         manager: emp.manager || {}
        //                     };
        //                 });
        //                 this.oEmployeeSearchModel.setProperty("/employees", aEmployees);
        //             }
        //         }.bind(this),
        //         error: function (jqXHR, textStatus, errorThrown) {
        //             console.error("Error fetching employee data:", textStatus, errorThrown);
        //             this.oEmployeeSearchModel.setProperty("/employees", []);
        //         }.bind(this)
        //     });
        // },

        _searchNewEmployees: function (sSearchTerm) {
            var sSearchLower = sSearchTerm.toLowerCase();
            var sPath = this.getPath("SF_1");

            var oUserModel = this.getOwnerComponent().getModel("UserInfo");
            var managerUsername = oUserModel ? oUserModel.getProperty("/managerUsername") : "";

            var sFilter = "manager/username eq '" + managerUsername + "' and status eq 't' and (" +
                "tolower(username) like '%" + sSearchLower + "%' or " +
                "tolower(firstName) like '%" + sSearchLower + "%' or " +
                "tolower(lastName) like '%" + sSearchLower + "%' or " +
                "tolower(userId) like '%" + sSearchLower + "%')";

            jQuery.ajax({
                url: sPath + "/User",
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                data: {
                    "$top": "10",
                    "$format": "JSON",
                    "$select": "username,empId,firstName,lastName,displayName,manager/userId,manager/username",
                    "$expand": "manager",
                    "$filter": sFilter
                },
                success: function (data) {
                    if (data && data.d && data.d.results) {
                        var aEmployees = data.d.results.map(function (emp) {
                            return {
                                userId: emp.empId || "",
                                firstName: emp.firstName || "",
                                lastName: emp.lastName || "",
                                username: emp.username || "",
                                displayName: emp.displayName || "",
                                manager: emp.manager || {}
                            };
                        });
                        this.oEmployeeSearchModel.setProperty("/employees", aEmployees);
                    }
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error fetching employee data:", textStatus, errorThrown);
                    this.oEmployeeSearchModel.setProperty("/employees", []);
                }.bind(this)
            });
        },


        onNewSuggestionItemSelected: function (oEvent) {

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

        // _loadTypeofChangePicklist: function () {
        //     var oModel = this.getOwnerComponent().getModel();

        //     if (!oModel) {
        //         console.error("OData model not found");
        //         return;
        //     }

        //     var sPath = "/Picklist('TypeofChange')/picklistOptions";

        //     oModel.read(sPath, {
        //         urlParameters: {
        //             "$expand": "picklistLabels",
        //             "$select": "externalCode,id,picklistLabels/id,picklistLabels/optionId,picklistLabels/label,picklistLabels/locale",
        //             "$filter": "picklistLabels/locale eq 'en_US'"
        //         },
        //         success: function (oData) {
        //             console.log("Full OData Response:", oData);

        //             if (oData && oData.results) {
        //                 var aEventReasons = oData.results.map(function (item) {
        //                     var oLabel = item.picklistLabels.results.find(function (label) {
        //                         return label.locale === "en_US";
        //                     });

        //                     return {
        //                         externalCode: item.externalCode,
        //                         name: oLabel ? oLabel.label : item.externalCode
        //                     };
        //                 });
        //                 aEventReasons.sort((a, b) => a.name.localeCompare(b.name));

        //                 this.oEventReasonsModel.setProperty("/eventReasons", aEventReasons);
        //                 console.log("Loaded required actions:", aEventReasons);
        //             } else {
        //                 console.warn("No results found in picklist options");
        //             }
        //         }.bind(this),
        //         error: function (oError) {
        //             console.error("Error fetching required actions:", oError);

        //             if (oError.responseText) {
        //                 try {
        //                     var errorDetails = JSON.parse(oError.responseText);
        //                     console.error("Detailed Error:", errorDetails);
        //                 } catch (e) {
        //                     console.error("Error parsing error response");
        //                 }
        //             }
        //         }.bind(this)
        //     });
        // },

        _loadTypeofChangePicklist: function () {
            // Get the base path using the updated getPath function
            var sPath = this.getPath("SF_1"); // or "SF_OAUTH" depending on your needs

            // Construct the full URL with query parameters
            var sUrl = sPath + "/Picklist('TypeofChange')/picklistOptions";

            // Make the AJAX call
            jQuery.ajax({
                url: sUrl,
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                data: {
                    "$expand": "picklistLabels",
                    "$select": "externalCode,id,picklistLabels/id,picklistLabels/optionId,picklistLabels/label,picklistLabels/locale",
                    "$filter": "picklistLabels/locale eq 'en_US'"
                },
                success: function (data) {
                    console.log("Full Ajax Response:", data);

                    if (data && data.d && data.d.results) {
                        var aEventReasons = data.d.results.map(function (item) {
                            // Check if picklistLabels exists and has results
                            if (item.picklistLabels && item.picklistLabels.results) {
                                var oLabel = item.picklistLabels.results.find(function (label) {
                                    return label.locale === "en_US";
                                });

                                return {
                                    externalCode: item.externalCode,
                                    name: oLabel ? oLabel.label : item.externalCode
                                };
                            } else {
                                return {
                                    externalCode: item.externalCode,
                                    name: item.externalCode
                                };
                            }
                        });

                        // Sort alphabetically by name
                        aEventReasons.sort(function (a, b) {
                            return a.name.localeCompare(b.name);
                        });

                        this.oEventReasonsModel.setProperty("/eventReasonsModel", aEventReasons);
                        console.log("Loaded required actions:", aEventReasons);
                    } else {
                        console.warn("No results found in picklist options");
                        this.oEventReasonsModel.setProperty("/eventReasonsModel", []);
                    }
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error fetching required actions:", textStatus, errorThrown);

                    if (jqXHR.responseText) {
                        try {
                            var errorDetails = JSON.parse(jqXHR.responseText);
                            console.error("Detailed Error:", errorDetails);
                        } catch (e) {
                            console.error("Error parsing error response");
                        }
                    }

                    this.oEventReasonsModel.setProperty("/eventReasonsModel", []);
                }.bind(this)
            });
        },


        onCloseDialog: function () {
            var oList = this.byId("idNewEmployeeList");
            if (oList) {
                oList.removeSelections(true);
            }

            var oSearchField = this.byId("idNewEmployeeSearch");
            if (oSearchField) {
                oSearchField.setValue("");
                oSearchField.setPlaceholder("Search Employee");
            }
            if (oList) {
                oList.setVisible(false);
            }
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

        //     var sExternalCode = oSelectedRowModel.getData().selectedRow.userId;
        //     console.log("External Code:", sExternalCode);

        //     var that = this;
        //     var oFile = oFileUploader && oFileUploader.oFileUpload && oFileUploader.oFileUpload.files[0];

        //     if (oFile) {
        //         var reader = new FileReader();
        //         reader.onload = function (event) {
        //             var sFileContent = event.target.result.split(',')[1];

        //             var oAttachmentPayload = {
        //                 "__metadata": { "uri": "Attachment" },
        //                 "fileName": oFile.name,
        //                 "module": "GENERIC_OBJECT",
        //                 "userId": sExternalCode,
        //                 "viewable": true,
        //                 "fileContent": sFileContent
        //             };

        //             var sAttachmentUrl = that.getPath("SF_2") + "/upsert";

        //             $.ajax({
        //                 url: sAttachmentUrl + "?$format=json", 
        //                 type: "POST",
        //                 contentType: "application/json",
        //                 data: JSON.stringify(oAttachmentPayload),
        //                 success: function (oAttachmentData) {
        //                     console.log("Attachment upload successful", oAttachmentData);
        //                     try {
        //                         let sKey = null;

        //                         // Check if response is an array
        //                         if (oAttachmentData && Array.isArray(oAttachmentData.d) && oAttachmentData.d.length > 0) {
        //                             sKey = oAttachmentData.d[0].key;
        //                         } 
        //                         // Check if response is a plain object
        //                         else if (oAttachmentData && oAttachmentData.d && typeof oAttachmentData.d === "object") {
        //                             sKey = oAttachmentData.d.key;
        //                         }

        //                         console.log("Extracted 'key' from response:", sKey);

        //                         if (sKey) {
        //                             const attachmentIdMatch = sKey.match(/Attachment\/attachmentId=(\d+)/);
        //                             if (attachmentIdMatch && attachmentIdMatch[1]) {
        //                                 const sAttachmentId = attachmentIdMatch[1];
        //                                 console.log("Extracted Attachment ID:", sAttachmentId);
        //                                 that.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification, sAttachmentId);
        //                             } else {
        //                                 console.error("Failed to extract attachmentId from the 'key' field.");
        //                                 sap.m.MessageBox.error("Failed to extract attachmentId from the 'key' field.", { title: "Error" });
        //                             }
        //                         } else {
        //                             console.error("The 'key' field is missing in the response.");
        //                             sap.m.MessageBox.error("Invalid response format. Missing 'key' field.", { title: "Error" });
        //                         }
        //                     } catch (error) {
        //                         console.error("Error processing JSON response:", error);
        //                         sap.m.MessageBox.error("Error processing server response.", { title: "Error" });
        //                     }
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
        //         that.submitPSNForm(sExternalCode, oEffectiveDate, sRequestType, sJustification, null);
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
        //             "__metadata": { "uri": "Attachment(" + sAttachmentId + "L)" }
        //         };
        //     }

        //     console.log("PSN Form Payload prepared:", JSON.stringify(oPayload));
        //     var sUrl = this.getPath("SF_2") + "/upsert?workflowConfirmed=true";

        //     $.ajax({
        //         url: sUrl,
        //         type: "POST",
        //         contentType: "application/json",
        //         data: JSON.stringify(oPayload),
        //         success: function (oData) {
        //             console.log("PSN Form Upsert successful", oData);
        //             sap.m.MessageBox.success("Workflow confirmed successfully!", { title: "Success" });
        //             this.onNavBackHome();
        //         },
        //         error: function (oError) {
        //             console.error("PSN Form Upsert failed", oError);
        //             var sErrorMessage = "Workflow confirmation failed.";
        //             if (oError.responseJSON?.error?.message) {
        //                 sErrorMessage = oError.responseJSON.error.message;
        //             }
        //             sap.m.MessageBox.error(sErrorMessage, { title: "Error" });
        //             this.onNavBackHome();
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

            var bIsMandatory = oFileUploader.data("mandatory");

            if (bIsMandatory && !oFileUploader.getValue()) {
                oFileUploader.setValueState("Error");
                oFileUploader.setValueStateText("Attachment is required.");
                MessageToast.show("Please upload the required document.");
                return;
            }

            oFileUploader.setValueState("None");

            var sRequestType = oRequestTypeSelect.getSelectedKey();
            var oEffectiveDate = oDatePicker.getDateValue();
            var localDate = new Date(oEffectiveDate.getTime() - (oEffectiveDate.getTimezoneOffset() * 60000));
            var sJustification = oCommentsTextArea.getValue();

            if (!sRequestType) {
                sap.m.MessageBox.error("Please select a Required Action");
                return;
            }

            if (!localDate) {
                sap.m.MessageBox.error("Please select an effective change date");
                return;
            }

            var sExternalCode = oSelectedRowModel.getData().selectedRow.userId;
            var sName = oSelectedRowModel.getData().selectedRow.displayName;

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
                        "userId": that.getOwnerComponent().getModel("appModel").getProperty("/currentUserId"),
                        "viewable": true,
                        "fileContent": sFileContent
                    };

                    var sAttachmentUrl = that.getPath("SF_OAUTH") + "/upsert";

                    $.ajax({
                        url: sAttachmentUrl + "?$format=json",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(oAttachmentPayload),
                        success: function (oAttachmentData) {
                            console.log("Attachment upload response:", oAttachmentData);

                            try {
                                let sAttachmentId = null;

                                // Check for errors in the attachment upload response
                                if (oAttachmentData && oAttachmentData.d && Array.isArray(oAttachmentData.d) && oAttachmentData.d[0].status === 'ERROR') {
                                    console.error("Attachment upload failed on the server:", oAttachmentData.d[0].message);
                                    sap.m.MessageBox.error("Attachment upload failed: " + oAttachmentData.d[0].message, { title: "Error" });
                                    return; // Stop further processing if attachment upload failed
                                }

                                // Attempt to extract the attachment ID
                                if (oAttachmentData && oAttachmentData.d) {
                                    if (Array.isArray(oAttachmentData.d) && oAttachmentData.d.length > 0 && oAttachmentData.d[0].key) {
                                        const attachmentIdMatch = oAttachmentData.d[0].key.match(/Attachment\/attachmentId=(\d+)/);
                                        if (attachmentIdMatch && attachmentIdMatch[1]) {
                                            sAttachmentId = attachmentIdMatch[1];
                                        } else {
                                            console.warn("Could not extract attachmentId from key:", oAttachmentData.d[0].key);
                                        }
                                    } else if (oAttachmentData.d.key) {
                                        const attachmentIdMatch = oAttachmentData.d.key.match(/Attachment\/attachmentId=(\d+)/);
                                        if (attachmentIdMatch && attachmentIdMatch[1]) {
                                            sAttachmentId = attachmentIdMatch[1];
                                        } else {
                                            console.warn("Could not extract attachmentId from key:", oAttachmentData.d.key);
                                        }
                                    } else if (Array.isArray(oAttachmentData.d) && oAttachmentData.d.length > 0 && oAttachmentData.d[0].attachmentId) {
                                        sAttachmentId = oAttachmentData.d[0].attachmentId;
                                    } else if (oAttachmentData.d.attachmentId) {
                                        sAttachmentId = oAttachmentData.d.attachmentId;
                                    }
                                }

                                that._submitPSNForm(sExternalCode, sName, localDate, sRequestType, sJustification, sAttachmentId);

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

                };
                reader.readAsDataURL(oFile);
            } else {
                that._submitPSNForm(sExternalCode, sName, localDate, sRequestType, sJustification, null);
            }
        },

        _submitPSNForm: function (sExternalCode, sName, localDate, sRequestType, sJustification, sAttachmentId) {
            var that = this;

            sap.m.MessageBox.confirm(
                "Are you sure you want to submit the Position Status Change request?",
                {
                    title: "Confirm Submission",
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            var oPayload = {
                                "__metadata": { "uri": "cust_PositionStatusChange" },
                                "externalCode": sExternalCode,
                                "cust_Emp_ID": sExternalCode,
                                "cust_EMP_Name": sName,
                                "effectiveStartDate": that.convertToODataDate(new Date()),
                                "cust_EffectiveDate": that.convertToODataDate(localDate),
                                "cust_PSNTypeChange": sRequestType,
                                "cust_Justification": sJustification || "No justification provided",
                            };

                            if (sAttachmentId) {
                                oPayload.cust_AttachmentNav = {
                                    "__metadata": { "uri": "Attachment(" + sAttachmentId + "L)" }
                                };
                            }

                            //var sUrl = that.getPath("SF_2") + "/upsert?workflowConfirmed=true";
                            var sUrl = that.getPath("SF_OAUTH") + "/upsert?workflowConfirmed=true";

                            that._makePostCall(sUrl, oPayload, "PSN Form Upsert successful!", "Workflow confirmation failed!", that.onNavBackHome.bind(that));
                        }
                    }
                }
            );
        },


        // _makePostCall: function (sUrl, oPayload, sSuccessMessage, sErrorMessage, fnSuccessCallback) {
        //     $.ajax({
        //         url: sUrl,
        //         type: "POST",
        //         contentType: "application/json",
        //         data: JSON.stringify(oPayload),
        //         success: function (oData) {
        //             console.log(sSuccessMessage, oData);
        //             sap.m.MessageBox.success(sSuccessMessage, { title: "Success" });
        //             if (fnSuccessCallback) {
        //                 fnSuccessCallback();
        //             }
        //         },
        //         error: function (oError) {
        //             console.error(sErrorMessage, oError);
        //             var sFinalErrorMessage = sErrorMessage;
        //             if (oError.responseJSON?.error?.message) {
        //                 sFinalErrorMessage = oError.responseJSON.error.message;
        //             }
        //             sap.m.MessageBox.error(sFinalErrorMessage, { title: "Error" });
        //             if (fnSuccessCallback) {
        //                 fnSuccessCallback();
        //             }
        //         }
        //     });
        // },


        _makePostCall: function(sUrl, oPayload, sSuccessMessage, sErrorMessage,fnSuccessCallback) {
            const that = this;
            
            $.ajax({
                url: sUrl,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(oPayload),
                success: function(data, textStatus, xhr) {
                    // Parse the XML response
                    const responseInfo = that._parseXMLResponse(data);
                    
                    if (responseInfo.status === "OK") {
                        sap.m.MessageBox.success(responseInfo.message || sSuccessMessage || "Request submitted successfully!", {
                            title: "Success",
                            // onClose: () => window.location.reload(),
                            onClose: function() {
                                that.onNavBackHome(); // Call your function here
                            }
                        
                        });
                    } else if (responseInfo.status === "ERROR") {
                        sap.m.MessageBox.error(responseInfo.message || "An error occurred while processing your request.", {
                            title: "Error"
                        });
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    let errorMessage = sErrorMessage || "An unexpected error occurred.";
                    
                    // Try to parse XML error response if available
                    if (xhr.responseText) {
                        try {
                            const responseInfo = that._parseXMLResponse(xhr.responseText);
                            if (responseInfo.message) {
                                errorMessage = responseInfo.message;
                            }
                        } catch (e) {
                            // If XML parsing fails, try JSON
                            try {
                                const jsonError = JSON.parse(xhr.responseText);
                                errorMessage = jsonError.error?.message || errorMessage;
                            } catch (jsonError) {
                                // Use default error message
                            }
                        }
                    }
                    
                    sap.m.MessageBox.error(errorMessage, { 
                        title: "Error" 
                    });
                }
            });
        },
        
        _parseXMLResponse: function(xmlData) {
            try {
                let xmlDoc;
                
                // Handle string response
                if (typeof xmlData === 'string') {
                    const parser = new DOMParser();
                    xmlDoc = parser.parseFromString(xmlData, "text/xml");
                } else {
                    xmlDoc = xmlData;
                }
                
                // Extract status and message from XML
                const statusElement = xmlDoc.querySelector('d\\:status, status');
                const messageElement = xmlDoc.querySelector('d\\:message, message');
                
                const status = statusElement ? statusElement.textContent : null;
                const message = messageElement ? messageElement.textContent : null;
                
                return {
                    status: status,
                    message: message
                };
            } catch (error) {
                console.error("Error parsing XML response:", error);
                return {
                    status: null,
                    message: null
                };
            }
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
            aSelectedItems.forEach(function (oItem) {
                // Get the user ID from the custom data
                var oCustomData = oItem.getCustomData().find(function (data) {
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
                var oSelectedEmployee = aEmployees.find(function (emp) {
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