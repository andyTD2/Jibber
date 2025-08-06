const db = require(baseDir + "/src/utils/db");
const queryDb = db.queryDb;

const deleteSession = async (userId) =>
{
    if(!userId)
    {
        return false;
    }
    const deleteOp = await queryDb("DELETE FROM sessions WHERE JSON_EXTRACT(data, '$.userID') = ?", [userId]);

    return deleteOp.affectedRows > 0;
}

module.exports = {
    deleteSession
}