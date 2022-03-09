import { useEffect, useState } from "react";
import { get } from "../../utilities/api";
import Icon from "../../utilities/icons";
import "./dashboard.css";
import "./index.css";

function ViewItem(props) {
    return (
        <div
            className={
                "server-item" + (props.name === props.viewing ? " active" : "")
            }
            onClick={() => (window.location.pathname = "/node/" + props.name)}
        >
            <span
                className={
                    "online-indicator " +
                    (props.data.status === "online" ? "online" : "offline")
                }
            ></span>
            {props.name.toUpperCase()}
            <Icon name="server" />
        </div>
    );
}

function StorageViewItem(props) {
    return (
        <div
            className={
                "server-item" +
                (props.data.config.name === props.viewing ? " active" : "")
            }
            onClick={() =>
                (window.location.pathname =
                    "/storage/" + props.data.config.name)
            }
        >
            <span
                className={
                    "online-indicator " +
                    (props.data.status.status === "online"
                        ? "online"
                        : "offline")
                }
            ></span>
            {props.data.config.name.toUpperCase()}
            <Icon name="harddisk" />
        </div>
    );
}

export default function Index() {
    const [cstate, setCState] = useState({});
    const [storages, setStorages] = useState({});
    const [summary, setSummary] = useState({});

    useEffect(() => {
        function getData() {
            get("/status/").then((data) => {
                if (data.node_status) {
                    setCState(data.node_status);
                    setStorages(data.storage_data);
                    get("/status/summary").then(setSummary);
                }
            });
        }

        getData();
        var intv = window.setInterval(getData, 10000);

        return () => window.clearInterval(intv);
    }, []);

    return (
        <div className="dashboard paper">
            <div className="dashboard-title noselect paper-light">
                <Icon name="view_dashboard" />
                <span className="server-name">
                    Dashboard : {summary.motd || "Welcome"}
                </span>
            </div>
            <div className="dash-content noscroll grid">
                <div className="index-item info"></div>
            </div>
            <div
                className="view-selector noselect noscroll"
                onWheel={(e) => {
                    e.preventDefault();
                    e.currentTarget.scrollLeft += e.deltaY;
                }}
            >
                <div
                    className="server-item active dash"
                    onClick={() => (window.location.pathname = "/")}
                >
                    <Icon name="view_dashboard" />
                </div>
                {Object.keys(cstate).map((v, i, a) => {
                    return (
                        <ViewItem
                            name={v}
                            data={cstate[v]}
                            viewing={"_dashboard"}
                        />
                    );
                })}
                {Object.keys(storages).map((v, i, a) => {
                    return (
                        <StorageViewItem
                            name={v}
                            data={storages[v]}
                            viewing={"_dashboard"}
                        />
                    );
                })}
            </div>
        </div>
    );
}
