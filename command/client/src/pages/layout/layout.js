import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../util.css";
import "./layout.css";
import bg1k from "./background-1K.jpg";
import bg2k from "./background-2K.jpg";
import bg4k from "./background-4K.jpg";
import Icon from "../../utilities/icons";
import { post } from "../../utilities/api";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width: width,
        height: height,
    };
}

export default function Layout() {
    const [bg, setBg] = useState(bg1k);
    useEffect(function () {
        var wdim = getWindowDimensions();
        if (wdim.width > 5120) {
            setBg(bg4k);
        } else if (wdim.width > 2560) {
            setBg(bg2k);
        }
    }, []);
    return (
        <>
            <div className="navbar paper">
                <img
                    src="/assets/logo128.png"
                    className="logo noselect"
                    alt="Cursedernetes logo"
                />
                <span className="page-title noselect">Cursedernetes</span>
                <button
                    className="button logout noselect"
                    onClick={() => {
                        post("/logout").then(() => {
                            window.localStorage.removeItem("fingerprint");
                            window.location.pathname = "/login";
                        });
                    }}
                >
                    <Icon name="logout_variant" />
                    Log Out
                </button>
            </div>
            <div
                className="page-content noscroll"
                style={{
                    backgroundImage: `url(${bg})`,
                }}
            >
                <Outlet />
            </div>
        </>
    );
}
