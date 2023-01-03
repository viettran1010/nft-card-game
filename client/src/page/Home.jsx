import React, { useEffect } from "react";
import { CustomInput, PageHOC, CustomButton } from "../components";
import { useGlobalContext } from "../context";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { contract, walletAddress, setShowAlert, setErrorMessage, gameData } =
    useGlobalContext();
  const [playerName, setPlayerName] = React.useState("");
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const playerExists = false;

      if (!playerExists) {
        await contract.registerPlayer(playerName, playerName);

        setShowAlert({
          status: true,
          type: "info",
          message: `Player ${playerName} is being summoned`,
        });
      }
    } catch (error) {
      setErrorMessage(error);
    }
  };

  useEffect(() => {
    const checkForPlayerToken = async () => {
      const playerExists = await contract.isPlayer(walletAddress);
      const playerTokenExists = await contract.isPlayerToken(walletAddress);

      if (playerExists && playerTokenExists) {
        navigate("/create-battle");
      }
    };

    if (contract) checkForPlayerToken();
  }, [contract]);

  useEffect(() => {
    if (gameData.activeBattle) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    }
  }, [gameData]);

  return (
    <div className="flex flex-col">
      <CustomInput
        label="Player Name"
        placeholder="Enter your player name"
        value={playerName}
        handleValueChange={setPlayerName}
      ></CustomInput>

      <CustomButton
        title="Register"
        handleClick={handleClick}
        restStyles="mt-6"
      ></CustomButton>
    </div>
  );
};

export default PageHOC(
  Home,
  <>
    Welcome to Avax Gods <br /> a Web3 NFT Card game
  </>,
  <>
    Connect your wallet to start playing <br /> the ultimate Web3 Battle Card
    Game
  </>
);
