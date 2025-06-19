export function matchEmailPattern(
  str: string,
) {
  const regex = /^([^@]+)@([^@]+)$/;

  const match = str.match(regex);
  if (!match) return undefined;

  const username = match[1];
  const domain = match[2];

  if (hasUnwantedCharacter(username)) return undefined;

  const [main, subaddress] = splitSubAddressing(username);
  if (!main) return undefined;

  const validDomain = checkValidDomain(domain);
  if (!validDomain) return undefined;

  return {
    email: [main, domain].join('@'),
    subaddress,
  }
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
  const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  const match = domain.match(domainRegex);
  if (match) return true;

  return false;
}

export function hasUnwantedCharacter(str: string) {
  const validChar = /^[a-zA-Z0-9_.+\-]+$/;
  return !validChar.test(str);
}

export function countDownTimeout(remainingSecond: number, callback: (second: number) => void, onCountDownEnd: () =>  void) {
  if (remainingSecond === 0) {
    onCountDownEnd();
    return;
  }

  callback(remainingSecond);
  setTimeout(() => {
    countDownTimeout(remainingSecond - 1, callback, onCountDownEnd);
  }, 1000);
}

export function formattingTime(second: number) {
  if (second < 60) {
    return `${second} seconds`;
  }

  const minute = Math.round(second / 60);
  return `${minute} minutes`;
}