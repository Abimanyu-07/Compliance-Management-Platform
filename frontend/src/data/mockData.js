export const initialBusinessProfile = {
  name: "Arun Manufacturing Pvt. Ltd.",
  type: "Private Limited Company",
  industry: "Food Manufacturing",
  location: "Coimbatore, Tamil Nadu",
  investment: "₹50 Lakhs",
  employees: 25,
  stage: "Starting Business",
  registrationNo: "U15400TZ2026PTC039211",
  commencementDate: "15 Oct 2026",
  activities: ["Food Processing", "Manufacturing", "Packaging", "Storage"]
};

export const initialApprovals = [
  {
    id: "app-1",
    name: "GST Registration",
    category: "Tax",
    authority: "GST Department",
    authorityFull: "Goods and Services Tax Department",
    status: "Approved",
    priority: "Normal",
    progress: 100,
    officialPortal: "https://www.gst.gov.in/",
    applicationMethod: "Online",
    missingDocs: [],
    requiredDocs: ["Business Registration Certificate", "Address Proof", "ID Proof", "PAN Card"],
    completedDocs: ["Business Registration Certificate", "Address Proof", "ID Proof", "PAN Card"],
    estimatedTime: "3-5 Days",
    fee: "₹0",
    description: "Mandatory tax registration for businesses supplying goods/services with turnover exceeding threshold."
  },
  {
    id: "app-2",
    name: "Pollution Consent (CTO)",
    category: "Environmental",
    authority: "TNPCB",
    authorityFull: "Tamil Nadu Pollution Control Board",
    status: "Action Required",
    priority: "High",
    progress: 75,
    officialPortal: "https://tnpcbonline.tn.gov.in/",
    applicationMethod: "Online via TNPCB Portal",
    missingDocs: ["Project Report"],
    requiredDocs: ["Business Registration Certificate", "Address Proof", "Land Document", "Project Report"],
    completedDocs: ["Business Registration Certificate", "Address Proof", "Land Document"],
    estimatedTime: "15-20 Days",
    fee: "₹12,500",
    description: "Consent to Operate (CTO) required under Water & Air Acts for food processing and industrial discharge.",
    bottleneckAlert: "Missing Project Report is currently delaying application scrutiny and blocking Factory Licence workflow."
  },
  {
    id: "app-3",
    name: "Factory Licence",
    category: "Industrial",
    authority: "Factories Dept",
    authorityFull: "Directorate of Industrial Safety and Health (DISH)",
    status: "Ready to Apply",
    priority: "High",
    progress: 60,
    officialPortal: "https://dish.tn.gov.in/",
    applicationMethod: "Online",
    missingDocs: [],
    requiredDocs: ["Factory Layout Plan", "Pollution Consent Certificate", "Stability Certificate", "Land Document"],
    completedDocs: ["Factory Layout Plan", "Land Document"],
    estimatedTime: "10-14 Days",
    fee: "₹8,000",
    description: "Mandatory approval under Factories Act 1948 for units employing 10+ workers with power.",
    prerequisite: "Pollution Consent (CTO)"
  },
  {
    id: "app-4",
    name: "Fire NOC",
    category: "Safety",
    authority: "Fire & Rescue Services",
    authorityFull: "Tamil Nadu Fire and Rescue Services Department",
    status: "Not Started",
    priority: "Medium",
    progress: 0,
    officialPortal: "https://tnfrs.tn.gov.in/",
    applicationMethod: "Online via Single Window Portal",
    missingDocs: ["Fire Safety Plan"],
    requiredDocs: ["Building Plan", "Factory Licence Copy", "Fire Extinguisher Installation Cert"],
    completedDocs: [],
    estimatedTime: "7-10 Days",
    fee: "₹5,000",
    description: "No Objection Certificate verifying compliance with fire safety infrastructure and emergency egress.",
    prerequisite: "Factory Licence"
  },
  {
    id: "app-5",
    name: "FSSAI Food License",
    category: "Food Safety",
    authority: "FSSAI",
    authorityFull: "Food Safety and Standards Authority of India",
    status: "Approved",
    priority: "High",
    progress: 100,
    officialPortal: "https://foscos.fssai.gov.in/",
    applicationMethod: "Online (FoSCoS Portal)",
    missingDocs: [],
    requiredDocs: ["Sanitation Plan", "Water Test Report", "Business Registration", "ID Proof"],
    completedDocs: ["Sanitation Plan", "Water Test Report", "Business Registration", "ID Proof"],
    estimatedTime: "7 Days",
    fee: "₹7,500",
    description: "State level license for food processing and packaging operations."
  },
  {
    id: "app-6",
    name: "ESI Registration",
    category: "Labor",
    authority: "ESIC",
    authorityFull: "Employees' State Insurance Corporation",
    status: "Approved",
    priority: "Normal",
    progress: 100,
    officialPortal: "https://www.esic.gov.in/",
    applicationMethod: "Online",
    missingDocs: [],
    requiredDocs: ["Employee List", "Bank Details", "Registration Certificate"],
    completedDocs: ["Employee List", "Bank Details", "Registration Certificate"],
    estimatedTime: "2 Days",
    fee: "₹0",
    description: "Social security scheme for health & disability coverage for employees."
  },
  {
    id: "app-7",
    name: "EPF Registration",
    category: "Labor",
    authority: "EPFO",
    authorityFull: "Employees' Provident Fund Organisation",
    status: "Approved",
    priority: "Normal",
    progress: 100,
    officialPortal: "https://www.epfindia.gov.in/",
    applicationMethod: "Online",
    missingDocs: [],
    requiredDocs: ["PAN", "Digital Signature", "Address Proof"],
    completedDocs: ["PAN", "Digital Signature", "Address Proof"],
    estimatedTime: "2 Days",
    fee: "₹0",
    description: "Provident fund social security registration for industrial employees."
  },
  {
    id: "app-8",
    name: "Trade License",
    category: "Municipal",
    authority: "Coimbatore City Municipal Corp",
    authorityFull: "Coimbatore City Municipal Corporation (CCMC)",
    status: "Ready to Apply",
    priority: "Normal",
    progress: 80,
    officialPortal: "https://ccmc.gov.in/",
    applicationMethod: "Online Municipal Portal",
    missingDocs: [],
    requiredDocs: ["Property Tax Receipt", "Lease Deed", "ID Proof"],
    completedDocs: ["Property Tax Receipt", "Lease Deed", "ID Proof"],
    estimatedTime: "5 Days",
    fee: "₹3,200",
    description: "Municipal permission to conduct commercial manufacturing within city limits."
  },
  {
    id: "app-9",
    name: "Commercial Power Sanction",
    category: "Utility",
    authority: "TANGEDCO",
    authorityFull: "Tamil Nadu Generation and Distribution Corp",
    status: "Under Review",
    priority: "High",
    progress: 50,
    officialPortal: "https://www.tangedco.gov.in/",
    applicationMethod: "Online / Field Verification",
    missingDocs: [],
    requiredDocs: ["Load Requirement Plan", "Ownership Proof", "Safety Certificate"],
    completedDocs: ["Load Requirement Plan", "Ownership Proof"],
    estimatedTime: "10 Days",
    fee: "₹22,000",
    description: "Sanction of 50 HP High Tension / Low Tension commercial electricity connection."
  },
  {
    id: "app-10",
    name: "Water Supply Sanction",
    category: "Utility",
    authority: "TWAD / CCMC",
    authorityFull: "Tamil Nadu Water Supply and Drainage Board",
    status: "Ready to Apply",
    priority: "Normal",
    progress: 70,
    officialPortal: "https://twadboard.tn.gov.in/",
    applicationMethod: "Online",
    missingDocs: [],
    requiredDocs: ["Plumbing Blueprint", "Site Plan", "Property Document"],
    completedDocs: ["Plumbing Blueprint", "Property Document"],
    estimatedTime: "7 Days",
    fee: "₹4,500",
    description: "Industrial water connection approval for food processing operations."
  },
  {
    id: "app-11",
    name: "Boiler Inspection Certificate",
    category: "Industrial",
    authority: "Directorate of Boilers",
    authorityFull: "Directorate of Boilers, Tamil Nadu",
    status: "Not Started",
    priority: "Low",
    progress: 0,
    officialPortal: "https://boilers.tn.gov.in/",
    applicationMethod: "Online / Physical Inspection",
    missingDocs: ["Boiler Blueprint"],
    requiredDocs: ["Boiler Blueprint", "Manufacturer Certificate"],
    completedDocs: [],
    estimatedTime: "14 Days",
    fee: "₹6,000",
    description: "Safety certification for high-pressure steam boilers used in food cooking."
  },
  {
    id: "app-12",
    name: "Hazardous Waste Authorization",
    category: "Environmental",
    authority: "TNPCB",
    authorityFull: "Tamil Nadu Pollution Control Board",
    status: "Not Started",
    priority: "Low",
    progress: 0,
    officialPortal: "https://tnpcbonline.tn.gov.in/",
    applicationMethod: "Online",
    missingDocs: ["Waste Management Flowchart"],
    requiredDocs: ["Waste Management Flowchart", "CTO Copy"],
    completedDocs: [],
    estimatedTime: "20 Days",
    fee: "₹5,000",
    description: "Authorization for safe disposal of processing sludge and effluent."
  }
];

