import {
  Cmd,
  CmdDesc,
  CmdList,
  HelpWrapper,
  KeyContainer,
} from "../styles/Help.styled";
import { commands, termContext } from "../Terminal";
import { generateTabs } from "../../utils/funcs";
import { useContext } from "react";
import { t } from "../../i18n";

const Help: React.FC = () => {
  const { executeCommand } = useContext(termContext);

  const handleCommandClick = (cmd: string) => {
    if (executeCommand) {
      executeCommand(cmd);
    }
  };

  return (
    <HelpWrapper data-testid="help">
      {commands.map(({ cmd, desc, tab }) => (
        <CmdList key={cmd}>
          <Cmd
            onClick={() => handleCommandClick(cmd)}
            style={{ cursor: "pointer" }}
          >
            {cmd}
          </Cmd>
          {generateTabs(tab)}
          <CmdDesc>- {desc}</CmdDesc>
        </CmdList>
      ))}
      <KeyContainer>
        <div>{t("cmd.help.tabAutocomplete")}</div>
        <div>
          {t("cmd.help.upArrow")} {generateTabs(5)} {t("cmd.help.upArrowDesc")}
        </div>
        <div>
          {t("cmd.help.ctrlL")} {generateTabs(5)} {t("cmd.help.ctrlLDesc")}
        </div>
        <div>{t("cmd.help.clickAny")}</div>
      </KeyContainer>
    </HelpWrapper>
  );
};

export default Help;
