"use client";

import React from "react";
import axios from "axios";

type User = {
  id: string;
  email?: string;
  name?: string;
  created_at: string;
};

const CryptoAuth: React.FC = () => {
  const [address, setAddress] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Please install MetaMask!");
      return;
    }

    try {
      const [address] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(address);
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  const authenticate = async () => {
    if (!address) return setError("Please connect your wallet first!");

    try {
      const startAuthentication = await axios.post(
          "/api/crypto-auth/start",
          {
            crypto_wallet_type: "ethereum",
            crypto_wallet_address: address,
            siwe_params: {
              domain: "localhost",
              uri: "http://localhost:3000"
            }
          },
      );
      const { challenge } = startAuthentication.data;

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [address, challenge],
      });
      const finishResponse = await axios.post("/api/crypto-auth/finish",
        {
          crypto_wallet_type: "ethereum",
          crypto_wallet_address: address,
          signature: signature
        },
      );

      if (finishResponse.data.status_code !== 200) {
        setError("Authentication failed!");
        console.error(finishResponse.data);
      } else {
        setUser({
          id: finishResponse.data.user_id,
          email: finishResponse.data.email,
          name: `${finishResponse.data.user.first_name ?? ""} ${finishResponse.data.user.last_name ?? ""}`,
          created_at: finishResponse.data.user.created_at,
        } as User);
      }
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  return (
    <div className="bg-black w-50/100 p-10 rounded-md flex flex-col items-center justify-center shadow-xl">
      <h1 className="font-bold text-5xl my-10">Crypto Wallet Authentication</h1>
      {error && <p className="text-red font-semibold">{error}</p>}
        {user ? <p>Welcome back, {user.name} with ID {user.id}!</p> : null}
        {address ? <p>Connected Wallet: {address}</p> : null}
        <div>
          {!address ? (
            <button className="shadow-md hover:bg-violet-700 hover:font-semibold bg-violet-800 text-white p-2 rounded-full" onClick={connectWallet}>Connect Wallet</button>
          ) : null} 
          {address && !user ? (
              <button className="shadow-md hover:bg-violet-700 hover:font-semibold bg-violet-800 text-white p-2 rounded-full" onClick={authenticate}>Authenticate</button>
          ): null}
          {user ? (
            <button className="shadow-md hover:bg-violet-700 hover:font-semibold bg-violet-800 text-white p-2 rounded-full" onClick={() => {setUser(null); setAddress(null);}}>Disconnect</button>
          ) : null}
        </div>
    </div>
  );
};

export default CryptoAuth;

