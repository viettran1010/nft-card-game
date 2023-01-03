import React from "react";
import { useState } from "react";
import { CustomButton, CustomInput, GameLoad, PageHOC } from "../components";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context";
import styles from "../styles";
import { useEffect } from "react";

const CreateBattle = () => {
  const navigate = useNavigate();
  const { contract, battleName, setBattleName, gameData, setErrorMessage } =
    useGlobalContext();
  const [waitBattle, setWaitBattle] = useState(false);

  useEffect(() => {
    if (gameData?.activeBattle?.battleStatus === 0) {
      setWaitBattle(true);
    }
  }, [gameData]);

  const handleClick = async () => {
    if (!battleName || !battleName.trim()) return null;

    try {
      await contract.createBattle(battleName);

      setWaitBattle(true);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    <>
      {waitBattle && <GameLoad></GameLoad>}

      <div className="flex flex-col mb-5">
        <CustomInput
          label="Battle"
          placeholder="Enter your battle name"
          value={battleName}
          handleValueChange={setBattleName}
        ></CustomInput>

        <CustomButton
          title="Create Battle"
          handleClick={handleClick}
          restStyles="mt-6"
        ></CustomButton>

        <p className={styles.infoText} onClick={() => navigate("/join-battle")}>
          Or join existing battles
        </p>
      </div>
    </>
  );
};

export default PageHOC(
  CreateBattle,
  <>
    Create <br /> a new Battle
  </>,
  <>Create your own battle and wait for other player to join you</>
);
