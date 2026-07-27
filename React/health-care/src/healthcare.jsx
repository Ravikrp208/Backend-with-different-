import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Activity, ShieldCheck, UserCheck, PlusCircle, Search, FileText,
  Lock, UploadCloud, QrCode, Download, Trash2, Key,
  ExternalLink, Stethoscope, RefreshCw, CheckCircle2, Wallet, Eye, EyeOff,
  Users, Globe, Clock, HeartPulse
} from "lucide-react";
import { encryptData, decryptData, generateIpfsHash } from "./utils/crypto";
import { exportPatientPDF } from "./utils/pdfExport";
import Toast from "./components/Toast";
import EmergencyModal from "./components/EmergencyModal";

const Healthcare = () => {
  // Web3 State
  const [accountAddress, setAccountAddress] = useState("");
  const [contractOwner, setContractOwner] = useState("");
  const [smartContract, setSmartContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("records");

  // Form States
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [allergies, setAllergies] = useState("");

  // Advanced Feature States
  const [useEncryption, setUseEncryption] = useState(false);
  const [ipfsFile, setIpfsFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [decryptedRecords, setDecryptedRecords] = useState({});

  // Search & Records
  const [searchPatientId, setSearchPatientId] = useState("101");
  const [patientAllRecords, setPatientAllRecords] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // Access Control & Providers List
  const [authorizeAddress, setAuthorizeAddress] = useState("");
  const [authorizedProviders, setAuthorizedProviders] = useState([
    { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", role: "Hospital Admin", date: "2026-07-20" },
    { address: "0x3C44CdD46573453471c6196321735709E72ce291", role: "Dr. Sarah Jenkins", date: "2026-07-25" }
  ]);

  // Modal & Toast
  const [toast, setToast] = useState(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [selectedEmergencyPatient, setSelectedEmergencyPatient] = useState(null);

  const contractAddress = "0x84b33F6dE438f78e203cB68eaADcB5f82De87693";
  const contractAbi = [
    {
      inputs: [
        { internalType: "uint256", name: "patient_id", type: "uint256" },
        { internalType: "string", name: "patient_name", type: "string" },
        { internalType: "string", name: "diagnosis", type: "string" },
        { internalType: "string", name: "treatment", type: "string" },
        { internalType: "uint256", name: "age", type: "uint256" }
      ],
      name: "addPatientRecord",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "authorizeByOwner",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ internalType: "uint256", name: "patient_id", type: "uint256" }],
      name: "fetchPatientRecords",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "record_id", type: "uint256" },
            { internalType: "uint256", name: "age", type: "uint256" },
            { internalType: "string", name: "patient_name", type: "string" },
            { internalType: "string", name: "diagnosis", type: "string" },
            { internalType: "string", name: "treatment", type: "string" },
            { internalType: "uint256", name: "timestamp", type: "uint256" }
          ],
          internalType: "struct Record[]",
          name: "",
          type: "tuple[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
    }
  ];

  const showToast = (message, type = "info", txHash = null) => {
    setToast({ message, type, txHash });
    setTimeout(() => setToast(null), 5000);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      showToast("MetaMask wallet missing! Please install MetaMask extension.", "error");
      return;
    }
    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      } catch (switchError) {
        console.warn("Chain switch error or user cancelled:", switchError);
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccountAddress(address);

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      setSmartContract(contract);

      try {
        const owner = await contract.getOwner();
        setContractOwner(owner);
      } catch {
        setContractOwner("0x84b33F6dE438f78e203cB68eaADcB5f82De87693");
      }

      showToast(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`, "success");
    } catch (error) {
      console.error("Wallet Connection Error:", error);
      showToast(error.message || "Failed to connect wallet", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
    loadSampleRecords();
  }, []);

  const loadSampleRecords = () => {
    setPatientAllRecords([
      {
        record_id: "101",
        patient_name: "Rahul Sharma",
        age: "32",
        diagnosis: "Type 2 Diabetes Mellitus & Mild Hypertension",
        treatment: "Metformin 500mg daily, Low glycemic diet, exercise 30 mins",
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
        ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        isEncrypted: false
      },
      {
        record_id: "101",
        patient_name: "Rahul Sharma",
        age: "37",
        diagnosis: encryptData("Acute Cardiac Arrhythmia - Confident Diagnostic"),
        treatment: encryptData("Prescribed Amiodarone 200mg & Continuous ECG Monitor"),
        timestamp: Math.floor(Date.now() / 1000) - 3600 * 4,
        ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        isEncrypted: true
      }
    ]);
  };

  // Add Patient Record Handler
  const handleAddPatientRecord = async (e) => {
    e.preventDefault();
    if (!patientId || !patientName || !diagnosis || !treatment) {
      showToast("Please fill all required patient fields", "error");
      return;
    }

    try {
      showToast("Preparing medical record on blockchain...", "info");

      let finalDiagnosis = diagnosis;
      let finalTreatment = treatment;

      if (useEncryption) {
        finalDiagnosis = encryptData(diagnosis);
        finalTreatment = encryptData(treatment);
      }

      if (ipfsFile) {
        const hash = generateIpfsHash(ipfsFile.name);
        finalTreatment += ` | IPFS Report: ${hash}`;
      }

      if (smartContract) {
        const tx = await smartContract.addPatientRecord(
          patientId,
          patientName,
          finalDiagnosis,
          finalTreatment,
          patientAge || 0
        );
        showToast("Transaction submitted to Ethereum network...", "info", tx.hash);
        await tx.wait();
        showToast("Medical Record successfully saved on Blockchain!", "success", tx.hash);
      } else {
        const newRecord = {
          record_id: patientId,
          patient_name: patientName,
          age: patientAge || "30",
          diagnosis: finalDiagnosis,
          treatment: finalTreatment,
          timestamp: Math.floor(Date.now() / 1000),
          ipfsHash: ipfsHash || (ipfsFile ? generateIpfsHash(ipfsFile.name) : ""),
          isEncrypted: useEncryption
        };
        setPatientAllRecords((prev) => [newRecord, ...prev]);
        showToast("Record added successfully (Demo Mode)", "success");
      }

      setPatientName("");
      setPatientAge("");
      setDiagnosis("");
      setTreatment("");
      setIpfsFile(null);
      setIpfsHash("");
      setActiveTab("records");
      setSearchPatientId(patientId);
    } catch (error) {
      console.error("Add Record Error:", error);
      showToast(error.reason || error.message || "Transaction failed", "error");
    }
  };

  // Fetch Patient Records
  const handleFetchRecords = async () => {
    if (!searchPatientId) {
      showToast("Please enter a Patient ID to search", "error");
      return;
    }
    try {
      setIsFetching(true);
      if (smartContract) {
        const records = await smartContract.fetchPatientRecords(searchPatientId);
        const formatted = records.map((r) => ({
          record_id: r.record_id.toString(),
          age: r.age.toString(),
          patient_name: r.patient_name,
          diagnosis: r.diagnosis,
          treatment: r.treatment,
          timestamp: Number(r.timestamp),
          isEncrypted: r.diagnosis.startsWith("ENC:") || r.treatment.startsWith("ENC:")
        }));
        setPatientAllRecords(formatted);
        showToast(`Fetched ${formatted.length} records for Patient #${searchPatientId}`, "success");
      } else {
        showToast(`Loaded records for Patient #${searchPatientId}`, "info");
      }
    } catch (error) {
      console.error("Fetch Records Error:", error);
      showToast("Could not fetch records from contract", "error");
    } finally {
      setIsFetching(false);
    }
  };

  // Authorize Provider
  const handleAuthorizeProvider = async () => {
    if (!authorizeAddress) {
      showToast("Please enter a valid Ethereum Wallet Address", "error");
      return;
    }
    try {
      if (smartContract) {
        const tx = await smartContract.authorizeByOwner(authorizeAddress);
        showToast("Authorizing provider on-chain...", "info", tx.hash);
        await tx.wait();
        showToast("Provider Authorized Successfully!", "success", tx.hash);
      }
      setAuthorizedProviders((prev) => [
        { address: authorizeAddress, role: "Medical Specialist", date: new Date().toISOString().split("T")[0] },
        ...prev
      ]);
      setAuthorizeAddress("");
    } catch (error) {
      console.error("Authorize Error:", error);
      showToast("Authorization failed", "error");
    }
  };

  // Revoke Provider Access
  const handleRevokeProvider = (addressToRevoke) => {
    setAuthorizedProviders((prev) => prev.filter((p) => p.address !== addressToRevoke));
    showToast(`Access Revoked for ${addressToRevoke.slice(0, 6)}...`, "info");
  };

  // Toggle Decrypt Record
  const toggleDecrypt = (index, encDiag, encTreat) => {
    if (decryptedRecords[index]) {
      setDecryptedRecords((prev) => ({ ...prev, [index]: null }));
    } else {
      const decDiag = decryptData(encDiag);
      const decTreat = decryptData(encTreat);
      setDecryptedRecords((prev) => ({
        ...prev,
        [index]: { diagnosis: decDiag, treatment: decTreat }
      }));
      showToast("Record Decrypted Client-Side", "success");
    }
  };

  // Trigger Emergency Card
  const openEmergencyCard = (rec) => {
    setSelectedEmergencyPatient({
      patientId: rec ? rec.record_id : searchPatientId || "101",
      patientName: rec ? rec.patient_name : "Rahul Sharma",
      patientAge: rec ? rec.age : "32",
      bloodGroup: bloodGroup,
      allergies: allergies || "Penicillin, Dust, Latex",
      emergencyContact: emergencyContact || "+91 98765 43210"
    });
    setEmergencyModalOpen(true);
  };

  const isOwner = accountAddress && contractOwner && accountAddress.toLowerCase() === contractOwner.toLowerCase();

  return (
    <div className="app-wrapper">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        patientData={selectedEmergencyPatient}
      />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Head Section */}
        <div className="glass-card-static overflow-hidden">
          <div className="relative bg-gradient-to-r from-sky-500/10 via-emerald-500/5 to-transparent p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-sky-500/20 to-emerald-500/10 border border-sky-500/20 rounded-2xl text-sky-400 shadow-lg shadow-sky-500/5">
                  <HeartPulse className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                    HealthCare Web3 EHR
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Blockchain-Powered Electronic Health Records
                  </p>
                </div>
              </div>

              {/* Wallet Connection */}
              <div>
                {accountAddress ? (
                  <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2.5 pl-4 rounded-2xl">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></span>
                        <span className="text-sm font-mono text-slate-200 font-medium">
                          {accountAddress.slice(0, 8)}...{accountAddress.slice(-6)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {isOwner ? "Contract Owner / Admin" : "Authorized Healthcare Provider"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-800 text-sky-400 rounded-xl border border-slate-700/50">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="glass-btn text-base not-['.disabled']:cursor-pointer"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" /> Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" /> Connect MetaMask
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Records</p>
                <p className="text-xl font-bold text-white mt-0.5">{patientAllRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Providers</p>
                <p className="text-xl font-bold text-white mt-0.5">{authorizedProviders.length}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Network</p>
                <p className="text-sm font-bold text-white mt-0.5">Sepolia</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 border rounded-xl ${smartContract ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Connected</p>
                <p className="text-sm font-bold text-white mt-0.5">{smartContract ? 'Active' : 'Offline'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="glass-card p-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setActiveTab("records")}
              className={`tab-btn ${activeTab === "records" ? "active" : ""}`}
            >
              <FileText className="w-4 h-4" /> Patient Records
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
            >
              <PlusCircle className="w-4 h-4" /> Add Record
            </button>
            <button
              onClick={() => setActiveTab("authorize")}
              className={`tab-btn ${activeTab === "authorize" ? "active" : ""}`}
            >
              <ShieldCheck className="w-4 h-4" /> Access Control
            </button>
            <button
              onClick={() => {
                openEmergencyCard(null);
              }}
              className="tab-btn text-rose-400 hover:text-rose-300 ml-auto cursor-pointer"
            >
              <QrCode className="w-4 h-4" /> Emergency Card
            </button>
          </div>
        </div>

        {/* TAB 1: Patient Medical Records */}
        {activeTab === "records" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="glass-card p-5">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    className="glass-input pl-11"
                    placeholder="Search by Patient ID..."
                    value={searchPatientId}
                    onChange={(e) => setSearchPatientId(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFetchRecords}
                    disabled={isFetching}
                    className="glass-btn whitespace-nowrap flex-1 md:flex-none cursor-pointer"
                  >
                    {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Fetch EHR"}
                  </button>
                  {patientAllRecords.length > 0 && (
                    <button
                      onClick={() => exportPatientPDF(patientAllRecords, searchPatientId)}
                      className="glass-btn-secondary whitespace-nowrap flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-sky-400" /> Export PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Records List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  Medical Record Timeline
                </h2>
                {patientAllRecords.length > 0 && (
                  <span className="badge badge-slate">{patientAllRecords.length} records</span>
                )}
              </div>

              {patientAllRecords.length === 0 ? (
                <div className="glass-card p-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-300 font-semibold text-lg">No records fetched yet</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                      Enter a Patient ID above and click "Fetch EHR" to load records from the Ethereum blockchain.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientAllRecords.map((rec, index) => {
                    const isDecrypted = decryptedRecords[index];
                    const displayDiag = isDecrypted ? isDecrypted.diagnosis : rec.diagnosis;
                    const displayTreat = isDecrypted ? isDecrypted.treatment : rec.treatment;

                    return (
                      <div
                        key={index}
                        className={`record-card ${rec.isEncrypted ? 'encrypted-record' : ''}`}
                      >
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="badge badge-sky font-mono">#{rec.record_id}</span>
                            <h3 className="text-lg font-bold text-white">{rec.patient_name}</h3>
                            <span className="text-sm text-slate-400">({rec.age} Yrs)</span>
                            {rec.isEncrypted && (
                              <span className="badge badge-amber flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Encrypted
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                            <span className="text-xs text-slate-400 font-mono whitespace-nowrap flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(Number(rec.timestamp) * 1000).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Record Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          <div className="record-content-box space-y-2">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-rose-400" />
                              Diagnosis / Medical Condition
                            </span>
                            <p className={`text-sm font-medium leading-relaxed break-all whitespace-pre-wrap ${rec.isEncrypted && !isDecrypted ? 'font-mono text-xs opacity-70 text-amber-300 bg-amber-950/20 p-2 rounded-lg' : 'text-rose-300'}`}>
                              {displayDiag}
                            </p>
                          </div>
                          <div className="record-content-box space-y-2">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                              Prescription & Treatment Plan
                            </span>
                            <p className={`text-sm font-medium leading-relaxed break-all whitespace-pre-wrap ${rec.isEncrypted && !isDecrypted ? 'font-mono text-xs opacity-70 text-amber-300 bg-amber-950/20 p-2 rounded-lg' : 'text-emerald-300'}`}>
                              {displayTreat}
                            </p>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/50">
                          {rec.ipfsHash ? (
                            <a
                              href={`https://ipfs.io/ipfs/${rec.ipfsHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/30 px-3 py-2 rounded-lg border border-sky-500/20 transition-colors self-start"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              IPFS Report
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <UploadCloud className="w-3.5 h-3.5" />
                              No external lab files
                            </span>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {rec.isEncrypted && (
                              <button
                                onClick={() => toggleDecrypt(index, rec.diagnosis, rec.treatment)}
                                className="glass-btn-secondary text-xs flex items-center gap-1.5 py-2 cursor-pointer"
                              >
                                {isDecrypted ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 text-amber-400" /> Re-Lock
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-400" /> Decrypt
                                  </>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => openEmergencyCard(rec)}
                              className="glass-btn-secondary text-xs flex items-center gap-1.5 py-2 text-rose-400 border-rose-500/30 hover:bg-rose-950/30 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" /> Emergency QR
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Add Patient Record */}
        {activeTab === "add" && (
          <div className="glass-card p-6 md:p-8 max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-5 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create Patient Diagnosis Record</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Write diagnosis notes and treatments immutably onto Ethereum Blockchain.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddPatientRecord} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="form-group">
                  <label className="form-label form-label-required">Patient ID</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. 101"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Patient Full Name</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Full Name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="glass-input"
                    placeholder="Age in years"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="glass-input bg-slate-900"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="+91 98765 43210"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies / Warnings</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Penicillin"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label form-label-required">Diagnosis Notes</label>
                <textarea
                  className="glass-input min-h-[100px]"
                  placeholder="Enter medical condition details..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="form-label form-label-required">Treatment & Prescriptions</label>
                <textarea
                  className="glass-input min-h-[100px]"
                  placeholder="Enter treatment plan, dosages, medications..."
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  required
                />
              </div>

              {/* IPFS Attachment */}
              <div className="content-section space-y-3">
                <label className="form-label text-sky-400 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Attach Lab Report / X-Ray PDF to IPFS
                </label>
                <input
                  type="file"
                  onChange={(e) => setIpfsFile(e.target.files[0])}
                  className="text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-500/15 file:text-sky-300 hover:file:bg-sky-500/25 cursor-pointer file:cursor-pointer"
                />
                {ipfsFile && (
                  <p className="text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Selected: {ipfsFile.name} (CID Hash generated on submit)
                  </p>
                )}
              </div>

              {/* Encryption Toggle */}
              <div className="content-section">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Client-Side End-to-End Encryption</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Encrypt diagnosis & treatment before broadcasting to the public Ethereum network.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={useEncryption}
                      onChange={(e) => setUseEncryption(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500 border border-slate-700"></div>
                  </label>
                </div>
              </div>

              <button type="submit" className="glass-btn w-full justify-center py-3.5 text-base cursor-pointer">
                <ShieldCheck className="w-5 h-5" /> Submit Record to Smart Contract
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: Access Control & Revoke */}
        {activeTab === "authorize" && (
          <div className="space-y-6">
            {/* Authorize Section */}
            <div className="glass-card p-6 md:p-8">
              <div className="border-b border-slate-800 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Healthcare Provider Access Control</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Grant or revoke permission for doctors and medical centers to view patient health records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  className="glass-input font-mono text-sm"
                  placeholder="Provider Ethereum Address (0x...)"
                  value={authorizeAddress}
                  onChange={(e) => setAuthorizeAddress(e.target.value)}
                />
                <button onClick={handleAuthorizeProvider} className="glass-btn glass-btn-success whitespace-nowrap cursor-pointer">
                  <UserCheck className="w-4 h-4" /> Authorize Doctor
                </button>
              </div>
            </div>

            {/* Active Authorized Providers List */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                    <Key className="w-4 h-4" />
                  </div>
                  Active Authorized Institutions & Doctors
                </h3>
                <span className="badge badge-amber">{authorizedProviders.length} active</span>
              </div>

              <div className="space-y-3">
                {authorizedProviders.map((provider, idx) => (
                  <div
                    key={idx}
                    className="provider-card flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-sky-300 font-medium">{provider.address}</span>
                        <span className="badge badge-emerald">{provider.role}</span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Access granted on {provider.date}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevokeProvider(provider.address)}
                      className="glass-btn-secondary text-xs text-rose-400 border-rose-500/30 hover:bg-rose-950/40 flex items-center gap-1.5 self-start cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Revoke Access
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Healthcare;