export const initialDocuments = [
  {
    id: "doc-1",
    name: "Business_Registration.pdf",
    type: "Business Registration Certificate",
    size: "1.8 MB",
    uploadedDate: "2026-08-10",
    status: "Verified",
    relatedApproval: "GST Registration",
    checks: [
      { name: "Document type detected", passed: true },
      { name: "Entity name matched (Arun Manufacturing)", passed: true },
      { name: "CIN / Registration number validated", passed: true },
      { name: "Authorized signature present", passed: true }
    ]
  },
  {
    id: "doc-2",
    name: "Address_Proof.pdf",
    type: "Address Proof",
    size: "2.4 MB",
    uploadedDate: "2026-08-12",
    status: "Verified",
    relatedApproval: "GST Registration",
    checks: [
      { name: "Document type detected", passed: true },
      { name: "Address matched (Coimbatore, Tamil Nadu)", passed: true },
      { name: "Utility bill currency valid (< 3 months)", passed: true },
      { name: "QR code verified", passed: true }
    ]
  },
  {
    id: "doc-3",
    name: "Land_Document.pdf",
    type: "Land Lease Deed",
    size: "4.1 MB",
    uploadedDate: "2026-08-15",
    status: "Verified",
    relatedApproval: "Pollution Consent",
    checks: [
      { name: "Document type detected", passed: true },
      { name: "Survey number validated", passed: true },
      { name: "Stamp duty verification valid", passed: true },
      { name: "Lessor signature matched", passed: true }
    ]
  },
  {
    id: "doc-4",
    name: "Project_Report.pdf",
    type: "Technical Project Report",
    size: "—",
    uploadedDate: "—",
    status: "Missing",
    relatedApproval: "Pollution Consent",
    warning: "This document is required before submitting the Pollution Consent (CTO) application.",
    checks: [
      { name: "Effluent treatment layout", passed: false },
      { name: "Raw material mass balance", passed: false },
      { name: "Air pollution control plan", passed: false }
    ]
  },
  {
    id: "doc-5",
    name: "Factory_Layout_Plan.pdf",
    type: "Architectural Layout",
    size: "5.2 MB",
    uploadedDate: "2026-08-20",
    status: "Verified",
    relatedApproval: "Factory Licence",
    checks: [
      { name: "Registered Architect Seal", passed: true },
      { name: "Emergency exit marking verified", passed: true },
      { name: "Machinery layout scale valid", passed: true }
    ]
  },
  {
    id: "doc-6",
    name: "Sanitation_Plan.pdf",
    type: "FSSAI Hazard & Sanitation Plan",
    size: "1.2 MB",
    uploadedDate: "2026-08-05",
    status: "Verified",
    relatedApproval: "FSSAI Food License",
    checks: [
      { name: "HACCP Compliance verified", passed: true },
      { name: "Water testing certificate attached", passed: true }
    ]
  }
];

