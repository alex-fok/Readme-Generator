const fs = require('fs');
const inquirer = require('inquirer');
const {directory} = require('./config');
const {errorAndReturn} = require('./errorHandler');
let current = "";

const createRM = () => {
    inquirer.prompt([{
        type: "input",
        message: "Type in file name for new README:",
        name: "fileName"
    }])
    .then(answer => {
        current = answer.fileName;
    })
}

const openExisting = () => {
    const files = fs.readdirSync(directory);
    files.length > 0
    ? inquirer.prompt([{
        type: "list",
        message: "Choose from the following:",
        choices: files,
        name: "fileName"
    }]).then(answer => {
        current = answer.fileName;
    })
    : errorAndReturn("No files found in directory", mainMenu);
}
const quit = () => {
    console.log("Quiting...");
    setTimeout(()=>{}, 500);
}
const mainMenu = () => {
    console.log("README Generator");
    inquirer.prompt([{
        type: "list",
        message: "Main Title",
        name: "main",
        choices: ["Create README", "Open Existing File", new inquirer.Separator(), "Quit"]
    }])
    .then(answer => {
        switch(answer.main) {
            case "Create README" :
                createRM(directory); break;
            case "Open Existing File":
                openExisting(); break;
            default:
                quit();
        }
    });
}
mainMenu();