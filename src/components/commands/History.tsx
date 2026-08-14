import { useContext } from "react";
import { Wrapper } from "../styles/Output.styled";
import { termContext } from "../Terminal";

let historyId = 0;
const nextId = () => ++historyId;

const History: React.FC = () => {
  const { history, index, executeCommand } = useContext(termContext);
  const currentHistory = history.slice(0, index).reverse();

  const handleHistoryClick = (cmd: string) => {
    if (executeCommand) {
      executeCommand(cmd);
    }
  };

  return (
    <Wrapper data-testid="history">
      {currentHistory.map(cmd => (
        <div
          key={`${cmd}_${nextId()}`}
          onClick={() => handleHistoryClick(cmd)}
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            color: "inherit",
          }}
        >
          {cmd}
        </div>
      ))}
    </Wrapper>
  );
};

export default History;
