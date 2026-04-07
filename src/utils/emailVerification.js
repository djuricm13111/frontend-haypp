import { jwtDecode } from "jwt-decode";

/**
 * Da li je nalog označen kao email-verifikovan u access JWT-u ili u API profilu.
 * Ako API eksplicitno kaže `false`, korisnik mora da verifikuje.
 * Ako JWT nema claim (stariji backend), tretira se kao verifikovano da se ne zaključa postojeći korisnici.
 *
 * @param {string | null} accessToken
 * @param {{ is_email_verified?: boolean } | null} profile
 * @returns {boolean}
 */
export function isAccountEmailVerified(accessToken, profile) {
  if (profile?.is_email_verified === true) return true;
  if (profile?.is_email_verified === false) return false;

  if (!accessToken) return false;
  try {
    const d = jwtDecode(accessToken);
    if (d.is_email_verified === false) return false;
    if (d.is_email_verified === true) return true;
    if (d.email_verified === false) return false;
    if (d.email_verified === true) return true;
    return true;
  } catch {
    return true;
  }
}
