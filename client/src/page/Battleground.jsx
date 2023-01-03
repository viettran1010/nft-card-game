import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles";
import { Alert } from "../components";
import { battlegrounds } from "../assets";
import { useGlobalContext } from "../context";

const Battleground = () => {
  const { setBattleground, setShowAlert, showAlert } = useGlobalContext();
  const navigate = useNavigate();

  const handleBattlegroundChoice = (battleground) => {
    setBattleground(battleground.id);
    localStorage.setItem("battleground", battleground.id);

    setShowAlert({
      status: true,
      type: "info",
      message: `${battleground.name} battleground selected`,
    });

    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  return (
    <div className={`${styles.flexCenter} ${styles.battlegroundContainer}`}>
      {showAlert?.status && (
        <Alert type={showAlert.type} message={showAlert.message}></Alert>
      )}

      <h1 className={`${styles.headText} text-center`}>
        Choose your
        <span className="text-siteViolet"> Battle </span>
        Ground
      </h1>

      <div className={`${styles.flexCenter} ${styles.battleGroundsWrapper}`}>
        {battlegrounds.map((battleground) => (
          <div
            key={battleground.id}
            className={`${styles.flexCenter} ${styles.battleGroundCard}`}
            onClick={() => handleBattlegroundChoice(battleground)}
          >
            <img
              src={battleground.image}
              alt="battleground"
              className={styles.battleGroundCardImg}
            />

            <div className="info absolute">
              <p className={styles.battleGroundCardText}>{battleground.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Battleground;
