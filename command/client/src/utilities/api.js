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
        return data.json();
    }
}
