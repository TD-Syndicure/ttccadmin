import InfoIcon from "./icons/InfoIcon";
import SuccessIcon from "./icons/SuccessIcon";
import ErrorIcon from "./icons/ErrorIcon";
import CloseIcon from "./icons/CloseIcon";

const alertStyle = {
  background: "linear-gradient(180deg, #0e97ba, #29aaec 30%, #d451d2 115%)",
  border: '1px solid #7cfdad',
  color: "white",
  padding: "10px 40px 10px 110px",
  textTransform: "uppercase",
  borderRadius: "4px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0px 2px 2px 2px rgba(0, 0, 0, 0.03)",
  width: "500px",
  minHeight: '80px',
  maxWidth: "90vw",
  boxSizing: "border-box",
  position: "relative"
};

const buttonStyle = {
  marginLeft: "0",
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const CustomAlertTemplate = ({ message, options, style, close }) => {
  return (
    <div style={{ ...alertStyle, ...style }}>
      <img src="/scientist.png" style={{
        position: 'absolute',
        bottom: '0px',
        left: '10px',
        height: '120px',
      }} />
      <span style={{ flex: 2 }}>{message}</span>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        right: '5px',
        height: 'calc(100% - 10px)'
      }}>
        <button onClick={close} style={buttonStyle}>
          <CloseIcon />
        </button>
        {options.type === "info" && <InfoIcon />}
        {options.type === "success" && <SuccessIcon />}
        {options.type === "error" && <ErrorIcon />}
      </div>
    </div>
  );
};

export default CustomAlertTemplate