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

], (Controller, JSONModel, fioriLibrary, HorizontalLayout, VerticalLayout, BusyIndicator, Filter, FilterOperator, MessageBox, MessageToast, Fragment) => {
    "use strict";

    return Controller.extend("com.taqa.psnform.taqapsnform.controller.PSNForm", {

        onInit() {
            sap.ui.core.BusyIndicator.show(0);

            this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");

            let data = this.getOwnerComponent().getModel("DataModel")
            this.getView().setModel(data, "DataModel");
            let ListDataModel = new JSONModel();
            this.getView().setModel(ListDataModel, "ListData");

            this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
            this.oViewModel = new sap.ui.model.json.JSONModel({
                showExitFullScreen: false,
                showFullScreen: true,
                showSearchSort: false,
                showRaiseRequest: true
            });
            this.getView().setModel(this.oViewModel, "buttonModel");

            this.oEmployeeSearchModel = new JSONModel({
                employees: []
            });
            this.getView().setModel(this.oEmployeeSearchModel, "employeeSearch");

            this.changeApprovalModel = new JSONModel({ employees: [] });
            this.getView().setModel(this.changeApprovalModel, "changeApproval");

            this.oEventReasonsModel = new JSONModel({
                eventReasons: []
            });
            this.getView().setModel(this.oEventReasonsModel, "eventReasons");

            this.oFlexibleColumnLayout.attachStateChange(this.onLayoutChange, this);

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

            let oSelectedEmployeeModel = new sap.ui.model.json.JSONModel({
                selectedEmployee: {}
            });

            this.getView().setModel(oSelectedEmployeeModel, "selectedEmployeeModel");

            const delayPromise = new Promise(resolve => {
                setTimeout(resolve, 1000);
            });

            Promise.all([...loadPromises, delayPromise])
                .then(() => {
                    sap.ui.core.BusyIndicator.hide();
                })
                .catch(error => {
                    console.error("Error during initialization:", error);
                    sap.ui.core.BusyIndicator.hide();
                });

            // sap.ui.require(["sap/ushell/Container"], async function (Container) {
            //     const UserInfo = await Container.getServiceAsync("UserInfo");
            //     let oUserModel = new sap.ui.model.json.JSONModel({
            //         email: UserInfo.getEmail(),   
            //         firstName: UserInfo.getFirstName(),
            //         lastName: UserInfo.getLastName(),
            //         fullName: UserInfo.getFullName(),
            //         id: UserInfo.getId()
            //     });
            //     this.getView().setModel(oUserModel, "userModel");
            //     if (UserInfo) {
            //         console.log("User Email ID:", UserInfo.getEmail());
            //     } else {
            //         console.log("Email ID not available");
            //     }
            // }.bind(this));

            this.oUserModel = new JSONModel({
                userDetails: {}
            });
            this.getView().setModel(this.oUserModel, "view");

            this._getUserName();
        },




        onNewRequestDialog: function () {
            let route = this.getOwnerComponent().getRouter();
            route.navTo("RouteNewForm", { action: "openFragment" });

        },


        onListItemPress: function (oEvent) {
            let oItem = oEvent.getParameter("listItem"); // Get the selected list item
            let oList = oEvent.getSource(); // Get the list control
            let oModel = this.getView().getModel("ListData");
            let sPath = oItem.getBindingContextPath();
            let oSelectedRowData = oModel.getProperty(sPath);
            let that = this;

            sap.ui.core.BusyIndicator.show(0);

            let userId = oSelectedRowData.externalCode;
            console.log(userId, typeof userId);

            // The SingleSelectMaster mode handles the visual selection automatically.
            // You don't need to manually add/remove style classes for highlighting.

            try {
                let busyPromise = new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 100);
                });
                busyPromise.then(function () {

                    this._getDetails(userId);
                    this._getEducationDetails(userId);
                    this._getLastExpDetails(userId);
                    this._getSalaryAdjustDetails(userId);
                    this._getApprovalDetails(userId);

                    this.oSelectedRowModel.setData({
                        selectedRow: oSelectedRowData
                    });

                    this.disableChangeOfStatusSection();
                    this.disableChangeOfCompSection();

                    console.log("Entire Model Data:", this.oSelectedRowModel.getData());

                    this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
                    this.oViewModel.setProperty("/showSearchSort", true);
                    this.oViewModel.setProperty("/showRaiseRequest", false);

                    let oMidColumnPage = this.byId("ObjectPageLayout");
                    oMidColumnPage.bindElement({
                        path: sPath,
                        model: "ListData"
                    });
                }.bind(this)).catch(function (error) {
                    console.error("Error during processing: ", error);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this));
            } catch (error) {
                console.error("Error during processing: ", error);
                sap.ui.core.BusyIndicator.hide();
            }

            this._selectedItemContext = oItem.getBindingContext("ListData"); // Use the selected item's context
            this._bSortAscending = true;
        },

        onSearchIconPress: function () {
            let oSearchField = this.getView().byId("idSearchField");
            let bSearchFieldVisible = oSearchField.getVisible();

            // Toggle search field visibility
            oSearchField.setVisible(!bSearchFieldVisible);

            // If making the search field visible, focus on it
            if (!bSearchFieldVisible) {
                oSearchField.focus();
            }
        },

        onSearch: function (oEvent) {
            // Get the search query from the SearchField
            let sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue"); // Use either "query" or "newValue"

            // Get the List control
            let oList = this.byId("idList");

            // Get the binding for the List items
            let oBinding = oList.getBinding("items");

            // Define the filter (e.g., search by "externalCode" or "cust_TypeOfChange")
            if (sQuery && sQuery.length > 0) {
                let oFilter = new sap.ui.model.Filter([
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
            let oList = this.getView().byId("page2").getContent()[0]; // Assuming your List is the first content element
            let oBinding = oList.getBinding("items");
            let bSortAscending = this._bSortAscending; // Get the current sort order

            let oSorter = new sap.ui.model.Sorter("externalCode", !bSortAscending); // Sort by externalCode, you can change to any property

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

        _updateButtonVisibilityAfterApproval: function () {

            let oSubmitButton = this.byId("submitChangesButton");
            if (oSubmitButton) {
                oSubmitButton.setVisible(true);
            }

            // Hide other buttons
            let oApproveButton = this.byId("approveButton");
            let oRejectButton = this.byId("rejectButton");
            let oMoreActionsButton = this.byId("moreActionsButton");

            if (oApproveButton) oApproveButton.setVisible(false);
            if (oRejectButton) oRejectButton.setVisible(false);
            if (oMoreActionsButton) oMoreActionsButton.setVisible(false);

        },

        onToggleFooter: function () {
            sap.m.MessageToast.show("Delegate action triggered");

        },

        
        getPath: function (destinationType) {
            let appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            let appPath = appId.replaceAll(".", "/");
            let appModulePath = jQuery.sap.getModulePath(appPath);

            if (destinationType === "SF_1") {
                return appModulePath + "/odata/v2/basic";
            } else if (destinationType === "SF_OAUTH") {
                return appModulePath + "/odata/v2/oauth";
            }
            return appModulePath;
        },

        _getUserName: function () {
            //userId = "31120";
            let sServiceUrl = this.getPath() + "/user-api/currentUser";

            let that = this;
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {

                    let userModel = new JSONModel(data);
                    that.getView().setModel(userModel, "UserData")

                    console.log("Fetched Data: ", userModel.getData());
                },
                error: function (e) {
                    MessageToast.show("Server Send Error");
                }
            });

        },

        _getPendingListDetails: function (userId) {
            //userId = "31120";
            let sServiceUrl = this.getPath("SF_1") + "/cust_PositionStatusChange?recordStatus=pending&$format=JSON&$select=externalCode,effectiveStartDate,cust_EMP_NameNav/displayName,cust_TypeOfChange,cust_Justification,wfRequestNav/wfRequestId,wfRequestNav/totalSteps,wfRequestNav/currentStepNum,wfRequestNav/status,wfRequestNav/wfRequestStepNav/stepNum,wfRequestNav/wfRequestStepNav/wfRequestStepId,wfRequestNav/wfRequestStepNav/status,wfRequestNav/wfRequestStepNav/positionNav/code,wfRequestNav/wfRequestStepNav/positionNav/externalName_en_US&$expand=wfRequestNav/wfRequestStepNav/positionNav,cust_EMP_NameNav";

            let that = this;
            $.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    // Set the fetched data into the JSON Model
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
            // userId = "31120";
            // Construct the complete URL
            let that = this;
            let sServiceUrl = this.getPath("SF_OAUTH") + "/User(" + userId + ")?$select=firstName,lastName,nationality,empId,userId,username,displayName,hireDate,defaultFullName,married,empInfo/jobInfoNav/employmentTypeNav/picklistLabels/optionId,empInfo/jobInfoNav/employmentTypeNav/picklistLabels/locale,empInfo/jobInfoNav/employmentTypeNav/picklistLabels/label&$format=JSON&$expand=empInfo/jobInfoNav,empInfo/jobInfoNav/employmentTypeNav/picklistLabels";


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
            let that = this;
            // userId = "31120";
            let sServiceUrl = this.getPath("SF_OAUTH") + "/Background_Education?$format=json&$select=userId,majorNav/picklistLabels/label,majorNav/picklistLabels/locale,majorNav/picklistLabels/optionId,sub_majorNav/picklistLabels/label,sub_majorNav/picklistLabels/locale,sub_majorNav/picklistLabels/optionId,degreeNav/picklistLabels/label,degreeNav/picklistLabels/locale,degreeNav/picklistLabels/optionId,schoolNav/picklistLabels/label,schoolNav/picklistLabels/locale,schoolNav/picklistLabels/optionId&$expand=majorNav/picklistLabels,degreeNav/picklistLabels,sub_majorNav/picklistLabels,schoolNav/picklistLabels&$filter=userId eq '" + userId + "'";


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
            let that = this;
            let sServiceUrl1 = this.getPath("SF_OAUTH") + "/EmpJob?$format=JSON&$select=userId,position,jobTitle,userNav/displayName&$expand=userNav&$filter=(position eq 21000885 or position eq 21000902 or position eq 22000551) and userNav/firstName ne null";
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
            let that = this;
            let sServiceUrl = this.getPath("SF_OAUTH") + "/Background_OutsideWorkExperience?$format=json&$select=startTitle,endDate,startDate,employer,yearsofexperience&$top=1&$filter=userId eq '" + userId + "'";


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
            let that = this;
            let sServiceUrl = this.getPath("SF_OAUTH") + "/FormHeader?$format=json&$select=dateAssigned,formLastContent/pmReviewContentDetail/summarySection/calculatedFormRating/rating,&$expand=formLastContent/pmReviewContentDetail/summarySection/calculatedFormRating&$filter=formSubjectId eq '" + userId + "' and formDataStatus eq 3";


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

        createRatingRow: function (sId, oContext) {
            let oData = oContext.getObject();
            let sRating = "";
            let sYear = this.formatYear(oData.dateAssigned);

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



        getApproverNames: function (positionCode) {
            let approvalData = this.getView().getModel("approvalData");
            let approverNames = []; // Array to collect matching approver names

            if (approvalData && approvalData.getProperty("/results") && positionCode) {
                let approvers = approvalData.getProperty("/results");
                // Iterate through all approvers
                approvers.forEach(function (approver) {
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
                let timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                let hireDate = new Date(timestamp);
                let oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd" });
                return oDateFormat.format(hireDate);
            }
            return value;
        },

        formatYear: function (value) {
            if (value) {
                let timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                let hireDate = new Date(timestamp);
                return hireDate.getFullYear();
            }
            return value;
        },





        formatTenureDate: function (value) {
            if (value) {
                let timestamp = parseInt(value.replace("/Date(", "").replace(")/", ""), 10);
                let hireDate = new Date(timestamp);
                let oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd" });
                let formattedHireDate = oDateFormat.format(hireDate);

                let currentDate = new Date();

                let timeDiff = currentDate - hireDate;

                let diffInYears = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
                return diffInYears + " years";
            }
            return value;
        },

        formatAttachmentLink: function (fileName) {
            return fileName || "";
        },

        serialNumberFormat: function (oContext, aData) {
            if (!this._serialNumberMap) {
                this._serialNumberMap = new WeakMap();
            }

            if (!this._serialNumberMap.has(oContext)) {
                let index = aData.indexOf(oContext) + 1;
                this._serialNumberMap.set(oContext, index);
            }

            return this._serialNumberMap.get(oContext);
        },



        // Controller (JavaScript)

        // Controller (JavaScript)


        onAttachmentLinkPress: function (oEvent) {
            //let attachmentId = this.getView().getModel("ListData").getProperty("/cust_AttachmentNav/attachmentId");
            const oContext = oEvent.getSource().getBindingContext("ListData");
            const attachmentId = oContext.getProperty("cust_AttachmentNav/attachmentId");
            if (attachmentId) {
                // Show loading indicator
                sap.ui.core.BusyIndicator.show(0);

                // Fetch the attachment data based on attachmentId
                this.fetchAttachmentData(attachmentId)
                    .then(attachmentData => {
                        // Display the attachment data in a dialog
                        this.showAttachmentDialog(attachmentData);
                        sap.ui.core.BusyIndicator.hide();
                    })
                    .catch(error => {
                        // Handle errors
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("Error fetching attachment data: " + error.message);
                    });
            } else {
                sap.m.MessageToast.show("No attachment ID found");
            }
        },

        showAttachmentDialog: function (attachmentData) {
            let oView = this.getView();

            // Load the fragment only once
            if (!this._oAttachmentDialog) {
                Fragment.load({
                    name: "com.taqa.psnform.taqapsnform.view.Attachment",
                    controller: this
                }).then(function (oDialog) {
                    this._oAttachmentDialog = oDialog;
                    oView.addDependent(this._oAttachmentDialog);

                    // Set up the dialog content with attachment data
                    this._setupAttachmentContent(attachmentData);

                    this._oAttachmentDialog.open();
                }.bind(this));
            } else {
                // Update dialog content with attachment data
                this._setupAttachmentContent(attachmentData);
                this._oAttachmentDialog.open();
            }
        },


        // Function to fetch attachment data
        fetchAttachmentData: function (attachmentId) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: this.getPath("SF_OAUTH") + `/Attachment(${attachmentId}L)?$format=json`,
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    success: function (data) {
                        if (data && data.d) {
                            resolve(data.d); // Resolve with JSON data
                        } else {
                            reject(new Error("Invalid data structure received"));
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        // Fallback to XML if JSON fails
                        $.ajax({
                            url: this.getPath("SF_OAUTH") + `/Attachment(${attachmentId}L)`,
                            method: "GET",
                            dataType: "xml",
                            success: function (xmlData) {
                                let $xml = $(xmlData);

                                // Extract data from XML
                                const attachmentData = {
                                    attachmentId: $xml.find("d\\:attachmentId, attachmentId").text(),
                                    fileName: $xml.find("d\\:fileName, fileName").text(),
                                    mimeType: $xml.find("d\\:mimeType, mimeType").text(),
                                    fileContent: $xml.find("d\\:fileContent, fileContent").text(), // Extract file content
                                    fileSize: $xml.find("d\\:fileSize, fileSize").text(),
                                    fileExtension: $xml.find("d\\:fileExtension, fileExtension").text()
                                };

                                resolve(attachmentData); // Resolve with XML data
                            },
                            error: function (xmlError) {
                                reject(xmlError); // Reject if both JSON and XML fail
                            }
                        });
                    }
                });
            });
        },



        // Dynamic Image Base64 to Iamge

        // _setupAttachmentContent: function (attachmentData) {
        //     // Get controls from fragment
        //     let oTitle = sap.ui.getCore().byId("attachmentDialogTitle") || this.byId("attachmentDialogTitle");
        //     let oTextArea = sap.ui.getCore().byId("attachmentTextArea") || this.byId("attachmentTextArea");
        //     let oImage = sap.ui.getCore().byId("attachmentImage") || this.byId("attachmentImage");

        //     // Set dialog title with file name
        //     if (oTitle) {
        //         oTitle.setText(attachmentData.fileName || "Attachment");
        //     }

        //     // Display file information in TextArea
        //     if (oTextArea) {
        //         oTextArea.setValue("File Information:\n" +
        //             "Name: " + (attachmentData.fileName || "Unknown") + "\n" +
        //             "Type: " + (attachmentData.mimeType || "Unknown") + "\n" +
        //             "Size: " + (attachmentData.fileSize || "Unknown") + " bytes");
        //         oTextArea.setVisible(true);
        //     }

        //     // Determine file type based on mimeType
        //     const isImage = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"].includes(attachmentData.mimeType);
        //     const isPdf = attachmentData.mimeType === "application/pdf";
        //     const isDocument = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        //                        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //                        "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
        //                        .includes(attachmentData.mimeType);

        //     if (isImage && oImage) {
        //         // Display image preview for image files
        //         oImage.setSrc("data:" + attachmentData.mimeType + ";base64," + attachmentData.fileContent);
        //         oImage.setWidth("100%");
        //         oImage.setHeight("auto");
        //         oImage.setAlt(attachmentData.fileName || "Attachment");
        //         oImage.setVisible(true);

        //         // Hide the TextArea since we are displaying an image
        //         oTextArea.setVisible(false);
        //     } else if (isPdf && oTextArea) {
        //         // For PDF files, provide a link to view the file
        //         oTextArea.setValue("File Information:\n" +
        //             "Name: " + (attachmentData.fileName || "Unknown") + "\n" +
        //             "Type: " + (attachmentData.mimeType || "Unknown") + "\n" +
        //             "Size: " + (attachmentData.fileSize || "Unknown") + " bytes\n\n" +
        //             `<a href="data:${attachmentData.mimeType};base64,${attachmentData.fileContent}" target="_blank">View PDF</a>`);

        //         // Hide the Image control
        //         oImage.setVisible(false);
        //     } else if (isDocument && oTextArea) {
        //         // For document files, provide a download link
        //         oTextArea.setValue("File Information:\n" +
        //             "Name: " + (attachmentData.fileName || "Unknown") + "\n" +
        //             "Type: " + (attachmentData.mimeType || "Unknown") + "\n" +
        //             "Size: " + (attachmentData.fileSize || "Unknown") + " bytes\n\n" +
        //             `<a href="data:${attachmentData.mimeType};base64,${attachmentData.fileContent}" download="${attachmentData.fileName}">Download Document</a>`);

        //         // Hide the Image control
        //         oImage.setVisible(false);
        //     } else if (oTextArea) {
        //         // Display a placeholder message for unsupported file types
        //         oTextArea.setValue("File Information:\n" +
        //             "Name: " + (attachmentData.fileName || "Unknown") + "\n" +
        //             "Type: " + (attachmentData.mimeType || "Unknown") + "\n" +
        //             "Size: " + (attachmentData.fileSize || "Unknown") + " bytes\n\n" +
        //             "Preview not available for this file.");

        //         // Hide the Image control
        //         oImage.setVisible(false);
        //     }
        // },


        // Static Data
        _setupAttachmentContent: function (attachmentData) {
            // Get controls from fragment
            let oTitle = sap.ui.getCore().byId("attachmentDialogTitle") || this.byId("attachmentDialogTitle");
            let oTextArea = sap.ui.getCore().byId("attachmentTextArea") || this.byId("attachmentTextArea");
            let oImage = sap.ui.getCore().byId("attachmentImage") || this.byId("attachmentImage");

            // Static file content for demonstration
            let fileContent1 = "iVBORw0KGgoAAAANSUhEUgAABIYAAAIlCAYAAACgt/N6AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAP+lSURBVHhe7J0FfBVHF8Vv3D0hENzd3R0KFaBOnbr7V3d3L3X3lpbSFnd3dwsaiLvrN+e+t+ERgidAkvPnN+S9ldnZ2X27O2evOGVkZhWJwfyVsJAgfCSEEEIIIYQQQgghlZS4hCTx8fbSz876PyGEEEIIIYQQQgipclAYIoQQQgghhBBCCKmiUBgihBBCCCGEEEIIqaJQGCKEEEIIIYQQQgipolAYIoQQQgghhBBCCKmiUBgihBBCCCGEEEIIqaJQGCKEEEIIIYQQQgipolAYIoQQQgghhBBCCKmiUBgihBBCCCGEEEIIqaJQGCKEEEIIIYQQQgipolAYIoQQQgghhBBCCKmiUBgihBBCCCGEEEIIqaJQGCKEEEIIIYQQQgipolAYIoQQQgghhBBCCKmiUBgihBBCCCGEEEIIqaJQGCKEEEIIIYQQQgipolAYIoQQQgghhBBCCKmiUBgihBBCCCGEEEIIqaJQGCKEEEIIIYQQQgipojhlZGYV4YP5K2EhQTqRnBp5eXmyd+9eiYyMlOTkZCksLBR/f3+pW7eu1K9fX7y8vOxLHklWVpasWLFC1/H09JQWLVqIn5+ffe4hMjIyZNOmTVJUpIftMDw8PCQoKEjCwsKO2FZOTo7s3LlT4uPji9vVtm1bcXFxsS9hIzMzU+vHMiXBslivWrVq+tfJyck+p/xIT0+X6Oho7VtnZ2epXbu2eHt72+dWTHAMcCxOtP9wTBs3bmz/Vjbg/Fm/fr1kZ2drv9arV09CQkLOyDE9GrGxsbJv3z4pKCjQcxm/ATc3N/vccxP8znfv3i25ubn2KYc42u8R+7lr1y7t68DAQL0+YNmTBf1k/U5xDEv+li0OHjyo1yUca3d3d2nYsKG26Wwea0IIIYQQQsjZJS4hSXy8beMUCkNlBASVX375RcaNG6eD/tTUVB18+/j4qJjRr18/ueGGG3QAXtqAbObMmXL//ffrQA/rvPrqq9K/f38d8DkC0WbMmDGSn59vn3IIDPowEMWAetSoUdK5c2edBlFl0aJFsmbNGq0bg220r06dOnLhhRceto2tW7fKddddV2r9GHj6+vrqPowYMUIuuuiich9cLly4UD744AMVhzC4fu2116Rdu3b2uRWTf//9V5577jn7t+PTp08feeedd8q0r3F8L774YomKilJR4vHHH5fhw4cfVVw4E+C38/HHH+u5GRoaqr+n4OBg+9xzk3nz5ulvFWKPIzhW+O1BQG3VqpX2NX6P+O39/vvv8vrrr+tyvXr1kkceeURq1qyp30+GH374QVavXq2fL7jgAj1PXF1d9TvA9QfXlU8++USFKIhX2D62d+mll57zohshhBBCCCGk/HAUhiAIFaHExieacQQ5Vb7++uuisLCwImdnZwhthxUzSCzy9fUtMgPvor1799rXOJxrr732sOXNQL0oMzPTPvcQy5cvLzKDv8PqdyxY19PTs6hNmzZFM2bMKCooKCiKi4srevfdd4t+/PHHomeeeabo/vvvL/rrr7+KzOC0aOvWrfaabZiBZpGXl1epdVsF24+IiCgyA1z7WuXHhAkTiurWravbRR/OmjXLPqfi8s033xzRp8cqZtBfVFhYaF+7bMjNzS1q0qSJ1u/j41P03XffFeXn59vnnh0+++yzopCQEG1TnTp1imJiYuxzzl3+/fffotq1ax92vEoW/B47d+5cNHnyZP09jh07tngejm1kZKS9tpPjqquuKnJ3d9fy5ptvFmVnZ9vn2Ni1a1fRgAEDDrsmubi4FL333ntFOTk59qUIIYQQQgghVRFoQJYexBhDZQDcnV588UWJi4vTt/RdunRRyxZYeZx33nlqOYBlzMBQHnjggSPctGAN888//9i/mdGbqWPq1KlqhXQsYEHToUMHGTp0qAwePFhatmyplgpwGVm3bp1aMsCFDPXD/QpuK3AXCggIkJSUFF13y5Yt9tpsYH0UAKsNWA/dddddcuedd8qQIUPUAgLWJgcOHJCXXnrpuG08XcLDw9USAtseOHCgtqmiA1c8WI9YpXXr1sWWHrDiaNCgwWHzmzdvrvPKGus4Ox7zs4ljG86VNh0Pxzbid47fPn6PgwYNkqZNm+p0/B7hJvrFF1/o76bkfp3qfuI6AisgFHzGdcMRWBfCehHzcK2AReK0adPUesnRsogQQgghhBBStaEwVAZs3LhR44wAuI189NFH8uijj6oI9Ndff6krBwb3Xbt2lbvvvvuIgSAEIwg1mG658mzYsKHYTeRoREREqDgzZcoUHfCtXLlS3a6s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334zEWn69OlRtg0bNrjGjRu71KlTh95x+iCitWjRwpUoUcJVqVIltPf84uDBg27JkiVuy5YtLlu2bO6CC5QEdbrs3bffpUqZ0v7WVRRCCCGEEEIIkahAlEHoIcoHwYO/2f7999/QK44FcWXo0KGhR1EZMGBAjFE/p8Ivv/zinnzySRMlAIHpo48+cqVLl7bHx4PopHvvvdf17t37mO3RRx916dOnD73yzMiRI4f78MMP3UUXXRTac/5BlNbbb79tohwikYgbJAwJIYQQQgghhEhU5MmTxzVo0MD9+eefliZGhA6CR8pQhENMkNKFiEQ6VTjr1q2zSKEbbrghtOf0ILpnzZo1oUfO5c+f37Vu3fqEaWmkiRUqVMiVKVPmmK1IkSIuefLkoVeeGVwjjofPPF8hXW716tWWPijiDglDQgghhBBCCCESFZkyZXK7du2yCJGHHnrIDRs2zFWsWDHW1KF69erZ+37++efQngh4TDpYeJ0iIpJKlSrlXn311dCeCC6//PIYI27uv/9+S1dDHOI4nn32Wffdd9/Z55JedqZQz4g0MD738ccftzQpBKNu3bqZOLZjxw57vmXLlqF3RED0Eud12223WUpdrly53KeffmrPsY/3cI5EE/EY4YyUNgSkFClSmKh1880323nB3r173XPPPeduvfVW17dvX1esWDETtho2bOgmTJjg/vvPShTbde7Ro4dFUPGdefPmtUgeIrqIjuJ5IrSIqDpw4IC9h+eGDBniqlWrZtFdHNPrr79uvzMsWrTI5c6d240ZM8bdeeedlrLHY76Dz+A6XHvttfY8+3hexA0ShoQQQgghhBBCJDrSpk3rHnvsMXf33Xe7GjVqmHgSG7yeWkRffvml279/v+0j3YgUsA4dOtjj0+Xqq6+2WkEUmSaljXpFJwuCyLJly9zs2bOP2TZt2hQpthAF89lnn1lU0iuvvOLuuusuN2jQIPfUU09Z0Wy+c/LkyVGilmbNmmW1j7p27RraExUipQIhpX379iZiUdOIaxmksiHItGrVKjJFDn744Qc3ePBgE2gQb7Zv327HQX2fAAQozuull15yjRo1ss9q27atvbZnz55WlwkxjdccOnTI0vx4DYIRIhKC33vvvWfHhiAVwHv++ecfE7SaN2/u3nrrLff+++9boe7bb7/dimtfeeWVJlyJuEHCkBBCCCGEEEKIREezZs3cZZddZlEtb7zxxkmttEXED6ljFHaGpUuX2mMiZM4EVg4jVS1I16pcuXLomROzdetWEzfuuOOOYzZEK0QTQECiaDRCDNE9iCcII6ROIdpQVJtIIqJugtdTnDtIU4sJxCYEoO7du7vatWtbraWSJUu6zz//3EQWxBm+j2Ps06dP6F3OonGeeOIJi5RCmCOKiOvIFsC14D233HKLCXhEAPF9CDZdunQxEYiUQIQs9vPdXENEHoSsRx55xD3zzDMmdgW/FxQvXtxeQ7QU143jRdwK0gnz5cvnqlat6q677rrQO8SZImFICCGEEEIIIcR5AWleLEcfFKEmYoY0p/iuu4P4cd9990XZSO0CBBPSq4iOib6xoll4jaECBQrY8QZQx+jw4cMmHiGQ1K9f3/Xv39/Sr/hOVjtDqDrecvfJkiWz9wHiD6lkRD/xuQF16tSxlLHwlDhWbeNYeD/pe6SLcQyBiAXlypWzcwO+n9chZBG5BTwX/E0E18yZM03cIUJp7NixtvH5RBixL4BzDN6HEEbaWXhEkYh7JAwJIYQQQgghhDgvQETo2LGjiRx//PGHmzNnjtUeSpMmTegV8QO1kIhuCd9IEwOOiZXLSIeLviECncqS60TnkJrFeS1evNhS5erWrXtKBayJ4gmHgt7UBIoLONeYOHLkiNVJoi4T0VDBRlQSYpWKSScsEoaEEEIIIYQQQpw3UH+GQsWkS1FUmfSl40XUhMOKV6e7BDr1dIjICd9Id4priKYhlYpl6SdOnGiRPaSSEXlzssydOzf0VwSIMkF0U3yB+EUEEoW1Z8yYEblxLPxWpLqJhEPCkBBCCCGEEEKI8waEE6KEBg4caEWbY6pNlD59ehOLSGEilYnULOr1hBd2jg6reFEomsLIwUpbAcEKX+Eb+4BoGVKheF9MW3h61okgMojizD/++KMbP3681dwhzetkQERiBbN+/frZCmMUoKZwNY+J2jleAeu4gBQyUtYmTZrkNm/ebNeeSKXhw4fbbzVy5MjQK2MHgYlrQGoa107EDRKGhBBCCCGEEEKcNyAeEFmzYsUKW8GKJc+jQ40dClWPHj3aVuSi0DEFj0mpQrCIiWC5+6efftr99NNP9vfJsG3bNterVy+LiolpmzdvXuiVJwdFuTlGNuopnQr33HOPRVAFxa9Zqp4l5S+99NIzLtAdGwh0Dz74oNu9e7cVpma1M1LJXnvtNauzRGHsk4FV4aiZNGLECPfAAw+E9oozJfnjjz/xDH8cPHjIpU8XUeBJCCGEEEIIIYQ4FyCKhygSRBKiYojUYVUtChcj/rA8OhC5g/CDCMFzCD0UXaYuDq/p1KmT1f1hH2lgfC6fxYpkCEm8hyXTg5pBFLTmexo0aGD7Y4LvRMChrg9RSjFtfGfOnDmtyDTfy2cHkNrGsVWrVi2yThLfSWFnIm0QwII0uWDZe/YTNcV7uR6sZhbA+xCWqG1E1BPnxTL8CEZBfSCOmbQvVkgj0ifYx/dTz4jPIO2O7ylfvrw9z3cjyHFtg+sd7AvOD4GOv4NrlTlzZte5c2erCcVzwe/I55IeF8Dqa6wCxzXgGPkszpm/EZXE6bF3336XKiSCJtuzd5+1Hv+vy5k9q+0UQgghhBBCCCGEEOcnW7btiAwOUiqZEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRBJFwpAQQgghhBBCCCFEEkXCkBBCCCGEEEIIIUQSRcKQEEIIIYQQQgghRJLEuf8DcUt7mdvslIMAAAAASUVORK5CYII=";

            // Set dialog title with file name
            if (oTitle) {
                oTitle.setText(attachmentData.fileName || "Attachment");
            }

            // Display file information in TextArea
            if (oTextArea) {
                oTextArea.setValue("File Information:\n" +
                    "Name: " + (attachmentData.fileName || "Unknown") + "\n" +
                    "Type: " + (attachmentData.mimeType || "Unknown") + "\n" +
                    "Size: " + (attachmentData.fileSize || "Unknown") + " bytes");
                oTextArea.setVisible(true);
            }

            // Determine file type based on mimeType
            const isImage = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"].includes(attachmentData.mimeType);
            const isPdf = attachmentData.mimeType === "application/pdf";
            const isDocument = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
                .includes(attachmentData.mimeType);

            if (isImage && oImage) {
                // Display image preview for image files
                oImage.setSrc("data:" + attachmentData.mimeType + ";base64," + fileContent1); // Use static fileContent1
                oImage.setWidth("100%");
                oImage.setHeight("auto");
                oImage.setAlt(attachmentData.fileName || "Attachment");
                oImage.setVisible(true);

                // Hide the TextArea since we are displaying an image
                oTextArea.setVisible(false);
            } else if (isPdf && oTextArea) {
                // For PDF files, provide a link to view the file
                oTextArea.setValue("File Information:\n" +
                    "Name: " + (attachmentData.fileName || "Unknown") + "\n" +
                    "Type: " + (attachmentData.mimeType || "Unknown") + "\n" +
                    "Size: " + (attachmentData.fileSize || "Unknown") + " bytes\n\n" +
                    `<a href="data:${attachmentData.mimeType};base64,${fileContent1}" target="_blank">View PDF</a>`); // Use static fileContent1

                // Hide the Image control
                oImage.setVisible(false);
            } else if (isDocument && oTextArea) {
                // For document files, provide a download link
                oTextArea.setValue("File Information:\n" +
                    "Name: " + (attachmentData.fileName || "Unknown") + "\n" +
                    "Type: " + (attachmentData.mimeType || "Unknown") + "\n" +
                    "Size: " + (attachmentData.fileSize || "Unknown") + " bytes\n\n" +
                    `<a href="data:${attachmentData.mimeType};base64,${fileContent1}" download="${attachmentData.fileName}">Download Document</a>`); // Use static fileContent1

                // Hide the Image control
                oImage.setVisible(false);
            } else if (oTextArea) {
                // Display a placeholder message for unsupported file types
                oTextArea.setValue("File Information:\n" +
                    "Name: " + (attachmentData.fileName || "Unknown") + "\n" +
                    "Type: " + (attachmentData.mimeType || "Unknown") + "\n" +
                    "Size: " + (attachmentData.fileSize || "Unknown") + " bytes\n\n" +
                    "Preview not available for this file.");

                oImage.setVisible(false);
            }
        },


        onDialogClose: function () {
            if (this._oAttachmentDialog) {
                this._oAttachmentDialog.close();
            }
        },

        onDownloadAttachment: function () {
            let oModel = this.getView().getModel("AttachmentData");
            if (!oModel) {
                return;
            }

            let oData = oModel.getData();
            let sFileContent = oData.fileContent;
            let sMimeType = oData.mimeType;
            let sFileName = oData.fileName;

            let byteCharacters = atob(sFileContent);
            let byteArrays = [];

            for (let i = 0; i < byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i));
            }

            let blob = new Blob([new Uint8Array(byteArrays)], { type: sMimeType });
            let url = URL.createObjectURL(blob);

            let a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = sFileName;
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },

        onDialogClose: function () {
            if (this._oAttachmentDialog) {
                this._oAttachmentDialog.close();
            }
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
            let sLayout = oEvent.getParameter("layout");
            let isFullScreen = sLayout === fioriLibrary.LayoutType.MidColumnFullScreen;

            let isExpanded = sLayout === fioriLibrary.LayoutType.OneColumn;
            let isCollapsed = sLayout === fioriLibrary.LayoutType.TwoColumnsMidExpanded ||
                sLayout === fioriLibrary.LayoutType.MidColumnFullScreen;

            this.oViewModel.setProperty("/showSearchSort", isCollapsed);
            this.oViewModel.setProperty("/showRaiseRequest", isExpanded);

            this.oViewModel.setProperty("/showExitFullScreen", isFullScreen);
            this.oViewModel.setProperty("/showFullScreen", !isFullScreen);
        },

        onSearchIconPress: function () {
            let oSearchField = this.byId("idSearchField");
            let oSearchButton = this.byId("idSearchButton");

            oSearchField.setVisible(true);
            oSearchButton.setVisible(false);
        },

        onOpenChangeApprovalDialog: function () {
            let oView = this.getView();

            if (!this._oRequestDialog) {

                this._oRequestDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "com.taqa.psnform.taqapsnform.view.PSNRequest",
                    this
                );

                oView.addDependent(this._oRequestDialog);

                if (!this.oEmployeeSearchModel) {
                    this.oEmployeeSearchModel = new sap.ui.model.json.JSONModel();
                }

                this.oEmployeeSearchModel.setData({
                    employees: []
                });

                this._oRequestDialog.open();
            } else {
                this._oRequestDialog.open();
            }
        },

        onEmployeeSearch: function (oEvent) {
            let sValue = "";
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

            let oModel = this.getOwnerComponent().getModel();

            if (!oModel) {
                console.error("OData model not found");
                return;
            }

            let sSearchLower = sSearchTerm.toLowerCase();

            let sFilter = "tolower(username) like '%" + sSearchLower + "%' or " +
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

                        let aEmployees = data.results.map(function (emp) {
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
            let oItem = oEvent.getParameter("listItem");

            if (oItem) {

                let oCustomData = oItem.getCustomData().find(function (data) {
                    return data.getKey() === "userId";
                });

                let sEmployeeId = oCustomData ? oCustomData.getValue() : "";
                this._selectedEmployeeId = sEmployeeId;

                let sEmployeeName = oItem.getTitle();

                let oSearchField = this.byId("idEmployeeSearch");
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

            let wfRequestId = this._currentWfRequestId || "defaultRequestId";

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
                }.bind(this)
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
            let oModel = this.getOwnerComponent().getModel();

            if (!oModel) {
                console.error("OData model not found");
                return;
            }

            let sPath = "/Picklist('TypeofChange')/picklistOptions";

            oModel.read(sPath, {
                urlParameters: {
                    "$expand": "picklistLabels",
                    "$select": "externalCode,id,picklistLabels/id,picklistLabels/optionId,picklistLabels/label,picklistLabels/locale",
                    "$filter": "picklistLabels/locale eq 'en_US'"
                },
                success: function (oData) {
                    console.log("Full OData Response:", oData);

                    if (oData && oData.results) {
                        let aEventReasons = oData.results.map(function (item) {
                            let oLabel = item.picklistLabels.results.find(function (label) {
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
                            let errorDetails = JSON.parse(oError.responseText);
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
                let oSearchField = this.byId("idEmployeeSearch");
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
                url: this.getPath("SF_OAUTH") + `/changeWfRequestApprover?wfRequestId=${wfRequestId}L&wfRequestStepId=${wfRequestStepId}L&updateToUserId='${userId}'&editTransaction='NO_EDIT'`,
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
                url: this.getPath("SF_OAUTH") + `/approveWfRequest?wfRequestId=${wfRequestId}L`,
                type: "POST",
                success: function (data, textStatus, jqXHR) {
                    sap.m.MessageToast.show("Workflow request approved successfully.");
                    this._updateButtonVisibilityAfterApproval();
                    this._getPendingListDetails();
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    let errorMessage = "Error approving workflow request: " + errorThrown;

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
                id: "rejectFragment"
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
                this._wfRequestIdForRejection = null;
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
                url: this.getPath("SF_OAUTH") + `/sendbackWfRequest?wfRequestId=${wfRequestId}L`,
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
                url: this.getPath("SF_OAUTH") + `/withdrawWfRequest?wfRequestId=${wfRequestId}L`,
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





        // Controller (JavaScript)
        // fetchEmpJobData: function (userId) {
        //      userId = "800063";
        //     let sServiceUrl = this.getPath() + `/odata/v2/EmpJob?$format=JSON&$filter=userId eq '${userId}'&$expand=companyNav,departmentNav,divisionNav,locationNav,workscheduleCodeNav,managerUserNav&$select=companyNav/externalCode,companyNav/name_en_US,departmentNav/externalCode,departmentNav/name_en_US,divisionNav/externalCode,divisionNav/name_en_US,locationNav/externalCode,locationNav/name,workscheduleCodeNav/externalCode,workscheduleCodeNav/externalName_en_US,jobCode,jobTitle,managerUserNav/userId,managerUserNav/displayName`;
        //     let that = this;

        //     jQuery.ajax({
        //         url: sServiceUrl,
        //         type: "GET",
        //         dataType: "json",
        //         async: false,
        //         success: function (data) {
        //             let empJobData = data.d.results[0];

        //             if (empJobData) {
        //                 that.empJobData = empJobData;

        //                 // that.fetchDropdownData(); // Fetch dropdown data after emp job data
        //             } else {
        //                 sap.m.MessageToast.show("No employee job data found.");
        //             }
        //         },
        //         error: function (e) {
        //             sap.m.MessageToast.show("Server Send Error");
        //             console.error("Error fetching employee job data:", e);
        //         }
        //     });
        // },


        fetchEmpJobData: function (userId) {
            if (!userId) {
                console.error("No userId provided for fetchEmpJobData");
                return;
            }

            let sServiceUrl = this.getPath("SF_OAUTH") + `/EmpJob?$format=JSON&$filter=userId eq '${userId}'&$expand=companyNav,departmentNav,divisionNav,locationNav,workscheduleCodeNav,managerUserNav&$select=companyNav/externalCode,companyNav/name_en_US,departmentNav/externalCode,departmentNav/name_en_US,divisionNav/externalCode,divisionNav/name_en_US,locationNav/externalCode,locationNav/name,workscheduleCodeNav/externalCode,workscheduleCodeNav/externalName_en_US,jobCode,jobTitle,managerUserNav/userId,managerUserNav/displayName`;
            let that = this;

            jQuery.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: false,
                success: function (data) {
                    let empJobData = data.d.results[0];

                    if (empJobData) {
                        that.empJobData = empJobData;
                        // Store fetched data
                        console.log("Successfully fetched employee job data for user:", userId);
                    } else {
                        sap.m.MessageToast.show("No employee job data found for user: " + userId);
                        console.warn("No employee job data found for user:", userId);
                    }
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching employee job data");
                    console.error("Error fetching employee job data for user:", userId, e);
                }
            });
        },


        fetchCompanyData: function () {
            let that = this;
            let url = this.getPath("SF_OAUTH") + "/FOCompany?$format=JSON&$select=externalCode,name";

            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {

                    let data1 = data.d.results
                    console.log(data1)

                    // let companyModel = new sap.ui.model.json.JSONModel(data.d.results);
                    // that.getView().setModel(companyModel, "CompanyModel");
                    // that.updateChangeOfStatusTable("1", "Company", companyModel);

                    let companyModel = new sap.ui.model.json.JSONModel(data.d.results);

                    // Set the model to the view
                    that.getView().setModel(companyModel, "CompanyModel");

                    // Log the company names to console for verification
                    // let companyNames = companyModel.getData().map(function (company) {
                    //     return company.name;
                    // });
                    // console.log("Company Names:", companyNames);
                    // console.log("Total number of companies:", companyNames.length);

                    // if (companyNames) {
                    //     that.companyNames = companyNames;

                    //     // that.fetchDropdownData(); // Fetch dropdown data after emp job data
                    // } else {
                    //     sap.m.MessageToast.show("No employee job data found.");
                    // }

                    // Continue with your existing function call
                    //that.updateChangeOfStatusTable("1", "Company", companyModel);
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching company data");
                    console.error("Error fetching company data:", e);
                }
            });
        },

        fetchDepartmentData: function () {
            let that = this;
            let url = this.getPath("SF_OAUTH") + "/FODepartment?$format=JSON&$select=externalCode,name";

            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let departmentModel = new sap.ui.model.json.JSONModel(data.d.results);
                    that.getView().setModel(departmentModel, "DepartmentModel");
                    //that.updateChangeOfStatusTable("2", "Department", departmentModel);
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching department data");
                    console.error("Error fetching department data:", e);
                }
            });
        },

        fetchDivisionData: function () {
            let that = this;
            let url = this.getPath("SF_OAUTH") + "/FODivision?$format=JSON&$select=externalCode,name";

            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let divisionModel = new sap.ui.model.json.JSONModel(data.d.results);
                    that.getView().setModel(divisionModel, "DivisionModel");
                    //that.updateChangeOfStatusTable("3", "Division", divisionModel);
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching division data");
                    console.error("Error fetching division data:", e);
                }
            });
        },

        fetchLocationData: function () {
            let that = this;
            let url = this.getPath("SF_OAUTH") + "/FOLocation?$format=JSON&$select=externalCode,name";

            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let locationModel = new sap.ui.model.json.JSONModel(data.d.results);
                    that.getView().setModel(locationModel, "LocationModel");
                    //that.updateChangeOfStatusTable("4", "Location", locationModel);
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching location data");
                    console.error("Error fetching location data:", e);
                }
            });
        },

        fetchWorkScheduleData: function () {
            let that = this;
            let url = this.getPath("SF_OAUTH") + "/WorkSchedule?$format=JSON&$select=externalCode,externalName_en_US";

            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let workScheduleModel = new sap.ui.model.json.JSONModel(data.d.results);
                    that.getView().setModel(workScheduleModel, "WorkScheduleModel");
                    //that.updateChangeOfStatusTable("5", "Work Schedule", workScheduleModel);
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching work schedule data");
                    console.error("Error fetching work schedule data:", e);
                }
            });
        },

        fetchPositionData: function () {
            let that = this;
            let url = this.getPath("SF_OAUTH") + "/Position?$format=JSON&$select=code,externalName_en_US,jobCode,jobTitle";

            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let positionModel = new sap.ui.model.json.JSONModel(data.d.results);
                    that.getView().setModel(positionModel, "PositionModel");
                    // Update both Manager and Job Title rows
                    //that.updateChangeOfStatusTable("6", "Manager", positionModel);
                    //that.updateChangeOfStatusTable("7", "Job Title", positionModel);
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching position data");
                    console.error("Error fetching position data:", e);
                }
            });
        },



        fetchEmpCompensationData: function (userId) {
            let that = this;

            let sServiceUrl = this.getPath("SF_OAUTH") + `/EmpCompensation?$format=JSON&$filter=userId eq '${userId}'&$expand=empPayCompRecurringNav/payComponentNav,payGroupNav,employmentNav/jobInfoNav/payGradeNav,&$select=empPayCompRecurringNav/payComponent,empPayCompRecurringNav/paycompvalue,empPayCompRecurringNav/currencyCode,empPayCompRecurringNav/frequency,empPayCompRecurringNav/payComponentNav/externalCode,empPayCompRecurringNav/payComponentNav/name,payGroupNav/externalCode,payGroupNav/name,employmentNav/jobInfoNav/payGradeNav/externalCode,employmentNav/jobInfoNav/payGradeNav/name`;

            jQuery.ajax({

                url: sServiceUrl,

                type: "GET",

                dataType: "json",

                async: true,

                success: function (data) {

                    let empCompensationModel = new sap.ui.model.json.JSONModel(data.d);

                    that.getView().setModel(empCompensationModel, "EmpCompensationModel");

                    console.log("EmpCompensation data fetched successfully:", data.d);
                    that.fetchGrossMonthlySalaryData(userId);

                    that.fetchPayGradeData(); // Fetch pay grade data for the combobox

                },

                error: function (e) {

                    sap.m.MessageToast.show("Error fetching employee compensation data.");

                    console.error("Error fetching employee compensation data:", e);

                }

            });

        },

        fetchGrossMonthlySalaryData: function (userId) {
            let that = this;
            let sGrossSalaryServiceUrl = this.getPath("SF_OAUTH") + `/EmpCompensation?$format=JSON&$filter=userId eq '${userId}'&$expand=empPayCompRecurringNav&$select=empPayCompRecurringNav/paycompvalue,empPayCompRecurringNav/currencyCode,empPayCompRecurringNav/frequency`;

            jQuery.ajax({
                url: sGrossSalaryServiceUrl,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let totalMonthlySalary = 0;
                    let currencyCode = "";

                    if (data && data.d && data.d.results && data.d.results.length > 0 &&
                        data.d.results[0].empPayCompRecurringNav &&
                        data.d.results[0].empPayCompRecurringNav.results) {
                        data.d.results[0].empPayCompRecurringNav.results.forEach(function (payComponent) {
                            if (payComponent.frequency === "MON" && payComponent.paycompvalue) {
                                totalMonthlySalary += parseFloat(payComponent.paycompvalue);
                                currencyCode = payComponent.currencyCode;
                            } else if (payComponent.frequency !== "MON" && payComponent.paycompvalue) {
                                console.warn("Pay component with frequency:", payComponent.frequency, "not considered for total monthly salary.");
                            }
                        });
                    }

                    let grossSalaryData = {
                        GrossMonthlySalary: totalMonthlySalary,
                        Currency: currencyCode
                    };

                    let grossSalaryModel = new sap.ui.model.json.JSONModel(grossSalaryData);
                    that.getView().setModel(grossSalaryModel, "GrossSalaryModel");
                    console.log("Gross Monthly Salary data fetched and calculated (separate call):", grossSalaryData);
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching gross monthly salary data.");
                    console.error("Error fetching gross monthly salary data:", e);
                }
            });
        },

        fetchPayGradeData: function () {
            let that = this;
            let sServiceUrl = this.getPath("SF_OAUTH") + "/FOPayGrade?$format=JSON&$select=name,externalCode";

            jQuery.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let payGradeModel = new sap.ui.model.json.JSONModel(data.d.results);
                    that.getView().setModel(payGradeModel, "PayGradeModel");
                    that.initializeChangeOfCompensationTable(that.getView().getModel("EmpCompensationModel").getProperty("/results/0"));
                    that.initializeGrossCompensationTable(data.d.results[0]);
                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching Pay Grade data.");
                    console.error("Error fetching Pay Grade data:", e);
                }
            });
        },

        initializeChangeOfCompensationTable: function (empCompensationData) {
            let changeOfCompensation = [];

            changeOfCompensation.push({
                SNo: "1",
                Item: "Grade",
                CurrentValue: empCompensationData && empCompensationData.employmentNav && empCompensationData.employmentNav.jobInfoNav && empCompensationData.employmentNav.jobInfoNav.results[0] && empCompensationData.employmentNav.jobInfoNav.results[0].payGradeNav ?
                    empCompensationData.employmentNav.jobInfoNav.results[0].payGradeNav.externalCode + " - " + empCompensationData.employmentNav.jobInfoNav.results[0].payGradeNav.name : "",
                NewValue: ""
            });

            if (empCompensationData && empCompensationData.empPayCompRecurringNav && empCompensationData.empPayCompRecurringNav.results) {
                empCompensationData.empPayCompRecurringNav.results.forEach(function (payComponent, index) {
                    changeOfCompensation.push({
                        SNo: (index + 2).toString(), // Start SNo from 2
                        Item: payComponent.payComponentNav ? payComponent.payComponentNav.name : "",
                        CurrentValue: payComponent.paycompvalue || "",
                        NewValue: ""
                    });
                });
            }

            let dataModel = new sap.ui.model.json.JSONModel({ ChangeOfCompensation: changeOfCompensation });
            this.getView().setModel(dataModel, "ChangeOfCompensationModel");
            this.bindChangeOfCompensationTable();
            this.getView().byId("changeOfCompSection").setVisible(true);
        },

        bindChangeOfCompensationTable: function () {
            let table = this.getView().byId("compensationTable");
            let that = this;

            table.bindItems({
                path: "ChangeOfCompensationModel>/ChangeOfCompensation",
                factory: function (sId, oContext) {
                    let item = oContext.getObject();
                    let cells = [
                        new sap.m.Text({ text: "{ChangeOfCompensationModel>SNo}" }),
                        new sap.m.Text({ text: "{ChangeOfCompensationModel>Item}" }),
                        new sap.m.Text({
                            text: {
                                parts: [
                                    { path: "ChangeOfCompensationModel>SNo" },
                                    { path: "ChangeOfCompensationModel>CurrentValue" }
                                ],
                                formatter: function (sno, value) {
                                    if (sno !== "1" && value) {
                                        return value + "  SAR";
                                    }
                                    return value || "";
                                }
                            }
                        })
                    ];

                    let newValueControl;

                    if (item.SNo === "1") {
                        newValueControl = new sap.m.ComboBox({
                            selectedKey: "{ChangeOfCompensationModel>NewValue}",
                            items: {
                                path: "PayGradeModel>/",
                                template: new sap.ui.core.Item({
                                    key: "{PayGradeModel>name}",
                                    text: "{PayGradeModel>name}"
                                })
                            },
                            change: function (oEvent) {
                                let selectedItem = oEvent.getParameter("selectedItem");
                                if (selectedItem) {
                                    let bindingContext = oEvent.getSource().getBindingContext("ChangeOfCompensationModel");
                                    let path = bindingContext.getPath();
                                    let model = oEvent.getSource().getModel("ChangeOfCompensationModel");
                                    model.setProperty(path + "/NewValue", selectedItem.getKey());
                                }
                            }
                        });
                    } else {
                        newValueControl = new sap.m.Text({ text: "{ChangeOfCompensationModel>NewValue}" });
                    }

                    cells.push(newValueControl);

                    return new sap.m.ColumnListItem({
                        cells: cells
                    });
                }
            });
        },

        initializeGrossCompensationTable: function (empCompensationData) {
            let grossCompensationData = [
                { SNo: "9", Item: "Leave Entitlement", CurrentValue: "As Per the Policy", NewValue: "As Per the Policy" },
                { SNo: "10", Item: "Medical Insurance Class", CurrentValue: "A+ Class", NewValue: "A+ Class" },
                { SNo: "11", Item: "Employee Ticket Entitlement", CurrentValue: "As Per the Policy", NewValue: "As Per the Policy" },
                { SNo: "12", Item: "Family Ticket Entitlement", CurrentValue: "As Per the Policy", NewValue: "As Per the Policy" },
                { SNo: "13", Item: "Contract Type", CurrentValue: empCompensationData && empCompensationData.employmentNav ? empCompensationData.employmentNav.contractType : "", NewValue: empCompensationData && empCompensationData.employmentNav ? empCompensationData.employmentNav.contractType : "" }
            ];

            let grossCompensationModel = new sap.ui.model.json.JSONModel(grossCompensationData);
            this.getView().setModel(grossCompensationModel, "GrossCompensationModel");
            this.bindGrossCompensationTable();
        },

        bindGrossCompensationTable: function () {
            let table = this.getView().byId("grosscompensationTable");

            table.bindItems({
                path: "GrossCompensationModel>/",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: "{GrossCompensationModel>SNo}" }),
                        new sap.m.Text({ text: "{GrossCompensationModel>Item}" }),
                        new sap.m.Text({ text: "{GrossCompensationModel>CurrentValue}" }),
                        new sap.m.Text({ text: "{GrossCompensationModel>NewValue}" })
                    ]
                })
            });
        },

        initializeChangeOfStatusTable: function () {
            let empJobData = this.empJobData; // Assuming this is set elsewhere
            let companyNames = this.companyNames;
            console.log(companyNames)

            let changeOfStatus = [
                {
                    SNo: "1",
                    Item: "Company",
                    CurrentStatus: empJobData.companyNav.name_en_US,
                    NewStatus: ""
                },
                {
                    SNo: "2",
                    Item: "Department",
                    CurrentStatus: empJobData.departmentNav.name_en_US,
                    NewStatus: ""
                },
                {
                    SNo: "3",
                    Item: "Division",
                    CurrentStatus: empJobData.divisionNav.name_en_US,
                    NewStatus: ""
                },
                {
                    SNo: "4",
                    Item: "Location",
                    CurrentStatus: empJobData.locationNav.name,
                    NewStatus: ""
                },
                {
                    SNo: "5",
                    Item: "Work Schedule",
                    CurrentStatus: empJobData.workscheduleCodeNav.externalName_en_US,
                    NewStatus: ""
                },
                {
                    SNo: "6",
                    Item: "Manager",
                    CurrentStatus: empJobData.managerUserNav.displayName,
                    NewStatus: ""
                },
                {
                    SNo: "7",
                    Item: "Job Title",
                    CurrentStatus: empJobData.jobTitle,
                    NewStatus: ""
                }
            ];

            let dataModel = new sap.ui.model.json.JSONModel({ ChangeOfStatus: changeOfStatus });
            this.getView().setModel(dataModel, "DataModel");

            this.bindTableItems();

            // Make section visible
            let changeOfStatusSection = this.getView().byId("changeOfStatusSection");
            if (changeOfStatusSection) {
                changeOfStatusSection.setVisible(true);
            }
        },

        _getUserIdAndOpenAddComponentDialog: function () {
            var oView = this.getView();
            let userId = null;
            let effectiveStartDate = null;
            let that = this;
        
            return new Promise(function (resolve, reject) {
                // Get the selected item from the list
                var oList = that.byId("idList");
                var oSelectedItem = oList.getSelectedItem();
                
                if (!oSelectedItem) {
                    sap.m.MessageToast.show("No record selected. Please select a record first.");
                    console.error("No record selected for opening Add Component dialog");
                    reject(new Error("No record selected"));
                    return;
                }
                
                // Get the binding context of the selected item
                var oSelectedContext = oSelectedItem.getBindingContext("ListData");
                
                if (!oSelectedContext) {
                    sap.m.MessageToast.show("Invalid selection. Cannot retrieve data.");
                    console.error("Invalid selection context for opening Add Component dialog");
                    reject(new Error("Invalid selection context"));
                    return;
                }
                
                // Get the data object from the binding context
                var oSelectedData = oSelectedContext.getObject();
                
                // Extract userId (externalCode) and effectiveStartDate directly from the data
                userId = oSelectedData.externalCode;
                
                // Format the effectiveStartDate from SAP OData format (/Date(timestamp)/) to YYYY-MM-DD
                if (oSelectedData.effectiveStartDate) {
                    var timestamp = parseInt(oSelectedData.effectiveStartDate.replace("/Date(", "").replace(")/", ""));
                    var date = new Date(timestamp);
                    effectiveStartDate = date.getFullYear() + "-" + 
                                         String(date.getMonth() + 1).padStart(2, '0') + "-" + 
                                         String(date.getDate()).padStart(2, '0');
                }
                
                console.log("Retrieved from selected list item - userId:", userId, "effectiveStartDate:", effectiveStartDate);
                
                if (!userId || !effectiveStartDate) {
                    sap.m.MessageToast.show("Could not retrieve user ID or effective date from selection.");
                    console.error("Could not retrieve user ID or effective date from selection");
                    reject(new Error("Could not retrieve user data"));
                    return;
                }
                
                // Store the values for later use
                that._currentUserId = userId;
                that._currentEffectiveDate = effectiveStartDate;
                
                resolve();
            });
        },


        onAddComponent: function (oEvent) {
            var oView = this.getView();
            let that = this;
        
             this._getUserIdAndOpenAddComponentDialog();
            //     .then(function () {
                    if (!that._pDialog) {
                        that._pDialog = Fragment.load({
                            id: oView.getId(),
                            name: "com.taqa.psnform.taqapsnform.view.AddComponent",
                            controller: that
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    that._pDialog.then(function (oDialog) {
                        oDialog.open();
                        that.fetchAddComponentData();
                    });
            //     })
            //     .catch(function (error) {
            //         console.error("Error during _getUserIdAndOpenAddComponentDialog:", error);
            //     });
        },
    
       
    
        // onAddComponent: function (oEvent) {
        //     var oView = this.getView();
        //    this._getUserIdAndOpenAddComponentDialog();
        //     let that = this;
        //     if (!that._pDialog) {
        //         that._pDialog = Fragment.load({
        //             id: oView.getId(),
        //             name: "com.taqa.psnform.taqapsnform.view.AddComponent",
        //             controller: that
        //         }).then(function (oDialog) {
        //             oView.addDependent(oDialog);
        //             return oDialog;
        //         });
        //     }
        //     that._pDialog.then(function (oDialog) {
        //         oDialog.open();
        //     });
        //     that.fetchAddComponentData(); 
        // },

        fetchAddComponentData: function () {
            let that = this;
            let sServiceUrl = this.getPath("SF_OAUTH") + "/FOPayComponent?$format=JSON&$select=name,payComponentType,externalCode,frequencyCode";

            jQuery.ajax({
                url: sServiceUrl,
                type: "GET",
                dataType: "json",
                async: true,
                success: function (data) {
                    let addComponentModel = new JSONModel(data.d);
                    that.getView().setModel(addComponentModel, "AddComponentModel");

                    console.log("Fetched Data: ", addComponentModel.getData());

                },
                error: function (e) {
                    sap.m.MessageToast.show("Error fetching Pay Component data.");
                    console.error("Error fetching Pay Component data:", e);
                }
            });
        },


        // onSubmitAddComponent: function() {
        //     // Get the dialog and form controls
        //     var oDialog = this.byId("addComponentDialog");
        //     var oPayComponentSelect = this.byId("payComponentSelect");
        //     var oValueInput = this.byId("valueInput");
   
        //     var sSelectedComponentCode = oPayComponentSelect.getSelectedKey();
        //     var sValue = oValueInput.getValue();
            
        //     if (!sSelectedComponentCode) {
        //         sap.m.MessageToast.show("Please select a pay component");
        //         return;
        //     }
            
        //     if (!sValue) {
        //         sap.m.MessageToast.show("Please enter a value");
        //         return;
        //     }
           
        //     var sUserId = "32050";
        //     var sEffectiveDate = "2025-04-04";
            
        //     console.log("Using specific userId:", sUserId, "effectiveDate:", sEffectiveDate);
        
        //     var oPayloadData = {
        //         userId: sUserId,
        //         effectiveDate: sEffectiveDate,
        //         componentCode: sSelectedComponentCode,
        //         value: sValue
        //     };
            
        //     // Show busy indicator
        //     var oBusyDialog = new sap.m.BusyDialog();
        //     oBusyDialog.open();
            
        //     // Make the Ajax POST call
        //     var that = this;
        //     $.ajax({
        //         url: this.getPath() + "/odata/v2/upsert",  // Replace with your actual endpoint
        //         type: "POST",
        //         contentType: "application/json",
        //         data: JSON.stringify(oPayloadData),
        //         success: function(data) {
        //             oBusyDialog.close();
        //             sap.m.MessageToast.show("Pay component added successfully");
                    
        //             // Close the dialog
        //             oDialog.close();
                    
        //             // Refresh your main list or model if needed
        //             that._refreshPayComponentsList();
        //         },
        //         error: function(jqXHR, textStatus, errorThrown) {
        //             oBusyDialog.close();
                    
        //             // Parse error message
        //             var sErrorMessage = "Failed to add pay component";
        //             try {
        //                 var oErrorResponse = JSON.parse(jqXHR.responseText);
        //                 if (oErrorResponse && oErrorResponse.message) {
        //                     sErrorMessage = oErrorResponse.message || sErrorMessage;
        //                 }
        //             } catch (e) {
        //                 if (errorThrown) {
        //                     sErrorMessage += ": " + errorThrown;
        //                 }
        //             }
                    
        //             // Show error message
        //             sap.m.MessageBox.error(sErrorMessage);
        //         }
        //     });
        // },


        onSubmitAddComponent: function() {
            var that = this;
            var oDialog = this.byId("addComponentDialog");
            var oPayComponentSelect = this.byId("payComponentSelect");
            var oValueInput = this.byId("valueInput");
            
            var sSelectedComponentCode = oPayComponentSelect.getSelectedKey();
      
            var sValue = oValueInput.getValue();
            
            if (!sSelectedComponentCode) {
                sap.m.MessageToast.show("Please select a pay component");
                return;
            }
            
            if (!sValue) {
                sap.m.MessageToast.show("Please enter a value");
                return;
            }
            
            this._getUserIdAndOpenAddComponentDialog()
                .then(function() {
                    var sUserId = that._currentUserId;
                    var sEffectiveDate = that._currentEffectiveDate;

                    console.log("Submitting with userId:", sUserId, "effectiveDate:", sEffectiveDate);
                    
                    var oPayloadData = {
                        userId: sUserId,
                        effectiveDate: sEffectiveDate,
                        componentCode: sSelectedComponentCode,
                        value: sValue
                    };
                 
                    var oBusyDialog = new sap.m.BusyDialog();
                    oBusyDialog.open();

                    let sUrl = that.getPath("SF_OAUTH") + "/upsert";
             
                    $.ajax({
                        url: sUrl , 
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(oPayloadData),
                        success: function(data) {
                            oBusyDialog.close();
                            sap.m.MessageToast.show("Pay component added successfully");
                            oPayComponentSelect.setSelectedKey("");
                            oValueInput.setValue("");  
                            oDialog.close();
                            
                            that._refreshPayComponentsList();
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            oBusyDialog.close();
                            
                            var sErrorMessage = "Failed to add pay component";
                            try {
                                var oErrorResponse = JSON.parse(jqXHR.responseText);
                                if (oErrorResponse && oErrorResponse.message) {
                                    sErrorMessage = oErrorResponse.message || sErrorMessage;
                                }
                            } catch (e) {
                                if (errorThrown) {
                                    sErrorMessage += ": " + errorThrown;
                                }
                            }
                           
                            sap.m.MessageBox.error(sErrorMessage);
                        }
                    });
                })
                .catch(function(error) {
                    sap.m.MessageBox.error("Could not submit: " + error.message);
                });
        },
        


        onCancelAddComponent: function () {
            if (this._pDialog) {
                this._pDialog.then(function (oDialog) {
                    oDialog.close();
                });
            }
        },

        bindTableItems: function () {
            // let table = this.getView().byId("changeStatusTable");

            // table.bindItems({
            //     path: "DataModel>/ChangeOfStatus",
            //     template: new sap.m.ColumnListItem({
            //         cells: [
            //             new sap.m.Text({ text: "{DataModel>SNo}" }),
            //             new sap.m.Text({ text: "{DataModel>Item}" }),
            //             new sap.m.Text({ text: "{DataModel>CurrentStatus}" }),
            //             new sap.m.ComboBox({
            //                 selectedKey: "{DataModel>NewStatus}",
            //                 items: {
            //                     path: "CompanyModel>/",
            //                     template: new sap.ui.core.Item({
            //                         key: "{CompanyModel>name}",
            //                         text: "{CompanyModel>name}"
            //                     })
            //                 },
            //                 change: function (oEvent) {
            //                     let selectedItem = oEvent.getParameter("selectedItem");
            //                     if (selectedItem) {
            //                         let bindingContext = oEvent.getSource().getBindingContext("DataModel");
            //                         let path = bindingContext.getPath();
            //                         let model = oEvent.getSource().getModel("DataModel");
            //                         model.setProperty(path + "/NewStatus", selectedItem.getKey());
            //                     }
            //                 }
            //             })
            //         ]
            //     })
            // });

            let table = this.getView().byId("changeStatusTable");

            table.bindItems({
                path: "DataModel>/ChangeOfStatus",
                factory: function (sId, oContext) {
                    let item = oContext.getObject();
                    let cells = [
                        new sap.m.Text({ text: "{DataModel>SNo}" }),
                        new sap.m.Text({ text: "{DataModel>Item}" }),
                        new sap.m.Text({ text: "{DataModel>CurrentStatus}" })
                    ];

                    // Create a ComboBox with the appropriate model based on SNo
                    let comboBox;

                    switch (item.SNo) {
                        case "1": // Company
                            comboBox = new sap.m.ComboBox({
                                selectedKey: "{DataModel>NewStatus}",
                                items: {
                                    path: "CompanyModel>/",
                                    template: new sap.ui.core.Item({
                                        key: "{CompanyModel>name}",
                                        text: "{CompanyModel>name}"
                                    })
                                }
                            });
                            break;

                        case "2": // Department
                            comboBox = new sap.m.ComboBox({
                                selectedKey: "{DataModel>NewStatus}",
                                items: {
                                    path: "DepartmentModel>/",
                                    template: new sap.ui.core.Item({
                                        key: "{DepartmentModel>name}",
                                        text: "{DepartmentModel>name}"
                                    })
                                }
                            });
                            break;

                        case "3": // Division
                            comboBox = new sap.m.ComboBox({
                                selectedKey: "{DataModel>NewStatus}",
                                items: {
                                    path: "DivisionModel>/",
                                    template: new sap.ui.core.Item({
                                        key: "{DivisionModel>name}",
                                        text: "{DivisionModel>name}"
                                    })
                                }
                            });
                            break;

                        case "4": // Location
                            comboBox = new sap.m.ComboBox({
                                selectedKey: "{DataModel>NewStatus}",
                                items: {
                                    path: "LocationModel>/",
                                    template: new sap.ui.core.Item({
                                        key: "{LocationModel>name}",
                                        text: "{LocationModel>name}"
                                    })
                                }
                            });
                            break;

                        case "5": // Work Schedule
                            comboBox = new sap.m.ComboBox({
                                selectedKey: "{DataModel>NewStatus}",
                                items: {
                                    path: "WorkScheduleModel>/",
                                    template: new sap.ui.core.Item({
                                        key: "{WorkScheduleModel>externalName_en_US}",
                                        text: "{WorkScheduleModel>externalName_en_US}"
                                    })
                                }
                            });
                            break;

                        case "6": // Manager
                            comboBox = new sap.m.ComboBox({
                                selectedKey: "{DataModel>NewStatus}",
                                items: {
                                    path: "PositionModel>/",
                                    template: new sap.ui.core.Item({
                                        key: "{PositionModel>externalName_en_US}",
                                        text: "{PositionModel>externalName_en_US}"
                                    })
                                }
                            });
                            break;

                        case "7": // Job Title
                            comboBox = new sap.m.ComboBox({
                                selectedKey: "{DataModel>NewStatus}",
                                items: {
                                    path: "PositionModel>/",
                                    template: new sap.ui.core.Item({
                                        key: "{PositionModel>jobTitle}",
                                        text: "{PositionModel>jobTitle}"
                                    })
                                }
                            });
                            break;

                        default:
                            comboBox = new sap.m.Input({
                                value: "{DataModel>NewStatus}"
                            });
                    }

                    // Add common event handler for all ComboBoxes
                    comboBox.attachChange(function (oEvent) {
                        let selectedItem = oEvent.getParameter("selectedItem");
                        if (selectedItem) {
                            let bindingContext = oEvent.getSource().getBindingContext("DataModel");
                            let path = bindingContext.getPath();
                            let model = oEvent.getSource().getModel("DataModel");
                            model.setProperty(path + "/NewStatus", selectedItem.getKey());
                        }
                    });

                    cells.push(comboBox);

                    return new sap.m.ColumnListItem({
                        cells: cells
                    });
                }
            });
        },

        initializeView: function () {
            this.initializeChangeOfStatusTable();
            this.fetchCompanyData();
            this.fetchDepartmentData();
            this.fetchDivisionData();
            this.fetchLocationData();
            this.fetchWorkScheduleData();
            this.fetchPositionData();
        },

        onUpdatePosition: function () {

            let userId = null;

            if (this._selectedItemContext) {
                let selectedRowData = this._selectedItemContext.getObject();
                userId = selectedRowData.externalCode;
            } else if (this.oSelectedRowModel && this.oSelectedRowModel.getData().selectedRow) {
                userId = this.oSelectedRowModel.getData().selectedRow.externalCode;
            }

            if (!userId) {
                sap.m.MessageToast.show("No employee selected. Please select an employee first.");
                console.error("No user ID available for onUpdatePosition");
                return;
            }

            console.log("Updating position for user:", userId);

            // Fetch employee data with the selected user ID
            this.fetchEmpJobData(userId);
            this.fetchEmpCompensationData(userId); // Assuming this also needs userId

            // Make sections visible and initialize the view
            this.highlightChangeOfStatusSection();
            this.highlightChangeOfCompSection();

            // Initialize view after data is fetched
            if (this.empJobData) {
                this.initializeView();
            } else {
                sap.m.MessageToast.show("Failed to load employee data. Please try again.");
            }
        },

        highlightChangeOfStatusSection: function () {
            let objectPage = this.getView().byId("ObjectPageLayout"); // Corrected ID
            let changeOfStatusSection = this.getView().byId("changeOfStatusSection");

            if (changeOfStatusSection) {
                changeOfStatusSection.setVisible(true);

                if (objectPage) {
                    // Scroll to the top of the ObjectPageLayout first, then to the section
                    // objectPage.scrollToSection(4, 0); // Scroll to top (section index 0, duration 0)
                    setTimeout(function () { // Delay to ensure previous scroll is done
                        objectPage.scrollToSection(changeOfStatusSection.getId(), 500); // Scroll to section
                    }, 0); // Short delay
                }
            }
        },

        highlightChangeOfCompSection: function () {
            let objectPage = this.getView().byId("ObjectPageLayout"); // Corrected ID
            let changeOfStatusSection = this.getView().byId("changeOfCompSection");

            if (changeOfStatusSection) {
                changeOfStatusSection.setVisible(true);

                if (objectPage) {
                    // Scroll to the top of the ObjectPageLayout first, then to the section
                    // objectPage.scrollToSection(4, 0); // Scroll to top (section index 0, duration 0)
                    setTimeout(function () { // Delay to ensure previous scroll is done
                        objectPage.scrollToSection(changeOfStatusSection.getId(), 500); // Scroll to section
                    }, 0); // Short delay
                }
            }
        },


        disableChangeOfStatusSection: function () {
            let objectPage = this.getView().byId("ObjectPageLayout"); // Corrected ID
            let changeOfStatusSection = this.getView().byId("changeOfStatusSection");

            if (changeOfStatusSection) {
                changeOfStatusSection.setVisible(false); // Set to false
            }
        },

        disableChangeOfCompSection: function () {
            let objectPage = this.getView().byId("ObjectPageLayout"); // Corrected ID
            let changeOfStatusSection = this.getView().byId("changeOfCompSection");

            if (changeOfStatusSection) {
                changeOfStatusSection.setVisible(false); // Set to false
            }
        },








        // onSubmit: function () {
        //     let oView = this.getView();
        //     let oSelectedRowModel = oView.getModel("selectedRowModel");

        //     console.log("Full Selected Row Model:", oSelectedRowModel.getData());

        //     let oRequestTypeSelect = this.byId("idRequestType");
        //     let oDatePicker = this.byId("idRequestDate");
        //     let oCommentsTextArea = this.byId("idComments");

        //     let sRequestType = oRequestTypeSelect.getSelectedKey();
        //     let oEffectiveDate = oDatePicker.getDateValue();
        //     let sJustification = oCommentsTextArea.getValue();

        //     if (!sRequestType) {
        //         sap.m.MessageBox.error("Please select a Required Action");
        //         return;
        //     }

        //     if (!oEffectiveDate) {
        //         sap.m.MessageBox.error("Please select an effective change date");
        //         return;
        //     }

        //     let sExternalCode = oSelectedRowModel.getProperty("/selectedRow/externalCode");
        //     console.log("External Code:", sExternalCode);

        //     let oPayload = {
        //         "__metadata": {
        //             "uri": "cust_PositionStatusChange"
        //         },
        //         "externalCode": sExternalCode,
        //         "effectiveStartDate": this.convertToODataDate(oEffectiveDate),
        //         "cust_TypeOfChange": sRequestType,
        //         "cust_Justification": sJustification || "No justification provided"
        //     };

        //     console.log("Payload prepared:", JSON.stringify(oPayload));

        //     let sUrl = this.getPath() + "/odata/v2/upsert?workflowConfirmed=true";

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
        //             let sErrorMessage = "Workflow confirmation failed.";

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
                let oDate = new Date(dateString);
                return "/Date(" + oDate.getTime() + ")/";
            } catch (error) {
                console.error("Date conversion error:", error);
                return "/Date(" + Date.now() + ")/";
            }
        },

        onNewButtonPress: function () {


            if (!this._oNewRequestDialog) {
                let oView = this.getView();

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