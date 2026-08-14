import { useContext } from "react";
import { Wrapper } from "../styles/Output.styled";
import { termContext } from "../Terminal";

const Email: React.FC = () => {
  const { history, index, rerender } = useContext(termContext);

  /* ===== get current command ===== */
  const currentCommand = history[index].split(" ");

  if (
    rerender &&
    index === history.length - 1 &&
    currentCommand[0] === "email" &&
    currentCommand.length <= 1
  ) {
    window.open("mailto:" + "portfolio@lunixizm.website", "_self");
  }

  const handleEmailClick = () => {
    window.open("mailto:" + "portfolio@lunixizm.website", "_self");
  };

  return (
    <Wrapper>
      <span
        onClick={handleEmailClick}
        style={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "inherit",
        }}
      >
        portfolio@lunixizm.website
      </span>
    </Wrapper>
  );
};

export default Email;
