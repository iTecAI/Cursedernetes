import Form from "../../utilities/forms/form";
import { Input } from "../../utilities/forms/inputs";
import Icon from "../../utilities/icons";
import "./login.css";

export default function Login() {
    return (
        <div className="login-wrapper paper">
            <span className="login-title noselect">Log In</span>
            <Form
                extraClasses={["login-form"]}
                onSubmit={(d) => console.log(d)}
                submitButton={
                    <button>
                        <Icon name="login_variant" />
                        Log In
                    </button>
                }
            >
                <Input
                    fieldName="username"
                    label=""
                    icon="account_box"
                    placeholder="Username"
                />
                <Input
                    fieldName="password"
                    label=""
                    icon="account_key"
                    placeholder="Password"
                    type="password"
                />
            </Form>
        </div>
    );
}
