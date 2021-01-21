const fs = require('fs');
const inquirer = require('inquirer');
const {directory, initStr} = require('./config');
const {errorAndGoTo} = require('./errorHandler');
let currentFolder = "";

const initRM = (title, callback) => {
    fs.writeFile(`${directory}/${currentFolder}/READEME.md`,`# ${title}\n${initStr}`, 'utf8', () => {
        callback();
    })
}

const createRM = () => {
    console.log("\nCreate new README: ");
    inquirer.prompt([
    {
        name: "folderName",
        type: "input",
        message: "Folder name for the new README:"
    },
    {
        name: "title",
        type: "input",
        message: "Project Title:"        
    }])
    .then(answer => {
        currentFolder = answer.folderName;

        if (!fs.existsSync(`./${directory}/${answer.folderName}`)) {
            fs.mkdirSync(`./${directory}/${answer.folderName}`);
            initRM(answer.title, () => {
                console.log(`File ${answer.folderName}/READEME.md is created.`);
                currentFolder = answer.folderName;
                fileEdit();
            })
        } else {
            inquirer
            .prompt([{
                name: "overwrite",
                type: "list",
                message: `Folder already existed. Do you want to overwrite ./${directory}/${answer.folderName}?`,
                choices: ["YES", "NO"]
            }])
            .then(followUp => {
                followUp.overwrite === "YES"
                    ? initRM(answer.title, () => {
                        console.log(`File ${answer.folderName}/READEME.md has been overwritten.`)
                        currentFolder = answer.folderName;
                        fileEdit();
                    })
                    : mainMenu();
            })
        } 
    })
}
const fileEdit = () => {
    console.log("fileEdit");
}

const openExisting = () => {
    const files = fs.readdirSync(directory);
    files.length > 0
    ? inquirer
    .prompt([{
        name: "folderName",
        type: "list",
        message: "Choose from the following:",
        choices: files        
    }])
    .then(answer => {
        currentFolder = answer.folderName;
        fileEdit();
    })
    : errorAndGoTo("No files found in directory", mainMenu);
}
const quit = () => {
    console.log("Quiting...");
    setTimeout(()=>{}, 500);
}
const mainMenu = () => {
    console.log("\nMENU");
    inquirer
    .prompt([{
        name: "main",
        type: "list",
        message: "Choose Operation:",
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
console.log("======== README Generator ========");
mainMenu();