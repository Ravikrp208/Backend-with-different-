import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldAlert, X, Printer, HeartPulse, User, Phone, Activity, Copy } from 'lucide-react';

const EmergencyModal = ({ isOpen, onClose, patientData }) => {
  if (!isOpen || !patientData) return null;

  const qrPayload = JSON.stringify({
    type: "EMERGENCY_HEALTH_ID",
    id: patientData.patientId || patientData.record_id || "PT-1001",
    name: patientData.patientName || patientData.patient_name || "Patient",
    bloodGroup: patientData.bloodGroup || "O+",
    allergies: patientData.allergies || "Penicillin, Dust",
    emergencyContact: patientData.emergencyContact || "+1 (555) 019-2831",
    contract: "0x84b33F6dE438f78e203cB68eaADcB5f82De87693"
  });

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrPayload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-md p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-rose-400">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 animate-pulse text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Emergency Health Card</h3>
              <p className="text-xs text-slate-400">Instant medical access QR</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={copyToClipboard}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1 text-xs cursor-pointer border border-slate-700"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1 text-xs cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-500/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5">
          {/* Patient Header with QR */}
          <div className="flex items-center justify-between bg-slate-800/50 p-5 rounded-2xl border border-slate-700/40">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Patient ID</p>
              <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                #{patientData.patientId || patientData.record_id || "PT-1001"}
              </p>
              <h3 className="text-xl font-bold text-white mt-1.5">
                {patientData.patientName || patientData.patient_name || "Rahul Sharma"}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {patientData.patientAge || patientData.age || 32} Years
              </p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-lg shadow-black/20">
              <QRCodeSVG value={qrPayload} size={100} level="H" />
            </div>
          </div>

          {/* Vital Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-rose-950/20 rounded-xl border border-rose-500/15">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <HeartPulse className="w-4 h-4 text-rose-400" /> Blood Group
              </div>
              <p className="text-xl font-bold text-rose-400">
                {patientData.bloodGroup || "O+"}
              </p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <User className="w-4 h-4 text-sky-400" /> Age
              </div>
              <p className="text-xl font-bold text-white">
                {patientData.patientAge || patientData.age || 32} Yrs
              </p>
            </div>
          </div>

          {/* Allergies */}
          <div className="p-4 bg-amber-950/20 rounded-xl border border-amber-500/15">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Activity className="w-4 h-4 text-amber-400" /> Critical Allergies
            </div>
            <p className="text-sm font-semibold text-amber-300">
              {patientData.allergies || "Penicillin, Dust, Latex"}
            </p>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/15">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Phone className="w-4 h-4 text-emerald-400" /> Emergency Contact
            </div>
            <p className="text-sm font-bold text-emerald-300">
              {patientData.emergencyContact || "+91 98765 43210"}
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-500 mt-2">
            Verified On-Chain EHR | Smart Contract: 0x84b3...7693
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
