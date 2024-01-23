import { SessionProvider as Provider } from "next-auth/react";

export default function SessionProvider({ children }) {
    return (
        <Provider session={{}}>
            {children}
        </Provider>
    );
}
