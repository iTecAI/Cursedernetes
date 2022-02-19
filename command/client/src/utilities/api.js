import { sha256 } from "js-sha256";

export async function get(
    path,
    options = {
        parameters: {},
    }
) {
    options = options || {};
    var data = await fetch(
        "/api" +
            path +
            "?" +
            new URLSearchParams(options.parameters || {}).toString(),
        {
            method: "GET",
            headers: {
                "x-fingerprint": localStorage.getItem("fingerprint") || "nofp",
            },
            cache: "no-cache",
            mode: "cors",
        }
    );
    if (
        data.headers.get("x-new-salt") &&
        data.headers.get("x-new-salt") !== "nosalt" &&
        window.localStorage.getItem("fingerprint")
    ) {
        window.localStorage.setItem(
            "fingerprint",
            sha256(
                window.localStorage.getItem("fingerprint") +
                    data.headers.get("x-new-salt")
            )
        );
    }
    return data.json();
}

export async function post(
    path,
    options = {
        parameters: {},
        body: null,
    }
) {
    options = options || {};
    var data;
    if (options.body) {
        data = await fetch(
            "/api" +
                path +
                "?" +
                new URLSearchParams(options.parameters || {}).toString(),
            {
                method: "POST",
                headers: {
                    "x-fingerprint":
                        localStorage.getItem("fingerprint") || "nofp",
                    "Content-Type": "application/json",
                },
                cache: "no-cache",
                body: JSON.stringify(options.body),
                mode: "cors",
            }
        );
        if (
            data.headers.get("x-new-salt") &&
            data.headers.get("x-new-salt") !== "nosalt" &&
            window.localStorage.getItem("fingerprint")
        ) {
            window.localStorage.setItem(
                "fingerprint",
                sha256(
                    window.localStorage.getItem("fingerprint") +
                        data.headers.get("x-new-salt")
                )
            );
        }
        return data.json();
    } else {
        data = await fetch(
            "/api" +
                path +
                "?" +
                new URLSearchParams(options.parameters || {}).toString(),
            {
                method: "POST",
                headers: {
                    "x-fingerprint":
                        localStorage.getItem("fingerprint") || "nofp",
                },
                cache: "no-cache",
                mode: "cors",
            }
        );
        if (
            data.headers.get("x-new-salt") &&
            data.headers.get("x-new-salt") !== "nosalt" &&
            window.localStorage.getItem("fingerprint")
        ) {
            window.localStorage.setItem(
                "fingerprint",
                sha256(
                    window.localStorage.getItem("fingerprint") +
                        data.headers.get("x-new-salt")
                )
            );
        }
        return data.json();
    }
}
