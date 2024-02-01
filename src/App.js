import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn/SignIn";
import LightTheme from "./layouts/light-theme/LightTheme";
import UserProvider from "./context/user.provider";
import IndexDBProvider from "./context/indexeddb.provider";
import Dashboard from "./pages/Dashboard/Dashboard";
import ModalProvider from "./context/modal.provider";
import SetUp from "./pages/Setup/SetUp";
import ServiceWorkerProvider from "./context/serviceworker.provider";
import WorkerProvider from "./context/socket-worker/worker.context";
import configs from "./configs.json";

function App() {
  return (
    <BrowserRouter>
      <ServiceWorkerProvider>
        <IndexDBProvider>
          <UserProvider>
            <WorkerProvider>
              <ModalProvider>
                <Routes>
                  <Route path="" element={<LightTheme />}>
                    <Route path="/" index element={<SignIn />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/setup" element={<SetUp />} />
                  </Route>
                </Routes>
              </ModalProvider>
            </WorkerProvider>
          </UserProvider>
        </IndexDBProvider>
      </ServiceWorkerProvider>
    </BrowserRouter>
  );
}

export default App;
