export default function RootNotFound() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "sans-serif",
        backgroundColor: "#fafafb",
        color: "#09090b",
      }}
    >
      <div>
        <h1 style={{ fontSize: "4rem", margin: 0, color: "#4f7cff" }}>404</h1>
        <p style={{ fontSize: "1.2rem", color: "#73737c", marginTop: "0.5rem" }}>
          Page Not Found
        </p>
      </div>
    </div>
  );
}
