import { IProject, ProjectStatus, UserRole } from "./class/Project.ts"
import { ProjectsManager } from "./class/ProjectsManager.ts"

// Create a toggleModal function
function toggleModal(id: string) {
    const modal = document.getElementById(id)

    if(modal && modal instanceof HTMLDialogElement) {
        if(!modal.open) {
            modal.showModal()
        } else {
            modal.close()
        }
    } else {
        console.warn("Modal Id ", id, " not found")
    }
}

const projectListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectListUI)

// Create the default project from code
const defaultProjectData: IProject = {
    name: "Default Project Name" as string,
    description: "Default description" as string,
    status: "Active" as ProjectStatus,
    userRole: "Architect" as UserRole,
    finishDate: new Date("13/03/2024" as string)
}

projectsManager.newProject(defaultProjectData)

const newProjectBtn = document.getElementById("new-project-btn")

if(newProjectBtn) {
    newProjectBtn.addEventListener("click", () => {toggleModal("new-project-modal")})
} else {
    console.warn("New projects button was not found");
}

const projectForm = document.getElementById("new-project-form")

if(projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (event) => {
        event.preventDefault()
        const formData = new FormData(projectForm)

        const projectData: IProject = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as ProjectStatus,
            userRole: formData.get("userRole") as UserRole,
            finishDate: new Date(formData.get("finishDate") as string)
        }

        try {
            const project = projectsManager.newProject(projectData)
            projectForm.reset()
    
            toggleModal("new-project-modal")
        } catch (err) {
            toggleModal("alert-dialog-message")

            const alertDialogMessage = document.getElementById("alert-dialog-message")

            if(alertDialogMessage && alertDialogMessage instanceof HTMLDialogElement) {

                const alertButton = document.getElementById("alert-submit-button") as HTMLButtonElement
                alertButton.addEventListener("click", () => {
                    toggleModal("alert-dialog-message")
                    console.log("ok")
                })
            }
            
            //window.alert(err)
        }
    })

    const cancelButton = document.getElementById("form-cancel-button") as HTMLButtonElement

    if(cancelButton){
        cancelButton.addEventListener("click", () => {toggleModal("new-project-modal")})
    }
} else {
    console.warn("The project form was not found. Check the ID!");
}

//Vuelve a projects-list cuando click on side bar
const projectsList = document.getElementById("projects-side-list") as HTMLLIElement
projectsList.addEventListener('click', () => {
    const projectsPage = document.getElementById("projects-page")
    const detailsPage = document.getElementById("project-details")
    if(!projectsPage || !detailsPage) {return}
    projectsPage.style.display = "flex"
    detailsPage.style.display = "none"
})


//Ejecuta el exportado del los proyectos al hacer click en el icono
const exportProjectBtn = document.getElementById("export-projects-btn")
if(exportProjectBtn) {
    exportProjectBtn.addEventListener("click", () => {
        projectsManager.exportToJSON()        
    })
}

//Ejecuta el importado de un archivo json cuando se hace click en el icono
const importProjectsBtn = document.getElementById("import-projects-btn")
if(importProjectsBtn) {
    importProjectsBtn.addEventListener("click", () => {
        projectsManager.importFromJSON()
    })
}