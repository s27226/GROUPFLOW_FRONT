import { createContext } from "react";

export const InvitationContext = createContext({
    invitationsCount: 0,
    setInvitationsCount: () => {}
});
