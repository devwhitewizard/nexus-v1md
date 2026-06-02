const db = require("./db");

// get or create user
function getUser(id) {
    return new Promise((resolve) => {
        db.get(
            "SELECT * FROM users WHERE id = ?",
            [id],
            (err, row) => {
                if (row) return resolve(row);

                // create user if not exists
                db.run(
                    "INSERT INTO users (id) VALUES (?)",
                    [id],
                    () => {
                        resolve({
                            id,
                            xp: 0,
                            level: 1,
                            coins: 0
                        });
                    }
                );
            }
        );
    });
}

// add xp
function addXP(id, amount = 1) {
    db.run(
        "UPDATE users SET xp = xp + ? WHERE id = ?",
        [amount, id]
    );
}

// level system (simple)
function addLevel(id) {
    db.run(
        "UPDATE users SET level = level + 1 WHERE id = ?",
        [id]
    );
}

module.exports = {
    getUser,
    addXP,
    addLevel
};