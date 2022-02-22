import { useEffect, useState } from "react";
import { get } from "../../utilities/api";
import Icon from "../../utilities/icons";
import "./dashboard.css";
import "./storage.css";
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
import { Doughnut } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import filesize from "filesize";

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

function ConfigItem(props = { name: "", value: "", icon: "" }) {
    return (
        <div className="config-item paper-light">
            <Icon name={props.icon} />
            <span className="key noselect">{props.name}: </span>
            <span className="value">{props.value}</span>
        </div>
    );
}

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

function FileNode(props = { storage: null, info: null }) {
    const [children, setChildren] = useState([]);
    const [expanded, setExpanded] = useState(false);

    function expand() {
        setExpanded(!expanded);
        get("/storage/" + props.storage + "/ls" + props.info.name).then((d) =>
            setChildren(
                d.map((v, i, a) => {
                    return <FileNode storage={"" + props.storage} info={v} />;
                })
            )
        );
    }

    if (props.info.type === "directory") {
        return (
            <div className="file-node directory">
                <Icon name="folder" />
                <span className="name" onClick={expand}>
                    {props.info.name.split("/").pop()}
                </span>
                <div
                    className={"node-children" + (expanded ? " expanded" : "")}
                >
                    {children}
                </div>
            </div>
        );
    } else {
        var icon;
        if (
            ["png", "jpg", "jpeg", "gif"].includes(
                props.info.name.split(".").pop().toLowerCase()
            )
        ) {
            icon = "file_image";
        } else if (
            ["mp4", "mov", "webm"].includes(
                props.info.name.split(".").pop().toLowerCase()
            )
        ) {
            icon = "file_video";
        } else if (
            ["mp3", "flac", "ogg", "wav"].includes(
                props.info.name.split(".").pop().toLowerCase()
            )
        ) {
            icon = "file_music";
        } else if (
            ["docx", "doc", "odt", "txt"].includes(
                props.info.name.split(".").pop().toLowerCase()
            )
        ) {
            icon = "file_document";
        } else if (
            ["csv"].includes(props.info.name.split(".").pop().toLowerCase())
        ) {
            icon = "file_delimited";
        } else if (
            ["pdf"].includes(props.info.name.split(".").pop().toLowerCase())
        ) {
            icon = "file_pdf";
        } else if (
            [
                "py",
                "sh",
                "bash",
                "java",
                "class",
                "js",
                "css",
                "html",
                "json",
                "xml",
            ].includes(props.info.name.split(".").pop().toLowerCase())
        ) {
            icon = "file_xml";
        } else {
            icon = "file";
        }
        return (
            <div className="file-node file">
                <Icon name={icon} />
                <span className="name">{props.info.name.split("/").pop()}</span>
            </div>
        );
    }
}

function FileViewer(props = { storage: null }) {
    const [fileView, setFileView] = useState([]);
    useEffect(() => {
        get("/storage/" + props.storage + "/ls/").then((d) => {
            if (!d.result) {
                setFileView(d);
            }
        });
    }, [props.storage]);

    return (
        <div className="file-tree">
            {fileView.map((v, i, a) => (
                <FileNode storage={props.storage} info={v} />
            ))}
        </div>
    );
}

export default function StorageDashboard() {
    const [cstate, setCState] = useState({});
    const [storages, setStorages] = useState({});
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
                }
            });
        }

        getData();
        var intv = window.setInterval(getData, 10000);

        return () => window.clearInterval(intv);
    }, [viewing, node]);

    return viewing && storages[viewing] ? (
        <div className="dashboard paper">
            <div className="dashboard-title noselect paper-light">
                <Icon name="harddisk" />
                <span className="server-name">
                    {viewing.toUpperCase()}
                    <span
                        className={
                            "online-indicator " +
                            (storages[viewing].status.status === "online"
                                ? "online"
                                : "offline")
                        }
                    ></span>
                </span>
            </div>
            <div className="dash-content noscroll">
                <div className="used-graph graph paper-light">
                    <Doughnut
                        data={{
                            labels: ["Used", "Free"],
                            datasets: [
                                {
                                    label: "% Used/Free",
                                    data: [
                                        storages[viewing].status.used /
                                            1000000000,
                                        storages[viewing].config.maxsize -
                                            storages[viewing].status.used /
                                                1000000000,
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
                        {Math.round(
                            (storages[viewing].status.used /
                                1000000000 /
                                storages[viewing].config.maxsize) *
                                10000
                        ) / 100}
                        %
                    </span>
                </div>
                <div className="config graph paper-light">
                    <div className="config-title paper-light noselect">
                        <Icon name="information_outline" />
                        <span className="title-text">Info</span>
                    </div>
                    <div className="content noscroll">
                        <ConfigItem
                            icon="label"
                            name="Type"
                            value={storages[viewing].config.type}
                            key="type"
                        />
                        {((config, status) => {
                            if (config.type === "sshfs") {
                                return [
                                    <ConfigItem
                                        icon="server"
                                        name="Host"
                                        value={
                                            config.host +
                                            ":" +
                                            (config.port || 22)
                                        }
                                        key="host"
                                    />,
                                    <ConfigItem
                                        icon="folder"
                                        name="Root"
                                        value={config.storage_root}
                                        key="root"
                                    />,
                                    <ConfigItem
                                        icon="harddisk"
                                        name="Usage"
                                        value={
                                            filesize(status.used) +
                                            " / " +
                                            filesize(
                                                config.maxsize * 1000000000
                                            )
                                        }
                                        key="mxsize"
                                    />,
                                    <ConfigItem
                                        icon="key"
                                        name="SSH Key"
                                        value={config.ssh_key}
                                        key="keye"
                                    />,
                                ];
                            }
                        })(storages[viewing].config, storages[viewing].status)}
                    </div>
                </div>
                <div className="file-viewer graph paper-light">
                    <div className="file-viewer-title paper-light noselect">
                        <Icon name="file_tree" />
                        <span className="title-text">Filesystem</span>
                    </div>
                    <FileViewer storage={viewing} />
                </div>
            </div>
            <div className="view-selector noselect noscroll">
                {Object.keys(cstate).map((v, i, a) => {
                    return (
                        <ViewItem
                            name={v}
                            data={cstate[v]}
                            viewing={viewing}
                            key={v}
                        />
                    );
                })}
                {Object.keys(storages).map((v, i, a) => {
                    return (
                        <StorageViewItem
                            name={v}
                            data={storages[v]}
                            viewing={viewing}
                            key={v}
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
