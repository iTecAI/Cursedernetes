import { useEffect, useState } from "react";
import { get } from "../../utilities/api";
import Icon from "../../utilities/icons";
import "./dashboard.css";
import { Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { useParams } from "react-router-dom";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

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

export default function Dashboard() {
    const [cstate, setCState] = useState({});
    const [storages, setStorages] = useState({});
    const [historical, setHistorical] = useState({});
    const [resources, setResources] = useState([]);
    const { node } = useParams();
    const [viewing, setViewing] = useState(node || null);

    useEffect(() => {
        function getData() {
            get("/status/").then((data) => {
                if (data.node_status) {
                    setCState(data.node_status);
                    setStorages(data.storage_data);
                    if (!viewing && Object.keys(data.node_status).length > 0) {
                        setViewing(Object.keys(data.node_status)[0]);
                    }
                    get("/status/" + viewing).then((data) => {
                        if (data.historical_data) {
                            setHistorical(data.historical_data);
                            setResources(data.resource_data);
                        }
                    });
                }
            });
        }

        getData();
        var intv = window.setInterval(getData, 10000);

        return () => window.clearInterval(intv);
    }, [viewing, node]);

    var historicalMemory = Object.keys(historical).map((v, i, a) => {
        var d = new Date(v * 1000);
        return [
            d.toTimeString().split(" ")[0].split(":")[0] +
                ":" +
                d.toTimeString().split(" ")[0].split(":")[1],
            historical[v].mem / 1000000,
        ];
    });
    var historicalCPU = Object.keys(historical).map((v, i, a) => {
        var d = new Date(v * 1000);
        return [
            d.toTimeString().split(" ")[0].split(":")[0] +
                ":" +
                d.toTimeString().split(" ")[0].split(":")[1],
            historical[v].cpu * 100,
        ];
    });
    var diskUsage = Object.values(resources).reduce((p, c, a) => {
        if (c.type === "storage") {
            return p + c.disk;
        } else {
            return p;
        }
    }, 0);
    var diskMax = Object.values(resources).reduce((p, c, a) => {
        if (c.type === "storage") {
            return p + c.maxdisk;
        } else {
            return p;
        }
    }, 0);

    if (!cstate[viewing] && viewing != null && Object.keys(cstate).length > 0) {
        window.location.pathname = "/";
    }

    return viewing && cstate[viewing] ? (
        <div className="dashboard paper">
            <div className="dashboard-title noselect paper-light">
                <Icon name="server" />
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
                <button className="node-settings">
                    <Icon name="settings" />
                </button>
            </div>
            <div className="dash-content noscroll">
                <div className="memory-graph graph paper-light">
                    <Line
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: "Node Memory Usage (MiB)",
                                },
                                legend: {
                                    display: false,
                                },
                            },
                            scales: {
                                yAxis: {
                                    min:
                                        Math.min(
                                            ...historicalMemory.map((v) => v[1])
                                        ) - 10 || 0,
                                    max:
                                        Math.max(
                                            ...historicalMemory.map((v) => v[1])
                                        ) + 10 || undefined,
                                },
                            },
                            aspectRatio: 1,
                            elements: {
                                line: {
                                    borderWidth: 2,
                                },
                            },
                        }}
                        data={{
                            labels: historicalMemory.map((v) => v[0]),
                            datasets: [
                                {
                                    label: null,
                                    data: historicalMemory.map((v) => v[1]),
                                    borderColor: "#fdd835",
                                    pointRadius: 0,
                                    tension: 0.2,
                                },
                            ],
                        }}
                    />
                </div>
                <div className="cpu-graph graph paper-light">
                    <Line
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: "CPU Usage (%)",
                                },
                                legend: {
                                    display: false,
                                },
                            },
                            scales: {
                                yAxis: {
                                    min:
                                        Math.min(
                                            ...historicalCPU.map((v) => v[1])
                                        ) - 0.2 || 0,
                                    max:
                                        Math.max(
                                            ...historicalCPU.map((v) => v[1])
                                        ) + 0.2 || undefined,
                                },
                            },
                            aspectRatio: 1,
                            elements: {
                                line: {
                                    borderWidth: 2,
                                },
                            },
                        }}
                        data={{
                            labels: historicalCPU.map((v) => v[0]),
                            datasets: [
                                {
                                    label: null,
                                    data: historicalCPU.map((v) => v[1]),
                                    borderColor: "#fdd835",
                                    pointRadius: 0,
                                    tension: 0.2,
                                },
                            ],
                        }}
                    />
                </div>
                <div className="disk-graph graph paper-light">
                    <Doughnut
                        data={{
                            labels: ["Used", "Free"],
                            datasets: [
                                {
                                    label: "% Used/Free",
                                    data: [
                                        diskUsage / 1000000000,
                                        (diskMax - diskUsage) / 1000000000,
                                    ],
                                    backgroundColor: [
                                        "#673ab7",
                                        "rgba(0,0,0,0.1)",
                                    ],
                                    borderColor: ["#320b8600", "rgba(0,0,0,0)"],
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: "Disk Usage (GiB)",
                                },
                                legend: {
                                    display: false,
                                },
                            },
                            aspectRatio: 1,
                        }}
                    />
                    <span className="percent noselect">
                        {Math.round((diskUsage / diskMax) * 10000) / 100}%
                    </span>
                </div>
                <div className="resources graph paper-light">
                    <div className="resource-title paper-light noselect">
                        <Icon name="hexagon_multiple" />
                        <span className="title-text">VM / LXC</span>
                    </div>
                    <div className="items">
                        {Object.values(resources).map((v, i, a) => {
                            if (["lxc", "qemu"].includes(v.type)) {
                                return (
                                    <div className="res-item paper-light noselect">
                                        <Icon
                                            name={
                                                v.type === "qemu"
                                                    ? "monitor_multiple"
                                                    : "hexagon"
                                            }
                                        />
                                        <span className="res-name">
                                            {v.name}
                                        </span>
                                        <span
                                            className={
                                                "running-indicator " +
                                                (v.status === "running"
                                                    ? "online"
                                                    : "offline")
                                            }
                                        ></span>
                                    </div>
                                );
                            } else {
                                return "";
                            }
                        })}
                    </div>
                </div>
                <div className="services graph paper-light">
                    <div className="service-title paper-light noselect">
                        <Icon name="cards" />
                        <span className="title-text">Services</span>
                    </div>
                </div>
            </div>
            <div
                className="view-selector noselect noscroll"
                onWheel={(e) => {
                    e.preventDefault();
                    e.currentTarget.scrollLeft += e.deltaY;
                }}
            >
                {Object.keys(cstate).map((v, i, a) => {
                    return (
                        <ViewItem name={v} data={cstate[v]} viewing={viewing} />
                    );
                })}
                {Object.keys(storages).map((v, i, a) => {
                    return (
                        <StorageViewItem
                            name={v}
                            data={storages[v]}
                            viewing={viewing}
                        />
                    );
                })}
            </div>
        </div>
    ) : (
        <div className="dashboard paper">
            <span className="no-nodes noselect">[ NO NODES AVAILABLE ]</span>
        </div>
    );
}
