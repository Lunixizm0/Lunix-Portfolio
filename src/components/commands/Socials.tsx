import { useContext, useEffect, useRef } from "react";
import { ProjectsIntro } from "../styles/Projects.styled";
import { Cmd, CmdDesc, CmdList, HelpWrapper } from "../styles/Help.styled";
import {
  checkRedirect,
  generateTabs,
  getCurrentCmdArry,
  isArgInvalid,
} from "../../utils/funcs";
import { termContext } from "../Terminal";
import Usage from "../Usage";

const Socials: React.FC = () => {
  const { arg, history, index, rerender } = useContext(termContext);

  /* ===== get current command ===== */
  const currentCommand = getCurrentCmdArry(history[index]);

  /* ===== open the Social desktop app window ===== */
  useEffect(() => {
    if (
      rerender &&
      history[index] === "socials" &&
      index === history.length - 1
    ) {
      document.dispatchEvent(
        new CustomEvent("open-social", { detail: { index } })
      );
    }
  }, [rerender, history, index]);

  /* ===== prevent the redirect from firing more than once per command ===== */
  const handledRef = useRef<string | null>(null);

  /* ===== check current command makes redirect ===== */
  useEffect(() => {
    const cmd = history[index];
    if (
      rerender &&
      index === history.length - 1 &&
      checkRedirect(rerender, currentCommand, "socials")
    ) {
      if (handledRef.current === cmd) return;
      handledRef.current = cmd;
      socials.forEach(({ id, url }) => {
        id === parseInt(arg[1]) && window.open(url, "_blank");
      });
    }
  }, [arg, rerender, currentCommand, index, history]);

  /* ===== handle social link click ===== */
  const handleSocialClick = (url: string) => {
    window.open(url, "_blank");
  };

  /* ===== check arg is valid ===== */
  const checkArg = () =>
    isArgInvalid(arg, "go", ["1", "2", "3"]) ? <Usage cmd="socials" /> : null;

  return arg.length > 0 || arg.length > 2 ? (
    checkArg()
  ) : (
    <HelpWrapper data-testid="socials">
      <ProjectsIntro>Here are my social links</ProjectsIntro>
      {socials.map(({ id, title, url, tab }) => (
        <CmdList key={title}>
          <Cmd
            onClick={() => handleSocialClick(url)}
            style={{ cursor: "pointer" }}
          >
            {`${id}. ${title}`}
          </Cmd>
          {generateTabs(tab)}
          <CmdDesc>- {url}</CmdDesc>
        </CmdList>
      ))}
      <Usage cmd="socials" marginY />
    </HelpWrapper>
  );
};

const socials = [
  {
    id: 1,
    title: "GitHub",
    url: "https://github.com/Lunixizm0",
    tab: 3,
  },
  {
    id: 2,
    title: "Linkedin",
    url: "https://www.linkedin.com/in/utku-ceylan-/",
    tab: 1,
  },
  {
    id: 3,
    title: "Mail",
    url: "portfolio@lunixizm.website",
    tab: 5,
  },
];

export default Socials;
