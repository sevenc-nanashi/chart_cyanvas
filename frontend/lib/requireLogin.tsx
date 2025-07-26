import { createElement, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSession } from "./contexts.ts";

const requireLogin = <T extends React.FC<never>>(component: T) => {
  return (props: never) => {
    const session = useSession();
    const navigate = useNavigate();

    useEffect(() => {
      if (session?.loggedIn === false) {
        navigate("/login");
      }
    }, [session, navigate]);
    if (!session) return <div />;
    if (session.loggedIn) return createElement(component, props);
    return <div />;
  };
};

export default requireLogin;
