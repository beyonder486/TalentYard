export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(222, 30%, 7%)",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "50%",
          border: "3px solid rgba(99,102,241,0.2)",
          borderTopColor: "hsl(249,90%,65%)",
          animation: "spin 0.75s linear infinite",
        }}
      />
      <p
        style={{
          color: "hsl(210,10%,55%)",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "0.9rem",
        }}
      >
        Loading TalentYard…
      </p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
