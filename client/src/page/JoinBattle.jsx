import React from "react";
import { CustomButton, PageHOC } from "../components";
import styles from "../styles";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context";
import { useEffect } from "react";

const JoinBattle = () => {
  const navigate = useNavigate();
  const {
    contract,
    gameData,
    setShowAlert,
    setBattleName,
    walletAddress,
    setErrorMessage,
  } = useGlobalContext();

  useEffect(() => {
    if (gameData?.activeBattle?.battleStatus === 1) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    }
  }, [gameData]);

  const handleClick = (battleName) => async () => {
    setBattleName(battleName);
    try {
      await contract.joinBattle(battleName);

      setShowAlert({
        status: true,
        type: "success",
        message: "Joining battle",
      });
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    <>
      <h2 className={styles.joinHeadText}>Available battles:</h2>

      <div className={styles.joinContainer}>
        {gameData.pendingBattles.length ? (
          gameData.pendingBattles
            .filter((battle) => !battle.players.includes(walletAddress))
            .map((battle, index) => (
              <div key={battle.name + index} className={styles.flexBetween}>
                <p className={styles.joinBattleTitle}>
                  {index + 1}. {battle.name}
                </p>
                <CustomButton
                  title="Join"
                  handleClick={handleClick(battle.name)}
                ></CustomButton>
              </div>
            ))
        ) : (
          <p className={styles.joinLoading}>
            Reload the page to see new battles
          </p>
        )}
      </div>

      <p className={styles.infoText} onClick={() => navigate("/create-battle")}>
        Or create a new battle
      </p>
    </>
  );
};

export default PageHOC(
  JoinBattle,
  <>
    Join <br /> a Battle
  </>,
  <>Join already existing battle</>
);
