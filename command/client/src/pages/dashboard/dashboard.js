import { useEffect, useState } from "react";
import { get } from "../../utilities/api";
import Icon from "../../utilities/icons";
import "./dashboard.css";

export default function Dashboard() {
    const [cstate, setCState] = useState({});
    const [viewing, setViewing] = useState(null);

    useEffect(() => {
        function getData() {
            get("/status/").then((data) => {
                if (data.node_status) {
                    setCState(data.node_status);
                    if (!viewing && Object.keys(data.node_status).length > 0) {
                        setViewing(Object.keys(data.node_status)[0]);
                    }
                }
            });
        }

        getData();
        var intv = window.setInterval(getData, 2500);

        return () => window.clearInterval(intv);
    }, [viewing]);

    return viewing ? (
        <div className="dashboard paper">
            <div className="dashboard-title noselect paper-light">
                <Icon name="server_network" />
                <span className="server-name">
                    {viewing.toUpperCase()}
                    <span
                        className={
                            "online-indicator " +
                            (cstate[viewing].status === "online"
                                ? "online"
                                : "offline")
                        }
                    ></span>
                </span>
            </div>
        </div>
    ) : (
        <div className="dashboard paper"></div>
    );
}
