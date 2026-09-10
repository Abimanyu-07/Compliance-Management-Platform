// Rule-Based Compliance Engine for InnovX Platform
// Generates personalized statutory requirements, document checklists, application timelines,
// dependency trees, risk scores, and AI recommendations based on business profile parameters.

export const generateRequirements = (business) => {
  const industry = (business.industry || 'Manufacturing').toLowerCase();
  const locationStr = typeof business.location === 'object' 
    ? `${business.location.city || 'Coimbatore'}, ${business.location.state || 'Tamil Nadu'}`
    : (business.location || 'Coimbatore, Tamil Nadu');

  const city = locationStr.split(',')[0].trim();
  const state = 'Tamil Nadu';

  let approvals = [];
  let documents = [];
  let applications = [];
  let dependencyNodes = [];
  let riskMetrics = {};
  let aiRecommendation = {};

  // Rule Sets by Industry
  if (industry.includes('food')) {
    // Food Processing Rules
    approvals = [
      {
        id: `${business.id}-app-1`,
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
        description: "Mandatory tax registration for food processing unit turnover."
      },
      {
        id: `${business.id}-app-2`,
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
        description: "Consent to Operate (CTO) required under Water & Air Acts for food effluent discharge.",
        bottleneckAlert: "Missing Project Report is currently delaying application scrutiny and blocking Factory Licence workflow."
      },
      {
        id: `${business.id}-app-3`,
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
        requiredDocs: ["Factory Layout Plan", "Pollution Consent Certificate", "Stability Certificate"],
        completedDocs: ["Factory Layout Plan"],
        estimatedTime: "10-14 Days",
        fee: "₹8,000",
        description: "Mandatory approval under Factories Act 1948 for units with workers and machinery.",
        prerequisite: "Pollution Consent (CTO)"
      },
      {
        id: `${business.id}-app-4`,
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
        description: "No Objection Certificate verifying fire safety infrastructure.",
        prerequisite: "Factory Licence"
      },
      {
        id: `${business.id}-app-5`,
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
        requiredDocs: ["Sanitation Plan", "Water Test Report", "Business Registration"],
        completedDocs: ["Sanitation Plan", "Water Test Report", "Business Registration"],
        estimatedTime: "7 Days",
        fee: "₹7,500",
        description: "State level license for food processing and packaging operations."
      },
      {
        id: `${business.id}-app-6`,
        name: "Trade License",
        category: "Municipal",
        authority: `${city} Municipal Corp`,
        authorityFull: `${city} City Municipal Corporation`,
        status: "Ready to Apply",
        priority: "Normal",
        progress: 80,
        officialPortal: "https://tnurbantree.tn.gov.in/",
        applicationMethod: "Online Municipal Portal",
        missingDocs: [],
        requiredDocs: ["Property Tax Receipt", "Lease Deed"],
        completedDocs: ["Property Tax Receipt", "Lease Deed"],
        estimatedTime: "5 Days",
        fee: "₹3,200",
        description: "Municipal permission to conduct commercial manufacturing within city limits."
      }
    ];

    documents = [
      { id: `${business.id}-doc-1`, name: "Business_Registration.pdf", type: "Business Registration Certificate", size: "1.8 MB", uploadedDate: "2026-08-10", status: "Verified", relatedApproval: "GST Registration" },
      { id: `${business.id}-doc-2`, name: "Address_Proof.pdf", type: "Address Proof", size: "2.4 MB", uploadedDate: "2026-08-12", status: "Verified", relatedApproval: "GST Registration" },
      { id: `${business.id}-doc-3`, name: "Land_Document.pdf", type: "Land Lease Deed", size: "4.1 MB", uploadedDate: "2026-08-15", status: "Verified", relatedApproval: "Pollution Consent" },
      { id: `${business.id}-doc-4`, name: "Project_Report.pdf", type: "Technical Project Report", size: "—", uploadedDate: "—", status: "Missing", relatedApproval: "Pollution Consent", warning: "Required for TNPCB Pollution Consent" },
      { id: `${business.id}-doc-5`, name: "Sanitation_Plan.pdf", type: "FSSAI Sanitation Plan", size: "1.2 MB", uploadedDate: "2026-08-05", status: "Verified", relatedApproval: "FSSAI Food License" }
    ];

    applications = [
      { id: `TNPCB-2026-10291`, approvalName: "Pollution Consent (CTO)", authority: "TNPCB", submittedDate: "2026-08-28", lastUpdated: "2h ago", status: "Under Review", deadline: "18 Sep 2026", actionRequired: "Upload Project Report to proceed to inspection phase" },
      { id: `FAC-2026-4412`, approvalName: "Factory Licence", authority: "Factories Dept", submittedDate: "2026-09-01", lastUpdated: "5h ago", status: "Action Required", deadline: "24 Sep 2026", actionRequired: "Awaiting prerequisite TNPCB CTO clearance" },
      { id: `GST-2026-8211`, approvalName: "GST Registration", authority: "GST Dept", submittedDate: "2026-08-10", lastUpdated: "Yesterday", status: "Approved", deadline: "Completed", actionRequired: "Download Official GST Certificate" }
    ];

    aiRecommendation = {
      title: "Complete Pollution Consent Documentation",
      description: "Your Pollution Consent application is currently blocked by a missing Project Report. Completing this document helps unblock downstream approvals.",
      priority: "High",
      approvalId: `${business.id}-app-2`
    };

    riskMetrics = { overallScore: 18, status: "Low Risk", delayDays: 14 };

  } else if (industry.includes('textile')) {
    // Textile Manufacturing Rules
    approvals = [
      {
        id: `${business.id}-app-1`,
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
        requiredDocs: ["Registration Certificate", "Premises Deed", "PAN Card"],
        completedDocs: ["Registration Certificate", "Premises Deed", "PAN Card"],
        estimatedTime: "3-5 Days",
        fee: "₹0",
        description: "Tax registration for textile manufacturing and fabric trade."
      },
      {
        id: `${business.id}-app-2`,
        name: "Textile Mill Factory Licence",
        category: "Industrial",
        authority: "Directorate of Industrial Safety",
        authorityFull: "Directorate of Industrial Safety and Health (DISH)",
        status: "Under Review",
        priority: "High",
        progress: 80,
        officialPortal: "https://dish.tn.gov.in/",
        applicationMethod: "Online Portal",
        missingDocs: [],
        requiredDocs: ["Power Sanction Copy", "Factory Layout", "Worker Safety Certificate"],
        completedDocs: ["Power Sanction Copy", "Factory Layout"],
        estimatedTime: "10-12 Days",
        fee: "₹15,000",
        description: "Specialized licensing under Factories Act for textile spinning & weaving looms."
      },
      {
        id: `${business.id}-app-3`,
        name: "Zero Liquid Discharge (ZLD) Pollution Consent",
        category: "Environmental",
        authority: "TNPCB",
        authorityFull: "Tamil Nadu Pollution Control Board",
        status: "Action Required",
        priority: "High",
        progress: 65,
        officialPortal: "https://tnpcbonline.tn.gov.in/",
        applicationMethod: "Online via Single Window Portal",
        missingDocs: ["Effluent Treatment Plant (ETP) Audit"],
        requiredDocs: ["Land Document", "ZLD System Design", "ETP Audit"],
        completedDocs: ["Land Document", "ZLD System Design"],
        estimatedTime: "20-25 Days",
        fee: "₹25,000",
        description: "Mandatory ZLD Consent for textile dyeing & processing effluent management in Tiruppur hub.",
        bottleneckAlert: "Missing ETP Audit document is holding up field inspection."
      },
      {
        id: `${business.id}-app-4`,
        name: "Textile Machinery Import NOC",
        category: "Trade",
        authority: "Ministry of Textiles / DGFT",
        authorityFull: "Directorate General of Foreign Trade",
        status: "Ready to Apply",
        priority: "Normal",
        progress: 90,
        officialPortal: "https://www.dgft.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["IEC Code", "Machinery Invoice", "TUFS Scheme Form"],
        completedDocs: ["IEC Code", "Machinery Invoice", "TUFS Scheme Form"],
        estimatedTime: "7 Days",
        fee: "₹2,500",
        description: "Clearance for automated loom and weaving machinery under ATUFS scheme."
      },
      {
        id: `${business.id}-app-5`,
        name: "Fire Safety NOC (Textile Storage)",
        category: "Safety",
        authority: "Fire & Rescue Services",
        authorityFull: "Tamil Nadu Fire and Rescue Services Department",
        status: "Not Started",
        priority: "Medium",
        progress: 0,
        officialPortal: "https://tnfrs.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: ["Sprinkler System Layout"],
        requiredDocs: ["Building Plan", "Sprinkler System Layout"],
        completedDocs: [],
        estimatedTime: "10 Days",
        fee: "₹8,500",
        description: "Fire clearance for cotton yarn storage warehouse and loom shed."
      },
      {
        id: `${business.id}-app-6`,
        name: "Trade & Yarn Storage Licence",
        category: "Municipal",
        authority: `${city} Municipal Corp`,
        authorityFull: `${city} Corporation Municipal Ward`,
        status: "Approved",
        priority: "Normal",
        progress: 100,
        officialPortal: "https://tnurbantree.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["Property Tax", "No Objection Certificate"],
        completedDocs: ["Property Tax", "No Objection Certificate"],
        estimatedTime: "5 Days",
        fee: "₹4,000",
        description: "Commercial trade permit for textile yarn stocking and garment manufacturing."
      }
    ];

    documents = [
      { id: `${business.id}-doc-1`, name: "Registration_Deed.pdf", type: "Partnership / Incorporation Deed", size: "2.1 MB", uploadedDate: "2026-08-01", status: "Verified", relatedApproval: "GST Registration" },
      { id: `${business.id}-doc-2`, name: "Loom_Shed_Layout.pdf", type: "Architectural Plan", size: "6.4 MB", uploadedDate: "2026-08-10", status: "Verified", relatedApproval: "Textile Mill Factory Licence" },
      { id: `${business.id}-doc-3`, name: "ETP_Audit_Report.pdf", type: "Effluent Treatment Plant Audit", size: "—", uploadedDate: "—", status: "Missing", relatedApproval: "Zero Liquid Discharge (ZLD) Pollution Consent", warning: "Required for Tiruppur TNPCB ZLD Consent" },
      { id: `${business.id}-doc-4`, name: "ATUFS_Subsidy_Form.pdf", type: "Machinery Subsidy Form", size: "1.5 MB", uploadedDate: "2026-08-12", status: "Verified", relatedApproval: "Textile Machinery Import NOC" }
    ];

    applications = [
      { id: `TNPCB-TEX-2026`, approvalName: "ZLD Pollution Consent", authority: "TNPCB", submittedDate: "2026-08-20", lastUpdated: "3h ago", status: "Action Required", deadline: "20 Sep 2026", actionRequired: "Upload ETP Audit Report for ZLD clearance" },
      { id: `DISH-TEX-881`, approvalName: "Textile Mill Factory Licence", authority: "Directorate of Industrial Safety", submittedDate: "2026-08-25", lastUpdated: "1d ago", status: "Under Review", deadline: "28 Sep 2026", actionRequired: "Officer site inspection scheduled" },
      { id: `GST-TEX-001`, approvalName: "GST Registration", authority: "GST Dept", submittedDate: "2026-08-05", lastUpdated: "Completed", status: "Approved", deadline: "Completed", actionRequired: "Active License" }
    ];

    aiRecommendation = {
      title: "Upload Effluent Treatment Plant (ETP) Audit Report",
      description: "Your ZLD Pollution Consent is currently pending ETP audit verification. Submitting this clears Tiruppur industrial water safety compliance.",
      priority: "High",
      approvalId: `${business.id}-app-3`
    };

    riskMetrics = { overallScore: 22, status: "Low Risk", delayDays: 10 };

  } else if (industry.includes('software') || industry.includes('it')) {
    // Software / IT Rules
    approvals = [
      {
        id: `${business.id}-app-1`,
        name: "GST Registration",
        category: "Tax",
        authority: "GST Department",
        authorityFull: "Goods and Services Tax Department",
        status: "Approved",
        priority: "High",
        progress: 100,
        officialPortal: "https://www.gst.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["Incorporation Certificate", "Rental Deed", "PAN"],
        completedDocs: ["Incorporation Certificate", "Rental Deed", "PAN"],
        estimatedTime: "3 Days",
        fee: "₹0",
        description: "Mandatory tax registration for IT service exports and domestic software sales."
      },
      {
        id: `${business.id}-app-2`,
        name: "Shops & Establishments Registration",
        category: "Labor",
        authority: "Labor Department",
        authorityFull: "Department of Labor, Govt of Tamil Nadu",
        status: "Ready to Apply",
        priority: "Normal",
        progress: 90,
        officialPortal: "https://labour.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["Employee Count Declaration", "Office Premises Photo", "Rental Agreement"],
        completedDocs: ["Employee Count Declaration", "Office Premises Photo", "Rental Agreement"],
        estimatedTime: "3-5 Days",
        fee: "₹1,500",
        description: "Standard labor registration for commercial IT office premises."
      },
      {
        id: `${business.id}-app-3`,
        name: "STPI / SEZ Registration",
        category: "Export & Tech",
        authority: "Software Technology Parks of India",
        authorityFull: "Ministry of Electronics and Information Technology",
        status: "Under Review",
        priority: "Normal",
        progress: 70,
        officialPortal: "https://www.stpi.in/",
        applicationMethod: "Online STPI Portal",
        missingDocs: [],
        requiredDocs: ["Software Export Plan", "Foreign Exchange Declaration"],
        completedDocs: ["Software Export Plan"],
        estimatedTime: "7-10 Days",
        fee: "₹10,000",
        description: "Registration for duty-free tech equipment imports and service export benefits."
      },
      {
        id: `${business.id}-app-4`,
        name: "Professional Tax Registration",
        category: "Municipal Tax",
        authority: `${city} Municipal Corp`,
        authorityFull: `${city} Corporation Revenue Department`,
        status: "Approved",
        priority: "Normal",
        progress: 100,
        officialPortal: "https://tnurbantree.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["PAN", "Salary Roll"],
        completedDocs: ["PAN", "Salary Roll"],
        estimatedTime: "2 Days",
        fee: "₹1,000",
        description: "Municipal professional tax deduction registration for IT staff."
      }
    ];

    documents = [
      { id: `${business.id}-doc-1`, name: "Incorporation_Certificate.pdf", type: "Company Certificate", size: "1.4 MB", uploadedDate: "2026-08-01", status: "Verified", relatedApproval: "GST Registration" },
      { id: `${business.id}-doc-2`, name: "IT_Park_Lease_Deed.pdf", type: "Office Rental Agreement", size: "3.2 MB", uploadedDate: "2026-08-03", status: "Verified", relatedApproval: "Shops & Establishments" },
      { id: `${business.id}-doc-3`, name: "Software_Export_Plan.pdf", type: "Export Projection", size: "2.8 MB", uploadedDate: "2026-08-08", status: "Verified", relatedApproval: "STPI / SEZ Registration" }
    ];

    applications = [
      { id: `STPI-2026-901`, approvalName: "STPI Registration", authority: "STPI", submittedDate: "2026-08-25", lastUpdated: "1d ago", status: "Under Review", deadline: "15 Sep 2026", actionRequired: "Officer reviewing software export projections" },
      { id: `GST-IT-441`, approvalName: "GST Registration", authority: "GST Dept", submittedDate: "2026-08-01", lastUpdated: "Completed", status: "Approved", deadline: "Completed", actionRequired: "Active GSTIN" }
    ];

    aiRecommendation = {
      title: "Submit Shops & Establishments Online Form",
      description: "Your IT office premises documentation is 90% ready. Submit the online application on the TN Labour Portal to receive instant approval.",
      priority: "Medium",
      approvalId: `${business.id}-app-2`
    };

    riskMetrics = { overallScore: 5, status: "Low Risk", delayDays: 0 };

  } else if (industry.includes('retail')) {
    // Retail Rules
    approvals = [
      {
        id: `${business.id}-app-1`,
        name: "GST Registration",
        category: "Tax",
        authority: "GST Department",
        authorityFull: "Goods and Services Tax Department",
        status: "Approved",
        priority: "High",
        progress: 100,
        officialPortal: "https://www.gst.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["Store Lease Deed", "ID Proof", "PAN Card"],
        completedDocs: ["Store Lease Deed", "ID Proof", "PAN Card"],
        estimatedTime: "3 Days",
        fee: "₹0",
        description: "GST registration for retail store invoicing."
      },
      {
        id: `${business.id}-app-2`,
        name: "Trade Licence",
        category: "Municipal",
        authority: `${city} Municipal Corp`,
        authorityFull: `${city} City Corporation`,
        status: "Ready to Apply",
        priority: "High",
        progress: 85,
        officialPortal: "https://tnurbantree.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["Property Tax Bill", "Store Lease Agreement"],
        completedDocs: ["Property Tax Bill", "Store Lease Agreement"],
        estimatedTime: "4 Days",
        fee: "₹2,500",
        description: "Municipal permit for running retail outlet."
      },
      {
        id: `${business.id}-app-3`,
        name: "Shops & Establishments Licence",
        category: "Labor",
        authority: "Labor Department",
        authorityFull: "Department of Labor, Govt of TN",
        status: "Approved",
        priority: "Normal",
        progress: 100,
        officialPortal: "https://labour.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["Staff List", "Signboard Photo"],
        completedDocs: ["Staff List", "Signboard Photo"],
        estimatedTime: "3 Days",
        fee: "₹1,200",
        description: "Commercial store working hours & staff safety clearance."
      }
    ];

    documents = [
      { id: `${business.id}-doc-1`, name: "Store_Lease_Agreement.pdf", type: "Retail Premises Deed", size: "2.1 MB", uploadedDate: "2026-08-01", status: "Verified", relatedApproval: "Trade Licence" },
      { id: `${business.id}-doc-2`, name: "Property_Tax_Receipt.pdf", type: "Municipal Tax Copy", size: "1.1 MB", uploadedDate: "2026-08-05", status: "Verified", relatedApproval: "Trade Licence" }
    ];

    applications = [
      { id: `TRADE-RET-101`, approvalName: "Trade Licence", authority: `${city} Municipal Corp`, submittedDate: "2026-08-28", lastUpdated: "4h ago", status: "Ready to Apply", deadline: "18 Sep 2026", actionRequired: "Ready for portal filing" }
    ];

    aiRecommendation = {
      title: "Submit Municipal Trade License Application",
      description: "Store lease deed and tax receipt verified. File application online on the Urban Tree portal.",
      priority: "Normal",
      approvalId: `${business.id}-app-2`
    };

    riskMetrics = { overallScore: 8, status: "Low Risk", delayDays: 0 };

  } else {
    // General Manufacturing / Default Rules
    approvals = [
      {
        id: `${business.id}-app-1`,
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
        requiredDocs: ["Registration Deed", "PAN", "Address Proof"],
        completedDocs: ["Registration Deed", "PAN", "Address Proof"],
        estimatedTime: "3-5 Days",
        fee: "₹0",
        description: "Statutory tax registration for manufacturing sales."
      },
      {
        id: `${business.id}-app-2`,
        name: "Factory Licence",
        category: "Industrial",
        authority: "Directorate of Industrial Safety",
        authorityFull: "Directorate of Industrial Safety and Health (DISH)",
        status: "Ready to Apply",
        priority: "High",
        progress: 70,
        officialPortal: "https://dish.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["Factory Layout Plan", "Land Deed"],
        completedDocs: ["Factory Layout Plan", "Land Deed"],
        estimatedTime: "10 Days",
        fee: "₹10,000",
        description: "Industrial safety approval under Factories Act."
      },
      {
        id: `${business.id}-app-3`,
        name: "Pollution Consent (CTE/CTO)",
        category: "Environmental",
        authority: "TNPCB",
        authorityFull: "Tamil Nadu Pollution Control Board",
        status: "Under Review",
        priority: "High",
        progress: 80,
        officialPortal: "https://tnpcbonline.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: [],
        requiredDocs: ["Site Plan", "Process Flowchart"],
        completedDocs: ["Site Plan", "Process Flowchart"],
        estimatedTime: "15 Days",
        fee: "₹15,000",
        description: "Environmental consent under Air and Water Pollution Control Acts."
      },
      {
        id: `${business.id}-app-4`,
        name: "Fire NOC",
        category: "Safety",
        authority: "Fire & Rescue Services",
        authorityFull: "Tamil Nadu Fire and Rescue Services",
        status: "Not Started",
        priority: "Medium",
        progress: 0,
        officialPortal: "https://tnfrs.tn.gov.in/",
        applicationMethod: "Online",
        missingDocs: ["Building Plan"],
        requiredDocs: ["Building Plan"],
        completedDocs: [],
        estimatedTime: "7 Days",
        fee: "₹5,000",
        description: "Fire safety infrastructure inspection and certification."
      }
    ];

    documents = [
      { id: `${business.id}-doc-1`, name: "Factory_Layout_Plan.pdf", type: "Architectural Layout", size: "4.2 MB", uploadedDate: "2026-08-01", status: "Verified", relatedApproval: "Factory Licence" },
      { id: `${business.id}-doc-2`, name: "Process_Flowchart.pdf", type: "Process Map", size: "1.8 MB", uploadedDate: "2026-08-05", status: "Verified", relatedApproval: "Pollution Consent" }
    ];

    applications = [
      { id: `MFG-2026-001`, approvalName: "Pollution Consent (CTE)", authority: "TNPCB", submittedDate: "2026-08-20", lastUpdated: "1d ago", status: "Under Review", deadline: "22 Sep 2026", actionRequired: "Officer site audit pending" }
    ];

    aiRecommendation = {
      title: "Prepare Factory Licence Application",
      description: "Layout plans and process flowcharts are verified. Submit application on DISH portal.",
      priority: "Medium",
      approvalId: `${business.id}-app-2`
    };

    riskMetrics = { overallScore: 12, status: "Low Risk", delayDays: 5 };
  }

  // Dependency Tree Nodes
  dependencyNodes = [
    { id: "dep-1", label: "Business Registration", authority: "MCA / ROC", status: "Approved", level: 1, x: 50, y: 150 },
    { id: "dep-2", label: "GST Registration", authority: "GST Dept", status: "Approved", level: 2, x: 250, y: 80, parent: "dep-1" },
    { id: "dep-3", label: "Land / Premises Deed", authority: "Revenue Dept", status: "Approved", level: 2, x: 250, y: 220, parent: "dep-1" },
    { id: "dep-4", label: approvals[1]?.name || "Pollution Consent", authority: approvals[1]?.authority || "TNPCB", status: approvals[1]?.status || "Under Review", level: 3, x: 450, y: 150, parent: ["dep-2", "dep-3"], isBottleneck: approvals[1]?.status === 'Action Required' },
    { id: "dep-5", label: approvals[2]?.name || "Factory Licence", authority: approvals[2]?.authority || "Factories Dept", status: approvals[2]?.status || "Ready to Apply", level: 4, x: 650, y: 150, parent: "dep-4" },
    { id: "dep-6", label: approvals[3]?.name || "Fire NOC", authority: approvals[3]?.authority || "Fire Services", status: approvals[3]?.status || "Not Started", level: 5, x: 850, y: 150, parent: "dep-5" }
  ];

  return {
    approvals,
    documents,
    applications,
    dependencyNodes,
    riskMetrics,
    aiRecommendation
  };
};
