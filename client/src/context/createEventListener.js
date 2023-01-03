import { ethers } from "ethers";
import { defenseSound } from "../assets";

import { ABI } from "../contracts";
import { playAudio, sparcle } from "../utils/animation";

const emptyAccount = "0x0000000000000000000000000000000000000000";

const AddNewEvent = (eventFilter, provider, callback) => {
  provider.removeListener(eventFilter); // Remove any existing listeners

  provider.on(eventFilter, (logs) => {
    const parsedLogs = new ethers.utils.Interface(ABI).parseLog(logs);

    callback(parsedLogs);
  });
};

const getCoords = (cardRef) => {
  const { left, top, width, height } = cardRef.current.getBoundingClientRect();

  return {
    pageX: left + width / 2,
    pageY: top + height / 2.25,
  };
};

export const createEventListener = ({
  navigate,
  contract,
  provider,
  walletAddress,
  setShowAlert,
  setUpdateGameData,
  player1Ref,
  player2Ref,
}) => {
  const NewPlayerEventFilter = contract.filters.NewPlayer();

  AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
    console.log("New Player Created: ", args);

    if (walletAddress === args.owner) {
      setShowAlert({
        status: true,
        type: "success",
        message: "Player Created Successfully",
      });
    }
  });

  const NewGameTokenEventFilter = contract.filters.NewGameToken();

  AddNewEvent(NewGameTokenEventFilter, provider, ({ args }) => {
    console.log("New Game Token Created: ", args);

    if (walletAddress.toLowerCase() === args.owner.toLowerCase()) {
      setShowAlert({
        status: true,
        type: "success",
        message: "Game Token Created Successfully",
      });

      navigate("/create-battle");
    }
  });

  const NewBattleEventFilter = contract.filters.NewBattle();

  AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
    console.log("New Battle Created: ", args, walletAddress);

    if (
      walletAddress.toLowerCase() === args.player1.toLowerCase() ||
      walletAddress.toLowerCase() === args.player2.toLowerCase()
    ) {
      navigate(`/battle/${args.battleName}`);
    }

    setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
  });

  const BattleMoveEventFilter = contract.filters.BattleMove();

  AddNewEvent(BattleMoveEventFilter, provider, ({ args }) => {
    console.log("New Battle Move: ", args);
  });

  const RoundEndedEventFilter = contract.filters.RoundEnded();

  AddNewEvent(RoundEndedEventFilter, provider, ({ args }) => {
    console.log("Round Ended: ", args, walletAddress);

    for (let i = 0; i < args.damagedPlayers.length; i++) {
      if (args.damagedPlayers[i] !== emptyAccount) {
        if (
          args.damagedPlayers[i].toLowerCase() === walletAddress.toLowerCase()
        ) {
          sparcle(getCoords(player1Ref));
        } else if (args.damagedPlayers[i] !== walletAddress) {
          sparcle(getCoords(player2Ref));
        }
      } else {
        playAudio(defenseSound);
      }
    }

    setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
  });

  const BattleEndedEventFilter = contract.filters.RoundEnded();

  AddNewEvent(BattleEndedEventFilter, provider, ({ args }) => {
    console.log("Battle Ended: ", args, walletAddress);

    if (walletAddress.toLowerCase() === args.winner.toLowerCase()) {
      setShowAlert({
        status: true,
        type: "success",
        message: "You Won The Battle!",
      });
    } else if (walletAddress.toLowerCase() === args.loser.toLowerCase()) {
      setShowAlert({
        status: true,
        type: "failure",
        message: "You Lost The Battle!",
      });
    }

    navigate("/create-battle");
  });
};
