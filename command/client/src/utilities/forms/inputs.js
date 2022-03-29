import { Component } from "react";
import Icon from "../icons";

function FieldWrapper(
    props = {
        fieldName: "",
        label: "",
        icon: "",
        children: [],
        fieldType: "",
        iconClass: null,
        valid: true,
        submessage: "",
    }
) {
    return (
        <div
            className={
                "field" +
                (props.fieldType ? " " + props.fieldType : "") +
                (props.icon ? " icon" : "") +
                (props.valid ? "" : " invalid") +
                (props.submessage ? " submessage" : "")
            }
            data-name={props.fieldName}
        >
            <div className="label noselect">
                {props.icon ? (
                    <Icon name={props.icon} category={props.iconClass} />
                ) : null}
                <span className="label-name">{props.label}</span>
            </div>
            <div className="field-input">
                <div className="submessage">{props.submessage}</div>
                {props.children}
            </div>
        </div>
    );
}

export default class Field extends Component {
    constructor(
        props = {
            values: {},
            onChange: () => {},
            fieldName: "newField",
            label: "Field",
            icon: null,
            iconClass: null,
            initialValue: null,
            validator: null,
        }
    ) {
        super(props);
        this.getInput = function (e) {
            this.setState({ value: e.target.value });
            return e.target.value;
        }.bind(this);
        this.handleChange = async function (e) {
            var value = this.getInput(e);
            this.state.values[this.state.fieldName] = value;
            var valid;
            if (props.validator) {
                valid = await props.validator(value);
            } else {
                valid = true;
            }
            if (valid === true) {
                this.setState({ valid: true, validMessage: "" });
                this.props.onChange(this.state.values);
            } else {
                this.setState({ valid: false, validMessage: valid });
            }
        }.bind(this);
        this.state = {
            valid: true,
            validMessage: "",
            values: props.values,
            fieldName: props.fieldName,
            label: props.label,
            icon: props.icon,
            iconClass: props.iconClass,
            value: props.initialValue || "",
        };
        this.state.values[this.state.fieldName] = this.state.value;
    }

    render() {
        return (
            <FieldWrapper
                fieldName={this.state.fieldName}
                fieldType=""
                label={this.state.label}
                icon={this.state.icon}
                iconClass={this.state.iconClass}
                valid={this.state.valid}
                submessage={this.state.validMessage}
            >
                <input
                    onChange={this.handleChange}
                    value={this.state.value}
                    className="field-entry"
                />
            </FieldWrapper>
        );
    }
}

export class Input extends Field {
    constructor(props = { placeholder: null, type: null }) {
        super(props);
    }

    render() {
        return (
            <FieldWrapper
                fieldName={this.state.fieldName}
                fieldType="input"
                label={this.state.label}
                icon={this.state.icon}
                iconClass={this.state.iconClass}
                valid={this.state.valid}
                submessage={this.state.validMessage}
            >
                <input
                    onChange={this.handleChange}
                    value={this.state.value}
                    placeholder={this.props.placeholder}
                    type={this.props.type || "text"}
                    className="field-entry"
                />
            </FieldWrapper>
        );
    }
}

export class Select extends Field {
    constructor(props) {
        super(props);
        if (props.children.length > 0) {
            this.setState({ value: props.children[0].props.value });
            var vals = this.state.values;
            vals[this.state.fieldName] = props.children[0].props.value;
            this.setState({ values: vals });
        }
    }

    componentDidUpdate() {
        if (this.props.children.length > 0 && this.state.value === "") {
            this.setState({ value: this.props.children[0].props.value });
            var vals = this.state.values;
            vals[this.state.fieldName] = this.props.children[0].props.value;
            this.setState({ values: vals });
        }
    }

    render() {
        return (
            <FieldWrapper
                fieldName={this.state.fieldName}
                fieldType="select"
                label={this.state.label}
                icon={this.state.icon}
                iconClass={this.state.iconClass}
                valid={this.state.valid}
                submessage={this.state.validMessage}
            >
                <select
                    onChange={this.handleChange}
                    value={this.state.value}
                    className="field-entry"
                >
                    {this.props.children}
                </select>
            </FieldWrapper>
        );
    }
}

export function HLine() {
    return <span className="form-element hline"></span>;
}

export class Range extends Field {
    constructor(props = { min: 0, max: 0, step: 1 }) {
        super(props);
        this.setState({
            value: this.state.value === "" ? 0 : this.state.value,
        });
        this.state.values[this.state.fieldName] = this.state.value;
    }

    componentDidUpdate() {
        if (this.state.value > this.props.max) {
            this.setState({ value: this.props.max });
        }
        if (this.state.value < this.props.min) {
            this.setState({ value: this.props.min });
        }
        if (isNaN(Number(this.state.value))) {
            this.setState({ value: this.props.min });
        }
    }

    render() {
        return (
            <FieldWrapper
                fieldName={this.state.fieldName}
                fieldType="range"
                label={this.state.label}
                icon={this.state.icon}
                iconClass={this.state.iconClass}
                valid={this.state.valid}
                submessage={this.state.validMessage}
            >
                <input
                    onChange={this.handleChange}
                    value={this.state.value}
                    type="range"
                    className="field-entry"
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                />
                <div className="range-shroud">
                    <div className="range-inner">
                        <span
                            className="marker"
                            style={{
                                left:
                                    (this.state.value /
                                        (this.props.max - this.props.min)) *
                                        100 +
                                    "%",
                            }}
                        />
                        <span
                            className="fill"
                            style={{
                                width:
                                    "calc(" +
                                    (this.state.value /
                                        (this.props.max - this.props.min)) *
                                        100 +
                                    "% + 20px)",
                            }}
                        />
                    </div>
                </div>
                <input
                    onChange={this.handleChange}
                    value={this.state.value || 0}
                    type="text"
                    className="value-display"
                />
            </FieldWrapper>
        );
    }
}
