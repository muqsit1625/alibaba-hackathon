// ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router";

type Props = {
    children: JSX.Element,
  };

export const ScrollToTop = ({children}: Props) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (<>{children}</>)
};

