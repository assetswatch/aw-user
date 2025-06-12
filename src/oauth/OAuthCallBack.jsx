import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const token = hash.get("access_token");
    const idToken = hash.get("id_token");

    if (token || idToken) {
      console.log("Access Token:", token);
      console.log("ID Token:", idToken);
      const payload = JSON.parse(atob(idToken.split(".")[1]));

      console.log("Name:", payload.name);
      console.log("Email:", payload.email);
    }

    navigate("/");
  }, [navigate]);

  return <div>Processing login...</div>;
};

export default OAuthCallback;
