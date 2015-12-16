testdata = {};
testdata.raw = 


{
    raw: [
        {
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
        },
        {
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
        },
        {
            "fullname": "Input.Files.Dynamic:inputA",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        },
        {
            "fullname": "Input.Files.Dynamic:inputB",
            "conceptname": "",
            "desc": "An input field of some kind.",
            "formula": "Sourced from outside our scope.",
            "type": "Money",
            "updatedby": "Ben",
            "updatedon": "22/06/2015",
            "critical": "",
            "usesvalue": [],
            "usesfilter": []
        },
        {
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
        }],
        sources: [
        {
            "fullname": "Input.Files.Dynamic",
            "desc": "An input file",
            "location": "/server/folder/files/inputDynamic",
            "type": "Text File",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": " /server/folder/scripts/calcStuff"
        },
         {
            "fullname": "Static.Files.Dims",
            "desc": "A file full of static (ish) dimension info",
            "location": "/server/folder/files/dims",
            "type": "Text File",
            "owner": "Madison Avenue",
            "dept": "Invoice Docketing",
            "calc": " /server/folder/scripts/calcStuff"
        },
         {
            "fullname": "Output.Reports.MR",
            "desc": "A report that is sent to auditors, regulators or the risk committee",
            "location": "/server/folder/reports/MR",
            "type": "Text File",
            "owner": "Len Miatena",
            "dept": "Invoice Docketing",
            "calc": " /server/folder/scripts/calcStuff"
        }
    ],
    terms: [
        {
            "code": "Measure1",
            "name": "Measure One",
            "desc": "This is a measure of risk",
            "critical": "Critical"
        },
        {
            "code": "Measure2",
            "name": "Measure Two",
            "desc": "This is a secondary measure of risk",
            "critical": ""
        }
    ]
}