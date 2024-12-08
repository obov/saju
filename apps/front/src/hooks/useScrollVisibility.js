import { useEffect, useState } from "react";

function useScrollVisibility(initialState = true) {
  const [isVisible, setIsVisible] = useState(initialState);

  useEffect(() => {
    const handleScroll = (e) => {
      // 위로 스크롤하고 현재 숨겨진 상태면 보이게
      if (e.deltaY < 0 && !isVisible) {
        setIsVisible(true);
      }
      // 아래로 스크롤하고 현재 보이는 상태면 숨기게
      if (e.deltaY > 0 && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, [isVisible]);

  return [isVisible, setIsVisible];
}

export default useScrollVisibility;
