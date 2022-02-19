import ThemeProvider from "./utilities/themeProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutRaw from "./pages/layout/layoutRaw";
import Layout from "./pages/layout/layout";
import Login from "./pages/login/login";
import { useEffect } from "react";
import { get } from "./utilities/api";

function App() {
    useEffect(() => {
        if (!window.location.pathname.includes("/login")) {
            get("/status").then((data) => {
                if (data.result) {
                    alert("Error " + data.code + ": " + data.reason);
                    window.location.pathname = "/login";
                }
            });
        }
    }, []);
    return (
        <ThemeProvider theme="main">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LayoutRaw />}>
                        <Route path="/login" element={<Login />} />
                    </Route>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<></>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
