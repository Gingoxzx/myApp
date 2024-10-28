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
  // 控制整体抽奖状态
  const [isSpinning, setIsSpinning] = useState(false);
  // 存储抽奖结果信息
  const [result, setResult] = useState(null);
  // 存储每列的定时器，用于清理
  const spinTimers = useRef([]);
  // 记录每列转动的次数
  const spinCounts = useRef([0, 0, 0]);
  // 存储三列的 DOM 引用
  const slotRefs = useRef([null, null, null]);

  /**
   * 控制单个老虎机列的转动
   * @param {number} index - 当前列的索引（0-2）
   * @param {number} stopAt - 最终停止的位置（奖品索引）
   * @param {number} totalSpins - 需要转动的总次数
   */
  const spinSlot = (index, stopAt, totalSpins) => {
    spinCounts.current[index] = 0;
    const slotElement = slotRefs.current[index];
    // 获取单个奖品项的高度
    const itemHeight = slotElement.children[0].offsetHeight;
    // 计算整个奖品列表的总高度
    const totalHeight = itemHeight * PRIZES.length;
    // 当前滚动位置
    let currentScroll = slotElement.scrollTop;
    // 初始滚动速度
    let speed = 20;
    // 是否开始减速的标志
    let slowdownStart = false;

    // 设置定时器控制滚动
    const timer = setInterval(() => {
      // 增加转动次数计数
      spinCounts.current[index]++;
      // 更新滚动位置
      currentScroll += speed;

      // 处理滚动边界：到达底部时重置到顶部
      if (currentScroll >= totalHeight) {
        currentScroll = 0;
        slotElement.scrollTop = 0;
      } else {
        slotElement.scrollTop = currentScroll;
      }

      // 达到指定转动次数后开始减速过程
      if (spinCounts.current[index] >= totalSpins && !slowdownStart) {
        slowdownStart = true;
        let currentSpeed = speed;

        // 减速动画函数
        const slowdown = () => {
          // 速度衰减：每次乘以0.98，最小保持1
          currentSpeed = Math.max(1, currentSpeed * 0.98);
          currentScroll += currentSpeed;

          // 处理减速过程中的滚动边界
          if (currentScroll >= totalHeight) {
            currentScroll = 0;
            slotElement.scrollTop = 0;
          } else {
            slotElement.scrollTop = currentScroll;
          }

          // 计算目标位置和当前位置
          const targetScroll = stopAt * itemHeight;
          const currentPos = slotElement.scrollTop;
          // 判断是否接近目标位置（误差在1/4个项目高度内）
          const isNearTarget =
            Math.abs(currentPos - targetScroll) < itemHeight / 4;

          // 如果速度仍然大于1且未接近目标，继续减速
          if (currentSpeed > 1 && !isNearTarget) {
            requestAnimationFrame(slowdown);
          } else {
            // 停止定时器并设置到最终位置
            clearInterval(timer);
            slotElement.scrollTop = targetScroll;

            // 当最后一列也停止时，检查结果
            if (index === 2) {
              setTimeout(() => {
                // 获取所有列的最终位置
                const finalSlots = [0, 1, 2].map(i =>
                  Math.floor(slotRefs.current[i].scrollTop / itemHeight)
                );
                // 检查是否所有列都停在相同位置
                const allSame = finalSlots.every(
                  slot => slot === finalSlots[0]
                );

                // 设置抽奖结果
                if (allSame) {
                  setResult(`恭喜获得 ${PRIZES[finalSlots[0]].name}！`);
                  onResult?.(true, PRIZES[finalSlots[0]]);
                } else {
                  setResult("很遗憾，再接再厉！");
                  onResult?.(false);
                }

                // 重置抽奖状态
                setIsSpinning(false);
              }, 300); // 延迟300ms显示结果，让动画完全结束
            }
          }
        };

        // 开始减速动画
        requestAnimationFrame(slowdown);
      }
    }, 25); // 每25ms执行一次滚动更新

    // 保存定时器引用，用于清理
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
