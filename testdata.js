testdata = {};
testdata.raw =


    {
        raw: [{
            "fullname": "Output.Reports.MR:Measure1",
            "conceptname": "Measure1",
            "desc": "A measure.",
            "formula": "Derived from inputA and inputB",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Input.Files.Dynamic:inputA",
                "Input.Files.Dynamic:inputB"
            ],
            "usesfilter": []
        }, {
            "fullname": "Output.Reports.MR:Measure2",
            "conceptname": "Measure2",
            "desc": "A measure.",
            "formula": "Derived from inputA and inputB, filtered by dimensionC",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Input.Files.Dynamic:inputA",
                "Input.Files.Dynamic:inputB"
            ],
            "usesfilter": [
                "Static.Files.Dims:dimensionC"
            ]
        }, {
            "fullname": "Output.Reports.MR:Measure3",
            "conceptname": "Measure3",
            "desc": "A measure.",
            "formula": "Derived from inputC, filtered by dimensionD",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Input.Files.Dynamic:inputC"
            ],
            "usesfilter": [
                "Static.Files.Dims:dimensionD"
            ]
        }, {
            "fullname": "Output.Reports.MR:DerivedMeasure",
            "conceptname": "TotalRisk",
            "desc": "A measure.",
            "formula": "Derived from other measures within the output dataset.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Output.Reports.MR:Measure1",
                "Output.Reports.MR:Measure2"
            ],
            "usesfilter": []
        },{
            "fullname": "Output.Reports.MR:TweakedFinalMeasure",
            "conceptname": "TotalRisk",
            "desc": "A measure.",
            "formula": "A tweaked version of derivedmeasure.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [
                "Output.Reports.MR:DerivedMeasure"
            ],
            "usesfilter": []
        }, {
            "fullname": "Input.Files.Dynamic:inputA",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "Sourced from the golden source.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": ["Input.GoldenSource.DB:fieldThree"],
            "usesfilter": []
        }, {
            "fullname": "Input.Files.Dynamic:inputB",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "Sourced from the golden source as Field1 + Field2.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": ["Input.GoldenSource.DB:fieldOne", "Input.GoldenSource.DB:fieldTwo"],
            "usesfilter": []
        }, {
            "fullname": "Input.Files.Dynamic:inputC",
            "conceptname": "",
            "desc": "An input field of some kind.  Perhaps it is a duplicate of inputB.",
            "formula": "Sourced from the golden source as Field1 + Field2.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": ["Input.GoldenSource.DB:fieldOne", "Input.GoldenSource.DB:fieldTwo"],
            "usesfilter": []
        }, {
            "fullname": "Input.GoldenSource.DB:fieldOne",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Input.GoldenSource.DB:fieldTwo",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Input.GoldenSource.DB:fieldThree",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Static.Files.Dims:dimensionC",
            "conceptname": "",
            "desc": "An input dimension, one supposes.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }, {
            "fullname": "Static.Files.Dims:dimensionD",
            "conceptname": "",
            "desc": "An input dimension, one supposes.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        }],
        sources: [{
            "fullname": "Input.Files.Dynamic",
            "desc": "An input file",
            "location": "/server/folder/files/inputDynamic",
            "type": "Text File",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Input.GoldenSource.DB",
            "desc": "A DB at the very root of our data lineage.",
            "location": "/server/folder/files/inputDynamic",
            "type": "Text File",
            "owner": "Helen Wheels",
            "dept": "Reference Data",
            "calc": "/server2/logic/stuff/"
        }, {
            "fullname": "Static.Files.Dims",
            "desc": "A file full of static (ish) dimension info",
            "location": "/server/folder/files/dims",
            "type": "Text File",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        }, {
            "fullname": "Output.Reports.MR",
            "desc": "A report that is sent to auditors, regulators or the risk committee",
            "location": "/server/folder/reports/MR",
            "type": "Text File",
            "owner": "Len Miatena",
            "dept": "Invoice Docketing",
            "calc": "/server/folder/scripts/calcStuff"
        }],
        terms: [{
            "code": "Measure1",
            "name": "Measure One",
            "desc": "This is a measure of risk",
            "critical": "Critical"
        }, {
            "code": "Measure2",
            "name": "Measure Two",
            "desc": "This is a  measure of risk",
            "critical": ""
        }, {
            "code": "Measure3",
            "name": "Measure Three",
            "desc": "This is a  measure of risk",
            "critical": ""
        }, {
            "code": "TotalRisk",
            "name": "The Total Risk",
            "desc": "This is a derived measure of risk which is considered critical.",
            "critical": "Critical"
        }]
    }