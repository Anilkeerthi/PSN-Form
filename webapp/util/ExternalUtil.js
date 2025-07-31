sap.ui.define([], function () {
    "use strict";

    return {

        processData: function (oData) {
            const oResponse = {
                staticInfo: "This is a static message from the external JS.",
                receivedData: oData,
                timestamp: new Date().toUTCString()
            };

            return oResponse;

        },

        dynamicContent: function (eventType, data) {
            const templates = {
                "PSN_DemotionUnBudgeted": [
                    {
                        text: 'Private and Confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To:       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE:       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'As part of organizational restructuring, the Management has made the decision to ',
                            { text: 'adjust your current position', bold: true },
                            ', effective ',
                            { text: data.changeDate || '', bold: true },
                            '. Your revised job title and reporting structure shall be as follows:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                text: [
                                    { text: 'Job Title\n', bold: true },
                                    { text: 'Department\n', bold: true },
                                    { text: 'Division\n', bold: true },
                                    { text: 'Reporting Line\n', bold: true },
                                    { text: 'Grade\n\n', bold: true }
                                ]
                            },
                            {
                                width: '*',
                                text: [
                                    ':  ' + (data.jobTitle || '') + '\n',
                                    ':  ' + (data.department || '') + '\n',
                                    ':  ' + (data.division || '') + '\n',
                                    ':  ' + (data.managerName || '') + '\n',
                                    ':  ' + (data.grade || '') + '\n\n'
                                ]
                            }
                        ],
                        fontSize: 12,
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: 'Your salary structure and benefits shall remain unchanged and will be as follows:',
                        margin: [0, 10, 0, 10]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text: 'It is understood that the change(s) in the compensation is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        stack: [
                            { text: 'Employee Name : ' + (data.signerName || '') },
                            { text: 'Date : ' + (data.currentDate || '') },
                            { text: 'Signature : _________________' }
                        ],
                        margin: [300, 50, 0, 300]
                    }
                ],

                "PSN_JobTitleChange": [
                    {
                        text: 'Private and confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: 'We are writing to inform you of your transfer to a new position as ' + (data.positionTitle || '') + '. This transfer is effective from ' + (data.changeDate || data.effectiveDate || '') + '.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Your new responsibilities will include ' + (data.roleName || data.responsibilities || '') + '. We believe this transfer will provide you with new opportunities for growth and development.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Your compensation and benefits package will remain the same, including ' + (data.benefits || 'all existing benefits') + '.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Please confirm your acceptance of this transfer by ' + (data.responseDate || data.currentDate || '') + '. Should you have any questions, please contact ' + (data.managerName || data.contactPerson || '') + '.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'We look forward to your continued contributions in your new role.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 0, 0, 0]
                    },
                    {
                        text: data.managerName || data.signerName || '',
                        margin: [0, 0, 0, 30]
                    }
                ],

                "PSN_TransBetLEorDepSalChBudgeted": [
                    {
                        text: 'Private and confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To :       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE :       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence is to officially advise you that, effective ',
                            { text: data.changeDate || '', bold: true },
                            ', you will be transferred to the ',
                            { text: (data.department || 'Supply Chain Department') + ' as ' + (data.positionTitle || 'Logistics Manager NME') + '.', bold: true },
                            ' You will be reporting to ',
                            { text: data.managerName || 'Sufian Kifah Aljorephani, Director - Strategic Sourcing and Contracts MENAT.', bold: true },
                            ' Your new salary structure shall be as under:\n\n'
                        ]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text: 'It is understood that the change(s) in the compensation is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    }
                ],

                "PSN_TransCountryWithSalChBud": [
                    {
                        text: 'Private and confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To : ' + data.employeeName,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'RE: Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence is to officially advise you that',
                            { text: data.changeDate || '', bold: true },
                            ', you will be transferred to ',
                            { text: (data.CompanyCurrentStatus || 'TAQA Well Solutions') + ', based in ' + (data.location || 'KSA') + ', under the ' + (data.division || 'Well Intervention division') + ', as ' + (data.positionTitle || 'Senior Operations Support Lead'), bold: true },
                            '. You will be reporting to ',
                            { text: data.managerName || 'Mohammad Faisal, Coiled Tubing Director, KSA.', bold: true },
                            ' Your new salary structure shall be as follows:'
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text: 'It is understood that the changes are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    }
                ],

                "PSN_TransBetLEorDepSalChUnBudgeted": [
                    {
                        text: 'Private and confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To :       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE :       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence is to officially advise you that effective ',
                            { text: data.changeDate || '', bold: true },
                            ', you will be transferred to the ',
                            { text: data.department || 'Well Intervention', bold: true },
                            ' department, as ',
                            { text: data.positionTitle || 'Senior Operations Support Lead.', bold: true },
                            ' You will be reporting to ',
                            { text: data.managerName || 'Mohammad Faisal, Coiled Tubing Director KSA.', bold: true },
                            ' Your new salary structure shall be as under:\n\n'
                        ]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text: 'It is understood that the changes are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    }
                ],

                "PSN_AnnualMeritIncreaseMass": [
                    {
                        text: 'Private and confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To :       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE :       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence is to officially advise you that, effective ',
                            { text: data.changeDate || '', bold: true },
                            ', your salary has been ',
                            { text: 'revised as part of a merit increase in recognition of your performance and contributions.', bold: true },
                            ' Your new salary structure and benefits shall be as follows:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text: 'It is understood that the change(s) in the compensation is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                image: data.signature,
                                fit: [300, 250],
                                margin: [0, 30, 0, 0]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: 'Employee Name : ' + (data.signerName || '') },
                                    { text: 'Date : ' + (data.currentDate || '') },
                                    { text: 'Signature : _________________' }
                                ],
                                margin: [0, 30, 0, 0]
                            }
                        ]
                    }
                ],

                "PSN_SalaryAdjustmentBudgeted": [
                    {
                        text: 'Private and Confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To:       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE:       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear Mr. ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence is to officially advise you that, effective ',
                            { text: data.changeDate || '', bold: true },
                            ', your ',
                            { text: data.adjustmentType || 'Housing Allowance', bold: true },
                            ' has been revised. Your updated salary structure and benefits shall be as under:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text: 'It is understood that the change(s) in the compensation is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                image: data.signature,
                                fit: [300, 250],
                                margin: [0, 30, 0, 0]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: 'Employee Name : ' + (data.signerName || '') },
                                    { text: 'Date : ' + (data.currentDate || '') },
                                    { text: 'Signature : _________________' }
                                ],
                                margin: [0, 30, 0, 0]
                            }
                        ]
                    }
                ],

                "PSN_SalaryAdjustmentUnBudgeted": [
                    {
                        text: 'Private and Confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To:       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE:       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear Mr. ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence is to officially advise you that, effective ',
                            { text: data.changeDate || '', bold: true },
                            ', a ',
                            { text: 'Market Variance (MV)', bold: true },
                            ' component has been added/Revised to align your salary with market standards. Your updated salary structure and benefits shall be as under:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text: 'It is understood that the change(s) in the compensation is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                image: data.signature,
                                fit: [300, 250],
                                margin: [0, 30, 0, 0]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: 'Employee Name : ' + (data.signerName || '') },
                                    { text: 'Date : ' + (data.currentDate || '') },
                                    { text: 'Signature : _________________' }
                                ],
                                margin: [0, 30, 0, 0]
                            }
                        ]
                    }
                ],

                "PSN_DemotionBudgeted": [
                    {
                        text: 'Private and confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To:       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE:       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear Mr. ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence serves as formal notification that, in line with organizational requirements, your position has been adjusted effective ',
                            { text: data.changeDate || '', bold: true },
                            '. Accordingly, your new salary structure and benefits shall be as follows:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                text: [
                                    { text: 'Job Title\n', bold: true },
                                    { text: 'Department\n', bold: true },
                                    { text: 'Division\n', bold: true },
                                    { text: 'Reporting Line\n', bold: true },
                                    { text: 'Grade\n\n', bold: true }
                                ]
                            },
                            {
                                width: '*',
                                text: [
                                    ':  ' + (data.jobTitle || '') + '\n',
                                    ':  ' + (data.department || '') + '\n',
                                    ':  ' + (data.division || '') + '\n',
                                    ':  ' + (data.managerName || '') + '\n',
                                    ':  ' + (data.grade || '') + '\n\n'
                                ]
                            }
                        ],
                        fontSize: 12,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text: 'It is understood that the change(s) in the compensation is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per the employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                image: data.signature,
                                fit: [300, 250],
                                margin: [0, 30, 0, 0]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: 'Employee Name : ' + (data.signerName || '') },
                                    { text: 'Date : ' + (data.currentDate || '') },
                                    { text: 'Signature : _________________' }
                                ],
                                margin: [0, 30, 0, 0]
                            }
                        ]
                    }
                ],

                "PSN_WorkScheduleChange": [
                    {
                        text: 'Private and Confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To:       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE:       Work Schedule Change Notification',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence is to inform you that your work schedule will be changed effective ',
                            { text: data.changeDate || '', bold: true },
                            '. Your new work schedule details are as follows:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                text: [
                                    { text: 'Work Schedule\n', bold: true },
                                    { text: 'Working Hours\n', bold: true },
                                    { text: 'Working Days\n', bold: true },
                                    { text: 'Break Time\n', bold: true }
                                ]
                            },
                            {
                                width: '*',
                                text: [
                                    ':  ' + (data.workSchedule || '') + '\n',
                                    ':  ' + (data.workingHours || '') + '\n',
                                    ':  ' + (data.workingDays || '') + '\n',
                                    ':  ' + (data.breakTime || '') + '\n'
                                ]
                            }
                        ],
                        fontSize: 12,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Your salary and benefits will remain unchanged. It is understood that the change(s) is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                image: data.signature,
                                fit: [300, 250],
                                margin: [0, 30, 0, 0]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: 'Employee Name : ' + (data.signerName || '') },
                                    { text: 'Date : ' + (data.currentDate || '') },
                                    { text: 'Signature : _________________' }
                                ],
                                margin: [0, 30, 0, 0]
                            }
                        ]
                    }
                ],

                "PSN_WorkScheduleChange": [
                    {
                        text: 'Private and Confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To:       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE:       Work Schedule Change Notification',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'This correspondence is to inform you that your work schedule will be changed effective ',
                            { text: data.changeDate || '', bold: true },
                            '. Your new work schedule details are as follows:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                text: [
                                    { text: 'Work Schedule\n', bold: true },
                                    { text: 'Working Hours\n', bold: true },
                                    { text: 'Working Days\n', bold: true },
                                    { text: 'Break Time\n', bold: true }
                                ]
                            },
                            {
                                width: '*',
                                text: [
                                    ':  ' + (data.workSchedule || '') + '\n',
                                    ':  ' + (data.workingHours || '') + '\n',
                                    ':  ' + (data.workingDays || '') + '\n',
                                    ':  ' + (data.breakTime || '') + '\n'
                                ]
                            }
                        ],
                        fontSize: 12,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Your salary and benefits will remain unchanged. It is understood that the change(s) is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                image: data.signature,
                                fit: [300, 250],
                                margin: [0, 30, 0, 0]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: 'Employee Name : ' + (data.signerName || '') },
                                    { text: 'Date : ' + (data.currentDate || '') },
                                    { text: 'Signature : _________________' }
                                ],
                                margin: [0, 30, 0, 0]
                            }
                        ]
                    }
                ],

                "PSN_PromotionBudgeted": [
                    {
                        text: 'Private and Confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To:       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE:       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'As part of the organizations review of compensation structures, the Management has decided to ',
                            { text: 'restructure your salary', bold: true },
                            ', effective ',
                            { text: data.changeDate || '', bold: true },
                            '. Your revised salary structure and benefits shall be as follows:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                text: [
                                    { text: 'Job Title\n', bold: true },
                                    { text: 'Department\n', bold: true },
                                    { text: 'Division\n', bold: true },
                                    { text: 'Reporting Line\n', bold: true },
                                    { text: 'Grade\n\n', bold: true }
                                ]
                            },
                            {
                                width: '*',
                                text: [
                                    ':  ' + (data.jobTitle || '') + '\n',
                                    ':  ' + (data.department || '') + '\n',
                                    ':  ' + (data.division || '') + '\n',
                                    ':  ' + (data.managerName || '') + '\n',
                                    ':  ' + (data.grade || '') + '\n\n'
                                ]
                            }
                        ],
                        fontSize: 12,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text:
                            'Please note that this salary restructuring does not impact any other terms of your employment. It is understood that the change(s) in the compensation is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                image: data.signature,
                                fit: [300, 250],
                                margin: [0, 30, 0, 0]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: 'Employee Name : ' + (data.signerName || '') },
                                    { text: 'Date : ' + (data.currentDate || '') },
                                    { text: 'Signature : _________________' }
                                ],
                                margin: [0, 30, 0, 0]
                            }
                        ]
                    }
                ],

                "PSN_PromotionUnBudgeted": [
                    {
                        text: 'Private and Confidential',
                        bold: true,
                        style: 'confidential',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: data.currentDate,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'To:       Mr. ' + data.employeeName,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    {
                        text: 'RE:       Position Status Notification Change Letter',
                        bold: true,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Dear ' + data.employeeName + ',',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            'In recognition of services rendered by you to the organization, the Management is pleased to award you a promotion with effect from ',
                            { text: data.changeDate || '', bold: true },
                            '. Your new salary structure and Benefits shall be as under:\n\n'
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                text: [
                                    { text: 'Job Title\n', bold: true },
                                    { text: 'Department\n', bold: true },
                                    { text: 'Division\n', bold: true },
                                    { text: 'Reporting Line\n', bold: true },
                                    { text: 'Grade\n\n', bold: true }
                                ]
                            },
                            {
                                width: '*',
                                text: [
                                    ':  ' + (data.jobTitle || '') + '\n',
                                    ':  ' + (data.department || '') + '\n',
                                    ':  ' + (data.division || '') + '\n',
                                    ':  ' + (data.managerName || '') + '\n',
                                    ':  ' + (data.grade || '') + '\n\n'
                                ]
                            }
                        ],
                        fontSize: 12,
                        margin: [0, 0, 0, 20]
                    },
                    {
                        stack: data.baseSalary,
                        margin: [0, -15, 0, 20],
                        fontSize: 12
                    },
                    {
                        text:
                            'It is understood that the change(s) in the compensation is/are limited to what is stated in this letter only and that the remaining provisions of your employment contract continue to be effective and not affected by such an adjustment. Other terms and conditions of your employment shall be as per employment contract.',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Best Regards,',
                        margin: [0, 10, 0, 0]
                    },
                    {
                        columns: [
                            {
                                width: 'auto',
                                image: data.signature,
                                fit: [300, 250],
                                margin: [0, 30, 0, 0]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: 'Employee Name : ' + (data.signerName || '') },
                                    { text: 'Date : ' + (data.currentDate || '') },
                                    { text: 'Signature : _________________' }
                                ],
                                margin: [0, 30, 0, 0]
                            }
                        ]
                    }
                ],
            };
            return templates[eventType] || templates["PSN_PromotionBudgeted"];
        }




    };
});