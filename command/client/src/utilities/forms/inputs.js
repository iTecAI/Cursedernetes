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
    }
) {
    return (
        <div
            className={
                "field" +
                (props.fieldType ? " " + props.fieldType : "") +
                (props.icon ? " icon" : "")
            }
            data-name={props.fieldName}
        >
            <div className="label noselect">
                {props.icon ? (
                    <Icon name={props.icon} category={props.iconClass} />
                ) : null}
                <span className="label-name">{props.label}</span>
            </div>
            <div className="field-input">{props.children}</div>
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
        }
    ) {
        super(props);
        this.getInput = function (e) {
            this.setState({ value: e.target.value });
            return e.target.value;
        }.bind(this);
        this.handleChange = function (e) {
            var value = this.getInput(e);
            this.state.values[this.state.fieldName] = value;
            this.props.onChange(this.state.values);
        }.bind(this);
        this.state = {
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
