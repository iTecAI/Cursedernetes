import Form from "../../utilities/forms/form";
import { Input } from "../../utilities/forms/inputs";
import Icon from "../../utilities/icons";
import "./login.css";
import { sha256 } from "js-sha256";
import { get, post } from "../../utilities/api";

export default function Login() {
    return (
        <div className="login-wrapper paper">
            <span className="login-title noselect">Log In</span>
            <Form
                extraClasses={["login-form"]}
                onSubmit={async function (data) {
                    if (!data.password || !data.username) {
                        alert("Please enter both a username and password");
                        return;
                    }
                    var initData = await get("/login/init");
                    var cliData = Math.random().toString();
                    var passHash = sha256(
                        initData.bits + data.password + cliData
                    );
                    post("/login/", {
                        body: {
                            username: data.username,
                            password_hash: passHash,
                            cli_bits: cliData,
                            uuid: initData.uuid,
                        },
                    }).then((loginInfo) => {
                        if (loginInfo.uuid) {
                            window.localStorage.setItem(
                                "fingerprint",
                                loginInfo.uuid
                            );
                            window.location.pathname = "/";
                        } else {
                            alert("Login error: " + loginInfo.reason);
                        }
                    });
                }}
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
