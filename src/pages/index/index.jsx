import React, { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import "./index.scss";

export default function index() {
  const [a, seta] = useState(2);
  const click = () => {
    seta(a + 1);
  };
  useEffect(() => {
    console.log("组件更新或挂载");
    return () => {
      console.log("卸载了");
    };
    // },[data.name]); //name是检测的数据
    // },[data.age]);  //age未检测
  }, [a]); //数组为空也会渲染页面

  useEffect(() => {
    console.log("挂载了111");

    return () => {
      console.log("挂载了222");
    };
  }, []);

  useEffect(() => {
    console.log("卸载了111");

    return () => {
      console.log("卸载了222");
    };
  }, []);

  useEffect(() => {
    console.log("更新了111");

    return () => {
      console.log("更新了222");
    };
  }, [a]);

  return (
    <View>
      <View
        onClick={() => {
          click();
        }}
      >
        点击设置
      </View>
      <View>{a}</View>
    </View>
  );
}
