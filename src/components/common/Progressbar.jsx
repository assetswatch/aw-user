export default function ProgressBar({ progress }) {
  return (
    <div
      style={{
        height: "10px",
        width: "100%",
        backgroundColor: "#e0e0e0",
        borderRadius: "5px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "#76c7c0",
          transition: "width 0.2s ease-in-out",
        }}
      />
    </div>
  );
}
