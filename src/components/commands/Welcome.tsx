import { useContext } from "react";
import {
  Cmd,
  HeroContainer,
  PreName,
  PreNameMobile,
  PreWrapper,
} from "../styles/Welcome.styled";
import { termContext } from "../Terminal";
import { t } from "../../i18n";

const Welcome: React.FC = () => {
  const { executeCommand } = useContext(termContext);

  const handleHelpClick = () => {
    if (executeCommand) {
      executeCommand("help");
    }
  };

  return (
    <HeroContainer data-testid="welcome">
      <div className="info-section">
        <PreName>
          {`


 ██▓     █    ██  ███▄    █  ██▓▒██   ██▒ ██▓▒███████▒ ███▄ ▄███▓
▓██▒     ██  ▓██▒ ██ ▀█   █ ▓██▒▒▒ █ █ ▒░▓██▒▒ ▒ ▒ ▄▀░▓██▒▀█▀ ██▒
▒██░    ▓██  ▒██░▓██  ▀█ ██▒▒██▒░░  █   ░▒██▒░ ▒ ▄▀▒░ ▓██    ▓██░
▒██░    ▓▓█  ░██░▓██▒  ▐▌██▒░██░ ░ █ █ ▒ ░██░  ▄▀▒   ░▒██    ▒██ 
░██████▒▒▒█████▓ ▒██░   ▓██░░██░▒██▒ ▒██▒░██░▒███████▒▒██▒   ░██▒
░ ▒░▓  ░░▒▓▒ ▒ ▒ ░ ▒░   ▒ ▒ ░▓  ▒▒ ░ ░▓ ░░▓  ░▒▒ ▓░▒░▒░ ▒░   ░  ░
░ ░ ▒  ░░░▒░ ░ ░ ░ ░░   ░ ▒░ ▒ ░░░   ░▒ ░ ▒ ░░░▒ ▒ ░ ▒░  ░      ░
  ░ ░    ░░░ ░ ░    ░   ░ ░  ▒ ░ ░    ░   ▒ ░░ ░ ░ ░ ░░      ░   
    ░  ░   ░              ░  ░   ░    ░   ░    ░ ░           ░   
                                             ░                   
          `}
        </PreName>
        <PreWrapper>
          <PreNameMobile>
            {`


 ██▓     █    ██  ███▄    █  ██▓▒██   ██▒ ██▓▒███████▒ ███▄ ▄███▓
▓██▒     ██  ▓██▒ ██ ▀█   █ ▓██▒▒▒ █ █ ▒░▓██▒▒ ▒ ▒ ▄▀░▓██▒▀█▀ ██▒
▒██░    ▓██  ▒██░▓██  ▀█ ██▒▒██▒░░  █   ░▒██▒░ ▒ ▄▀▒░ ▓██    ▓██░
▒██░    ▓▓█  ░██░▓██▒  ▐▌██▒░██░ ░ █ █ ▒ ░██░  ▄▀▒   ░▒██    ▒██ 
░██████▒▒▒█████▓ ▒██░   ▓██░░██░▒██▒ ▒██▒░██░▒███████▒▒██▒   ░██▒
░ ▒░▓  ░░▒▓▒ ▒ ▒ ░ ▒░   ▒ ▒ ░▓  ▒▒ ░ ░▓ ░░▓  ░▒▒ ▓░▒░▒░ ▒░   ░  ░
░ ░ ▒  ░░░▒░ ░ ░ ░ ░░   ░ ▒░ ▒ ░░░   ░▒ ░ ▒ ░░░▒ ▒ ░ ▒░  ░      ░
  ░ ░    ░░░ ░ ░    ░   ░ ░  ▒ ░ ░    ░   ▒ ░░ ░ ░ ░ ░░      ░   
    ░  ░   ░              ░  ░   ░    ░   ░    ░ ░           ░   
                                             ░                   
          `}
          </PreNameMobile>
        </PreWrapper>
        <div>
          {t("cmd.welcome.helpPrefix")}
          <Cmd onClick={handleHelpClick} style={{ cursor: "pointer" }}>
            help
          </Cmd>
          {t("cmd.welcome.helpSuffix")}
        </div>
        <br />
      </div>
    </HeroContainer>
  );
};

export default Welcome;
