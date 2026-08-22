import { useContext } from "react";
import { t } from "../i18n";
import About from "./commands/About";
import Clear from "./commands/Clear";
import Echo from "./commands/Echo";
import Email from "./commands/Email";
import GeneralOutput from "./commands/GeneralOutput";
import Help from "./commands/Help";
import History from "./commands/History";
import Projects from "./commands/Projects";
import Resume from "./commands/Resume";
import Socials from "./commands/Socials";
import Welcome from "./commands/Welcome";
import {
  NeofetchAccent,
  NeofetchArt,
  NeofetchContainer,
  OutputContainer,
  UsageDiv,
} from "./styles/Output.styled";
import { termContext } from "./Terminal";

type Props = {
  index: number;
  cmd: string;
};

const neofetchInfo: [string, string][] = [
  ["OS", "Humanoid OS x86_64 (Kali-flavored)"],
  ["Host", "Biological Chassis v1 (Utku)"],
  ["Kernel", "6.9.0-lunix-gen1"],
  ["Uptime", "15 years, 0 crashes* (*unverified)"],
  ["Packages", "1337 (dpkg), 42 (broken snaps)"],
  ["Shell", "bash 5.2.15 (zsh refused)"],
  ["Resolution", "1920x1080 @ -4.75 myopia"],
  ["DE/WM", "XFCE / Xfwm4"],
  ["Terminal", "this browser tab"],
  ["CPU", "Human Brain (2) @ 4.5GHz [caffeine-cooled]"],
  ["GPU", "Imagination Integrated"],
  ["Memory", "2.1GiB / 16GiB (97% browser tabs)"],
];

const Output: React.FC<Props> = ({ index, cmd }) => {
  const { arg } = useContext(termContext);

  const specialCmds = ["projects", "socials", "echo"];

  // return 'Usage: <cmd>' if command arg is not valid
  // eg: about tt
  if (!specialCmds.includes(cmd) && arg.length > 0)
    return (
      <UsageDiv data-testid="usage-output">
        {t("terminal.usage", { cmd })}
      </UsageDiv>
    );

  // hidden easter eggs
  if (cmd === "sudo") {
    return (
      <OutputContainer>
        <GeneralOutput>{t("terminal.sudo")}</GeneralOutput>
      </OutputContainer>
    );
  }
  if (cmd === "neofetch") {
    return (
      <OutputContainer>
        <NeofetchContainer data-testid="neofetch">
          <NeofetchArt>{`
     ______
    [ o  o ]
    [  __  ]
    [______]
      |  |
   ___|  |___
  / [       ] \\
  \\ [______] /
   \\________/
      |  |
      d  b
          `}</NeofetchArt>
          <div>
            <div>
              <NeofetchAccent>lunix</NeofetchAccent>@humanoid
            </div>
            <div>--------------</div>
            {neofetchInfo.map(([key, value]) => (
              <div key={key}>
                <NeofetchAccent>{key}:</NeofetchAccent> {value}
              </div>
            ))}
            <div>* since first boot, allegedly</div>
          </div>
        </NeofetchContainer>
      </OutputContainer>
    );
  }
  if (cmd === "uname") {
    return (
      <OutputContainer>
        <GeneralOutput>Linux</GeneralOutput>
      </OutputContainer>
    );
  }
  if (cmd === "ls") {
    return (
      <OutputContainer>
        <GeneralOutput>{t("terminal.ls")}</GeneralOutput>
      </OutputContainer>
    );
  }

  return (
    <OutputContainer data-testid={index === 0 ? "latest-output" : null}>
      {
        {
          about: <About />,
          clear: <Clear />,
          echo: <Echo />,
          email: <Email />,
          resume: <Resume />,
          help: <Help />,
          history: <History />,
          projects: <Projects />,
          pwd: <GeneralOutput>/home/lunix</GeneralOutput>,
          socials: <Socials />,
          welcome: <Welcome />,
          whoami: <GeneralOutput>humanoid</GeneralOutput>,
        }[cmd]
      }
    </OutputContainer>
  );
};

export default Output;
