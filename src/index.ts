import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { IProject, ProjectStatus, UserRole } from "./class/Project.ts"
import { ProjectsManager } from "./class/ProjectsManager.ts"
import * as OBC from "openbim-components"
import { FragmentsGroup } from "bim-fragment"
import { TodoCreator } from "./bim-components/TodoCreator/index.ts"

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
// const defaultProjectData: IProject = {
//     name: "Default Project Name" as string,
//     description: "Default description" as string,
//     status: "Active" as ProjectStatus,
//     userRole: "Architect" as UserRole,
//     finishDate: new Date("13/03/2024" as string)
// }

// projectsManager.newProject(defaultProjectData)

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

//OpenBIM Components Viewer (this part simplify threeJS functionality)

const viewer = new OBC.Components()

const sceneComponent = new OBC.SimpleScene(viewer)
sceneComponent.setup()
viewer.scene = sceneComponent
const scene = sceneComponent.get()
scene.background = null

const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement
const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
viewer.renderer = rendererComponent

const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
viewer.camera = cameraComponent

const raycasterComponent = new OBC.SimpleRaycaster(viewer)
viewer.raycaster = raycasterComponent

viewer.init()
cameraComponent.updateAspect()
rendererComponent.postproduction.enabled = true

const fragmentManager = new OBC.FragmentManager(viewer)

function exportFragments(model: FragmentsGroup) {
    const fragmentBinary = fragmentManager.export(model)
    const blob = new Blob([fragmentBinary])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${model.name.replace(".ifc", "")}.frag`
    a.click()
    URL.revokeObjectURL(url)
    console.log("done fragments")
}

function exportProperties(model: FragmentsGroup) {
    const json = JSON.stringify(model.properties)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${model.name.replace(".ifc", "")}_data`
    a.click()
    URL.revokeObjectURL(url)
    console.log("done properties");
    
}

const ifcLoader = new OBC.FragmentIfcLoader(viewer)
ifcLoader.settings.wasm = {
    path: "http://unpkg.com/web-ifc@0.0.43/",
    absolute: true
}

const highlighter = new OBC.FragmentHighlighter(viewer)
highlighter.setup()

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
highlighter.events.select.onClear.add(() => {
    propertiesProcessor.cleanPropertiesList()
})

const classifier = new OBC.FragmentClassifier(viewer)
const classificationWindow = new OBC.FloatingWindow(viewer)
classificationWindow.visible = false
viewer.ui.add(classificationWindow)
classificationWindow.title = "Model Groups"

const classificationBtn = new OBC.Button(viewer)
classificationBtn.materialIcon = "account_tree"
classificationBtn.onClick.add(() => {
    classificationWindow.visible = !classificationWindow.visible
    classificationBtn.active = classificationWindow.visible
})

async function createModelTree() {
    const fragmentTree = new OBC.FragmentTree(viewer)
    await fragmentTree.init()
    await fragmentTree.update(["model", "storeys", "entities"])
    fragmentTree.onHovered.add((fragmentMap) => {
        highlighter.highlightByID("hover", fragmentMap)
    })
    fragmentTree.onSelected.add((fragmentMap) => {
        highlighter.highlightByID("select", fragmentMap)
    })
    const tree = fragmentTree.get().uiElement.get("tree")
    return tree
}

const culler = new OBC.ScreenCuller(viewer)
cameraComponent.controls.addEventListener("sleep", () => {
    culler.needsUpdate = true 
})

async function onModelLoaded (model: FragmentsGroup) {
    highlighter.update()

    for(const fragment of model.items) {culler.add(fragment.mesh)}
    culler.needsUpdate = true

    try {
        classifier.byModel(model.name, model)
        classifier.byStorey(model)    
        classifier.byEntity(model)
        const tree = await createModelTree()
        await classificationWindow.slots.content.dispose(true)
        classificationWindow.addChild(tree)
        
        propertiesProcessor.process(model)
        highlighter.events.select.onHighlight.add((fragmentMap) => {
            const expressID = [...Object.values(fragmentMap)[0]][0]
            propertiesProcessor.renderProperties(model, Number(expressID))
        })

    } catch (error) {
        alert(error)
    }

}

ifcLoader.onIfcLoaded.add(async (model) => {
    console.log(model)
    exportFragments(model)
    exportProperties(model)
    onModelLoaded(model)
})

fragmentManager.onFragmentsLoaded.add((model) => {
    onModelLoaded(model)
})

const importFragmentBtn = new OBC.Button(viewer)
importFragmentBtn.materialIcon = "upload"
importFragmentBtn.tooltip = "Load FRAG"

importFragmentBtn.onClick.add(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.frag'
    const reader = new FileReader()
    reader.addEventListener('load', async () => {
        const binary = reader.result
        if(!(binary instanceof ArrayBuffer)) {return}
        const fragmentBinary = new Uint8Array(binary)
        await fragmentManager.load(fragmentBinary)
    })
    input.addEventListener('change', () => {
        const filesList = input.files
        if(!filesList) {return}
        reader.readAsArrayBuffer(filesList[0])
    })
    input.click()
})

const todoCreator = new TodoCreator(viewer)

const toolbar = new OBC.Toolbar(viewer)
toolbar.addChild(
    ifcLoader.uiElement.get("main"),
    classificationBtn,
    propertiesProcessor.uiElement.get("main"),
    importFragmentBtn,
    fragmentManager.uiElement.get("main"),
    todoCreator.uiElement.get("activationButton")
)
viewer.ui.addToolbar(toolbar)