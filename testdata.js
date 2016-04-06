testdata = {};
testdata.raw =


    {
        raw: [{
            "fullname": "MIS.Mart.ExecDashboard:Retail_UpToDate",
            "conceptname": "",
            "desc": "Sum of balances not in arrears.",
            "formula": "Balance filtered by arrears amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 1,
            "usesvalue": ["MIS.Staging.Retail:DrawnBalance"],
            "usesfilter": ["MIS.Staging.Retail:DaysPastDue"]
        }, {
            "fullname": "MIS.Mart.ExecDashboard:Retail_Arrears_1M",
            "conceptname": "",
            "desc": "Sum of balances <1 month in arrears.",
            "formula": "Balance filtered by arrears amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 1,
            "usesvalue": ["MIS.Staging.Retail:DrawnBalance"],
            "usesfilter": ["MIS.Staging.Retail:DaysPastDue"]
        }, {
            "fullname": "MIS.Mart.ExecDashboard:Retail_Arrears_2M",
            "conceptname": "",
            "desc": "Sum of balances 1-2 months in arrears.",
            "formula": "Balance filtered by arrears amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 1,
            "usesvalue": ["MIS.Staging.Retail:DrawnBalance"],
            "usesfilter": ["MIS.Staging.Retail:DaysPastDue"]
        }, {
            "fullname": "MIS.Mart.ExecDashboard:Retail_Arrears_3M",
            "conceptname": "",
            "desc": "Sum of balances 3+ months in arrears.",
            "formula": "Balance filtered by arrears amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 1,
            "usesvalue": ["MIS.Staging.Retail:DrawnBalance"],
            "usesfilter": ["MIS.Staging.Retail:DaysPastDue"]
        }, {
            "fullname": "MIS.Mart.ExecDashboard:All_UpToDate",
            "conceptname": "",
            "desc": "Sum of balances not in arrears, retail and BB.",
            "formula": "Balance filtered by arrears amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 1,
            "usesvalue": ["MIS.Staging.Retail:DrawnBalance","MIS.Staging.SmallBusiness:DrawnBalance"],
            "usesfilter": ["MIS.Staging.Retail:DaysPastDue", "MIS.Staging.SmallBusiness:DaysPastDue"]
        }, {
            "fullname": "MIS.Mart.ExecDashboard:All_Arrears_1M",
            "conceptname": "",
            "desc": "Sum of balances <1 month in arrears, retail and BB.",
            "formula": "Balance filtered by arrears amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 1,
             "usesvalue": ["MIS.Staging.Retail:DrawnBalance","MIS.Staging.SmallBusiness:DrawnBalance"],
            "usesfilter": ["MIS.Staging.Retail:DaysPastDue", "MIS.Staging.SmallBusiness:DaysPastDue"]
        }, {
            "fullname": "MIS.Mart.ExecDashboard:All_Arrears_2M",
            "conceptname": "",
            "desc": "Sum of balances 1-2 months in arrears, retail and BB.",
            "formula": "Balance filtered by arrears amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 1,
            "usesvalue": ["MIS.Staging.Retail:DrawnBalance","MIS.Staging.SmallBusiness:DrawnBalance"],
            "usesfilter": ["MIS.Staging.Retail:DaysPastDue", "MIS.Staging.SmallBusiness:DaysPastDue"]
        }, {
            "fullname": "MIS.Mart.ExecDashboard:All_Arrears_3M",
            "conceptname": "",
            "desc": "Sum of balances 3+ months in arrears, retail and BB.",
            "formula": "Balance filtered by arrears amount.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 1,
            "usesvalue": ["MIS.Staging.Retail:DrawnBalance","MIS.Staging.SmallBusiness:DrawnBalance"],
            "usesfilter": ["MIS.Staging.Retail:DaysPastDue", "MIS.Staging.SmallBusiness:DaysPastDue"]
        }, {
            "fullname": "MIS.Staging.Retail:DrawnBalance",
            "conceptname": "",
            "desc": "Loan drawn balance after manual adjustment.",
            "formula": "Balance plus adjustment.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Retail.Balances:DrawnBalance"],
            "usesfilter": []
        }, {
            "fullname": "MIS.Staging.SmallBusiness:DrawnBalance",
            "conceptname": "",
            "desc": "Loan drawn balance for small businesses.",
            "formula": "Balance plus adjustment.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Retail.Balances:DrawnBalance", "MIS.Staging.SB_Adjust:DrawnBalance"],
            "usesfilter": []
        }, {
            "fullname": "MIS.Staging.SB_Adjust:DrawnBalance",
            "conceptname": "",
            "desc": "Adjustments to balances reflecting forbearances, writeoffs, etc.  Delivered via email from relationship managers.",
            "formula": "",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "MIS.Staging.SmallBusiness:DaysPastDue",
            "conceptname": "",
            "desc": "Number of business days since last required complete payment.",
            "formula": "Taken directly from balances Last Payment Date.",
            "type": "Enumeration",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Retail.Balances:LastPaymentDate"],
            "usesfilter": []
        }, {
            "fullname": "MIS.Staging.Retail:DaysPastDue",
            "conceptname": "",
            "desc": "Number of business days since last required complete payment.",
            "formula": "Taken directly from balances Last Payment Date.",
            "type": "Enumeration",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Retail.Balances:LastPaymentDate"],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Balances:LastPaymentDate",
            "conceptname": "",
            "desc": "Number of business days since last required complete payment.",
            "formula": "Function of current month end and last payment date.",
            "type": "Enumeration",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Retail.Accounts:LastPaymentDate"],
            "usesfilter": []
        }, {
            "fullname": "MIS.Mart.CustomerReport:Exposure",
            "conceptname": "",
            "desc": "Measure: exposure amount.",
            "formula": "Any exposure in Balances is copied to the datamart.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 2,
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance",
                "Core.Retail.Balances:BalanceID"
            ],
            "usesfilter": []
        }, {
            "fullname": "MIS.Mart.CustomerReport:Drawn",
            "conceptname": "",
            "desc": "Dimension: drawn/undrawn flag.",
            "formula": "Depends on which Balances field the balance was taken from.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 2,
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:BalanceID"
            ],
            "usesfilter": []
        }, {
            "fullname": "MIS.Mart.CustomerReport:ClientType",
            "conceptname": "",
            "desc": "Dimension: individual/business flag.",
            "formula": "Keyed by balance ID.  Depends on which customer data source the  ID is found in.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 2,
            "usesvalue": [
                "ClientData.Individuals:Segment",
                "ClientData.SmallBusiness:Segment",
                ],
            "usesfilter": [
                "ClientData.Individuals:Cust_ID",
                "ClientData.SmallBusiness:Client_ID",
                "Core.Retail.Balances:BalanceID"
                ]
        }, {
            "fullname": "MIS.Mart.CustomerReport:ClientQuality",
            "conceptname": "",
            "desc": "Dimension: internal quality level.",
            "formula": "Internal Quality taken from refernce data.  For small businesses, ultimate parent entity is used.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 2,
            "usesvalue": ["CustQuality.Internal:Entity_Grade"],
            "usesfilter": [
                "ClientData.Individuals:Cust_ID",
                "ClientData.SmallBusiness:Client_ID",
                "Core.Retail.Balances:BalanceID"
                ]
        }, {
            "fullname": "MIS.Mart.CustomerReport:Region",
            "conceptname": "",
            "desc": "Dimension: region that contains customer's address.",
            "formula": "Regions are based on postcodes.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 2,
            "usesvalue": ["ClientData.Individuals:Postcode",
                "ClientData.SmallBusiness:Postcode"],
            "usesfilter": [
                ]
        },{
            "fullname": "MIS.Mart.CustomerReport:Name",
            "conceptname": "",
            "desc": "Attribute: name of the account holder.",
            "formula": "Taken directly from ref data systems.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 2,
            "usesvalue": ["ClientData.Individuals:Name",
                "ClientData.SmallBusiness:Name"],
            "usesfilter": [
                ]
        },{
            "fullname": "ClientData.Individuals:Cust_ID",
            "conceptname": "",
            "desc": "Primary key in client data system.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        },{
            "fullname": "ClientData.SmallBusiness:Client_ID",
            "conceptname": "",
            "desc": "Primary key in business client data system.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "ClientData.Individuals:Postcode",
            "conceptname": "",
            "desc": "Postcode of the individual.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.1,
            "usesvalue": [],
            "usesfilter": []
        },{
            "fullname": "ClientData.SmallBusiness:Postcode",
            "conceptname": "",
            "desc": "Postcode of the business.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.1,
            "usesvalue": [],
            "usesfilter": []
        },  {
            "fullname": "ClientData.Individuals:Segment",
            "conceptname": "",
            "desc": "Segment (Mass/affluent/semi).",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.1,
            "usesvalue": [],
            "usesfilter": []
        },{
            "fullname": "ClientData.SmallBusiness:Segment",
            "conceptname": "",
            "desc": "Segment (soleTrader/micro/small).",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.1,
            "usesvalue": [],
            "usesfilter": []
        },  {
            "fullname": "ClientData.Individuals:Name",
            "conceptname": "",
            "desc": "Name of the individual.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.1,
            "usesvalue": [],
            "usesfilter": []
        },{
            "fullname": "ClientData.SmallBusiness:Name",
            "conceptname": "",
            "desc": "Name of the business.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.1,
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Balances:BalanceID",
            "conceptname": "",
            "desc": "Primary key for account balances throughout retail.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        },  {
            "fullname": "MIS.Mart.AssetBreakdown:TotalAssets",
            "conceptname": "TotalAssets",
            "desc": "Total assets including drawn and undrawn.",
            "formula": "Total of DrawnBalance and UndrawnBalance",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 3,
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance"
            ],
            "usesfilter": []
        }, {
            "fullname": "MIS.Mart.AssetBreakdown:Substandard",
            "conceptname": "Substandard",
            "desc": "Total substandard assets, where internal entity grade is used to determine substandardness.",
            "formula": "DrawnBalance + UndrawnBalance where Entity_Grade == 'SUB'",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 3,
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance"
            ],
            "usesfilter": [
                "CustQuality.Internal:Entity_Grade"
            ]
        }, {
            "fullname": "MIS.Mart.AssetBreakdown:Distressed",
            "conceptname": "Distressed",
            "desc": "Total distressed assets, where 'distress' is determined from Restruct process output.",
            "formula": "drawn + undrawn where Restruct_flag is present",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 3,
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance"
            ],
            "usesfilter": [
                "CustQuality.Internal:Restruct_Flag"
            ]
        }, {
            "fullname": "MIS.Mart.AssetBreakdown:AtRisk",
            "conceptname": "WeightedRisk",
            "desc": "Total assets considered 'at risk' in FDF3 terms, including balances and arrears.",
            "formula": "fdf3(distressed assets, arrears owing).",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 3,
            "usesvalue": [
                "MIS.Mart.AssetBreakdown:Distressed",
                "Core.Retail.Balances:Arrears"
            ],
            "usesfilter": []
        }, {
            "fullname": "MIS.Mart.AssetBreakdown:NonPerf",
            "conceptname": "WeightedRisk",
            "desc": "Sum of substandard and distressed exposures after deduplication.",
            "formula": "Distressed assets + substandard assets - (distressed && substandard).",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 3,
            "usesvalue": [
                "MIS.Mart.AssetBreakdown:Distressed",
                "MIS.Mart.AssetBreakdown:Substandard"
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
            "flags": "",
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
            "flags": "",
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
            "flags": "",
            "usesvalue": ["Core.Retail.Accounts:Limit", "Core.Retail.Accounts:MonthlyPayment", "Core.Retail.Calculated:Overdue"],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Accounts:Limit",
            "conceptname": "",
            "desc": "Borrowing limit associated with account.",
            "formula": "Taken from CBS.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.05,
            "adjustment": "Adjust_Limits",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Accounts:MonthlyPayment",
            "conceptname": "",
            "desc": "Current accrual on account including overdue payments.",
            "formula": "Taken from CBS.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.15,
            "usesvalue": ["Core.Systems.Records:Coupon"],
            "usesfilter": ["Core.Systems.Transactions:CustID", "Core.Systems.Transactions:Flags", "Core.Systems.Transactions:ProductID"]
        }, {
            "fullname": "Core.Retail.Accounts:LastPaymentDate",
            "conceptname": "",
            "desc": "Date of last payment.",
            "formula": "Taken from CBS.",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Systems.Transactions:Event", "Core.Systems.Transactions:Timestamp"],
            "usesfilter": ["Core.Systems.Transactions:CustID", "Core.Systems.Transactions:Flags", "Core.Systems.Transactions:ProductID", "Core.Systems.Transactions:EventType"]
        }, {
            "fullname": "Core.Retail.Accounts:PaymentSchedule",
            "conceptname": "",
            "desc": "Set of flags describing payment calendar.",
            "formula": "Taken from CBS.",
            "type": "Enumeration",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Systems.Records:Schedule"],
            "usesfilter": ["Core.Systems.Records:CustID", "Core.Systems.Records:AcctID","Core.Systems.Transactions:CustID", "Core.Systems.Transactions:Flags", "Core.Systems.Transactions:ProductID"]
        }, {
            "fullname": "Core.Retail.Accounts:Funded",
            "conceptname": "",
            "desc": "Funded amount on the account -- this should equal the finance figure.",
            "formula": "",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "quality": 1.05,
            "usesvalue": ["Core.Systems.Transactions:Amt"],
            "usesfilter": ["Core.Systems.Transactions:CustID", "Core.Systems.Transactions:Flags", "Core.Systems.Transactions:ProductID"]
        }, {
            "fullname": "Core.Retail.Calculated:Overdue",
            "conceptname": "",
            "desc": "Overdue amount taking partial payments into account.",
            "formula": "",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Retail.Accounts:MonthlyPayment"],
            "usesfilter": ["Core.Retail.Accounts:PaymentSchedule"]
        }, {
            "fullname": "CustQuality.Internal:Entity_Grade",
            "conceptname": "",
            "desc": "Internal entity grade derived from ratings and bureau scores.",
            "formula": "Taken from provisional grade after manual adjustment.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "adjustment": "Adjust_Grade",
            "usesvalue": ["CustQuality.Internal:Provisional_Grade"],
            "usesfilter": []
        }, {
            "fullname": "CustQuality.Internal:Provisional_Grade",
            "conceptname": "",
            "desc": "Provisional internal entity grade derived from ratings and bureau scores.",
            "formula": "Corp rating where present; else bureau score.  Sometimes a manually entered value is used.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "comment": "Subject to manual overrides.",
            "usesvalue": ["Reference.SnP.Ratings:Rating", "Reference.Delphi.Scores:Score"],
            "usesfilter": []
        }, {
            "fullname": "CustQuality.Internal:Restruct_Flag",
            "conceptname": "",
            "desc": "True if .",
            "formula": "count (Restruct_event) > 0 and Restruct_type =~ 'R'.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Refin.Retail.Restruct:Restruct_Event"],
            "usesfilter": ["Refin.Retail.Restruct:Restruct_Type"]
        }, {
            "fullname": "Reference.SnP.Ratings:Rating",
            "conceptname": "",
            "desc": "SnP simple rating as of previous EOD.",
            "formula": "",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Reference.Agency.Files:RecordValue"],
            "usesfilter": ["Reference.Agency.Files:FileID", "Reference.Agency.Files:RecordID", "Reference.Agency.Files:Source"]
        }, {
            "fullname": "Reference.Delphi.Scores:Score",
            "conceptname": "",
            "desc": "Delphi base customer credit score as of previous EOD.",
            "formula": "",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Reference.Agency.Files:RecordValue"],
            "usesfilter": ["Reference.Agency.Files:FileID", "Reference.Agency.Files:RecordID", "Reference.Agency.Files:Source"]
        }, {
            "fullname": "Reference.Agency.Files:FileID",
            "conceptname": "",
            "desc": "ID of an instance of an agency data file.",
            "formula": "Arrives via FileNet from outside the department.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Reference.Agency.Files:RecordID",
            "conceptname": "",
            "desc": "ID of a row in an agency data file.",
            "formula": "Arrives via FileNet from outside the department.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Reference.Agency.Files:RecordValue",
            "conceptname": "",
            "desc": "Value of a row of an agency data file.",
            "formula": "Arrives via FileNet from outside the department.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Reference.Agency.Files:Source",
            "conceptname": "",
            "desc": "Entity code of the sender of an agency file.",
            "formula": "Arrives via FileNet from outside the department.",
            "type": "Enumeration",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Refin.Retail.Restruct_Mods:Modif_Event",
            "conceptname": "",
            "desc": "Date of last modification to contract terms.",
            "formula": "uses not Modif_date but novation_reason for legacy reasons. ",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "from": "1/2/2016",
            "to": "1/1/2999",
            "usesvalue": ["Core.Contracts.History:Modif_Date"],
            "usesfilter": ["Core.Contracts.History:Novation_Reason"]
        }, {
            "fullname": "Refin.Retail.Restruct:Restruct_Event",
            "conceptname": "",
            "desc": "Date of last Restruct event.  Sometimes overridden with 'modification event' date for legacy reasons.",
            "formula": "",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "from": "1/1/1999",
            "to": "1/1/2016",
            "flags": "",
            "risk":0.5,
            "usesvalue": ["Core.Contracts.History:Novation_Date","Core.Contracts.History:Modif_Date"],
            "usesfilter": ["Core.Contracts.History:Novation_Reason"]
        }, {
            "fullname": "Refin.Retail.Restruct:Restruct_Event",
            "conceptname": "",
            "desc": "Date of last Restruct event.  Sometimes overridden with 'modification event' date for legacy reasons.",
            "formula": "",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "from": "1/2/2016",
            "to": "1/1/2999",
            "flags": "",
            "usesvalue": ["Core.Contracts.History:Novation_Date","Refin.Retail.Restruct_Mods:Modif_Event"],
            "usesfilter": ["Core.Contracts.History:Novation_Reason"]
        }, {
            "fullname": "Refin.Retail.Restruct:Restruct_Type",
            "conceptname": "",
            "desc": "Flag indicating type of Restruct.",
            "formula": "case when novation_reason = RST then RST when novation_reason = RNR then FORB default OTHER end",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Contracts.History:Novation_Reason"],
            "usesfilter": []
        }, {
            "fullname": "Core.Contracts.History:Novation_Reason",
            "conceptname": "",
            "desc": "Reason for last contract renegotiation.",
            "formula": "",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Systems.Records:Comments"],
            "usesfilter": ["Core.Systems.Records:AcctID", "Core.Systems.Records:CustID", "Core.Systems.Records:Version"]
        }, {
            "fullname": "Compliance.BCBS.CreditRisk:TotalNonPerf",
            "conceptname": "TotalNonPerf",
            "desc": "Total non-performing assets.",
            "formula": "Passed through directly.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 5,
            "usesvalue": ["MIS.Mart.AssetBreakdown:NonPerf"],
            "usesfilter": []
        }, {
            "fullname": "Compliance.BCBS.CreditRisk:TotalAssets",
            "conceptname": "TotalAssets",
            "desc": "Total assets.",
            "formula": "Passed through directly.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 5,
            "usesvalue": ["MIS.Mart.AssetBreakdown:TotalAssets"],
            "usesfilter": []
        }, {
            "fullname": "Compliance.BCBS.CreditRisk:TotalUpToDate",
            "conceptname": "TotalUpToDate",
            "desc": "Total up-to-date assets.",
            "formula": "Taken from dashboard directly.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 5,
            "usesvalue": ["MIS.Mart.ExecDashboard:All_UpToDate"],
            "usesfilter": []
        }, {
            "fullname": "Compliance.BCBS.CreditRisk:TotalArrears",
            "conceptname": "TotalArrears",
            "desc": "Total assets that are in arrears.",
            "formula": "Sum of arrears fields from the dashboard.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "importance": 5,
            "usesvalue": ["MIS.Mart.ExecDashboard:All_Arrears_1M","MIS.Mart.ExecDashboard:All_Arrears_2M","MIS.Mart.ExecDashboard:All_Arrears_3M"],
            "usesfilter": []
        }, {
            "fullname": "Core.Contracts.History:Novation_Date",
            "conceptname": "",
            "desc": "Date of last contract renegotiation.",
            "formula": "",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Systems.Records:Event"],
            "usesfilter": ["Core.Systems.Records:AcctID", "Core.Systems.Records:CustID", "Core.Systems.Records:EventType"]
        }, {
            "fullname": "Core.Contracts.History:Modif_Date",
            "conceptname": "",
            "desc": "Date of last contract renegotiation.",
            "formula": "",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "from": "1/1/1999",
            "to": "1/1/2016",
            "usesvalue": ["Core.Systems.Records:Event", "Core.Contracts.Adjustments:Last_Adjust_Date"],
            "usesfilter": ["Core.Systems.Records:AcctID", "Core.Systems.Records:CustID", "Core.Systems.Records:EventType"]
        },{
            "fullname": "Core.Contracts.History:Modif_Date",
            "conceptname": "",
            "desc": "Date of last contract renegotiation.",
            "formula": "",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "from": "1/2/2016",
            "to": "1/1/2999",
            "usesvalue": ["Core.Systems.Records:Event"],
            "usesfilter": ["Core.Systems.Records:AcctID", "Core.Systems.Records:CustID", "Core.Systems.Records:EventType"]
        },{
            "fullname": "Core.Contracts.Adjustments:Last_Adjust_Date",
            "conceptname": "",
            "desc": "Date of last contract renegotiation, manually entered outside contract system.",
            "formula": "",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "risk": 1,
            "from": "1/1/1999",
            "to": "1/1/2016",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Transactions:CustID",
            "conceptname": "",
            "desc": "Customer id.",
            "formula": "Mainframe processes.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Transactions:ProductID",
            "conceptname": "",
            "desc": "Product id used to relate transaction to contract.",
            "formula": "Mainframe processes.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Transactions:Flags",
            "conceptname": "",
            "desc": "Poorly-understood set of bits associated with each transation.  Needs to be documented.",
            "formula": "Mainframe processes.",
            "type": "bitfield",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "risk":0.5,
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Transactions:Event",
            "conceptname": "",
            "desc": "Transaction details encoded into a string.",
            "formula": "Mainframe processes.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Transactions:EventType",
            "conceptname": "",
            "desc": "Bitfield describing contents of Event string.",
            "formula": "Mainframe processes.",
            "type": "bitfield",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Transactions:Timestamp",
            "conceptname": "",
            "desc": "Timestamp as 32bit value.",
            "formula": "Mainframe processes.",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Transactions:Amt",
            "conceptname": "",
            "desc": "Money amount of transaction in EUR.",
            "formula": "Mainframe processes.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:Event",
            "conceptname": "",
            "desc": "Event details encoded as a string.",
            "formula": "Mainframe processes.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "from": "1/2/2016",
            "to": "1/1/2999",
            "flags": "",
            "risk": 0.2,
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:Event",
            "conceptname": "",
            "desc": "Event details encoded as a string.",
            "formula": "Mainframe processes.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "from": "1/1/1999",
            "to": "1/1/2016",
            "flags": "",
            "risk": 0.5,
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:Coupon",
            "conceptname": "",
            "desc": "Coupon of a generalized debt.",
            "formula": "Mainframe processes.",
            "type": "Number",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:Comments",
            "conceptname": "",
            "desc": "Comment field containing relationship manager's remarks.",
            "formula": "Mainframe processes.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:Version",
            "conceptname": "",
            "desc": "Version identified for documents.",
            "formula": "Mainframe processes.",
            "type": "Number",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:CustID",
            "conceptname": "",
            "desc": "Customer ID.",
            "formula": "Mainframe processes.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:AcctID",
            "conceptname": "",
            "desc": "Account ID.",
            "formula": "Mainframe processes.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:EventType",
            "conceptname": "",
            "desc": "Event type bitfield used to interpret event string.",
            "formula": "Mainframe processes.",
            "type": "Bitfield",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Systems.Records:Schedule",
            "conceptname": "",
            "desc": "Payment schedule details encoded into a string.",
            "formula": "Mainframe processes.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }],
        sources: [{
            "fullname": "MIS.Staging.Retail",
            "desc": "Staging area for retail dashboard fields.",
            "location": "/va_server/hdfs_export/datamarts/cr",
            "type": "SAS VA",
            "owner": "Amos_Quito",
            "dept": "Credit_Risk",
            "calc": "/server2/code/bi_code",
            "latency": 1
        }, {
            "fullname": "MIS.Staging.Retail",
            "desc": "Staging area for retail dashboard fields.",
            "location": "/va_server/hdfs_export/datamarts/cr",
            "type": "SAS VA",
            "owner": "Amos_Quito",
            "dept": "Credit_Risk",
            "calc": "/server2/code/bi_code",
            "latency": 1
        }, {
            "fullname": "MIS.Staging.SmallBusiness",
            "desc": "Staging area for BB dashboard fields.",
            "location": "/va_server/hdfs_export/datamarts/cr",
            "type": "SAS VA",
            "owner": "Amos_Quito",
            "dept": "Credit_Risk",
            "calc": "/server2/code/bi_code",
            "latency": 1
        }, {
            "fullname": "MIS.Staging.SB_Adjust",
            "desc": "Adjustments file brought in to fix up dashboard.",
            "location": "P:/crmaterial/monthly/adjustments_sheets",
            "type": "Excel",
            "owner": "n/a",
            "dept": "Credit_Risk",
            "calc": "n/a",
            "risk": 2,
            "notbefore": 6
        }, {
            "fullname": "MIS.Mart.ExecDashboard",
            "desc": "Senior management dashboard.",
            "location": "/va_server/hdfs_export/datamarts/cr",
            "type": "SAS VA",
            "owner": "Amos_Quito",
            "dept": "Credit_Risk",
            "calc": "/server2/code/bi_code",
            "latency": 1
        }, {
            "fullname": "MIS.Mart.CustomerReport",
            "desc": "Data mart for ad-hoc queries as part of BCBS 239 response.",
            "location": "/va_server/hdfs_export/datamarts/cr",
            "type": "SAS VA",
            "owner": "Amos_Quito",
            "dept": "Credit_Risk",
            "calc": "/server2/code/bi_code",
            "latency": 1
        }, {
            "fullname": "Core.Systems.Transactions",
            "desc": "Core mainframe banking system for UK retail.",
            "location": "%%EBC01%AC1",
            "type": "DB2 Table",
            "owner": "Rick_Mansworth",
            "dept": "Banking",
            "calc": "mainframe"
        }, {
            "fullname": "Core.Systems.Records",
            "desc": "Books and records mainframe storage.",
            "location": "5%EBC01%AC2",
            "type": "DB2 Table",
            "owner": "Rick_Mansworth",
            "dept": "Banking",
            "calc": "mainframe"
        }, {
            "fullname": "ClientData.Individuals",
            "desc": "Customer personal data.",
            "location": "/server2/customer_data",
            "type": "SAS Dataset",
            "owner": "Mandy_Harpoons",
            "dept": "Customer_Mgmt",
            "calc": "/server2/code/etl_stuff",
            "notbefore": 1
        }, {
            "fullname": "ClientData.SmallBusiness",
            "desc": "Small business data.",
            "location": "/server2/customer_data",
            "type": "SAS Dataset",
            "owner": "Mandy_Harpoons",
            "dept": "Customer_Mgmt",
            "calc": "/server2/code/etl_stuff",
            "notbefore": 2
        }, {
            "fullname": "Reference.ClientData.Hierarchy",
            "desc": "Business hierarchy for small corp clients, taken from bureau files.",
            "location": "/server/customer/ref/spreadsheets",
            "type": "Excel",
            "owner": "Mandy_Harpoons",
            "dept": "Reference_Data",
            "calc": "/server2/code/etl_stuff",
            "notbefore": 1
        }, {
            "fullname": "Reference.SnP.Ratings",
            "desc": "Reference data from external source (SnP).",
            "location": "/server/folder/files/ref/snp",
            "type": "Text File",
            "owner": "Madison_Avenue",
            "dept": "Reference_Data",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Reference.Delphi.Scores",
            "desc": "Reference data from external source (Delphi).",
            "location": "/server/delphi/yyymm/scores",
            "type": "SAS Dataset",
            "owner": "Madison_Avenue",
            "dept": "Reference_Data",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Reference.Agency.Files",
            "desc": "This asset represents a set of files recieved daily or monthly from various external agencies.",
            "location": "/server/files/mmmyy",
            "type": "Text File",
            "owner": "Hudley_Pierce",
            "dept": "Reference_Data",
            "calc": "/server/files/shipment/rules",
            "notbefore": 2
        }, {
            "fullname": "Refin.Retail.Restruct_Mods",
            "desc": "Restruct information around account modifications.",
            "location": "/server/staging/retail/restr/mods",
            "type": "SAS Dataset",
            "owner": "Madison_Avenue",
            "dept": "Banking",
            "calc": "/server/folder/scripts/calcStuff",
            "latency": 1,
            "process": "Proc_Refinancing",
            "comment": "Refinancing data assets are considered risky due to the complex manual processes involved."
        },{
            "fullname": "Refin.Retail.Restruct",
            "desc": "Extract from payments system.",
            "location": "/server/staging/retail/restr/snapshots",
            "type": "SAS Dataset",
            "owner": "Madison_Avenue",
            "dept": "Banking",
            "calc": "/server/folder/scripts/calcStuff",
            "latency": 1,
            "process": "Proc_Refinancing"
        },{
            "fullname": "Core.Retail.Balances",
            "desc": "Account balances from retail core banking systems",
            "location": "/server/folder/files/inputDynamic",
            "type": "SAS Dataset",
            "owner": "Madison_Avenue",
            "dept": "Banking",
            "calc": "/server/folder/scripts/calcStuff",
            "latency": 1
        }, {
            "fullname": "Core.Retail.Accounts",
            "desc": "Account information for retail contracts.",
            "location": "CBS01//t_acct",
            "type": "Oracle table",
            "owner": "Helen_Wheels",
            "dept": "Banking",
            "calc": "CBS01//CBSUSER//p_acct_update",
            "latency": 1
        },{
            "fullname": "Compliance.BCBS.CreditRisk",
            "desc": "Final summary output for BCBS RDA compliance.",
            "location": "//reports/shipment/outbound",
            "type": "PDF",
            "owner": "Isabel_Pon",
            "dept": "Compliance",
            "calc": "//reports/compliance",
            "latency":1
        },{
            "fullname": "Core.Contracts.History",
            "desc": "Contract terms information for retail contracts.",
            "location": "/server/folder/files/terms",
            "type": "SAS Dataset",
            "owner": "Helen_Wheels",
            "dept": "Banking",
            "calc": "/server2/logic/stuff/",
            "notbefore": 1
        }, {
            "fullname": "Core.Contracts.Adjustments",
            "desc": "Manual additions to contract history, collected outside the contract system.",
            "location": "/server/folder/additional/files",
            "type": "Excel",
            "owner": "Helen_Wheels",
            "dept": "Banking",
            "calc": "n/a",
            "notbefore": 3
        }, {
            "fullname": "Core.Retail.Calculated",
            "desc": "Table in the retail Oracle db that contains calculated values relating to arrears.",
            "location": "CBS01//t_acct",
            "type": "Oracle table",
            "owner": "Helen_Wheels",
            "dept": "Banking",
            "calc": "CBS01//CBSUSER//p_overdue_update",
            "notbefore": 1
        }, {
            "fullname": "CustQuality.Internal",
            "desc": "Internal customer quality measures.",
            "location": "/server/folder/files/dims",
            "type": "SAS Dataset",
            "owner": "Madison_Avenue",
            "dept": "Customer_Mgmt",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "MIS.Mart.AssetBreakdown",
            "desc": "A report that is sent to auditors, governed as part of BCBS, containing retail credit risk summary information",
            "location": "/server/folder/reports/MR",
            "type": "SAS VA",
            "owner": "Len_Miatena",
            "dept": "Credit_Risk",
            "calc": "/server/folder/scripts/calcStuff",
            "latency": 1
        }],
        terms: [{
            "code": "TotalAssets",
            "name": "Total Assets",
            "desc": "Total assets, on and off balance sheet, regardless of risk weighting.",
            "flags": "critical"
        }, {
            "code": "Substandard",
            "desc": "Total assets deemed substandard by risk managers.",
            "name": "Substandard Assets",
            "flags": "critical"
        }, {
            "code": "Distressed",
            "name": "Distressed Assets",
            "desc": "Total assets deemed distressed based on relationship manager class and payment history.",
            "flags": ""
        }, {
            "code": "WeightedRisk",
            "name": "Total Weighted Risk",
            "desc": "Total assets weighted by risk classification.",
            "flags": ""
        }, {
            "code": "TotalArrears",
            "name": "Total Assets in Arrears",
            "desc": "Total assets that are currently in arrears.",
            "flags": ""
        }, {
            "code": "TotalUpToDate",
            "name": "Total Up-to-Date",
            "desc": "Total assets that are not currently in arrears.",
            "flags": ""
        }, {
            "code": "TotalNonPerf",
            "name": "Total Non-Performing",
            "desc": "Total assets that are deemed non-performing.",
            "flags": ""
        }]
    }