export const initialApplications = [
  {
    id: "TNPCB-2026-10291",
    approvalName: "Pollution Consent (CTO)",
    authority: "TNPCB",
    submittedDate: "2026-08-28",
    lastUpdated: "2 hours ago",
    status: "Under Review",
    deadline: "18 Sep 2026",
    urgency: "High",
    actionRequired: "Upload Project Report to proceed to inspection phase",
    timeline: [
      { step: "Application Submitted", date: "28 Aug 2026", status: "completed" },
      { step: "Initial Scrutiny", date: "02 Sep 2026", status: "completed" },
      { step: "Document Review", date: "In Progress", status: "current", note: "Pending Project Report" },
      { step: "Field Inspection", date: "Pending Scrutiny", status: "upcoming" },
      { step: "Final Decision & CTO Issuance", date: "Pending Inspection", status: "upcoming" }
    ]
  },
  {
    id: "FAC-2026-4412",
    approvalName: "Factory Licence",
    authority: "Factories Dept",
    submittedDate: "2026-09-01",
    lastUpdated: "5 hours ago",
    status: "Action Required",
    deadline: "24 Sep 2026",
    urgency: "High",
    actionRequired: "Awaiting prerequisite TNPCB CTO clearance",
    timeline: [
      { step: "Application Draft Created", date: "01 Sep 2026", status: "completed" },
      { step: "Prerequisite Verification", date: "02 Sep 2026", status: "current", note: "Blocked by TNPCB CTO" },
      { step: "Plan Approval Scrutiny", date: "Pending Prerequisite", status: "upcoming" },
      { step: "Safety Inspection", date: "Pending Scrutiny", status: "upcoming" },
      { step: "Licence Grant", date: "Pending Inspection", status: "upcoming" }
    ]
  },
  {
    id: "GST-2026-8211",
    approvalName: "GST Registration",
    authority: "GST Department",
    submittedDate: "2026-08-10",
    lastUpdated: "Yesterday",
    status: "Approved",
    deadline: "Completed",
    urgency: "Normal",
    actionRequired: "Download Official GST Certificate",
    timeline: [
      { step: "Application Submitted", date: "10 Aug 2026", status: "completed" },
      { step: "Aadhaar Authentication", date: "11 Aug 2026", status: "completed" },
      { step: "Officer Verification", date: "13 Aug 2026", status: "completed" },
      { step: "Registration Granted (33AABCU9912K1Z5)", date: "14 Aug 2026", status: "completed" }
    ]
  },
  {
    id: "FSSAI-2026-3391",
    approvalName: "FSSAI Food License",
    authority: "FSSAI",
    submittedDate: "2026-08-05",
    lastUpdated: "3 days ago",
    status: "Approved",
    deadline: "Completed",
    urgency: "Normal",
    actionRequired: "License active until Aug 2027",
    timeline: [
      { step: "Application Submitted", date: "05 Aug 2026", status: "completed" },
      { step: "Document Scrutiny", date: "06 Aug 2026", status: "completed" },
      { step: "State Officer Approval", date: "08 Aug 2026", status: "completed" },
      { step: "License Issued (12426999000142)", date: "09 Aug 2026", status: "completed" }
    ]
  },
  {
    id: "TANGEDCO-2026-551",
    approvalName: "Commercial Power Sanction",
    authority: "TANGEDCO",
    submittedDate: "2026-08-25",
    lastUpdated: "1 day ago",
    status: "Under Review",
    deadline: "15 Sep 2026",
    urgency: "Medium",
    actionRequired: "Field Engineer site meter inspection scheduled for Sep 12",
    timeline: [
      { step: "Online Application Filed", date: "25 Aug 2026", status: "completed" },
      { step: "Fee Payment & Quotation", date: "27 Aug 2026", status: "completed" },
      { step: "Transformer & Load Inspection", date: "12 Sep 2026", status: "current" },
      { step: "Power Service Meter Connection", date: "Pending Inspection", status: "upcoming" }
    ]
  },
  {
    id: "FIRE-2026-0922",
    approvalName: "Fire NOC",
    authority: "Fire & Rescue",
    submittedDate: "Not Submitted",
    lastUpdated: "—",
    status: "Not Started",
    deadline: "02 Oct 2026",
    urgency: "Normal",
    actionRequired: "Complete Factory Licence before submitting Fire NOC application",
    timeline: [
      { step: "Draft Application", date: "Pending", status: "upcoming" },
      { step: "Fire Equipment Audit", date: "Pending", status: "upcoming" },
      { step: "Final NOC Issuance", date: "Pending", status: "upcoming" }
    ]
  }
];

