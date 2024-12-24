"use client";

import React, { useEffect, useState } from "react";

const AnimatedTitle: React.FC = () => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const londonTime = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Europe/London",
        hour12: false,
      }).format(new Date());
      setTime(londonTime);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    document.title = time;
  }, [time]);

  return null;
};

export default AnimatedTitle;