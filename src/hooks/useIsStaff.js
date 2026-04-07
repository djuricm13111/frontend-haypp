import { useContext, useMemo } from "react";

import { AuthUserContext } from "../context/AuthUserContext";

/**
 * Samo ako je profil učitan sa API-ja i `is_staff === true`.
 * JWT se ne koristi — običan korisnik nikad ne vidi admin UI u headeru.
 */
export function useIsStaff() {
  const { authTokens, userProfile } = useContext(AuthUserContext);
  return useMemo(() => {
    if (!authTokens?.access) return false;
    return userProfile?.is_staff === true;
  }, [authTokens, userProfile]);
}
