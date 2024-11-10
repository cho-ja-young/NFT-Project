// NFTMintingPage.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import './NFTMintingPage.css';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const contractABI = JSON.parse(process.env.REACT_APP_CONTRACT_ABI);

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;

const NFTMintingPage = () => {
    const [account, setAccount] = useState(null);
    const [nfts, setNfts] = useState([]);
    const [nftData, setNftData] = useState('');
    const [mintStatus, setMintStatus] = useState('');
    const [web3, setWeb3] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [pinataUrl, setPinataUrl] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (window.ethereum) {
            const localWeb3 = new Web3(window.ethereum);
            setWeb3(localWeb3);
            window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
                if (chainId !== '0x7a69') {
                    alert("Please switch to the Ganache network.");
                }
            });
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

    const disconnectWallet = () => {
        setAccount(null);
        setNfts([]);
        setMintStatus('');
        setNftData('');
        setImageUrl(null);
        setPinataUrl('');
    };

    const loadNFTs = async (account) => {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        try {
            const nftList = await contract.methods.getNFTsByOwner(account).call();
            setNfts(nftList);
        } catch (error) {
            console.error("Failed to load NFTs:", error);
        }
    };

    const mintNFT = async () => {
        if (!nftData || !pinataUrl) return alert("Please enter NFT data and upload an image.");
        setIsModalOpen(true);
        setMintStatus("Uploading to IPFS...");

        const contract = new web3.eth.Contract(contractABI, contractAddress);
        try {
            setMintStatus("Calling smart contract...");
            await contract.methods.mintNFT(account, nftData, pinataUrl).send({ from: account });
            setMintStatus("NFT minted successfully!");
            loadNFTs(account);
        } catch (error) {
            console.error("Minting failed:", error);
            setMintStatus("NFT minting failed.");
        } finally {
            setTimeout(() => {
                setIsModalOpen(false);
                setMintStatus('');
            }, 3000); // 일정 시간 후 팝업을 닫음
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const config = {
                    headers: {
                        'pinata_api_key': PINATA_API_KEY,
                        'pinata_secret_api_key': PINATA_SECRET_KEY,
                    }
                };

                const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, config);
                const imageUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
                setPinataUrl(imageUrl);
                setImageUrl(URL.createObjectURL(file));
                setMintStatus("Image uploaded to IPFS successfully!");
            } catch (error) {
                console.error("File upload failed:", error);
                setMintStatus("Image upload failed.");
            }
        }
    };

    return (
        <div className="container">
            <div className="header">
                <button className="connect-button" onClick={account ? disconnectWallet : connectWallet}>
                    {account ? `Disconnect Wallet` : `Connect Wallet`}
                </button>
            </div>

            <h1>NFT Minting Page</h1>

            <div className="section">
                <p>Wallet Address: {account || "Not connected"}</p>
            </div>

            <div className="section">
                <h2>Your NFT Ownership</h2>
                <div className="nft-list">
                    {account ? (
                        nfts.length > 0 ? nfts.map((nft, index) => (
                            <div key={index} className="nft-item">
                                NFT ID: {nft.id} - Data: {nft.data}
                            </div>
                        )) : "No NFTs found"
                    ) : (
                        <p>Please connect your wallet to view your NFTs.</p>
                    )}
                </div>
            </div>

            <div className="section">
                <h2>Register New NFT</h2>
                <div className="mint-form">
                    <label htmlFor="nftData">NFT Data:</label>
                    <input 
                        type="text" 
                        id="nftData" 
                        value={nftData} 
                        onChange={(e) => setNftData(e.target.value)} 
                        placeholder="Enter NFT metadata (e.g., name, description)" 
                        required 
                        disabled={!account}
                    />
                    <label htmlFor="imageUpload">Upload Image:</label>
                    <input 
                        type="file" 
                        id="imageUpload" 
                        onChange={handleImageUpload} 
                        required 
                        disabled={!account}
                    />
                    {imageUrl && <img src={imageUrl} alt="NFT Preview" style={{ width: "100px", marginTop: "10px" }} />}
                    <button onClick={mintNFT} disabled={!account}>Mint NFT</button>
                </div>
                <p>{mintStatus}</p>
            </div>

            {/* Inner Pop-up Modal */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <p>{mintStatus}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NFTMintingPage;
