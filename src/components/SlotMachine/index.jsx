import React, { useState, useEffect, useRef } from "react";
import "./index.scss";

const PRIZES = [
  { id: 1, name: "iPhone 15", icon: "📱" },
  { id: 2, name: "任天堂Switch", icon: "🎮" },
  { id: 3, name: "AirPods", icon: "🎧" },
  { id: 4, name: "现金红包", icon: "💰" },
  { id: 5, name: "购物券", icon: "🎫" },
  { id: 6, name: "谢谢参与", icon: "💫" }
];

const SlotMachine = ({ onResult }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const spinTimers = useRef([]);
  const spinCounts = useRef([0, 0, 0]);
  const slotRefs = useRef([null, null, null]);

  // 开始转动单个老虎机列
  const spinSlot = (index, stopAt, totalSpins) => {
    spinCounts.current[index] = 0;
    const slotElement = slotRefs.current[index];
    const itemHeight = slotElement.children[0].offsetHeight;
    const totalHeight = itemHeight * PRIZES.length;
    let currentScroll = slotElement.scrollTop;
    let speed = 20;
    let slowdownStart = false;

    const timer = setInterval(() => {
      spinCounts.current[index]++;

      // 增加滚动位置，但步长更小
      currentScroll += speed;

      // 如果滚动到底部，重置到顶部
      if (currentScroll >= totalHeight) {
        currentScroll = 0;
        slotElement.scrollTop = 0;
      } else {
        slotElement.scrollTop = currentScroll;
      }

      // 达到指定转动次数后开始减速
      if (spinCounts.current[index] >= totalSpins && !slowdownStart) {
        slowdownStart = true;
        let currentSpeed = speed;

        const slowdown = () => {
          // 减速系数改为0.98，使减速更加缓慢
          currentSpeed = Math.max(1, currentSpeed * 0.98);
          currentScroll += currentSpeed;

          if (currentScroll >= totalHeight) {
            currentScroll = 0;
            slotElement.scrollTop = 0;
          } else {
            slotElement.scrollTop = currentScroll;
          }

          const targetScroll = stopAt * itemHeight;
          const currentPos = slotElement.scrollTop;
          const isNearTarget =
            Math.abs(currentPos - targetScroll) < itemHeight / 4;

          if (currentSpeed > 1 && !isNearTarget) {
            requestAnimationFrame(slowdown);
          } else {
            clearInterval(timer);
            slotElement.scrollTop = targetScroll;

            if (index === 2) {
              setTimeout(() => {
                // 直接从 DOM 中读取最终位置
                const finalSlots = [0, 1, 2].map(i =>
                  Math.floor(slotRefs.current[i].scrollTop / itemHeight)
                );
                const allSame = finalSlots.every(
                  slot => slot === finalSlots[0]
                );

                if (allSame) {
                  setResult(`恭喜获得 ${PRIZES[finalSlots[0]].name}！`);
                  onResult?.(true, PRIZES[finalSlots[0]]);
                } else {
                  setResult("很遗憾，再接再厉！");
                  onResult?.(false);
                }

                setIsSpinning(false);
              }, 300);
            }
          }
        };

        requestAnimationFrame(slowdown);
      }
    }, 25); // 增加间隔时间（从16改为25）

    spinTimers.current[index] = timer;
  };

  // 开始抽奖
  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // 决定是否中奖（30%概率）
    const willWin = Math.random() < 0.3;

    // 随机选择一个奖品位置
    const winningPrizeIndex = Math.floor(Math.random() * PRIZES.length);

    // 如果中奖，三列都显示相同的奖品
    // 如果不中奖，确保三列显示不同的奖品
    const finalPositions = willWin
      ? [winningPrizeIndex, winningPrizeIndex, winningPrizeIndex]
      : (() => {
          // 为不中奖情况生成三个不同的随机数
          const positions = new Set();
          while (positions.size < 3) {
            positions.add(Math.floor(Math.random() * PRIZES.length));
          }
          return Array.from(positions);
        })();

    // 依次启动三列，设置不同的转动次数
    spinSlot(0, finalPositions[0], 20 + Math.floor(Math.random() * 10));
    setTimeout(() => {
      spinSlot(1, finalPositions[1], 30 + Math.floor(Math.random() * 10));
    }, 500);
    setTimeout(() => {
      spinSlot(2, finalPositions[2], 40 + Math.floor(Math.random() * 10));
    }, 1000);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      spinTimers.current.forEach(timer => clearInterval(timer));
    };
  }, []);

  return (
    <div className="slot-machine">
      <div className="slot-container">
        {[0, 1, 2].map(index => (
          <div key={index} className="slot-column">
            <div
              className="slot-window"
              ref={el => (slotRefs.current[index] = el)}
            >
              {/* 重复三次奖品列表以确保滚动流畅 */}
              {[...PRIZES, ...PRIZES, ...PRIZES].map((prize, prizeIndex) => (
                <div key={prizeIndex} className="slot-item">
                  {prize.icon}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result && <div className="result-message">{result}</div>}

      <button
        className={`spin-button ${isSpinning ? "spinning" : ""}`}
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning ? "抽奖中..." : "开始抽奖"}
      </button>
    </div>
  );
};

export default SlotMachine;
