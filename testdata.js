testdata = {};
testdata.raw =


    {
        raw: [{
            "fullname": "Reports.BCBS.CreditRisk:TotalAssets",
            "conceptname": "TotalAssets",
            "desc": "A measure.",
            "formula": "Total of DrawnBalance and UndrawnBalance",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance"
            ],
            "usesfilter": []
        }, {
            "fullname": "Reports.BCBS.CreditRisk:Substandard",
            "conceptname": "Substandard",
            "desc": "A measure.",
            "formula": "Derived from DrawnBalance and UndrawnBalance, filtered by Entity_Grade",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance"
            ],
            "usesfilter": [
                "Customer.Quality.Internal:Entity_Grade"
            ]
        }, {
            "fullname": "Reports.BCBS.CreditRisk:Distressed",
            "conceptname": "Distressed",
            "desc": "A measure.",
            "formula": "drawn + undrawn where restructure_flag is present",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance"
            ],
            "usesfilter": [
                "Customer.Quality.Internal:Restructure_Flag"
            ]
        }, {
            "fullname": "Reports.BCBS.CreditRisk:AtRisk",
            "conceptname": "WeightedRisk",
            "desc": "A measure.",
            "formula": "Distressed assets + arrears owing.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Reports.BCBS.CreditRisk:Distressed",
                "Core.Retail.Balances:Arrears"
            ],
            "usesfilter": []
        }, {
            "fullname": "Reports.BCBS.CreditRisk:NonPerforming",
            "conceptname": "WeightedRisk",
            "desc": "Sum of substandard and distressed exposures after deduplication.",
            "formula": "Distressed assets + substandard assets - (distressed && substandard).",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Reports.BCBS.CreditRisk:Distressed",
                "Reports.BCBS.CreditRisk:Substandard"
            ],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Balances:DrawnBalance",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "funded amount used directly.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": ["Core.Retail.Accounts:Funded"],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Balances:UndrawnBalance",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "limit - funded",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": ["Core.Retail.Accounts:Limit", "Core.Retail.Accounts:Funded"],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Balances:Arrears",
            "conceptname": "",
            "desc": "An input field of some kind.  Perhaps it is a duplicate of UndrawnBalance.",
            "formula": "accrued outstanding - limit amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": ["Core.Retail.Accounts:Limit", "Core.Retail.Accounts:Accrual"],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Accounts:Limit",
            "conceptname": "",
            "desc": "Borrowing limit associated with account.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Accounts:Accrual",
            "conceptname": "",
            "desc": "Current accrual on account including overdue payments.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Accounts:Funded",
            "conceptname": "",
            "desc": "Funded amount on the account -- this should equal the finance figure.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Customer.Quality.Internal:Entity_Grade",
            "conceptname": "",
            "desc": "Internal entity grade derived from ratings and bureau scores.",
            "formula": "Corp rating where present; else bureau score.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": ["Reference.SnP.Ratings:Rating", "Reference.Delphi.Scores:Score"],
            "usesfilter": []
        }, {
            "fullname": "Customer.Quality.Internal:Restructure_Flag",
            "conceptname": "",
            "desc": "True if .",
            "formula": "count (restructure_event) > 0 and restructure_type =~ 'R'.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": ["Core.Retail.Payments:Restructure_Event"],
            "usesfilter": ["Core.Retail.Payments:Restructure_Type"]
        }, {
            "fullname": "Reference.SnP.Ratings:Rating",
            "conceptname": "",
            "desc": "True if .",
            "formula": "out of scope",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Reference.Delphi.Scores:Score",
            "conceptname": "",
            "desc": "True if .",
            "formula": "out of scope",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Payments:Restructure_Event",
            "conceptname": "",
            "desc": "True if .",
            "formula": "out of scope",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Payments:Restructure_Type",
            "conceptname": "",
            "desc": "True if .",
            "formula": "count (restructure_event) > 0 and restructure_type =~ 'R'.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }],
        sources: [{
            "fullname": "Reference.SnP.Ratings",
            "desc": "Reference data from external source (SnP).",
            "location": "/server/folder/files/ref/snp",
            "type": "Text File",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Reference.Delphi.Scores",
            "desc": "Reference data from external source (Delphi).",
            "location": "/server/delphi/yyymm/scores",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Core.Retail.Payments",
            "desc": "Extract from payments system.",
            "location": "/server/staging/retail/payments/snapshots",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        },{
            "fullname": "Core.Retail.Balances",
            "desc": "Account balances from retail core banking systems",
            "location": "/server/folder/files/inputDynamic",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Core.Retail.Accounts",
            "desc": "Account information for retail contracts.",
            "location": "/server/folder/files/inputDynamic",
            "type": "SAS Dataset",
            "owner": "Helen Wheels",
            "dept": "Reference Data",
            "calc": "/server2/logic/stuff/"
        }, {
            "fullname": "Customer.Quality.Internal",
            "desc": "Internal customer quality measures.",
            "location": "/server/folder/files/dims",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Reports.BCBS.CreditRisk",
            "desc": "A report that is sent to auditors, governed as part of BCBS, containing retail credit risk summary information",
            "location": "/server/folder/reports/MR",
            "type": "SAS VA Dataset",
            "owner": "Len Miatena",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        }],
        terms: [{
            "code": "TotalAssets",
            "name": "Total Assets",
            "desc": "Total assets, on and off balance sheet, regardless of risk weighting.",
            "critical": ""
        }, {
            "code": "Substandard",
            "desc": "Total assets deemed substandard by risk managers.",
            "name": "Substandard Assets",
            "critical": ""
        }, {
            "code": "Distressed",
            "name": "Distressed Assets",
            "desc": "Total assets deemed distressed based on relationship manager class and payment history.",
            "critical": "Critical"
        }, {
            "code": "WeightedRisk",
            "name": "Total Weighted Risk",
            "desc": "Total assets weighted by risk classification.",
            "critical": "Critical"
        }],
        tings: [{
            "type": "Process",
            "name": "Dat"
        }]
    }