import { createElement } from "react";
import { useSession } from "./contexts.ts";
import { useNavigate } from "@remix-run/react";

const requireLogin = <T extends React.FC<never>>(component: T) => {
  return (props: never) => {
    const session = useSession();
    const navigate = useNavigate();
    if (!session) return <div />;
    if (session.loggedIn) return createElement(component, props);
    navigate("/login");
    return <div />;
  };
};

export default requireLogin;
