import { useState, useEffect } from "react";
import { ethers } from "ethers";
const Healthcare = () => {
  const [accountAddress, setAccountAddress] = useState("");
  const [authorizeAddress, setAuthorizeAddress] = useState("");
  const [smartContract, setSmartConract] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientName, setpatientName] = useState("");
  const [patientAge, setpatientAge] = useState("");
  const [diagnosis, setdiagnosis] = useState("");
  const [treatment, settreatment] = useState("");
  const [patientAllRecords, setpatientAllRecords] = useState([]);
  const contractAddress = "0x84b33F6dE438f78e203cB68eaADcB5f82De87693";
  const contractAbi = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "patient_id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "patient_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "diagnosis",
          type: "string",
        },
        {
          internalType: "string",
          name: "treatment",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "age",
          type: "uint256",
        },
      ],
      name: "addPatientRecord",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "authorizeByOwner",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "allRecords",
      outputs: [
        {
          internalType: "uint256",
          name: "record_id",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "age",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "patient_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "diagnosis",
          type: "string",
        },
        {
          internalType: "string",
          name: "treatment",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "authorizePerson",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "patient_id",
          type: "uint256",
        },
      ],
      name: "fetchPatientRecords",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "record_id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "age",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "patient_name",
              type: "string",
            },
            {
              internalType: "string",
              name: "diagnosis",
              type: "string",
            },
            {
              internalType: "string",
              name: "treatment",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
          ],
          internalType: "struct Record[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getOwner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        alert("download metamask wallet");
        return;
      }
      // connect wallet to my app
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });

      const signer = await provider.getSigner();
      setAccountAddress(await signer.getAddress());

      // connect with SmartContract
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer,
      );
      setSmartConract(contract);

      const owner = await contract.getOwner();
      console.log(owner);
    };

    connectWallet();
  }, []);

  const authorityProvide = async () => {
    try {
      const provided = await smartContract.authorizeByOwner(authorizeAddress);
      setAuthorizeAddress("");
    } catch (error) {
      console.log("error", error);
    }
  };
  const addPateintRecord = async () => {
    try {
      const record = await smartContract.addPatientRecord(
        patientId,
        patientName,
        diagnosis,
        treatment,
        patientAge,
      );
      setPatientId("");
      setpatientName("");
      setpatientAge("");
      setdiagnosis("");
      settreatment("");
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchAllRecords = async () => {
    try {
      const allRecords = await smartContract.fetchPatientRecords(patientId);
      setpatientAllRecords(allRecords);
      setPatientId("");
    } catch (error) {
      console.log("error", error);
    }
  };
  return (
    <div className="container">
      <h1 className="title">HealthCare Application</h1>
      {accountAddress && (
        <p className="account-info">Connected Account: {accountAddress} </p>
      )}
      <p className="owner-info">You are the contract owner</p>

      <div className="form-section">
        <h2>Fetch Patient Records</h2>
        <input
          className="input-field"
          type="text"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button className="action-button" onClick={fetchAllRecords}>
          Fetch Records
        </button>
      </div>

      <div className="form-section">
        <h2>Add Patient Record</h2>
        <input
          className="input-field"
          type="text"
          placeholder="pateint ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="pateint name"
          value={patientName}
          onChange={(e) => setpatientName(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="pateint age"
          value={patientAge}
          onChange={(e) => setpatientAge(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => setdiagnosis(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Treatment"
          value={treatment}
          onChange={(e) => settreatment(e.target.value)}
        />
        <button className="action-button" onClick={addPateintRecord}>
          Add Records
        </button>
      </div>
      <div className="form-section">
        <h2>Authorize HealthCare Provider</h2>
        <input
          className="input-field"
          type="text"
          placeholder="Provider Address"
          value={authorizeAddress}
          onChange={(e) => setAuthorizeAddress(e.target.value)}
        />
        <button className="action-button" onClick={authorityProvide}>
          Authorize Provider
        </button>
      </div>

      {
        <div className="records-section">
          <h2>Patient Records</h2>
          {patientAllRecords.map((record, index) => (
            <div key={index}>
              <p>Record ID: {record.record_id}</p>
              <p>Patient Age: {record.age}</p>
              <p>Patient Name: {record.patient_name}</p>
              <p>Diagnosis: {record.diagnosis}</p>
              <p>Treatment: {record.treatment}</p>
              <p>
                Timestamp:{" "}
                {new Date(Number(record.timestamp) * 1000).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Healthcare;
