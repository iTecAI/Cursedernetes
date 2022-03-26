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

function DashboardItem(
    props = { name: "", displayName: "", icon: "", children: [] }
) {
    return (
        <div
            className={"index-item " + props.name + " paper noscroll"}
            style={{ gridArea: props.name }}
        >
            <div className="container-title paper-light">
                <Icon name={props.icon} />
                <span className="text">{props.displayName}</span>
            </div>
            <div className="container-content noscroll">{props.children}</div>
        </div>
    );
}

function InfoItem(props = { icon: "", title: "", value: null }) {
    return (
        <div className="item-info">
            <Icon name={props.icon} />
            <span className="item-title">{props.title}</span>
            <span className="item-value">{props.value}</span>
        </div>
    );
}

function NodeItem(props = { status: null }) {
    return (
        <div className="item-node">
            <span
                className={
                    "online-indicator " +
                    (props.status.status === "online" ? "online" : "offline")
                }
            ></span>
            <span className="name">{props.status.node.toUpperCase()}</span>
            <Icon name="memory" />
            <span className="cpu">
                {Math.round((props.status.cpu / props.status.maxcpu) * 10000) /
                    100}
                %
            </span>
            <Icon name="chip" />
            <span className="memory">
                {Math.round((props.status.mem / props.status.maxmem) * 10000) /
                    100}
                %
            </span>
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
                <DashboardItem
                    name="info"
                    displayName="Information"
                    icon="information"
                >
                    <InfoItem
                        icon="account"
                        title="Current User"
                        value={summary.current_user}
                    />
                    <InfoItem
                        icon="account_multiple"
                        title="Logged In"
                        value={(summary.users || []).join(", ")}
                    />
                    <InfoItem
                        icon="clock"
                        title="Uptime"
                        value={summary.uptime}
                    />
                    <InfoItem
                        icon="server"
                        title="# Nodes"
                        value={Object.keys(summary.nodes || {}).length}
                    />
                    <InfoItem
                        icon="harddisk"
                        title="# Storages"
                        value={Object.keys(summary.storages || {}).length}
                    />
                    <InfoItem
                        icon="monitor_multiple"
                        title="# VMs"
                        value={
                            Object.keys(summary.qemu || {}).length +
                            Object.keys(summary.lxc || {}).length +
                            " (" +
                            Object.keys(summary.qemu || {}).length +
                            " QEMU, " +
                            Object.keys(summary.lxc || {}).length +
                            " LXC)"
                        }
                    />
                    <InfoItem
                        icon="hexagon_multiple"
                        title="# Services"
                        value={0}
                    />
                </DashboardItem>
                <DashboardItem name="nodes" displayName="Nodes" icon="server">
                    {Object.values(summary.nodes || {}).map((v, i, a) => (
                        <NodeItem status={v} />
                    ))}
                </DashboardItem>
                <DashboardItem
                    name="storages"
                    displayName="Storages"
                    icon="harddisk"
                ></DashboardItem>
                <DashboardItem
                    name="rawvms"
                    displayName="VMs"
                    icon="monitor_multiple"
                ></DashboardItem>
                <DashboardItem
                    name="services"
                    displayName="Services"
                    icon="hexagon_multiple"
                ></DashboardItem>
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
