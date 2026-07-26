import { useContext, useEffect } from "react";
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

const Projects: React.FC = () => {
  const { arg, history, rerender, executeCommand } = useContext(termContext);

  /* ===== get current command ===== */
  const currentCommand = getCurrentCmdArry(history);

  /* ===== check current command is redirect ===== */
  useEffect(() => {
    if (checkRedirect(rerender, currentCommand, "projects")) {
      projects.forEach(({ id, url }) => {
        id === parseInt(arg[1]) && window.open(url, "_blank");
      });
    }
  }, [arg, rerender, currentCommand]);

  /* ===== handle project click ===== */
  const handleProjectClick = (id: number, url: string) => {
    window.open(url, "_blank");
  };

  /* ===== check arg is valid ===== */
  const checkArg = () =>
    isArgInvalid(arg, "go", ["1", "2", "3", "4"]) ? (
      <Usage cmd="projects" />
    ) : null;

  return arg.length > 0 || arg.length > 2 ? (
    checkArg()
  ) : (
    <div data-testid="projects">
      <ProjectsIntro>
        “Talk is cheap. Show me the code”? I got you! <br />
        Here are some of my projects.
      </ProjectsIntro>
      {projects.map(({ id, title, desc, url }) => (
        <ProjectContainer key={id}>
          <ProjectTitle
            onClick={() => handleProjectClick(id, url)}
            style={{ cursor: 'pointer' }}
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
    desc: "A diagnostic tool for Ahenk, a remote managament system for Pardus ETAP.",
    url: "https://github.com/Lunixizm0/ahenk-debug",
  },

  {
    id: 2,
    title: "Data-Collector",
    desc: "A data collector tool for Windows.",
    url: "https://github.com/Lunixizm0/Data-Collector",
  },
  {
    id: 3,
    title: "Walkie Talkie",
    desc: "A communication tool that allows users to send messages and talk securely over LAN.",
    url: "https://github.com/Lunixizm0/Walkie",
  }
];

export default Projects;
