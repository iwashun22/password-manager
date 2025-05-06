export function matchEmailPattern(
  str: string,
  allowSubAddress: boolean = true
) {
  const regex = /^([^@]+)@([^@]+)$/;

  const match = str.match(regex);
  if (!match) return undefined;

  const username = match[1];
  const domain = match[2];

  const [main, subaddress] = splitSubAddressing(username);
  if (!allowSubAddress && (subaddress !== null)) return undefined;

  const validDomain = checkValidDomain(domain);
  if (!validDomain) return undefined;

  return [main, domain].join('@');
}

export function splitSubAddressing(username: string): [string, string | null] {
  const regex = /^([^+]+)\+([^+]+)$/;

  const match = username.match(regex);
  if (!match) {
    if (username.includes("+")) return ['', null];

    return [username, null];
  }

  return [match[1], match[2]];
}

export function checkValidDomain(domain: string) {
  const domainRegex = /^(?:[a-zA-Z0-9-]+.)+[a-zA-Z]{2,}$/;
  
  const match = domain.match(domainRegex);
  if (match) return true;

  return false;
}