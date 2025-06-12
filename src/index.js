import ReactDOM from "react-dom/client";
import $ from "jquery";
import "react-bootstrap";
import App from "./App";

// Making jQuery globally available
window.$ = window.jQuery = $;

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
