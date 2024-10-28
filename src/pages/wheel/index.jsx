import React, { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import "./index.scss";

export default function index() {
  const [isRunning, setIsRunning] = useState(false);
  const [num, setNum] = useState(1);
  const [prize, setPrize] = useState("");
  const [speed, setSpeed] = useState(50);

  // 奖品列表
  const prizeList = ["iPhone", "iPad", "MacBook", "AirPods", "谢谢参与"];

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setNum(prev => {
          if (prev >= prizeList.length) {
            return 1;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isRunning, speed]);

  const handleStart = () => {
    if (isRunning) return;

    setIsRunning(true);
    setPrize("");

    // 随机运行时间 2-4 秒
    const runTime = 2000 + Math.random() * 2000;

    // 逐渐减速
    setTimeout(() => {
      setSpeed(100);
      setTimeout(() => {
        setSpeed(200);
        setTimeout(() => {
          setIsRunning(false);
          // 随机选择一个奖品
          const randomPrize =
            prizeList[Math.floor(Math.random() * prizeList.length)];
          setPrize(randomPrize);
        }, 1000);
      }, 1000);
    }, runTime);
  };

  return (
    <View className="container">
      <View className="title">老虎机抽奖</View>
      <View className="prize">{prize ? `恭喜您抽中${prize}` : "等待抽奖"}</View>
      <View className="btn" onClick={handleStart}>
        {isRunning ? "抽奖中..." : "开始抽奖"}
      </View>
      <View className="list">
        {prizeList.map((item, index) => (
          <View
            key={index}
            className={`item ${num === index + 1 ? "active" : ""}`}
          >
            {item}
          </View>
        ))}
      </View>
    </View>
  );
}
