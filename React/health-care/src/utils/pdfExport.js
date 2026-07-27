// PDF Generator helper using browser print / window payload

export const exportPatientPDF = (patientRecords, patientId) => {
  if (!patientRecords || patientRecords.length === 0) return;

  const printWindow = window.open("", "_blank");
  const recordsHTML = patientRecords
    .map(
      (rec, index) => `
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-weight: bold; color: #0284c7;">Record #${rec.record_id || index + 1}</span>
          <span style="color: #64748b; font-size: 12px;">${new Date(Number(rec.timestamp) * 1000).toLocaleString()}</span>
        </div>
        <p><strong>Patient Name:</strong> ${rec.patient_name || 'N/A'}</p>
        <p><strong>Age:</strong> ${rec.age || 'N/A'}</p>
        <p><strong>Diagnosis:</strong> <span style="color: #dc2626; font-weight: 600;">${rec.diagnosis}</span></p>
        <p><strong>Treatment & Prescription:</strong> ${rec.treatment}</p>
        ${rec.ipfsHash ? `<p style="font-size: 12px; color: #0284c7;"><strong>IPFS Report:</strong> ${rec.ipfsHash}</p>` : ''}
      </div>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medical History Report - Patient ID #${patientId}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
          .footer { border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">HealthCare Blockchain Electronic Health Record</h1>
            <p class="subtitle">Patient Medical Summary Report | Patient ID: #${patientId}</p>
          </div>
          <div>
            <p style="font-size: 12px; font-weight: bold; color: #0284c7;">Verified On-Chain</p>
          </div>
        </div>
        ${recordsHTML}
        <div class="footer">
          Generated automatically from Ethereum Smart Contract: 0x84b33F6dE438f78e203cB68eaADcB5f82De87693 on ${new Date().toLocaleDateString()}
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
