const errorAndGoTo = (message, callback) => {
    console.log(`Error: ${message}`);
    callback();
}

exports.errorAndGoTo = errorAndGoTo;