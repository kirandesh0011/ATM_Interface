import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [investmentReturn, setInvestmentReturn] = useState(0);
  const [investmentTime, setInvestmentTime] = useState(0);
  const [investmentGain, setInvestmentGain] = useState(0);
  const [roi, setROI] = useState(0);
  const [annualizedROI, setAnnualizedROI] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [showDonateOptions, setShowDonateOptions] = useState(false);
  const [selectedDonationOption, setSelectedDonationOption] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [donationSuccess, setDonationSuccess] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    getWallet();
  }, []);

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getATMContract();
    } catch (error) {
      console.error(error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const calculateROI = () => {
    const gain = investmentReturn - investmentAmount;
    const roi = (gain / investmentAmount) * 100;
    const annualizedROI = roi / investmentTime;
    setInvestmentGain(gain);
    setROI(roi);
    setAnnualizedROI(annualizedROI);
    setShowTable(true);
    if (roi >= 50) {
      setShowDonateOptions(true);
    }
  };

  const handleAmountChange = (e) => {
    setInvestmentAmount(parseFloat(e.target.value));
  };

  const handleReturnChange = (e) => {
    setInvestmentReturn(parseFloat(e.target.value));
  };

  const handleTimeChange = (e) => {
    setInvestmentTime(parseInt(e.target.value));
  };

  const handleDonateOptionSelect = (option) => {
    setSelectedDonationOption(option);
  };

  const handleDonationAmountChange = (e) => {
    setDonationAmount(parseFloat(e.target.value));
  };

  const handleDonate = async () => {
    if (!selectedDonationOption) {
      return;
    }
    if (selectedDonationOption === "Orphanage" && donationAmount < 500) {
      alert("Minimum donation amount for Orphanage is 500");
      return;
    }
    if (selectedDonationOption === "Old Age Homes" && donationAmount < 800) {
      alert("Minimum donation amount for Old Age Homes is 800");
      return;
    }
    // Donation logic here
    setDonationSuccess(true);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <h2>ROI Calculator</h2>
          <label>
            Investment Amount:
            <input type="number" value={investmentAmount} onChange={handleAmountChange} />
          </label>
          <label>
            Investment Return:
            <input type="number" value={investmentReturn} onChange={handleReturnChange} />
          </label>
          <label>
            Investment Time (Years):
            <input type="number" value={investmentTime} onChange={handleTimeChange} />
          </label>
          <button onClick={calculateROI}>Calculate ROI</button>
          {showTable && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Investment Gain</th>
                    <th>ROI</th>
                    <th>Annualized ROI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{investmentGain}</td>
                    <td>{roi.toFixed(2)}%</td>
                    <td>{annualizedROI.toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {showDonateOptions && (
            <div className="donate-options">
              <h2>Choose Donation Option</h2>
              <button onClick={() => handleDonateOptionSelect("Orphanage")}>Orphanage</button>
              <button onClick={() => handleDonateOptionSelect("Old Age Homes")}>Old Age Homes</button>
              {selectedDonationOption && (
                <div>
                  <p>You selected: {selectedDonationOption}</p>
                  <p>Minimum donation amount: {selectedDonationOption === "Orphanage" ? 500 : 800}</p>
                  <label>
                    Donation Amount:
                    <input type="number" value={donationAmount} onChange={handleDonationAmountChange} />
                  </label>
                  <button onClick={handleDonate}>Donate</button>
                  {donationSuccess && <p>Donated successfully!</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
        .table-container {
          margin-top: 20px;
        }
        .donate-options {
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          border: 1px solid #dddddd;
          text-align: center;
          padding: 8px;
        }
      `}</style>
    </main>
  );
}
