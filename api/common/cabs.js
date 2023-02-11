const { PayloadTooLarge } = require("http-errors");
const pool = require("../../config/database");
getCabs1 = async () => {

    console.log("Selecting Items ");
    sqlcheck = "select * from prayag_cabs where isDeleted='N'";
    pool.query(sqlcheck, [], (err, result) => {
        console.log("Result===" + result);
        return result;
    })

}
const findCabs = function () {
    console.log("Finding User");
    return new Promise(function (resolve, reject) {
        pool.query("select * from prayag_cabs where isDeleted='N'")
            .then(function (results) {
                if (results.length > 0) {
                    resolve(results)
                } else {
                    reject("aas");
                }

            }).catch(function (error) {
                reject(error);
            })
    })
}
exports.getCabs = findCabs;
