import { useContext, useEffect } from "react";
import _ from "lodash";
import { termContext } from "../Terminal";

const Resume: React.FC = () => {
  const { history, index, rerender } = useContext(termContext);

  useEffect(() => {
    if (rerender && history[index] === "resume" && index === history.length - 1) {
      document.dispatchEvent(new CustomEvent('open-resume', { detail: { index } }));
    }
  }, [rerender, history, index]);

  return <span></span>;
};

export default Resume;
