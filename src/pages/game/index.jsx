import React from "react";
import SlotMachine from "../../components/SlotMachine";

const GamePage = () => {
  const handleResult = (isWin, prize) => {
    if (isWin) {
      console.log(`赢得了 ${prize.name}!`);
    } else {
      console.log("没有中奖");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
      <SlotMachine onResult={handleResult} />
    </div>
  );
};

export default GamePage;
