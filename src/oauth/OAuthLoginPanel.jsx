const OAuthLoginPanel = () => {
  const redirectUri = `${window.location.origin}/oauth/callback`;

  const clientId =
    "215315207953-krd2r1qd9rr5t50i460gqg46o54cg67h.apps.googleusercontent.com";
  const scope = encodeURIComponent("openid email profile");
  const responseType = "token id_token";
  const nonce = Math.random().toString(36).substring(2);

  const lclientId = "78w3jodn6iqj1o";
  const lstate = btoa(JSON.stringify({ provider: "linkedin" }));
  const lscope = "email profile openid";

  const url = `https://www.linkedin.com/oauth/v2/userinfo?response_type=code&client_id=${lclientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(lscope)}&state=${encodeURIComponent(lstate)}`;

  const oauthUrls = {
    google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&nonce=${nonce}&prompt=select_account`,
    facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${redirectUri}&response_type=token&scope=email`,
    linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${lclientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(lscope)}&state=${nonce}`,
    apple: `https://appleid.apple.com/auth/authorize?response_type=code&client_id=YOUR_APPLE_CLIENT_ID&redirect_uri=${redirectUri}&scope=name email&response_mode=query`,
  };

  const handleLogin = (provider) => {
    window.location.href = oauthUrls[provider];
  };

  return (
    <div className="social-icons">
      <div
        className="social-btn"
        onClick={() => {
          handleLogin("google");
        }}
      >
        <img src="assets/images/social/google.svg" alt="Google" />
      </div>
      <div
        className="social-btn"
        onClick={() => {
          handleLogin("apple");
        }}
      >
        <img src="assets/images/social/apple.svg" alt="Apple" />
      </div>
      <div
        className="social-btn"
        onClick={() => {
          handleLogin("facebook");
        }}
      >
        <img src="assets/images/social/fb.svg" alt="Facebook" />
      </div>
      <div
        className="social-btn"
        onClick={() => {
          handleLogin("linkedin");
        }}
      >
        <img src="assets/images/social/linkedin.svg" alt="LinkedIn" />
      </div>
    </div>
  );
};

export default OAuthLoginPanel;
