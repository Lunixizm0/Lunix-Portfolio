import { useContext } from "react";
import { UsageDiv } from "./styles/Output.styled";
import { termContext } from "./Terminal";
import { t } from "../i18n";

type Props = {
  cmd: "projects" | "socials";
  marginY?: boolean;
};

const arg = {
  projects: { placeholder: "project-no", example: "4" },
  socials: { placeholder: "social-no", example: "1" },
};

const Usage: React.FC<Props> = ({ cmd, marginY = false }) => {
  const { executeCommand } = useContext(termContext);
  const action = "go";

  const handleExampleClick = () => {
    if (executeCommand) {
      executeCommand(`${cmd} ${action} ${arg[cmd].example}`);
    }
  };

  return (
    <UsageDiv data-testid={`${cmd}-invalid-arg`} marginY={marginY}>
      {t("cmd.usage.usage", {
        cmd,
        action,
        placeholder: arg[cmd].placeholder,
      })}{" "}
      <br />
      {t("cmd.usage.eg")}{" "}
      <span
        onClick={handleExampleClick}
        style={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "inherit",
        }}
      >
        {cmd} {action} {arg[cmd].example}
      </span>
    </UsageDiv>
  );
};

export default Usage;
