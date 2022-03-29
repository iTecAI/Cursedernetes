import { Component, Children, cloneElement } from "react";
import "./forms.css";

export default class Form extends Component {
    constructor(
        props = {
            extraClasses: [],
            onSubmit: () => {},
            onChange: () => {},
            onMount: () => {},
            children: [],
            submitButton: <></>,
        }
    ) {
        super(props);
        this.state = {
            values: {},
            classes: props.extraClasses,
        };
        this.handleSubmit = props.onSubmit || (() => {});
        this.handleChange = props.onChange || (() => {});
        this.handleUpdate = props.onUpdate || (() => {});
        this.wrapSubmit = function (e) {
            // console.log(e, this.state.values);
            this.handleSubmit(this.state.values);
        }.bind(this);
    }

    componentDidUpdate() {
        this.handleUpdate(this.state.values);
    }

    render() {
        var classes = this.state.classes || [];
        classes.push("form");
        return (
            <div className={classes.join(" ")}>
                {Children.map(this.props.children, (child) => {
                    return cloneElement(child, {
                        values: this.state.values,
                        onChange: this.handleChange,
                    });
                })}
                {cloneElement(
                    this.props.submitButton || <button>Submit</button>,
                    {
                        onClick: this.wrapSubmit,
                        className: "form-button form-submit",
                    }
                )}
            </div>
        );
    }
}
