import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Output from "./Output";
import TermInfo from "./TermInfo";
import {
  CmdNotFound,
  Empty,
  Form,
  Hints,
  Input,
  MobileBr,
  MobileSpan,
  Wrapper,
} from "./styles/Terminal.styled";
import { argTab } from "../utils/funcs";
import { t } from "../i18n";

type Command = {
  cmd: string;
  desc: string;
  tab: number;
}[];

export const commands: Command = [
  { cmd: "about", desc: t("terminal.cmd.about"), tab: 8 },
  { cmd: "clear", desc: t("terminal.cmd.clear"), tab: 8 },
  { cmd: "echo", desc: t("terminal.cmd.echo"), tab: 9 },
  { cmd: "email", desc: t("terminal.cmd.email"), tab: 8 },
  { cmd: "resume", desc: t("terminal.cmd.resume"), tab: 7 },
  { cmd: "help", desc: t("terminal.cmd.help"), tab: 9 },
  { cmd: "history", desc: t("terminal.cmd.history"), tab: 6 },
  { cmd: "projects", desc: t("terminal.cmd.projects"), tab: 5 },
  { cmd: "pwd", desc: t("terminal.cmd.pwd"), tab: 10 },
  { cmd: "socials", desc: t("terminal.cmd.socials"), tab: 6 },
  { cmd: "sudo", desc: t("terminal.cmd.sudo"), tab: 9 },
  { cmd: "welcome", desc: t("terminal.cmd.welcome"), tab: 6 },
  { cmd: "whoami", desc: t("terminal.cmd.whoami"), tab: 7 },
  { cmd: "neofetch", desc: t("terminal.cmd.neofetch"), tab: 5 },
  { cmd: "uname", desc: t("terminal.cmd.uname"), tab: 8 },
  { cmd: "ls", desc: t("terminal.cmd.ls"), tab: 11 },
];

// easter-egg commands
export const hiddenCommands = ["sudo", "neofetch", "uname", "ls"];

type Term = {
  arg: string[];
  history: string[];
  rerender: boolean;
  index: number;
  clearHistory?: () => void;
  executeCommand?: (cmd: string) => void;
};

export const termContext = createContext<Term>({
  arg: [],
  history: [],
  rerender: false,
  index: 0,
});

