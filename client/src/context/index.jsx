import React from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ABI, ADDRESS } from "../contracts";
import { createEventListener } from "./createEventListener";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const GlobalContext = React.createContext();

export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [contract, setContract] = useState("");
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "info",
    message: "",
  });
  const navigate = useNavigate();
  const [battleName, setBattleName] = useState("");
  const [gameData, setGameData] = useState({
    players: [],
    pendingBattles: [],
    activeBattle: null,
  });
  const [updateGameData, setUpdateGameData] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");

  const player1Ref = useRef();
  const player2Ref = useRef();

  const [battleground, setBattleground] = useState("bg-astral");

  const battlegroundFromLocalStorage = localStorage.getItem("battleground");

  useEffect(() => {
    if (battlegroundFromLocalStorage) {
      setBattleground(battlegroundFromLocalStorage);
    } else {
      localStorage.setItem("battleground", battleground);
    }
  }, []);

  const updateCurrentWalletAddress = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log(accounts);
    if (accounts?.length > 0) {
      setWalletAddress(accounts[0]);
    }

    await setSmartContractAndProvider();
  };

  const setSmartContractAndProvider = async () => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const newContract = new ethers.Contract(ADDRESS, ABI, signer);

    setProvider(provider);
    setContract(newContract);
  };

  useEffect(() => {
    updateCurrentWalletAddress();

    window.ethereum.on("accountsChanged", updateCurrentWalletAddress);
  }, []);

  // useEffect(() => {
  // setSmartContractAndProvider();
  // }, []);

  useEffect(() => {
    if (contract) {
      createEventListener({
        navigate,
        contract,
        provider,
        walletAddress,
        setShowAlert,
        setUpdateGameData,
        player1Ref,
        player2Ref,
      });
    }
  }, [contract]);

  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({
          status: false,
          type: "info",
          message: "",
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  //* Handle error messages
  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage.reason
        ?.slice("execution reverted: ".length)
        .slice(0, -1);

      if (parsedErrorMessage) {
        setShowAlert({
          status: true,
          type: "failure",
          message: parsedErrorMessage,
        });
      }
    }
  }, [errorMessage]);

  // set game data
  useEffect(() => {
    const fetchGameData = async () => {
      const fetchedBattles = await contract.getAllBattles();
      console.log("===fetchedBattles: ", fetchedBattles);

      const pendingBattles = fetchedBattles.filter(
        (battle) => battle.battleStatus === 0
      );

      let activeBattle = null;

      fetchedBattles.forEach((battle) => {
        if (
          battle.players.find(
            (player) => player.toLowerCase() === walletAddress.toLowerCase()
          )
        ) {
          if (battle.winner.startsWith("0x00")) {
            activeBattle = battle;
          }
        }
      });

      setGameData({
        pendingBattles: pendingBattles.slice(1),
        activeBattle,
      });
    };

    if (contract) fetchGameData();
  }, [contract, updateGameData]);

  return (
    <GlobalContext.Provider
      value={{
        contract,
        walletAddress,
        showAlert,
        setShowAlert,
        battleName,
        setBattleName,
        gameData,
        battleground,
        setBattleground,
        errorMessage,
        setErrorMessage,
        player1Ref,
        player2Ref,
        updateCurrentWalletAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
