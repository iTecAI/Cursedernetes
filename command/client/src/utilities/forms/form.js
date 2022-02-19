import { Component, Children, cloneElement } from "react";
import "./forms.css";

export default class Form extends Component {
    constructor(
        props = {
            extraClasses: [],
            onSubmit: () => {},
            onChange: () => {},
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
        this.wrapSubmit = function (e) {
            // console.log(e, this.state.values);
            this.handleSubmit(this.state.values);
        }.bind(this);
    }

    render() {
        var classes = this.state.classes || [];
        classes.push("form");
        return (
            <div className={classes}>
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
