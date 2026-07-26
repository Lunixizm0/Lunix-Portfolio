import { useContext, useEffect } from "react";
import _ from "lodash";
import { termContext } from "../Terminal";

const Resume: React.FC = () => {
  const { history, index, rerender } = useContext(termContext);

  useEffect(() => {
    if (rerender && history[index] === "resume") {
      document.dispatchEvent(new CustomEvent('open-resume'));
    }
  }, [rerender, history, index]);

  return <span></span>;
};

export default Resume;
