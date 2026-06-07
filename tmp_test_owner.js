const isOwner = (sender, ownerNumbers, SUDO) => {
    const isSudo = (sender) => {
        if (!sender || !SUDO) return false;
        const senderDigits = sender.replace(/\D/g, "");
        const sudoDigits = SUDO.replace(/\D/g, "");
        return sudoDigits && senderDigits.includes(sudoDigits);
    };

    if (!sender) return false;
    if (isSudo(sender)) return true;

    const senderDigits = sender.replace(/\D/g, "");
    if (!senderDigits) return false;

    // Check owners list
    const isMatched = ownerNumbers.some(num => {
        const ownerDigits = num.replace(/\D/g, "");
        return ownerDigits && senderDigits === ownerDigits;
    });

    return isMatched || false;
};

// TEST CASE
const sender = "254797715445@s.whatsapp.net";
const SUDO = "254797715445";
const owners = ["254797715445@s.whatsapp.net"];

console.log("Sender:", sender);
console.log("SUDO:", SUDO);
console.log("Result:", isOwner(sender, owners, SUDO));

const sender2 = "254797715445@s.whatsapp.net";
const owners2 = ["0797715445"]; // Local format
console.log("Result (Local Owners):", isOwner(sender2, owners2, SUDO));
