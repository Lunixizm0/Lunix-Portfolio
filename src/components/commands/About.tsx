import { AboutWrapper } from "../styles/About.styled";
import { t } from "../../i18n";

const About: React.FC = () => {
  return (
    <AboutWrapper data-testid="about">
      <p>{t("cmd.about.intro", { name: "Utku Ceylan" })}</p>
      <p>{t("cmd.about.role", { role: t("cmd.about.roleAlt") })}</p>
      <p>{t("cmd.about.passion")}</p>
    </AboutWrapper>
  );
};

export default About;
