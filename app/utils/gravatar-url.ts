async function md5(string: string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('MD5', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

const emailPattern = /.+@.+/;

export async function getGravatarUrl(emailOrUsername: string) {
    const trimmed = emailOrUsername.trim().toLowerCase();

    if (!emailPattern.test(trimmed)) {
        return null;
    }

    const emailHash = await md5(trimmed);
    return `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
}
