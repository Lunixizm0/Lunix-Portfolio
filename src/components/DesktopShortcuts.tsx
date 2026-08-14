import React from "react";
import styled from "styled-components";
import DesktopShortcut, { Icons } from "./DesktopShortcut";
import { t } from "../i18n";

type Props = {
  onOpenTerminal: () => void;
  onOpenWelcome: () => void;
  onOpenResume: () => void;
  onOpenSocial: () => void;
  hidden?: boolean;
  activeTerminal?: boolean;
  activeBrowser?: boolean;
  activeResume?: boolean;
  activeSocial?: boolean;
  mobileExpanded?: boolean;
};

const Grid = styled.div<{ hidden?: boolean; mobileExpanded?: boolean }>`
  position: fixed;
  display: grid;
  z-index: 10; /* below windows */
  ${({ hidden }) => hidden && "display:none;"}

  ${({ mobileExpanded }) =>
    mobileExpanded
      ? `
    top: 12px; left: 12px; right: 12px; bottom: 12px;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    grid-auto-rows: max-content;
    gap: 20px;
    justify-items: center;
    align-content: start;
    overflow: auto;
  `
      : `
    top: 24px; left: 24px;
    grid-template-columns: repeat(1, max-content);
    grid-auto-rows: max-content;
    gap: 18px;
  `}
`;

const DesktopShortcuts: React.FC<Props> = ({
  onOpenTerminal,
  onOpenWelcome,
  onOpenResume,
  onOpenSocial,
  hidden,
  activeTerminal,
  activeBrowser,
  activeResume,
  activeSocial,
  mobileExpanded,
}) => {
  return (
    <Grid hidden={hidden} mobileExpanded={mobileExpanded}>
      <DesktopShortcut
        label={t("desktop.browser")}
        onOpen={onOpenWelcome}
        icon={Icons.Browser}
        active={activeBrowser}
      />
      <DesktopShortcut
        label={t("desktop.terminal")}
        onOpen={onOpenTerminal}
        icon={Icons.Terminal}
        active={activeTerminal}
      />
      <DesktopShortcut
        label={t("desktop.social")}
        onOpen={onOpenSocial}
        icon={Icons.Social}
        active={activeSocial}
      />
      <DesktopShortcut
        label={t("desktop.linkedin")}
        href="https://www.linkedin.com/in/utku-ceylan-/"
        icon={Icons.LinkedIn}
      />
      <DesktopShortcut
        label={t("desktop.github")}
        href="https://github.com/Lunixizm0"
        icon={Icons.GitHub}
      />
      <DesktopShortcut
        label={t("desktop.resume")}
        onOpen={onOpenResume}
        icon={Icons.PDF}
        active={activeResume}
      />
    </Grid>
  );
};

export default React.memo(DesktopShortcuts);
