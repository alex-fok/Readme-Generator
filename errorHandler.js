const errorAndReturn = (message, callback) => {
    console.log(`Error: ${message}`);
    callback();
}

exports.errorAndReturn = errorAndReturn;