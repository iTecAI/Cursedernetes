import { Outlet } from "react-router-dom";
import "../../util.css";
import Icon from "../../utilities/icons";
import "./layout.css";

export default function Layout() {
    return (
        <>
            <div className="navbar paper">
                <Icon name="server_security" />
                <span className="page-title noselect">
                    {"Cursedernetes - [ " + window.location.hostname + " ]"}
                </span>
            </div>
            <div className="page-content noscroll">
                <Outlet />
            </div>
        </>
    );
}
