import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultBusinesses } from '../data/defaultBusinesses';
import { generateRequirements } from '../services/complianceEngine';
import { initialNotifications, grievances as defaultGrievances, schemesAndIncentives } from '../data/mockData';

const AppContext = createContext();

const STORAGE_KEYS = {
  BUSINESSES: 'innovx_businesses_v2',
  ACTIVE_ID: 'innovx_active_id_v2',
  BUSINESS_DATA: 'innovx_data_v2'
};

export const AppProvider = ({ children }) => {
  // 1. Initialize Businesses List from localStorage or Default
  const [businesses, setBusinesses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
      return saved ? JSON.parse(saved) : defaultBusinesses;
    } catch {
      return defaultBusinesses;
    }
  });

  // 2. Initialize Active Business ID
  const [activeBusinessId, setActiveBusinessId] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      return savedId || defaultBusinesses[0].id;
    } catch {
      return defaultBusinesses[0].id;
    }
  });

  // Active Business Object
  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || businesses[0] || defaultBusinesses[0];

  // 3. Initialize Business Workspace Data Store from localStorage
  const [dataStore, setDataStore] = useState(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.BUSINESS_DATA);
      if (savedData) return JSON.parse(savedData);
    } catch (e) {
      console.warn("Failed loading localStorage business data", e);
    }
    // Default initial store for pre-populated businesses
    const initialStore = {};
    defaultBusinesses.forEach(b => {
      initialStore[b.id] = generateRequirements(b);
    });
    return initialStore;
  });

  // Ensure current active business has generated requirements in dataStore
  const activeData = dataStore[activeBusiness.id] || generateRequirements(activeBusiness);

  // Active state slices
  const approvals = activeData.approvals || [];
  const documents = activeData.documents || [];
  const applications = activeData.applications || [];
  const dependencyNodes = activeData.dependencyNodes || [];
  const riskMetrics = activeData.riskMetrics || { overallScore: 10, status: "Low Risk" };
  const aiRecommendation = activeData.aiRecommendation || {
    title: "Complete Application Scrutiny",
    description: "Verify uploaded documents before submission.",
    priority: "Normal"
  };

  const [notifications, setNotifications] = useState(initialNotifications);
  const [grievances, setGrievances] = useState(defaultGrievances);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [whatIfExpanded, setWhatIfExpanded] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    } catch (e) {
      console.error("Failed saving businesses to localStorage", e);
    }
  }, [businesses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeBusinessId);
    } catch (e) {
      console.error("Failed saving activeId to localStorage", e);
    }
  }, [activeBusinessId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESS_DATA, JSON.stringify(dataStore));
    } catch (e) {
      console.error("Failed saving dataStore to localStorage", e);
    }
  }, [dataStore]);

  // Switch Active Business
  const switchBusiness = (businessId) => {
    if (businesses.some(b => b.id === businessId)) {
      setActiveBusinessId(businessId);
      // Ensure dataset exists
      if (!dataStore[businessId]) {
        const targetBus = businesses.find(b => b.id === businessId);
        if (targetBus) {
          const generated = generateRequirements(targetBus);
          setDataStore(prev => ({ ...prev, [businessId]: generated }));
        }
      }
    }
  };

  // Add New Business
  const addBusiness = (newBusinessInput) => {
    const newId = `bus-${Date.now()}`;
    const newBusObj = { id: newId, ...newBusinessInput };
    
    // Generate requirements
    const generatedRequirements = generateRequirements(newBusObj);

    // Update state & data store
    setBusinesses(prev => [...prev, newBusObj]);
    setDataStore(prev => ({ ...prev, [newId]: generatedRequirements }));
    setActiveBusinessId(newId);

    // Add success notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Workspace Created: ${newBusObj.name}`,
        message: `InnovX generated ${generatedRequirements.approvals.length} statutory requirements for ${newBusObj.industry} in ${newBusObj.location}.`,
        time: "Just now",
        type: "success",
        unread: true
      },
      ...prev
    ]);
  };

  // Update Business Profile
  const updateBusinessProfile = (updatedProfile) => {
    setBusinesses(prev => 
      prev.map(b => b.id === activeBusiness.id ? { ...b, ...updatedProfile } : b)
    );
  };

  // Upload Document Simulator
  const handleUploadDocument = (docName = "Project_Report.pdf", relatedApproval = "Pollution Consent") => {
    setDataStore(prevStore => {
      const currentBusData = prevStore[activeBusiness.id] || generateRequirements(activeBusiness);

      const updatedDocs = currentBusData.documents.map(doc => {
        if (doc.name.includes("Project_Report") || doc.name.includes(docName) || doc.id.includes("doc-4")) {
          return {
            ...doc,
            name: docName,
            status: "Verified",
            size: "3.2 MB",
            uploadedDate: new Date().toISOString().split('T')[0],
            warning: null,
            checks: [
              { name: "Document layout detected", passed: true },
              { name: " Mass balance / details verified", passed: true },
              { name: "Authorized seal present", passed: true }
            ]
          };
        }
        return doc;
      });

      const updatedApprovals = currentBusData.approvals.map(app => {
        if (app.name.includes("Pollution") || app.missingDocs?.includes("Project Report") || app.id.includes("app-2")) {
          return {
            ...app,
            status: "Under Review",
            progress: 90,
            missingDocs: [],
            bottleneckAlert: null
          };
        }
        if (app.name.includes("Factory") || app.id.includes("app-3")) {
          return {
            ...app,
            status: "Ready to Apply",
            progress: 80
          };
        }
        return app;
      });

      const updatedApps = currentBusData.applications.map(item => {
        if (item.approvalName.includes("Pollution") || item.status === 'Action Required') {
          return {
            ...item,
            status: "Under Review",
            lastUpdated: "Just now",
            actionRequired: "Document verified. Scrutiny officer reviewing."
          };
        }
        return item;
      });

      return {
        ...prevStore,
        [activeBusiness.id]: {
          ...currentBusData,
          documents: updatedDocs,
          approvals: updatedApprovals,
          applications: updatedApps,
          riskMetrics: { ...currentBusData.riskMetrics, overallScore: 5, delayDays: 0 }
        }
      };
    });

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: "AI Document Scrutiny Passed",
        message: `${docName} verified for ${activeBusiness.name}. Statutory scrutiny unblocked!`,
        time: "Just now",
        type: "success",
        unread: true
      },
      ...prev
    ]);
  };

  const addGrievance = (grievanceData) => {
    const newGrievance = {
      id: `GRV-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Under Review",
      submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      ...grievanceData
    };
    setGrievances(prev => [newGrievance, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const disclaimerNotice = "AI-generated guidance: Requirements shown are based on the business profile and configured compliance rules. Verify applicable requirements with the relevant authority before submission.";

  return (
    <AppContext.Provider value={{
      businesses,
      activeBusinessId,
      activeBusiness,
      switchBusiness,
      addBusiness,
      updateBusinessProfile,
      approvals,
      documents,
      applications,
      dependencyNodes,
      riskMetrics,
      aiRecommendation,
      notifications,
      grievances,
      addGrievance,
      schemesAndIncentives,
      selectedAppId,
      setSelectedAppId,
      handleUploadDocument,
      markNotificationRead,
      clearAllNotifications,
      whatIfExpanded,
      setWhatIfExpanded,
      disclaimerNotice
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
