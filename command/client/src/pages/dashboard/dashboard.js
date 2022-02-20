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

export default function Dashboard() {
    const [cstate, setCState] = useState({});
    const [historical, setHistorical] = useState({});
    const [resources, setResources] = useState([]);
    const [viewing, setViewing] = useState(null);

    useEffect(() => {
        function getData() {
            get("/status/").then((data) => {
                if (data.node_status) {
                    setCState(data.node_status);
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
        var intv = window.setInterval(getData, 2500);

        return () => window.clearInterval(intv);
    }, [viewing]);

    var historicalMemory = Object.keys(historical).map((v, i, a) => {
        var d = new Date(v * 1000);
        return [
            d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(),
            historical[v].mem / 1000000,
        ];
    });
    var historicalCPU = Object.keys(historical).map((v, i, a) => {
        var d = new Date(v * 1000);
        return [
            d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(),
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
                                        ) - 20 || 0,
                                    max:
                                        Math.max(
                                            ...historicalMemory.map((v) => v[1])
                                        ) + 20 || undefined,
                                },
                            },
                            aspectRatio: 1,
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
                                        ) - 0.5 || 0,
                                    max:
                                        Math.max(
                                            ...historicalCPU.map((v) => v[1])
                                        ) + 0.5 || undefined,
                                },
                            },
                            aspectRatio: 1,
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
                                    text: "GiB Disk Usage (Used/Free)",
                                },
                                legend: {
                                    display: false,
                                },
                            },
                            aspectRatio: 1,
                        }}
                    />
                    <span className="percent">
                        {Math.round((diskUsage / diskMax) * 10000) / 100}%
                    </span>
                </div>
            </div>
            <div className="view-selector noselect noscroll">
                {Object.keys(cstate).map((v, i, a) => {
                    return (
                        <div
                            className={
                                "server-item" + (v === viewing ? " active" : "")
                            }
                        >
                            <span
                                className={
                                    "online-indicator " +
                                    (cstate[v].status === "online"
                                        ? "online"
                                        : "offline")
                                }
                            ></span>
                            {v.toUpperCase()}
                        </div>
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
