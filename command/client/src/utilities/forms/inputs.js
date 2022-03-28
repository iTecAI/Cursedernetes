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
