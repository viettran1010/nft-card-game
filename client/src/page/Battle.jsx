import React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ActionButton, Alert, Card, GameInfo, PlayerInfo } from "../components";
import styles from "../styles";
import {
  attack,
  attackSound,
  defense,
  defenseSound,
  player01 as player01Icon,
  player02 as player02Icon,
} from "../assets";
import { playAudio } from "../utils/animation";
import { useGlobalContext } from "../context";
import { useEffect } from "react";

const Battle = () => {
  const {
    contract,
    gameData,
    walletAddress,
    showAlert,
    setShowAlert,
    battleground,
    setErrorMessage,
    player1Ref,
    player2Ref,
  } = useGlobalContext();

  const [player1, setPlayer1] = useState({});
  const [player2, setPlayer2] = useState({});

  const { battleName } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        let player01Address = null;
        let player02Address = null;

        if (
          gameData.activeBattle.players[0].toLowerCase() ===
          walletAddress.toLowerCase()
        ) {
          player01Address = gameData.activeBattle.players[0];
          player02Address = gameData.activeBattle.players[1];
        } else {
          player01Address = gameData.activeBattle.players[1];
          player02Address = gameData.activeBattle.players[0];
        }

        const p1TokenData = await contract.getPlayerToken(player01Address);
        const player01 = await contract.getPlayer(player01Address);

        const p2TokenData = await contract.getPlayerToken(player02Address);
        const player02 = await contract.getPlayer(player02Address);

        const p1Att = p1TokenData.attackStrength.toNumber();
        const p1Def = p1TokenData.defenseStrength.toNumber();
        const p1Hp = player01.playerHealth.toNumber();
        const p1Mana = player01.playerMana.toNumber();

        const p2Hp = player02.playerHealth.toNumber();
        const p2Mana = player02.playerMana.toNumber();

        setPlayer1({
          ...player01,
          att: p1Att,
          def: p1Def,
          health: p1Hp,
          mana: p1Mana,
        });

        setPlayer2({
          ...player02,
          att: "X",
          def: "X",
          health: p2Hp,
          mana: p2Mana,
        });
      } catch (error) {
        setErrorMessage(error);
      }
    };

    if (contract && gameData.activeBattle) getPlayerInfo();
  }, [contract, battleName, gameData]);

  const makeAMove = async (choice) => {
    playAudio(choice === 1 ? attackSound : defenseSound);

    try {
      await contract.attackOrDefendChoice(choice, battleName, {
        gasLimit: 200000,
      });

      setShowAlert({
        status: true,
        type: "info",
        message: "Your move has been submitted",
      });
    } catch (error) {
      setErrorMessage(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gameData?.activeBattle) {
        console.log("No active battle, redirecting to home page");
        navigate("/");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`${styles.flexBetween} ${styles.gameContainer} ${battleground}`}
    >
      {showAlert?.status && (
        <Alert type={showAlert.type} message={showAlert.message}></Alert>
      )}
      <PlayerInfo player={player2} playerIcon={player02Icon} mt />

      <div className={`${styles.flexCenter} flex-col my-10`}>
        <Card
          card={player2}
          title={player2?.playerName}
          cardRef={player2Ref}
          playerTwo
        ></Card>

        <div className="flex flex-row items-center">
          <ActionButton
            imgUrl={attack}
            handleClick={() => makeAMove(1)}
            restStyles="mr-2 hover:border-yellow-400"
          ></ActionButton>

          <Card
            card={player1}
            title={player1?.playerName}
            cardRef={player1Ref}
            restStyles="mt-3"
          ></Card>

          <ActionButton
            imgUrl={defense}
            handleClick={() => makeAMove(2)}
            restStyles="ml-6 hover:border-red-600"
          ></ActionButton>
        </div>
      </div>

      <PlayerInfo player={player1} playerIcon={player01Icon} mt></PlayerInfo>

      <GameInfo></GameInfo>
    </div>
  );
};

export default Battle;
