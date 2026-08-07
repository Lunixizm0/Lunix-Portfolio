import {
  AboutWrapper,
  HighlightAlt,
  HighlightSpan,
} from "../styles/About.styled";

const About: React.FC = () => {
  return (
    <AboutWrapper data-testid="about">
      <p>
        Hi, my name is <HighlightSpan>Utku Ceylan</HighlightSpan>.
      </p>
      <p>
        I'm a{" "}
        <HighlightAlt>Junior Security Researcher & Team Leader</HighlightAlt>{" "}
        based in Turkey.
      </p>
      <p>I am passionate about security research in large ecosystems.</p>
    </AboutWrapper>
  );
};

export default About;
