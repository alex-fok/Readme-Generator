const fs = require('fs');
const inquirer = require('inquirer');
const {directory, initStr} = require('./config');
const {errorAndGoTo} = require('./errorHandler');
let currentFolder = "";

const quit = () => {
    console.log("Quiting...");
    setTimeout(()=>{}, 200);
}

const initRM = (title, callback) => {
    fs.writeFile(`${directory}/${currentFolder}/README.md`,`# ${title}\n${initStr}`, 'utf8', () => {
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

    const editREADME = (file, data, start, end, content, section, goTo = editFile) => {
        const result = data.substring(0,start).concat("\n", content, "\n", data.substring(end));
        fs.writeFile(file, result, (err)=> {
            if (err) throw err;
            console.log(`Section ${section} edited\n`);
            goTo();
        })
    }
    const getSectSpan = (data, targetText) => {
        const indexAt = data.indexOf(targetText);
        const contentStart = indexAt + targetText.length;
        const nextSectAt = data.indexOf("## ", indexAt + 1);
        const contentEnd = nextSectAt < 0 ? data.length : nextSectAt;
        return [contentStart, contentEnd];
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
            const file = `${directory}/${currentFolder}/README.md`;

            const addContributor = () => {
                const location = `./${directory}/contributors.json`;
                let contributors = {};

                const add = () => {
                    inquirer
                    .prompt([
                        {
                            name: "name",
                            type: "input",
                            message: "Name of contirbutor or source"
                        },
                        {
                            name: "link",
                            type: "input",
                            message: "Link of the contributor"
                        }
                    ]).then(answer => {
                        contributors[answer.name] = answer.link;
                        actions();
                    })
                }

                const remove = () => {
                    const keys = Object.keys(contributors);
                    if (keys.length === 0) {
                        console.log("There are no contributors.");
                        actions();
                    }
                    else{
                        inquirer
                        .prompt([{
                            name: "name",
                            type: "list",
                            message: "Choose contributor to remove",
                            choices: keys
                        }])
                        .then(answer => {
                            delete contributors[answer.name];
                            actions();
                        })
                    }
                }

                const save = () => {
                    fs.writeFile(location, JSON.stringify(contributors), "utf8", (err) => {
                        if (err) throw err;
                        fs.readFile(file, 'utf8', (err, data) => {
                            if (err) throw err;
                            const keys = Object.keys(contributors);
                            const str = keys.map((name) => {
                                `[${name}](${contributors[name]})\n`
                            });
                            const targetText = "## Credits";
                            editREADME(file, data, ...getSectSpan(data, targetText), str, "Credits", actions);
                        })
                    })
                    
                }

                const actions = () => {
                    inquirer
                    .prompt([{
                        name: "actions",
                        type: "list",
                        message: "Choose Operation",
                        choices: ["Add", "Remove", "Save", new inquirer.Separator(), "Go Back", "Quit"]
                    }])
                    .then(answer => {
                        switch(answer.actions) {
                            case "Add": add(); break;
                            case "Remove": remove(); break;
                            case "Save": save(); break;
                            case "Go Back": selectSection(); break;
                            default: quit(); break;
                        }
                    })
                }

                contributors = fs.existsSync(location) ? JSON.parse(fs.readFileSync(location, 'utf8')) : {};
                actions();
                
            }

            const addText = () => {
                fs.readFile(file, 'utf8', (err, data) => {
                    if (err) throw err;
                    const targetText = `## ${answer.section}`;
                    const indexAt = data.indexOf(targetText);
                    if (indexAt < 0) {
                        console.log(`Section not found. Please make sure '${targetText}' is included in README`);
                        selectSection();
                    }
                    else {
                        inquirer
                        .prompt([{
                            name: "content",
                            type: "input",
                            message: "Insert content:"
                        }])
                        .then(input => {
                            editREADME(file, data, ...getSectSpan(data, targetText), input.content, answer.section);
                        })
                    }
                })
            }

            switch(answer.section) {
                case "Credits": addContributor(); break;
                case "License": addLicense(); break;
                case "Installation": addText(); break;
                case "Usage": addText(); break;
                case "Go Back": mainMenu(); break;
                default: quit(); break;
            }
            
            
            const addLicense = () => {
                
            }

         
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
        message: "Choose operation",
        choices: files        
    }])
    .then(answer => {
        currentFolder = answer.folderName;
        editFile();
    })
    : errorAndGoTo("No files found in directory", mainMenu);
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
                quit(); break;
        }
    });
}

const start = () => {
    console.log("======== README Generator ========");
    if (!fs.existsSync(`./${directory}`)) {
        fs.mkdirSync(`./${directory}`);
    }
    mainMenu();
}
start();