const fs = require('fs');
const inquirer = require('inquirer');
const {directory, initStr} = require('./config');
const {errorAndGoTo} = require('./errorHandler');
let currentFolder = "";

const initRM = (title, callback) => {
    fs.writeFile(`${directory}/${currentFolder}/README.md`,`# ${title}\n${initStr}`, 'utf8', () => {
        callback();
    })
}
console.log("C:\Users\foktm\code\hw\09-Readme-Generator\generate\aaa\READEME.md")

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
                editFile();
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
                        editFile();
                    })
                    : mainMenu();
            })
        } 
    })
}
const editFile = () => {
    console.log("======== EDITING ========");

    const addContent = (file, data, start, end, section) => {
        inquirer
        .prompt([{
            name: "content",
            type: "input",
            message: "Insert content:"
        }])
        .then(answer => {
            const result = data.substring(0,start).concat("\n", answer.content, "\n", data.substring(end));
            fs.writeFile(file, result, (err)=> {
                if (err) throw err;
                console.log(`Section ${section} edited\n`);
                editFile();
            })
        })
    }

    const selectSection = () => {
        inquirer
        .prompt([{
            name: "section",
            type: "list",
            message: "Select section to edit:",
            choices: ["Installation","Usage", "Credits", "License", new inquirer.Separator(),"Go Back", "Quit"]
        }])
        .then(answer => {
            if(answer.section === "Quit") return quit();
            else if (answer.section === "Go Back") {
                console.log("======== END EDITING ========\n");
                return mainMenu();
            }
            
            const targetText = `## ${answer.section}`;
            const file = `${directory}/${currentFolder}/README.md`;

            switch(answer.section) {
                case "Credits": addContributor(); break;
                case "License": addLicense(); break;
                default: addText(); break;
            }
            
            const addContributor = () => {
                
            }
            const addLicense = () => {
                
            }

            const addText = () => {
                fs.readFile(file, 'utf8', (err, data) => {
                if (err) throw err;
                const indexAt = data.indexOf(targetText);
                if (indexAt < 0) {
                    console.log(`Section not found. Please make sure '${targetText}' is included in README`);
                    return selectSection();
                }
                else {
                    const contentStart = indexAt + targetText.length;
                    const nextSectAt = data.indexOf("## ", indexAt + 1);
                    const contentEnd = nextSectAt < 0 ? data.length : nextSectAt;
                    addContent(file, data, contentStart, contentEnd, answer.section);
                }
            })}
        })
    }
    selectSection();
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
        editFile();
    })
    : errorAndGoTo("No files found in directory", mainMenu);
}
const quit = () => {
    console.log("Quiting...");
    setTimeout(()=>{}, 200);
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