export const dependencyNodes = [
  { id: "dep-1", label: "Business Registration", authority: "MCA / ROC", status: "Approved", level: 1, x: 50, y: 150 },
  { id: "dep-2", label: "GST Registration", authority: "GST Dept", status: "Approved", level: 2, x: 250, y: 80, parent: "dep-1" },
  { id: "dep-3", label: "Land Lease Deed", authority: "Revenue Dept", status: "Approved", level: 2, x: 250, y: 220, parent: "dep-1" },
  { id: "dep-4", label: "Pollution Consent (CTO)", authority: "TNPCB", status: "Action Required", level: 3, x: 450, y: 150, parent: ["dep-2", "dep-3"], isBottleneck: true },
  { id: "dep-5", label: "Factory Licence", authority: "Factories Dept", status: "Ready to Apply", level: 4, x: 650, y: 150, parent: "dep-4", isBlocked: true },
  { id: "dep-6", label: "Fire NOC", authority: "Fire Services", status: "Not Started", level: 5, x: 850, y: 150, parent: "dep-5" },
  { id: "dep-7", label: "Final Operational Clearance", authority: "Govt of Tamil Nadu", status: "Pending", level: 6, x: 1050, y: 150, parent: "dep-6" }
];

export const riskMetrics = {
  overallScore: 18,
  status: "Low Risk",
  statusDescription: "Your business is in good standing with minor actionable documentation blocks.",
  riskFactors: [
    { name: "Missing Project Report", impact: "Medium", score: 35, category: "Documentation", detail: "CTO application scrutinization paused by TNPCB officer." },
    { name: "Upcoming Renewal: Factory Licence", impact: "Low", score: 15, category: "Timeline", detail: "Annual inspection window closes on Sep 24, 2026." },
    { name: "Approval Dependency Bottleneck", impact: "High", score: 65, category: "Workflow", detail: "CTO delay holds up Factory Licence and subsequent Fire NOC." },
    { name: "Incomplete Fire NOC Draft", impact: "Low", score: 10, category: "Readiness", detail: "80% documentation ready, waiting on DISH license." }
  ],
  delayPrediction: {
    approval: "Pollution Consent (CTO)",
    authority: "TNPCB",
    predictedDelayDays: 14,
    rootCause: "Project Report document missing from submission portal",
    downstreamImpact: "Factory Licence processing will be delayed by ~18 business days",
    recommendedAction: "Upload verified Project Report PDF today to clear scrutiny queue."
  }
};