const Terminal = () => {
  const containerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start with 'welcome' so it executes first on load
  const [cmdHistory, setCmdHistory] = useState<string[]>(["welcome", "about"]);
  const [rerender, setRerender] = useState(false);
  const [hints, setHints] = useState<string[]>([]);

  const executeCommand = useCallback((cmd: string) => {
    setCmdHistory(prev => [...prev, cmd]);
    setRerender(true);
    setHints([]);
  }, []);

  const clearHistory = useCallback(() => {
    setCmdHistory([]);
    setHints([]);
  }, []);

  // Reset the "newly submitted" flag on the next keystroke so a subsequent
  // identical submit still triggers the redirect effects.
  const handleInput = useCallback(() => setRerender(false), []);

  // focus on input when terminal is clicked
  const handleDivClick = () => {
    inputRef.current && inputRef.current.focus();
  };
  useEffect(() => {
    document.addEventListener("click", handleDivClick);
    return () => {
      document.removeEventListener("click", handleDivClick);
    };
  }, []);

  // Auto-scroll to bottom when history updates or new output renders
  useEffect(() => {
    const el = containerRef?.current as unknown as HTMLElement | null;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [cmdHistory, rerender]);

  const renderedHistory = useMemo(
    () =>
      cmdHistory.map((cmdH, index) => {
        const commandArray = cmdH.trim().split(" ");
        const validCommand = commands.find(c => c.cmd === commandArray[0]);
        const contextValue = {
          arg: commandArray.slice(1),
          history: cmdHistory,
          rerender,
          index,
          clearHistory,
          executeCommand,
        };
        return (
          <div key={index}>
            <div>
              <TermInfo />
              <MobileBr />
              <MobileSpan>&#62;</MobileSpan>
              <span data-testid="input-command">{cmdH}</span>
            </div>
            {validCommand || hiddenCommands.includes(commandArray[0]) ? (
              <termContext.Provider value={contextValue}>
                <Output index={index} cmd={commandArray[0]} />
              </termContext.Provider>
            ) : cmdH === "" ? (
              <Empty />
            ) : (
              <CmdNotFound data-testid={`not-found-${index}`}>
                {t("terminal.notFound", { cmd: cmdH })}
              </CmdNotFound>
            )}
          </div>
        );
      }),
    [cmdHistory, rerender, clearHistory, executeCommand]
  );

  return (
    <Wrapper data-testid="terminal-wrapper" ref={containerRef}>
      {renderedHistory}

      {hints.length > 1 && (
        <div>
          {hints.map(hCmd => (
            <Hints key={hCmd}>{hCmd}</Hints>
          ))}
        </div>
      )}

      <TerminalInput
        cmdHistory={cmdHistory}
        inputRef={inputRef}
        onExecute={executeCommand}
        onInput={handleInput}
        onClear={clearHistory}
        setHints={setHints}
      />
    </Wrapper>
  );
};

type TerminalInputProps = {
  cmdHistory: string[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onExecute: (cmd: string) => void;
  onInput: () => void;
  onClear: () => void;
  setHints: React.Dispatch<React.SetStateAction<string[]>>;
};

// Owns the live input value + history navigation so that typing only
// re-renders the form, not the whole command history.
const TerminalInput: React.FC<TerminalInputProps> = ({
  cmdHistory,
  inputRef,
  onExecute,
  onInput,
  onClear,
  setHints,
}) => {
  const [inputVal, setInputVal] = useState("");
  // History navigation index: null means not navigating; otherwise index into cmdHistory (oldest -> newest)
  const [histIndex, setHistIndex] = useState<number | null>(null);

  // Reset navigation whenever history changes (submit or re-execute)
  useEffect(() => {
    setHistIndex(null);
  }, [cmdHistory]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onExecute(inputVal);
    setInputVal("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInput();
    setInputVal(e.target.value);
  };

  // Keyboard Press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onInput();
    const ctrlI = e.ctrlKey && e.key.toLowerCase() === "i";
    const ctrlL = e.ctrlKey && e.key.toLowerCase() === "l";

    // if Tab or Ctrl + I
    if (e.key === "Tab" || ctrlI) {
      e.preventDefault();
      if (!inputVal) return;

      let hintsCmds: string[] = [];
      commands.forEach(({ cmd }) => {
        if (cmd.startsWith(inputVal)) {
          hintsCmds = [...hintsCmds, cmd];
        }
      });

      const returnedHints = argTab(inputVal, setInputVal, setHints, hintsCmds);
      hintsCmds = returnedHints ? [...hintsCmds, ...returnedHints] : hintsCmds;

      // if there are many command to autocomplete
      if (hintsCmds.length > 1) {
        setHints(hintsCmds);
      }
      // if only one command to autocomplete
      else if (hintsCmds.length === 1) {
        const currentCmd = inputVal.split(" ");
        setInputVal(
          currentCmd.length !== 1
            ? `${currentCmd[0]} ${currentCmd[1]} ${hintsCmds[0]}`
            : hintsCmds[0]
        );

        setHints([]);
      }
    }

    // if Ctrl + L
    if (ctrlL) {
      onClear();
    }

    // Go previous cmd
    if (e.key === "ArrowUp") {
      if (cmdHistory.length === 0) return;

      const nextIndex =
        histIndex === null ? cmdHistory.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(nextIndex);
      setInputVal(cmdHistory[nextIndex]);
      inputRef?.current?.blur();
    }

    // Go next cmd
    if (e.key === "ArrowDown") {
      if (histIndex === null) return;

      if (histIndex === cmdHistory.length - 1) {
        setInputVal("");
        setHistIndex(null);
        return;
      }

      const nextIndex = Math.min(cmdHistory.length - 1, histIndex + 1);
      setHistIndex(nextIndex);
      setInputVal(cmdHistory[nextIndex]);
      inputRef?.current?.blur();
    }
  };

  // For caret position at the end
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef?.current?.focus();
    }, 1);
    return () => clearTimeout(timer);
  }, [inputVal, histIndex]);

  return (
    <Form onSubmit={handleSubmit}>
      <label htmlFor="terminal-input">
        <TermInfo /> <MobileBr />
        <MobileSpan>&#62;</MobileSpan>
      </label>
      <Input
        title="terminal-input"
        type="text"
        id="terminal-input"
        autoComplete="off"
        spellCheck="false"
        autoFocus
        autoCapitalize="off"
        ref={inputRef}
        value={inputVal}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
    </Form>
  );
};

export default React.memo(Terminal);
