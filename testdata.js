testdata = {};
testdata.raw =


    {
        raw: [{
            "fullname": "MIS.BCBS.CreditRisk:Exposure",
            "conceptname": "",
            "desc": "Measure: exposure amount.",
            "formula": "Any exposure in Balances is copied to the datamart.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance",
                "Core.Retail.Balances:BalanceID"
            ],
            "usesfilter": []
        }, {
            "fullname": "MIS.BCBS.CreditRisk:Drawn",
            "conceptname": "",
            "desc": "Dimension: drawn/undrawn flag.",
            "formula": "Depends on which Balances field the balance was taken from.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance",
                "Core.Retail.Balances:BalanceID"
                ]
        }, {
            "fullname": "MIS.BCBS.CreditRisk:ClientType",
            "conceptname": "",
            "desc": "Dimension: individual/business flag.",
            "formula": "Keyed by balance ID.  Depends on which customer data source the  ID is found in.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": [
                "Customer.ClientData.Individuals:Cust_ID",
                "Customer.ClientData.SmallBusiness:Client_ID",
                "Core.Retail.Balances:BalanceID"
                ]
        }, {
            "fullname": "MIS.BCBS.CreditRisk:ClientQuality",
            "conceptname": "",
            "desc": "Dimension: internal quality level.",
            "formula": "Internal Quality taken from refernce data.  For small businesses, ultimate parent entity is used.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": [
                "Customer.Quality.Internal:Entity_Grade",
                "Core.Retail.Balances:BalanceID"
                ]
        }, {
            "fullname": "MIS.BCBS.CreditRisk:Region",
            "conceptname": "",
            "desc": "Dimension: region that contains customer's address.",
            "formula": "Regions are based on postcodes.",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Customer.ClientData.Individuals:Postcode",
                "Customer.ClientData.SmallBusiness:Postcode",],
            "usesfilter": [
                ]
        },{
            "fullname": "MIS.BCBS.CreditRisk:Name",
            "conceptname": "",
            "desc": "Attribute: name of the account holder.",
            "formula": "Taken directly from ref data systems.",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Customer.ClientData.Individuals:Name",
                "Customer.ClientData.SmallBusiness:Name",],
            "usesfilter": [
                ]
        },{
            "fullname": "Customer.ClientData.Individuals:Cust_ID",
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
            "fullname": "Customer.ClientData.SmallBusiness:Client_ID",
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
            "fullname": "Customer.ClientData.Individuals:Postcode",
            "conceptname": "",
            "desc": "Postcode of the individual.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        },{
            "fullname": "Customer.ClientData.SmallBusiness:Postcode",
            "conceptname": "",
            "desc": "Postcode of the business.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        },  {
            "fullname": "Customer.ClientData.Individuals:Name",
            "conceptname": "",
            "desc": "Name of the individual.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        },{
            "fullname": "Customer.ClientData.SmallBusiness:Name",
            "conceptname": "",
            "desc": "Name of the business.",
            "formula": "from upstream systems",
            "type": "String",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
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
            "fullname": "Reports.BCBS.CreditRisk:TotalAssets",
            "conceptname": "TotalAssets",
            "desc": "Total assets including drawn and undrawn.",
            "formula": "Total of DrawnBalance and UndrawnBalance",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [
                "Core.Retail.Balances:DrawnBalance",
                "Core.Retail.Balances:UndrawnBalance"
            ],
            "usesfilter": []
        }, {
            "fullname": "Reports.BCBS.CreditRisk:Substandard",
            "conceptname": "Substandard",
            "desc": "Total substandard assets, where internal entity grade is used to determine substandardness.",
            "formula": "DrawnBalance + UndrawnBalance where Entity_Grade == 'SUB'",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
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
            "desc": "Total distressed assets, where 'distress' is determined from restructuring process output.",
            "formula": "drawn + undrawn where restructure_flag is present",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
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
            "desc": "Total assets considered 'at risk' in FDF3 terms, including balances and arrears.",
            "formula": "fdf3(distressed assets, arrears owing).",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
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
            "flags": "",
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
            "usesvalue": ["Core.Retail.Accounts:Limit", "Core.Retail.Accounts:Accrual"],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Accounts:Limit",
            "conceptname": "",
            "desc": "Borrowing limit associated with account.",
            "formula": "",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Accounts:Accrual",
            "conceptname": "",
            "desc": "Current accrual on account including overdue payments.",
            "formula": "",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Retail.Accounts:Funded",
            "conceptname": "",
            "desc": "Funded amount on the account -- this should equal the finance figure.",
            "formula": "",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Customer.Quality.Internal:Entity_Grade",
            "conceptname": "",
            "desc": "Internal entity grade derived from ratings and bureau scores.",
            "formula": "Taken from provisional grade after manual adjustment.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Customer.Quality.Internal:Provisional_Entity_Grade"],
            "usesfilter": []
        }, {
            "fullname": "Customer.Quality.Internal:Provisional_Entity_Grade",
            "conceptname": "",
            "desc": "Provisional internal entity grade derived from ratings and bureau scores.",
            "formula": "Corp rating where present; else bureau score.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
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
            "flags": "",
            "usesvalue": ["Refinancing.Retail.Restructuring:Restructure_Event"],
            "usesfilter": ["Refinancing.Retail.Restructuring:Restructure_Type"]
        }, {
            "fullname": "Reference.SnP.Ratings:Rating",
            "conceptname": "",
            "desc": "SnP simple rating as of previous EOD.",
            "formula": "",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Reference.Delphi.Scores:Score",
            "conceptname": "",
            "desc": "Delphi base customer credit score as of previous EOD.",
            "formula": "",
            "type": "Enum",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Refinancing.Retail.Restructuring_Mods:Modification_Event",
            "conceptname": "",
            "desc": "Date of last modification to contract terms.",
            "formula": "uses modification_date but novation_reason for legacy reasons. ",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Contracts.History:Modification_Date"],
            "usesfilter": ["Core.Contracts.History:Novation_Reason"]
        }, {
            "fullname": "Refinancing.Retail.Restructuring:Restructure_Event",
            "conceptname": "",
            "desc": "Date of last restructuring event.  Sometimes overridden with 'modification event' date for legacy reasons.",
            "formula": "Unknown",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": ["Core.Contracts.History:Novation_Date","Refinancing.Retail.Restructuring_Mods:Modification_Event"],
            "usesfilter": ["Core.Contracts.History:Novation_Reason"]
        }, {
            "fullname": "Refinancing.Retail.Restructuring:Restructure_Type",
            "conceptname": "",
            "desc": "Flag indicating type of restructuring.",
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
            "usesvalue": [],
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
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Core.Contracts.History:Modification_Date",
            "conceptname": "",
            "desc": "Date of last contract renegotiation.",
            "formula": "unknown",
            "type": "Date",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "flags": "",
            "usesvalue": [],
            "usesfilter": []
        }],
        sources: [{
            "fullname": "MIS.BCBS.CreditRisk",
            "desc": "Data mart for ad-hoc queries as part of BCBS 239 response.",
            "location": "/va_server/hdfs_export/datamarts/cr",
            "type": "SAS VA Dataset",
            "owner": "Amos Quito",
            "dept": "Credit Risk",
            "calc": "/server2/code/bi_code"
        }, {
            "fullname": "Customer.ClientData.Individuals",
            "desc": "Customer personal data.",
            "location": "/server2/customer_data",
            "type": "SAS Dataset",
            "owner": "Mandy Harpoons",
            "dept": "Customer Mgmt",
            "calc": "/server2/code/etl_stuff"
        }, {
            "fullname": "Customer.ClientData.SmallBusiness",
            "desc": "Small business data.",
            "location": "/server2/customer_data",
            "type": "SAS Dataset",
            "owner": "Mandy Harpoons",
            "dept": "Customer Mgmt",
            "calc": "/server2/code/etl_stuff"
        }, {
            "fullname": "Reference.ClientData.Hierarchy",
            "desc": "Business hierarchy for small corp clients, taken from bureau files.",
            "location": "/server/customer/ref/spreadsheets",
            "type": "Excel",
            "owner": "Mandy Harpoons",
            "dept": "Reference Data",
            "calc": "/server2/code/etl_stuff"
        }, {
            "fullname": "Reference.SnP.Ratings",
            "desc": "Reference data from external source (SnP).",
            "location": "/server/folder/files/ref/snp",
            "type": "Text File",
            "owner": "Madison Avenue",
            "dept": "Reference Data",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Reference.Delphi.Scores",
            "desc": "Reference data from external source (Delphi).",
            "location": "/server/delphi/yyymm/scores",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Reference Data",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Refinancing.Retail.Restructuring_Mods",
            "desc": "Restructuring information around account modifications.",
            "location": "/server/staging/retail/restr/mods",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Banking",
            "calc": "/server/folder/scripts/calcStuff"
        },{
            "fullname": "Refinancing.Retail.Restructuring",
            "desc": "Extract from payments system.",
            "location": "/server/staging/retail/restr/snapshots",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Banking",
            "calc": "/server/folder/scripts/calcStuff"
        },{
            "fullname": "Core.Retail.Balances",
            "desc": "Account balances from retail core banking systems",
            "location": "/server/folder/files/inputDynamic",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Banking",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Core.Retail.Accounts",
            "desc": "Account information for retail contracts.",
            "location": "/server/folder/files/inputDynamic",
            "type": "SAS Dataset",
            "owner": "Helen Wheels",
            "dept": "Banking",
            "calc": "/server2/logic/stuff/"
        },{
            "fullname": "Core.Contracts.History",
            "desc": "Contract terms information for retail contracts.",
            "location": "/server/folder/files/terms",
            "type": "SAS Dataset",
            "owner": "Helen Wheels",
            "dept": "Banking",
            "calc": "/server2/logic/stuff/"
        }, {
            "fullname": "Customer.Quality.Internal",
            "desc": "Internal customer quality measures.",
            "location": "/server/folder/files/dims",
            "type": "SAS Dataset",
            "owner": "Madison Avenue",
            "dept": "Customer Mgmt",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Reports.BCBS.CreditRisk",
            "desc": "A report that is sent to auditors, governed as part of BCBS, containing retail credit risk summary information",
            "location": "/server/folder/reports/MR",
            "type": "SAS VA Dataset",
            "owner": "Len Miatena",
            "dept": "Credit Risk",
            "calc": "/server/folder/scripts/calcStuff"
        }],
        terms: [{
            "code": "TotalAssets",
            "name": "Total Assets",
            "desc": "Total assets, on and off balance sheet, regardless of risk weighting.",
            "flags": ""
        }, {
            "code": "Substandard",
            "desc": "Total assets deemed substandard by risk managers.",
            "name": "Substandard Assets",
            "flags": ""
        }, {
            "code": "Distressed",
            "name": "Distressed Assets",
            "desc": "Total assets deemed distressed based on relationship manager class and payment history.",
            "flags": "critical"
        }, {
            "code": "WeightedRisk",
            "name": "Total Weighted Risk",
            "desc": "Total assets weighted by risk classification.",
            "flags": "critical"
        }],
        tings: [{
            "type": "Process",
            "name": "Dat"
        }]
    }