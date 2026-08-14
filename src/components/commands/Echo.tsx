import { useContext } from "react";
import { Wrapper } from "../styles/Output.styled";
import { termContext } from "../Terminal";

const Echo: React.FC = () => {
  const { arg } = useContext(termContext);

  let outputStr = arg.join(" ");
  outputStr = outputStr.replace(/^'+|'+$/g, ""); // remove trailing single quotes ''
  outputStr = outputStr.replace(/^"+|"+$/g, ""); // remove trailing double quotes ""
  outputStr = outputStr.replace(/^`+|`+$/g, ""); // remove trailing backtick ``

  return <Wrapper>{outputStr}</Wrapper>;
};

export default Echo;
