import Form from "../../utilities/forms/form";
import { HLine, Input, Range, Select } from "../../utilities/forms/inputs";
import "./serviceCreate.css";
import { useEffect, useState } from "react";
import { get } from "../../utilities/api";
import Icon from "../../utilities/icons";

function isValidURL(str) {
    var regexp =
        /^(?:(?:https?|ftp|http?):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str)) {
        return true;
    } else {
        return false;
    }
}

export default function CreateService() {
    const [summary, setSummary] = useState({});
    const [preview, setPreview] = useState(null);
    const [values, setValues] = useState({});

    useEffect(() => {
        function getData() {
            get("/status/").then((data) => {
                if (data.node_status) {
                    get("/status/summary").then(setSummary);
                }
            });
        }

        getData();
        var intv = window.setInterval(getData, 10000);

        return () => window.clearInterval(intv);
    }, []);

    return (
        <div className="dashboard create service paper">
            <div className="dashboard-title noselect paper-light">
                <Icon name="cards" />
                <span className="server-name">Create Service</span>
                <button
                    className="close-btn"
                    onClick={() => window.open("/", "_self")}
                >
                    <Icon name="close" />
                </button>
            </div>
            <div className="dash-content noscroll">
                <div className="form-area noscroll">
                    <Form
                        extraClasses={["service-form"]}
                        submitButton={
                            <button>
                                <Icon name="check" /> Create
                            </button>
                        }
                        onChange={(v) => {
                            setValues(v);
                        }}
                        onUpdate={(v) => {
                            setValues(v);
                        }}
                        onSubmit={(v) => {
                            console.log(v);
                        }}
                    >
                        <Input
                            placeholder="https://"
                            type="text"
                            fieldName="source"
                            label="Source"
                            icon="source_branch"
                            validator={async function (value) {
                                if (isValidURL(value)) {
                                    var domain = new URL(value).hostname;
                                    if (
                                        [
                                            "github.com",
                                            "hub.docker.com",
                                        ].includes(domain)
                                    ) {
                                        var v = await get(
                                            "/service/create/preview",
                                            {
                                                parameters: { url: value },
                                            }
                                        );
                                        if (v.title) {
                                            setPreview(v);
                                            console.log(v);
                                        } else {
                                            setPreview(null);
                                            return (
                                                "Invalid URL (" + v.reason + ")"
                                            );
                                        }
                                        return true;
                                    } else {
                                        return "Invalid URL (Must be github/docker.io)";
                                    }
                                } else {
                                    return "Invalid URL";
                                }
                            }}
                        />
                        <HLine />
                        <Select fieldName="node" label="Node" icon="server">
                            {Object.values(summary.nodes || {}).map(
                                (v, i, a) => (
                                    <option value={v.id} key={v.id}>
                                        {v.node}
                                    </option>
                                )
                            )}
                        </Select>
                        <Input
                            placeholder="New Service"
                            type="text"
                            fieldName="service_name"
                            label="Service Name"
                            icon="pencil"
                        />
                        <Range
                            fieldName="cpuCores"
                            label="CPU Cores"
                            icon="memory"
                            min={0}
                            max={
                                (((summary.nodes || {})[values.node] || {})
                                    .maxcpu || 0) / 2
                            }
                            step={0.01}
                            initialValue={0.05}
                        />
                        <Range
                            fieldName="cpuUnits"
                            label="CPU Priority"
                            icon="priority_high"
                            min={0}
                            max={100000}
                            step={1}
                            initialValue={1024}
                        />
                        <Range
                            fieldName="memory"
                            label="Memory (MB)"
                            icon="chip"
                            min={16}
                            max={
                                (((summary.nodes || {})[values.node] || {})
                                    .maxmem || 0) /
                                    1000000 -
                                1
                            }
                            step={1}
                            initialValue={64}
                        />
                    </Form>
                </div>
                <div className="preview">
                    {preview ? (
                        <div className="preview-box">
                            <span className="prev-title">{preview.title}</span>
                            <img
                                className="prev-img noselect"
                                src={preview.image}
                                alt="Preview"
                            />
                            <span className="prev-desc">
                                {preview.description}
                            </span>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </div>
    );
}
