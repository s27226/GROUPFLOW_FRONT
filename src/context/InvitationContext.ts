import { createContext, Dispatch, SetStateAction } from "react";

interface InvitationContextType {
    invitationsCount: number;
    setInvitationsCount: Dispatch<SetStateAction<number>>;
}

export const InvitationContext = createContext<InvitationContextType>({
    invitationsCount: 0,
    setInvitationsCount: () => {}
});
