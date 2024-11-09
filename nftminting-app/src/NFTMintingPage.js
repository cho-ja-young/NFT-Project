import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './NFTMintingPage.css';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const contractABI = JSON.parse(process.env.REACT_APP_CONTRACT_ABI);

const NFTMintingPage = () => {
    const [account, setAccount] = useState(null);
    const [nfts, setNfts] = useState([]);
    const [nftData, setNftData] = useState('');
    const [mintStatus, setMintStatus] = useState('');
    const [web3, setWeb3] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);  // 파일 업로드 상태 추가

    useEffect(() => {
        // Ganache 로컬 네트워크와 연결
        if (window.ethereum) {
            const localWeb3 = new Web3(window.ethereum);
            setWeb3(localWeb3);
            // MetaMask로 연결 시 Ganache로 네트워크를 설정
            window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
                if (chainId !== '0x7a69') {  // Ganache의 기본 체인 ID는 0x7a69 (1337)
                    alert("Please switch to the Ganache network.");
                }
            });
        } else {
            alert("MetaMask is required to connect the wallet.");
        }
    }, []);

    const connectWallet = async () => {
        try {
            // MetaMask와 Ganache 네트워크 연결 요청
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            loadNFTs(accounts[0]);
        } catch (error) {
            console.error("User denied wallet connection:", error);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);  // 연결 해제
        setNfts([]);       // NFT 리스트 초기화
        setMintStatus(''); // 상태 초기화
        setNftData('');    // 입력 데이터 초기화
        setImageUrl(null); // 이미지 URL 초기화
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
        if (!nftData || !imageUrl) return alert("Please enter NFT data and upload an image.");
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        try {
            await contract.methods.mintNFT(account, nftData, imageUrl).send({ from: account });
            setMintStatus("NFT minted successfully!");
            loadNFTs(account);
        } catch (error) {
            console.error("Minting failed:", error);
            setMintStatus("NFT minting failed.");
        }
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);  // 로컬 파일 경로
            setImageUrl(imageUrl);
        }
    };

    return (
        <div className="container">
            {/* Connect / Disconnect Wallet Button in the upper-right corner */}
            <div className="header">
                <button className="connect-button" onClick={account ? disconnectWallet : connectWallet}>
                    {account ? `Disconnect Wallet` : `Connect Wallet`}
                </button>
            </div>

            <h1>NFT Minting Page</h1>

            {/* Wallet Connection Status */}
            <div className="section">
                <p>Wallet Address: {account || "Not connected"}</p>
            </div>

            {/* NFT Ownership Section */}
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

            {/* Mint New NFT Section */}
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
                    <label htmlFor="imageUpload">Upload Image URL:</label>
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
        </div>
    );
};

export default NFTMintingPage;