export const grievances = [
  {
    id: "GRV-1021",
    applicationId: "TNPCB-2026-10291",
    approvalName: "Pollution Consent (CTO)",
    authority: "TNPCB - District Office Coimbatore",
    category: "Application Delay",
    description: "Initial application scrutiny has passed 7 business days without field inspection officer assignment.",
    priority: "High",
    status: "Under Review",
    submittedDate: "05 Sep 2026",
    officerAssigned: "R. Shanmugam (EE, TNPCB)"
  },
  {
    id: "GRV-1017",
    applicationId: "GST-2026-8211",
    approvalName: "GST Registration",
    authority: "Central GST Ward 4",
    category: "Document Clarification",
    description: "Clarification requested regarding commercial electricity bill address matching lease deed.",
    priority: "Medium",
    status: "Resolved",
    submittedDate: "22 Aug 2026",
    resolution: "Uploaded revised electricity bill with exact door number match. Approved on Aug 24."
  }
];

export const schemesAndIncentives = [
  {
    id: "sch-1",
    title: "Tamil Nadu MSME Capital Subsidy Scheme",
    category: "Manufacturing",
    authority: "Department of Micro, Small and Medium Enterprises, Govt of TN",
    matchStatus: "Potential Match",
    subsidyAmount: "25% Subsidy up to ₹15 Lakhs",
    eligibility: [
      "New manufacturing unit established in Coimbatore district",
      "Investment in plant and machinery between ₹10L to ₹50L",
      "Registered under MSME Udyam"
    ],
    deadline: "31 Oct 2026",
    description: "Financial assistance provided for capital investment in eligible plant, machinery, and food processing equipment."
  },
  {
    id: "sch-2",
    title: "Single Window Portal Compliance Incentive",
    category: "Digital Governance",
    authority: "Guidance Tamil Nadu",
    matchStatus: "Potential Match",
    subsidyAmount: "100% Processing Fee Waiver",
    eligibility: [
      "Applications submitted through TN Single Window Portal 2.0",
      "Green/Orange category industrial units"
    ],
    deadline: "Open All Year",
    description: "Reimbursement of official government application processing fees for early digital filing."
  },
  {
    id: "sch-3",
    title: "Food Processing Infrastructure Development Grant",
    category: "Food Manufacturing",
    authority: "Ministry of Food Processing Industries (MoFPI)",
    matchStatus: "Potential Match",
    subsidyAmount: "Grant up to ₹20 Lakhs",
    eligibility: [
      "Food processing & packaging units setting up cold storage / testing lab",
      "Compliance with FSSAI & TNPCB standards"
    ],
    deadline: "15 Nov 2026",
    description: "Financial grant for setting up modern packaging and hygiene compliance infrastructure."
  },
  {
    id: "sch-4",
    title: "Green Energy & Eco-Tariff Concession",
    category: "Utilities / Environmental",
    authority: "TANGEDCO",
    matchStatus: "Eligible",
    subsidyAmount: "15% Power Tariff Rebate",
    eligibility: [
      "Unit possessing valid TNPCB Consent to Operate",
      "Solar rooftop or energy-efficient machinery installed"
    ],
    deadline: "Rolling Monthly",
    description: "Discount on monthly commercial electricity bills for environmentally certified units."
  }
];

export const initialNotifications = [
  {
    id: "notif-1",
    title: "Action Required: Missing Project Report",
    message: "Pollution Consent application TNPCB-2026-10291 needs Project Report PDF.",
    time: "10 mins ago",
    type: "warning",
    unread: true
  },
  {
    id: "notif-2",
    title: "GST Registration Certificate Ready",
    message: "GST Registration approved. Download your certificate in Documents.",
    time: "2 hours ago",
    type: "success",
    unread: true
  },
  {
    id: "notif-3",
    title: "TANGEDCO Site Visit Scheduled",
    message: "Field meter inspection assigned for Sep 12, 2026.",
    time: "1 day ago",
    type: "info",
    unread: false
  }
];
