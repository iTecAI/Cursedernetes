export default function Icon(props = { name: "eye", category: "mdi" }) {
    return (
        <i
            className={
                "nf nf-" +
                (props.category || "mdi") +
                "-" +
                (props.name || "eye")
            }
        ></i>
    );
}
