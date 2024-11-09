import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './NFTMintingPage.css';

const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = YOUR_CONTRACT_ABI; // Replace with your contract ABI

const NFTMintingPage = () => {
    const [account, setAccount] = useState(null);
    const [nfts, setNfts] = useState([]);
    const [nftData, setNftData] = useState('');
    const [mintStatus, setMintStatus] = useState('');
    const [web3, setWeb3] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            setWeb3(new Web3(window.ethereum));
        } else {
            alert("MetaMask is required to connect the wallet.");
        }
    }, []);

    const connectWallet = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            loadNFTs(accounts[0]);
        } catch (error) {
            console.error("User denied wallet connection:", error);
        }
    };

    const loadNFTs = async (account) => {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        try {
            const nftList = await contract.methods.getNFTsByOwner(account).call(); // Assume this method exists
            setNfts(nftList);
        } catch (error) {
            console.error("Failed to load NFTs:", error);
        }
    };

    const mintNFT = async () => {
        if (!nftData) return alert("Please enter NFT data.");
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        try {
            await contract.methods.mintNFT(account, nftData).send({ from: account });
            setMintStatus("NFT minted successfully!");
            loadNFTs(account);
        } catch (error) {
            console.error("Minting failed:", error);
            setMintStatus("NFT minting failed.");
        }
    };

    return (
        <div className="container">
            <h1>NFT Minting Page</h1>

            {/* Wallet Connection */}
            <div className="section">
                <button onClick={connectWallet}>Connect Wallet</button>
                <p>Wallet Address: {account || "Not connected"}</p>
            </div>

            {/* NFT Ownership Section */}
            <div className="section">
                <h2>Your NFT Ownership</h2>
                <div className="nft-list">
                    {nfts.length > 0 ? nfts.map((nft, index) => (
                        <div key={index} className="nft-item">
                            NFT ID: {nft.id} - Data: {nft.data}
                        </div>
                    )) : "No NFTs found"}
                </div>
            </div>

            {/* Mint New NFT Section */}
            <div className="section">
                <h2>Mint New NFT</h2>
                <div className="mint-form">
                    <label htmlFor="nftData">NFT Data:</label>
                    <input 
                        type="text" 
                        id="nftData" 
                        value={nftData} 
                        onChange={(e) => setNftData(e.target.value)} 
                        placeholder="Enter NFT metadata (e.g., name, description)" 
                        required 
                    />
                    <button onClick={mintNFT}>Mint NFT</button>
                </div>
                <p>{mintStatus}</p>
            </div>
        </div>
    );
};

export default NFTMintingPage;
