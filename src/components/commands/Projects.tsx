import { useContext, useEffect, useRef } from "react";
import {
  checkRedirect,
  getCurrentCmdArry,
  isArgInvalid,
} from "../../utils/funcs";
import {
  ProjectContainer,
  ProjectDesc,
  ProjectsIntro,
  ProjectTitle,
} from "../styles/Projects.styled";
import { termContext } from "../Terminal";
import Usage from "../Usage";
import { t } from "../../i18n";

const Projects: React.FC = () => {
  const { arg, history, index, rerender } = useContext(termContext);

  /* ===== get current command ===== */
  const currentCommand = getCurrentCmdArry(history[index]);

  /* ===== prevent the redirect from firing more than once per command ===== */
  const handledRef = useRef<string | null>(null);

  /* ===== check current command is redirect ===== */
  useEffect(() => {
    const cmd = history[index];
    if (
      rerender &&
      index === history.length - 1 &&
      checkRedirect(rerender, currentCommand, "projects")
    ) {
      if (handledRef.current === cmd) return;
      handledRef.current = cmd;
      projects.forEach(({ id, url }) => {
        id === parseInt(arg[1]) && window.open(url, "_blank");
      });
    }
  }, [arg, rerender, currentCommand, index, history]);

  /* ===== handle project click ===== */
  const handleProjectClick = (id: number, url: string) => {
    window.open(url, "_blank");
  };

  /* ===== check arg is valid ===== */
  const checkArg = () =>
    isArgInvalid(arg, "go", ["1", "2", "3", "4", "5", "6", "7"]) ? (
      <Usage cmd="projects" />
    ) : null;

  return arg.length > 0 ? (
    checkArg()
  ) : (
    <div data-testid="projects">
      <ProjectsIntro>{t("cmd.projects.intro")}</ProjectsIntro>
      {projects.map(({ id, title, desc, url }) => (
        <ProjectContainer key={id}>
          <ProjectTitle
            onClick={() => handleProjectClick(id, url)}
            style={{ cursor: "pointer" }}
          >
            {`${id}. ${title}`}
          </ProjectTitle>
          <ProjectDesc>{desc}</ProjectDesc>
        </ProjectContainer>
      ))}
      <Usage cmd="projects" marginY />
    </div>
  );
};

const projects = [
  {
    id: 1,
    title: "ahenk-debug",
    desc: "A diagnostic tool for Ahenk, a remote management system for Pardus ETAP.",
    url: "https://github.com/Lunixizm0/ahenk-debug",
  },
  {
    id: 2,
    title: "linux-autoruns",
    desc: "Sysinternals Autoruns equivalent for Linux, scanning 16 autostart entry points with a Qt6 GUI.",
    url: "https://github.com/Lunixizm0/linux-autoruns",
  },
  {
    id: 3,
    title: "firebase-dumper",
    desc: "Firebase assessment tool that dumps Firestore, Auth, Storage, RTDB, security rules and more via the Admin SDK.",
    url: "https://github.com/Lunixizm0/firebase-dumper",
  },
  {
    id: 4,
    title: "Walkie Talkie",
    desc: "A communication tool that allows users to send messages and talk securely over LAN.",
    url: "https://github.com/Lunixizm0/Walkie",
  },
  {
    id: 5,
    title: "SearchThings",
    desc: "Parallel file search tool written in Rust, with regex support and a live progress bar.",
    url: "https://github.com/Lunixizm0/SearchThings",
  },
  {
    id: 6,
    title: "Vulnerable-API",
    desc: "Deliberately vulnerable Flask API (SQLi, XSS, SSTI, LFI...) for security training, with paired safe endpoints.",
    url: "https://github.com/Lunixizm0/Vulnerable-API",
  },
  {
    id: 7,
    title: "Lunix-Portfolio",
    desc: "This interactive terminal-style portfolio & social hub (the site you're on right now).",
    url: "https://github.com/Lunixizm0/Lunix-Portfolio",
  },
];

export default Projects;
