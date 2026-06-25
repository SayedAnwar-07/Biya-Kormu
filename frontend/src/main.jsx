import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./routes/Router";
import { Provider } from "react-redux";
import store from "./redux/store";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <HelmetProvider>
      <Router />
    </HelmetProvider>
  </Provider>
);
